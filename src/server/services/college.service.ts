import type { ApplicationPlatform, Prisma } from "@prisma/client";
import { db } from "@/server/db";
import type { StudentStats } from "@/features/colleges/utils/tier";

export interface CollegeSearchParams {
  query?: string;
  state?: string;
  platform?: ApplicationPlatform;
  maxAdmitRate?: number;
  onlyQuestBridge?: boolean;
  limit?: number;
}

export type CollegeListItem = Prisma.CollegeGetPayload<{
  select: {
    id: true;
    slug: true;
    name: true;
    city: true;
    state: true;
    type: true;
    platforms: true;
    admitRate: true;
    sat25: true;
    sat75: true;
    act25: true;
    act75: true;
    undergradEnrollment: true;
    costOfAttendanceCents: true;
    isQuestBridgePartner: true;
    requiresCssProfile: true;
    dataSource: true;
    dataVerifiedAt: true;
  };
}>;

const LIST_SELECT = {
  id: true,
  slug: true,
  name: true,
  city: true,
  state: true,
  type: true,
  platforms: true,
  admitRate: true,
  sat25: true,
  sat75: true,
  act25: true,
  act75: true,
  undergradEnrollment: true,
  costOfAttendanceCents: true,
  isQuestBridgePartner: true,
  requiresCssProfile: true,
  dataSource: true,
  dataVerifiedAt: true,
} satisfies Prisma.CollegeSelect;

export interface CollegeSearchResult {
  colleges: CollegeListItem[];
  /** Total matching the filters, which may exceed the returned page. */
  matched: number;
}

export async function searchColleges({
  query,
  state,
  platform,
  maxAdmitRate,
  onlyQuestBridge,
  limit = 60,
}: CollegeSearchParams): Promise<CollegeSearchResult> {
  const where: Prisma.CollegeWhereInput = {};

  if (query?.trim()) {
    const q = query.trim();
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { aliases: { hasSome: [q, q.toUpperCase()] } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }
  if (state) where.state = state;
  if (platform) where.platforms = { has: platform };
  if (onlyQuestBridge) where.isQuestBridgePartner = true;
  if (maxAdmitRate !== undefined) {
    where.admitRate = { lte: maxAdmitRate, not: null };
  }

  const [colleges, matched] = await Promise.all([
    db.college.findMany({
      where,
      select: LIST_SELECT,
      orderBy: [{ admitRate: { sort: "asc", nulls: "last" } }, { name: "asc" }],
      take: limit,
    }),
    db.college.count({ where }),
  ]);

  return { colleges, matched };
}

export async function getCollegeBySlug(slug: string) {
  return db.college.findUnique({ where: { slug } });
}

/** Distinct states present in the college table, for the filter dropdown. */
export async function getAvailableStates(): Promise<string[]> {
  const rows = await db.college.findMany({
    where: { state: { not: null } },
    select: { state: true },
    distinct: ["state"],
    orderBy: { state: "asc" },
  });
  return rows.flatMap((r) => (r.state ? [r.state] : []));
}

/** Best SAT and ACT the student has recorded, for tier suggestions. */
export async function getStudentStats(userId: string): Promise<StudentStats> {
  const scores = await db.testScore.findMany({
    where: { userId, type: { in: ["SAT", "ACT"] } },
    select: { type: true, score: true },
  });

  const best = (type: "SAT" | "ACT") =>
    scores
      .filter((s) => s.type === type)
      .reduce<number | null>(
        (max, s) => (max === null || s.score > max ? s.score : max),
        null,
      );

  return { satTotal: best("SAT"), actComposite: best("ACT") };
}

export async function countCollegesWithStats(): Promise<{
  total: number;
  withStats: number;
}> {
  const [total, withStats] = await Promise.all([
    db.college.count(),
    db.college.count({ where: { admitRate: { not: null } } }),
  ]);
  return { total, withStats };
}
