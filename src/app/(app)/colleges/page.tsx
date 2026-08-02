import { Suspense } from "react";
import type { Metadata } from "next";
import type { ApplicationPlatform } from "@prisma/client";
import { LOCAL_USER_ID } from "@/lib/constants";
import {
  countCollegesWithStats,
  getAvailableStates,
  getStudentStats,
  searchColleges,
} from "@/server/services/college.service";
import { getListedCollegeIds } from "@/server/services/application.service";
import { CollegeCard } from "@/features/colleges/components/college-card";
import { CollegeFilters } from "@/features/colleges/components/college-filters";

export const metadata: Metadata = { title: "Colleges" };

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function CollegesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const maxAdmit = first(params.maxAdmit);

  const [search, listedIds, studentStats, states, counts] = await Promise.all([
    searchColleges({
      query: first(params.q),
      state: first(params.state),
      platform: first(params.platform) as ApplicationPlatform | undefined,
      maxAdmitRate: maxAdmit ? Number(maxAdmit) : undefined,
      onlyQuestBridge: first(params.qb) === "1",
    }),
    getListedCollegeIds(LOCAL_USER_ID),
    getStudentStats(LOCAL_USER_ID),
    getAvailableStates(),
    countCollegesWithStats(),
  ]);

  const { colleges, matched } = search;
  const missingStats = counts.withStats === 0;
  const truncated = matched > colleges.length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Colleges
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Search, compare, and build your list. Adding a school here creates its
          application.
        </p>
      </header>

      {missingStats && (
        <div className="border-info/30 bg-info-subtle mb-6 rounded-[14px] border p-4">
          <p className="text-fg text-[13.5px] font-medium">
            No admission statistics loaded yet.
          </p>
          <p className="text-fg-muted mt-1 text-[13px]">
            The seed ships college names and platforms but deliberately no numbers — stale
            or invented admit rates are worse than none. Run{" "}
            <code className="bg-surface-raised rounded px-1.5 py-0.5 font-mono text-[12px]">
              pnpm db:import:scorecard
            </code>{" "}
            with a free{" "}
            <a
              href="https://api.data.gov/signup/"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              api.data.gov key
            </a>{" "}
            to pull real admit rates, score ranges, and costs from the U.S. Department of
            Education.
          </p>
        </div>
      )}

      <Suspense fallback={<div className="h-9" />}>
        <CollegeFilters states={states} />
      </Suspense>

      <p className="text-fg-subtle mt-4 mb-3 text-[13px] tabular-nums">
        {truncated
          ? `Showing ${colleges.length} of ${matched} matches`
          : `${matched} ${matched === 1 ? "college" : "colleges"}`}
        {listedIds.size > 0 && ` · ${listedIds.size} on your list`}
      </p>

      {colleges.length === 0 ? (
        <div className="border-border rounded-[14px] border border-dashed py-16 text-center">
          <p className="text-fg text-[15px] font-medium">No colleges match that.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-sm text-[13.5px]">
            Try a different search, or clear the filters. Only {counts.total} schools are
            seeded so far — running the Scorecard import with{" "}
            <code className="font-mono text-[12px]">--all</code> adds every
            degree-granting institution.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {colleges.map((college) => (
            <CollegeCard
              key={college.id}
              college={college}
              listed={listedIds.has(college.id)}
              studentStats={studentStats}
            />
          ))}
        </div>
      )}
    </div>
  );
}
