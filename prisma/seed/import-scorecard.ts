/**
 * Imports real institutional statistics from the U.S. Department of Education's
 * College Scorecard API into the College table.
 *
 *   pnpm db:import:scorecard          enrich the curated colleges already seeded
 *   pnpm db:import:scorecard --all    additionally insert every degree-granting
 *                                     institution, for broad search coverage
 *
 * Requires COLLEGE_SCORECARD_API_KEY in .env — free at https://api.data.gov/signup/
 *
 * Why this is a separate step rather than committed seed data: admit rates and
 * score ranges change every year, and a stale or invented number is worse than a
 * missing one when you are deciding where to apply. Statistics come from the
 * government; the seed file only claims identity.
 *
 * Results are written to prisma/seed/data/scorecard-snapshot.json so the import
 * is reproducible and reviewable.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { PrismaClient, type CollegeType } from "@prisma/client";

const db = new PrismaClient();

const API_BASE = "https://api.data.gov/ed/collegescorecard/v1/schools";
const PER_PAGE = 100;

const FIELDS = [
  "id",
  "school.name",
  "school.city",
  "school.state",
  "school.school_url",
  "school.ownership",
  "latest.admissions.admission_rate.overall",
  "latest.admissions.sat_scores.25th_percentile.critical_reading",
  "latest.admissions.sat_scores.75th_percentile.critical_reading",
  "latest.admissions.sat_scores.25th_percentile.math",
  "latest.admissions.sat_scores.75th_percentile.math",
  "latest.admissions.act_scores.25th_percentile.cumulative",
  "latest.admissions.act_scores.75th_percentile.cumulative",
  "latest.student.size",
  "latest.cost.attendance.academic_year",
].join(",");

interface ScorecardRow {
  id: number;
  "school.name": string;
  "school.city": string | null;
  "school.state": string | null;
  "school.school_url": string | null;
  "school.ownership": number | null;
  "latest.admissions.admission_rate.overall": number | null;
  "latest.admissions.sat_scores.25th_percentile.critical_reading": number | null;
  "latest.admissions.sat_scores.75th_percentile.critical_reading": number | null;
  "latest.admissions.sat_scores.25th_percentile.math": number | null;
  "latest.admissions.sat_scores.75th_percentile.math": number | null;
  "latest.admissions.act_scores.25th_percentile.cumulative": number | null;
  "latest.admissions.act_scores.75th_percentile.cumulative": number | null;
  "latest.student.size": number | null;
  "latest.cost.attendance.academic_year": number | null;
}

interface ScorecardResponse {
  metadata: { total: number; page: number; per_page: number };
  results: ScorecardRow[];
}

function ownershipToType(ownership: number | null): CollegeType | null {
  switch (ownership) {
    case 1:
      return "PUBLIC";
    case 2:
      return "PRIVATE_NONPROFIT";
    case 3:
      return "PRIVATE_FORPROFIT";
    default:
      return null;
  }
}

/** SAT composite is the sum of the section percentiles; null unless both exist. */
function satTotal(reading: number | null, math: number | null): number | null {
  return reading !== null && math !== null ? reading + math : null;
}

/** Normalizes for fuzzy matching: lowercase, strip punctuation and filler words. */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(the|of|at|university|college|institute|technology)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchPage(
  apiKey: string,
  page: number,
  extraParams: Record<string, string> = {},
): Promise<ScorecardResponse> {
  const url = new URL(API_BASE);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("fields", FIELDS);
  url.searchParams.set("per_page", String(PER_PAGE));
  url.searchParams.set("page", String(page));
  url.searchParams.set("school.operating", "1");
  url.searchParams.set("school.degrees_awarded.predominant__range", "3..4");
  for (const [key, value] of Object.entries(extraParams)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url);
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `College Scorecard returned ${response.status}: ${body.slice(0, 300)}`,
    );
  }
  return (await response.json()) as ScorecardResponse;
}

function statsFrom(row: ScorecardRow) {
  const coa = row["latest.cost.attendance.academic_year"];
  return {
    ipedsId: String(row.id),
    admitRate: row["latest.admissions.admission_rate.overall"],
    sat25: satTotal(
      row["latest.admissions.sat_scores.25th_percentile.critical_reading"],
      row["latest.admissions.sat_scores.25th_percentile.math"],
    ),
    sat75: satTotal(
      row["latest.admissions.sat_scores.75th_percentile.critical_reading"],
      row["latest.admissions.sat_scores.75th_percentile.math"],
    ),
    act25: row["latest.admissions.act_scores.25th_percentile.cumulative"],
    act75: row["latest.admissions.act_scores.75th_percentile.cumulative"],
    undergradEnrollment: row["latest.student.size"],
    costOfAttendanceCents: coa !== null ? Math.round(coa * 100) : null,
    dataSource: "college-scorecard",
    dataVerifiedAt: new Date(),
  };
}

async function main() {
  const apiKey = process.env.COLLEGE_SCORECARD_API_KEY;
  if (!apiKey) {
    console.error(
      "COLLEGE_SCORECARD_API_KEY is not set.\n\n" +
        "Get a free key at https://api.data.gov/signup/ (takes about a minute),\n" +
        "then add it to .env:\n\n" +
        '  COLLEGE_SCORECARD_API_KEY="your-key-here"\n',
    );
    process.exitCode = 1;
    return;
  }

  const importAll = process.argv.includes("--all");

  console.warn("Fetching College Scorecard data…");
  const rows: ScorecardRow[] = [];
  let page = 0;
  let total = Infinity;

  while (rows.length < total) {
    const response = await fetchPage(apiKey, page);
    total = response.metadata.total;
    rows.push(...response.results);
    page += 1;
    process.stdout.write(`\r  ${rows.length} / ${total}`);
    if (response.results.length === 0) break;
  }
  process.stdout.write("\n");

  const snapshotPath = path.join(
    process.cwd(),
    "prisma/seed/data/scorecard-snapshot.json",
  );
  await writeFile(snapshotPath, JSON.stringify(rows, null, 2));
  console.warn(`Snapshot written to ${snapshotPath}`);

  // Index by normalized name so curated rows can be matched without IPEDS ids.
  const byName = new Map<string, ScorecardRow>();
  for (const row of rows) {
    const key = normalize(row["school.name"]);
    if (!byName.has(key)) byName.set(key, row);
  }

  const existing = await db.college.findMany({
    select: { id: true, slug: true, name: true, aliases: true },
  });

  let enriched = 0;
  const unmatched: string[] = [];

  for (const college of existing) {
    const row =
      byName.get(normalize(college.name)) ??
      college.aliases.map((a) => byName.get(normalize(a))).find(Boolean);

    if (!row) {
      unmatched.push(college.name);
      continue;
    }

    await db.college.update({
      where: { id: college.id },
      data: statsFrom(row),
    });
    enriched += 1;
  }

  console.warn(`Enriched ${enriched} of ${existing.length} curated colleges.`);
  if (unmatched.length > 0) {
    console.warn(`Unmatched (${unmatched.length}): ${unmatched.join(", ")}`);
  }

  if (importAll) {
    const knownIpeds = new Set(
      (
        await db.college.findMany({
          where: { ipedsId: { not: null } },
          select: { ipedsId: true },
        })
      ).map((c) => c.ipedsId),
    );

    let inserted = 0;
    for (const row of rows) {
      if (knownIpeds.has(String(row.id))) continue;
      const name = row["school.name"];
      const slug = normalize(name).replace(/ /g, "-").slice(0, 60) || `school-${row.id}`;

      await db.college.upsert({
        where: { ipedsId: String(row.id) },
        update: statsFrom(row),
        create: {
          slug: `${slug}-${row.id}`,
          name,
          aliases: [],
          city: row["school.city"],
          state: row["school.state"],
          country: "US",
          type: ownershipToType(row["school.ownership"]),
          website: row["school.school_url"],
          ...statsFrom(row),
        },
      });
      inserted += 1;
    }
    console.warn(`Inserted ${inserted} additional institutions.`);
  }

  const withStats = await db.college.count({ where: { admitRate: { not: null } } });
  console.warn(`\n${withStats} colleges now have admission statistics.`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void db.$disconnect());
