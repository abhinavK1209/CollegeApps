import type {
  ApplicationRound,
  DeadlineKind,
  Prisma,
  RequirementType,
} from "@prisma/client";
import { db } from "@/server/db";
import {
  conventionDate,
  DEADLINE_TITLES,
  ROUND_CONVENTIONS,
  roundLabel,
} from "./round-conventions";

/**
 * Derives an application's full checklist from the college and the round.
 *
 * This is the core of the product: the student picks a school and a round, and
 * the system produces the deadlines, essay prompts, recommendation slots, school
 * forms, and aid requirements — rather than asking them to build a tracker.
 *
 * Regeneration is idempotent and never destroys work:
 *   - requirements are matched on (type, label) and skipped if user-overridden
 *   - anything already submitted or confirmed keeps its status
 *   - deadlines a student edited are marked USER origin and left alone
 */

interface DerivedRequirement {
  type: RequirementType;
  label: string;
  isRequired: boolean;
}

interface DerivedDeadline {
  kind: DeadlineKind;
  title: string;
  dueAt: Date;
  isHard: boolean;
}

export interface DerivationResult {
  requirements: number;
  deadlines: number;
  prompts: number;
}

function deriveRequirements(
  college: {
    platforms: string[];
    requiresCssProfile: boolean;
    requiredTeacherRecs: number;
    requiresCounselorRec: boolean;
  },
  round: ApplicationRound,
  needsAid: boolean,
  parentsSeparated: boolean,
): DerivedRequirement[] {
  const items: DerivedRequirement[] = [];
  const isUC = college.platforms.includes("UC");

  items.push({ type: "TRANSCRIPT", label: "Official transcript", isRequired: true });
  items.push({
    type: "FEE_OR_WAIVER",
    label: "Application fee or waiver",
    isRequired: true,
  });
  items.push({ type: "TEST_SCORES", label: "Send test scores", isRequired: false });

  // The UC application takes no letters of recommendation, no counselor forms,
  // and no interviews. Generating those slots would be actively misleading.
  if (!isUC) {
    const teacherRecs = Math.max(college.requiredTeacherRecs, 2);
    for (let i = 1; i <= teacherRecs; i += 1) {
      items.push({
        type: "TEACHER_REC",
        label: `Teacher recommendation ${i}`,
        isRequired: true,
      });
    }
    items.push({
      type: "COUNSELOR_REC",
      label: "Counselor recommendation",
      isRequired: true,
    });
    items.push({ type: "SCHOOL_REPORT", label: "School report", isRequired: true });
    items.push({
      type: "MID_YEAR_REPORT",
      label: "Mid-year report",
      isRequired: true,
    });
  }

  // Mandatory on Common App for every applicant, and it must be sent LAST —
  // submitting it locks the mid-year report and counselor recommendation.
  if (college.platforms.includes("COMMON_APP")) {
    items.push({
      type: "FINAL_REPORT",
      label: "Final report (send only after all decisions)",
      isRequired: true,
    });
  }

  if (needsAid) {
    items.push({ type: "FAFSA", label: "FAFSA", isRequired: true });
    if (college.requiresCssProfile) {
      items.push({ type: "CSS_PROFILE", label: "CSS Profile", isRequired: true });
      items.push({ type: "IDOC", label: "IDOC documents", isRequired: false });
      if (parentsSeparated) {
        items.push({
          type: "NONCUSTODIAL_PROFILE",
          label: "Noncustodial parent's CSS Profile",
          isRequired: true,
        });
      }
    }
  }

  if (ROUND_CONVENTIONS[round].isBinding) {
    items.push({
      type: "OTHER",
      label: `${roundLabel(round)} agreement (signed by you, a parent, and your counselor)`,
      isRequired: true,
    });
  }

  return items;
}

function deriveDeadlines(
  round: ApplicationRound,
  cycleYear: number,
  needsAid: boolean,
  requiresCss: boolean,
): DerivedDeadline[] {
  const convention = ROUND_CONVENTIONS[round];
  const deadlines: DerivedDeadline[] = [
    {
      kind: "APPLICATION",
      title: `${DEADLINE_TITLES.APPLICATION} (${roundLabel(round)})`,
      dueAt: conventionDate(convention.application, cycleYear),
      isHard: true,
    },
  ];

  if (needsAid && convention.aid) {
    if (requiresCss) {
      deadlines.push({
        kind: "CSS_PROFILE",
        title: DEADLINE_TITLES.CSS_PROFILE ?? "CSS Profile due",
        dueAt: conventionDate(convention.aid, cycleYear),
        isHard: true,
      });
    }
    deadlines.push({
      kind: "FAFSA_PRIORITY",
      title: DEADLINE_TITLES.FAFSA_PRIORITY ?? "FAFSA priority date",
      dueAt: conventionDate(convention.aid, cycleYear),
      isHard: true,
    });
  }

  if (convention.decisionRelease) {
    deadlines.push({
      kind: "DECISION_RELEASE",
      title: DEADLINE_TITLES.DECISION_RELEASE ?? "Decision expected",
      dueAt: conventionDate(convention.decisionRelease, cycleYear),
      isHard: false,
    });
  }

  return deadlines;
}

export async function regenerateChecklist(
  userId: string,
  applicationId: string,
): Promise<DerivationResult> {
  const application = await db.application.findFirstOrThrow({
    where: { id: applicationId, userId },
    include: { college: true },
  });

  const profile = await db.studentProfile.findUnique({ where: { userId } });
  const needsAid = profile?.needsFinancialAid ?? true;
  const parentsSeparated = profile?.parentsSeparated ?? false;

  const derivedRequirements = deriveRequirements(
    application.college,
    application.round,
    needsAid,
    parentsSeparated,
  );
  const derivedDeadlines = deriveDeadlines(
    application.round,
    application.cycleYear,
    needsAid,
    application.college.requiresCssProfile,
  );

  const existingRequirements = await db.requirement.findMany({
    where: { applicationId },
  });

  let requirementCount = 0;
  for (const derived of derivedRequirements) {
    const match = existingRequirements.find(
      (r) => r.type === derived.type && r.label === derived.label,
    );
    if (match) {
      // Never regress work the student already did.
      if (!match.isUserOverridden) {
        await db.requirement.update({
          where: { id: match.id },
          data: { isRequired: derived.isRequired },
        });
      }
      requirementCount += 1;
      continue;
    }
    await db.requirement.create({
      data: {
        applicationId,
        type: derived.type,
        label: derived.label,
        isRequired: derived.isRequired,
        origin: "DERIVED",
      },
    });
    requirementCount += 1;
  }

  // Requirements that no longer apply (e.g. the round changed) are removed only
  // when untouched — anything started or submitted stays visible.
  await db.requirement.deleteMany({
    where: {
      applicationId,
      origin: "DERIVED",
      isUserOverridden: false,
      status: "NOT_STARTED",
      label: { notIn: derivedRequirements.map((r) => r.label) },
    },
  });

  await db.deadline.deleteMany({
    where: { applicationId, origin: "DERIVED" },
  });

  const deadlineData: Prisma.DeadlineCreateManyInput[] = derivedDeadlines.map((d) => ({
    userId,
    applicationId,
    kind: d.kind,
    title: d.title,
    dueAt: d.dueAt,
    isHard: d.isHard,
    origin: "DERIVED" as const,
    // Typical for the round, not scraped from the college. The UI says so.
    confidence: application.round === "QUESTBRIDGE_MATCH" ? "HIGH" : "LOW",
  }));
  await db.deadline.createMany({ data: deadlineData });

  const prompts = await db.essayPrompt.count({ where: { applicationId } });

  await db.activityEvent.create({
    data: {
      userId,
      entityType: "APPLICATION",
      entityId: applicationId,
      action: "UPDATED",
      summary: `Rebuilt checklist for ${application.college.name} (${roundLabel(application.round)})`,
    },
  });

  return {
    requirements: requirementCount,
    deadlines: deadlineData.length,
    prompts,
  };
}
