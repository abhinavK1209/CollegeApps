import type { MilestoneKind } from "@prisma/client";
import { db } from "@/server/db";

/**
 * Milestones are earned, not sprinkled. Each fires once, ever, and only for
 * things that genuinely mattered — first submission, all recommendations in,
 * FAFSA filed. Celebrating trivia would make the real ones worthless.
 */
export async function detectMilestones(userId: string): Promise<MilestoneKind[]> {
  const [applications, requirements, essays, aid] = await Promise.all([
    db.application.findMany({
      where: { userId, archivedAt: null },
      select: { submittedAt: true, decision: true },
    }),
    db.requirement.findMany({
      where: { application: { userId } },
      select: { type: true, status: true, isRequired: true },
    }),
    db.essay.findMany({
      where: { userId, archivedAt: null },
      select: { status: true },
    }),
    db.financialAidProfile.findUnique({ where: { userId } }),
  ]);

  const earned: MilestoneKind[] = [];

  if (applications.length > 0) earned.push("FIRST_APPLICATION");

  const submitted = applications.filter((a) => a.submittedAt !== null);
  if (submitted.length > 0) earned.push("FIRST_SUBMISSION");
  if (applications.length > 0 && submitted.length === applications.length) {
    earned.push("ALL_SUBMITTED");
  }

  const recs = requirements.filter(
    (r) => r.type === "TEACHER_REC" || r.type === "COUNSELOR_REC",
  );
  if (recs.length > 0 && recs.every((r) => r.status === "CONFIRMED_RECEIVED")) {
    earned.push("ALL_RECS_IN");
  }

  if (
    essays.length > 0 &&
    essays.every((e) => e.status === "FINAL" || e.status === "SUBMITTED")
  ) {
    earned.push("ALL_ESSAYS_DONE");
  }

  if (aid?.fafsaSubmittedAt) earned.push("FAFSA_FILED");
  if (applications.some((a) => a.decision === "ACCEPTED" || a.decision === "MATCHED")) {
    earned.push("FIRST_ACCEPTANCE");
  }

  // Record only newly earned ones; the unique constraint makes this idempotent.
  const fresh: MilestoneKind[] = [];
  for (const kind of earned) {
    const existing = await db.milestone.findUnique({
      where: { userId_kind: { userId, kind } },
    });
    if (existing) continue;
    await db.milestone.create({ data: { userId, kind } });
    fresh.push(kind);
  }

  return fresh;
}

export const MILESTONE_COPY: Record<MilestoneKind, string> = {
  FIRST_APPLICATION: "First school on your list. The process has a shape now.",
  FIRST_SUBMISSION: "First application submitted. That's the hardest one.",
  ALL_EARLY_SUBMITTED: "Every early application is in.",
  ALL_ESSAYS_DONE: "Every essay is final. That was the bulk of the work.",
  ALL_RECS_IN: "Every recommendation is confirmed received.",
  FAFSA_FILED: "FAFSA filed.",
  FIRST_ACCEPTANCE: "You're going to college.",
  ALL_SUBMITTED: "Every application is submitted.",
  FULLY_FUNDED: "Fully funded.",
  COMMITTED: "Committed. It's done.",
};
