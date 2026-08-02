import type { ApplicationPlatform, ApplicationRound, SchoolTier } from "@prisma/client";
import { db } from "@/server/db";
import { CURRENT_CYCLE_YEAR } from "@/lib/constants";

/** Platform a college prefers, used as the default when adding to a list. */
function defaultPlatform(platforms: ApplicationPlatform[]): ApplicationPlatform {
  const preference: ApplicationPlatform[] = [
    "COMMON_APP",
    "UC",
    "APPLY_TEXAS",
    "COALITION",
    "DIRECT",
  ];
  return preference.find((p) => platforms.includes(p)) ?? "OTHER";
}

export async function addCollegeToList(
  userId: string,
  collegeId: string,
  tier: SchoolTier | null,
) {
  const college = await db.college.findUniqueOrThrow({
    where: { id: collegeId },
    select: { platforms: true, name: true },
  });

  const application = await db.application.upsert({
    where: {
      userId_collegeId_cycleYear: { userId, collegeId, cycleYear: CURRENT_CYCLE_YEAR },
    },
    update: { tier, archivedAt: null },
    create: {
      userId,
      collegeId,
      cycleYear: CURRENT_CYCLE_YEAR,
      // Round stays RD until the student picks one — the rule engine validates
      // binding rounds at that point, not here.
      round: "RD" satisfies ApplicationRound,
      platform: defaultPlatform(college.platforms),
      tier,
      status: "RESEARCHING",
    },
  });

  await db.activityEvent.create({
    data: {
      userId,
      entityType: "APPLICATION",
      entityId: application.id,
      action: "CREATED",
      summary: `Added ${college.name} to your list`,
    },
  });

  return application;
}

export async function removeCollegeFromList(userId: string, collegeId: string) {
  await db.application.deleteMany({
    where: { userId, collegeId, cycleYear: CURRENT_CYCLE_YEAR },
  });
}

export async function listApplications(userId: string) {
  return db.application.findMany({
    where: { userId, cycleYear: CURRENT_CYCLE_YEAR, archivedAt: null },
    include: {
      college: {
        select: {
          id: true,
          slug: true,
          name: true,
          city: true,
          state: true,
          admitRate: true,
          costOfAttendanceCents: true,
          platforms: true,
        },
      },
    },
    orderBy: [{ tier: "asc" }, { createdAt: "desc" }],
  });
}

/** Ids of colleges already on the list, for marking search results. */
export async function getListedCollegeIds(userId: string): Promise<Set<string>> {
  const rows = await db.application.findMany({
    where: { userId, cycleYear: CURRENT_CYCLE_YEAR, archivedAt: null },
    select: { collegeId: true },
  });
  return new Set(rows.map((r) => r.collegeId));
}
