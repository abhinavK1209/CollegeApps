import type {
  ApplicationRound,
  DecisionOutcome,
  RuleCode,
  Severity,
} from "@prisma/client";
import { db } from "@/server/db";
import { roundLabel, ROUND_CONVENTIONS } from "./round-conventions";

/**
 * Checks the application list against the rules colleges actually enforce.
 *
 * Nothing on the market does this, and the failure modes are severe: two binding
 * Early Decision applications, or an early application filed alongside a
 * Restrictive Early Action one, can get offers rescinded.
 *
 * Findings are ADVISORY. They explain, they cite, and they can be dismissed —
 * they never block the student. Policies vary by college and change, so the app
 * states the general rule and points at the source rather than pretending to
 * know a specific college's fine print. See docs/00-RESEARCH.md §2.
 */

export interface RuleInput {
  id: string;
  collegeId: string;
  collegeName: string;
  round: ApplicationRound;
  decision: DecisionOutcome | null;
  status: string;
  isPublic: boolean;
  tier: string | null;
}

export interface Finding {
  code: RuleCode;
  severity: Severity;
  entityKey: string;
  message: string;
  explanation: string;
  citationUrl?: string;
  entityIds: string[];
}

const WITHDRAWN_STATES: DecisionOutcome[] = ["WITHDRAWN", "DENIED"];

function isLive(app: RuleInput): boolean {
  return (
    app.status !== "WITHDRAWN" &&
    (app.decision === null || !WITHDRAWN_STATES.includes(app.decision))
  );
}

/** Pure — no database access, so the rules are directly testable. */
export function evaluateRules(
  applications: RuleInput[],
  context: { ferpaWaiverSigned: boolean; questBridgeRanked: boolean },
): Finding[] {
  const findings: Finding[] = [];
  const live = applications.filter(isLive);

  // ── More than one binding commitment ────────────────────────────────────
  const binding = live.filter((a) => ROUND_CONVENTIONS[a.round].isBinding);
  if (binding.length > 1) {
    findings.push({
      code: "MULTIPLE_BINDING_ED",
      severity: "BLOCKER",
      entityKey: binding
        .map((a) => a.id)
        .sort()
        .join("|"),
      message: `You have ${binding.length} binding applications: ${binding
        .map((a) => `${a.collegeName} (${roundLabel(a.round)})`)
        .join(", ")}.`,
      explanation:
        "Early Decision is a binding commitment, and you may hold only one at a time. " +
        "ED I and ED II are equally binding — being deferred or denied from ED I frees " +
        "you to apply ED II, but the two cannot be live at once.",
      citationUrl:
        "https://www.ivycoach.com/the-ivy-coach-blog/early-decision-early-action/early-decision-vs-early-action/",
      entityIds: binding.map((a) => a.id),
    });
  }

  // ── Restrictive / Single-Choice Early Action exclusivity ────────────────
  const exclusive = live.filter((a) => ROUND_CONVENTIONS[a.round].isExclusiveEarly);
  const restrictive = exclusive.filter((a) => a.round === "REA" || a.round === "SCEA");

  for (const rea of restrictive) {
    // The standard carve-out is non-binding applications to public universities.
    const conflicts = live.filter(
      (other) =>
        other.id !== rea.id &&
        ROUND_CONVENTIONS[other.round].application.yearOffset === -1 &&
        other.round !== "RD" &&
        other.round !== "ROLLING" &&
        !(other.isPublic && !ROUND_CONVENTIONS[other.round].isBinding),
    );

    if (conflicts.length > 0) {
      findings.push({
        code: "REA_EXCLUSIVITY",
        severity: "BLOCKER",
        entityKey: `${rea.id}:${conflicts
          .map((c) => c.id)
          .sort()
          .join("|")}`,
        message: `${rea.collegeName} is ${roundLabel(rea.round)}, which conflicts with ${conflicts
          .map((c) => `${c.collegeName} (${roundLabel(c.round)})`)
          .join(", ")}.`,
        explanation:
          "Restrictive and Single-Choice Early Action let you apply early to only one " +
          "private college. Non-binding early applications to public universities are " +
          "the usual exception, and some colleges also allow foreign universities or " +
          "scholarship deadlines. Check the exact policy — it varies.",
        citationUrl: "https://ingeniusprep.com/blog/restrictive-early-action/",
        entityIds: [rea.id, ...conflicts.map((c) => c.id)],
      });
    }
  }

  // ── QuestBridge rankings are binding ────────────────────────────────────
  if (context.questBridgeRanked) {
    const bindingNonQb = live.filter(
      (a) => ROUND_CONVENTIONS[a.round].isBinding && a.round !== "QUESTBRIDGE_MATCH",
    );
    if (bindingNonQb.length > 0) {
      findings.push({
        code: "QUESTBRIDGE_ED_CONFLICT",
        severity: "BLOCKER",
        entityKey: bindingNonQb
          .map((a) => a.id)
          .sort()
          .join("|"),
        message: `Ranking colleges for the QuestBridge Match conflicts with ${bindingNonQb
          .map((a) => a.collegeName)
          .join(", ")}.`,
        explanation:
          "Ranking a college in the National College Match is a binding commitment — if " +
          "you match, you must attend. You cannot also hold a binding Early Decision " +
          "application elsewhere.",
        citationUrl:
          "https://www.questbridge.org/apply-to-college/programs/national-college-match/apply/ranking-colleges",
        entityIds: bindingNonQb.map((a) => a.id),
      });
    }
  }

  // ── Admitted under a binding round: withdraw everything else ────────────
  const bindingAccept = applications.find(
    (a) =>
      ROUND_CONVENTIONS[a.round].isBinding &&
      (a.decision === "ACCEPTED" || a.decision === "MATCHED"),
  );
  if (bindingAccept) {
    const stillOpen = live.filter((a) => a.id !== bindingAccept.id);
    if (stillOpen.length > 0) {
      findings.push({
        code: "ED_ACCEPTED_MUST_WITHDRAW",
        severity: "BLOCKER",
        entityKey: bindingAccept.id,
        message: `You were admitted to ${bindingAccept.collegeName} under a binding round. ${stillOpen.length} other applications are still open.`,
        explanation:
          "Accepting a binding offer obligates you to withdraw every other application, " +
          "including ones already submitted. Colleges share admitted-student lists and do " +
          "rescind offers over this.",
        entityIds: stillOpen.map((a) => a.id),
      });
    }
  }

  // ── FERPA waiver gates the whole recommendation pipeline ────────────────
  const needsRecs = live.some((a) => a.round !== "QUESTBRIDGE_MATCH");
  if (needsRecs && !context.ferpaWaiverSigned && live.length > 0) {
    findings.push({
      code: "MISSING_FERPA_WAIVER",
      severity: "WARNING",
      entityKey: "ferpa",
      message: "You haven't signed the FERPA waiver yet.",
      explanation:
        "On the Common App you cannot invite recommenders until the FERPA waiver is " +
        "signed. It blocks your entire recommendation pipeline, and students routinely " +
        "hit it weeks later than they should.",
      entityIds: [],
    });
  }

  // ── List balance ────────────────────────────────────────────────────────
  if (live.length >= 4) {
    const likely = live.filter((a) => a.tier === "LIKELY").length;
    if (likely === 0) {
      findings.push({
        code: "UNBALANCED_LIST",
        severity: "INFO",
        entityKey: "balance",
        message: "No likely schools on your list.",
        explanation:
          "A list with no schools you are very likely to be admitted to is the most " +
          "common way this process ends badly. Two or three is the usual advice.",
        entityIds: [],
      });
    }
  }

  return findings;
}

/** Re-evaluates and reconciles stored findings, preserving dismissals. */
export async function refreshRuleFindings(userId: string): Promise<Finding[]> {
  const [applications, profile] = await Promise.all([
    db.application.findMany({
      where: { userId, archivedAt: null },
      include: { college: { select: { name: true, type: true } } },
    }),
    db.studentProfile.findUnique({ where: { userId } }),
  ]);

  const inputs: RuleInput[] = applications.map((a) => ({
    id: a.id,
    collegeId: a.collegeId,
    collegeName: a.college.name,
    round: a.round,
    decision: a.decision,
    status: a.status,
    isPublic: a.college.type === "PUBLIC",
    tier: a.tier,
  }));

  const findings = evaluateRules(inputs, {
    ferpaWaiverSigned: profile?.ferpaWaiverSignedAt != null,
    questBridgeRanked:
      profile?.questBridgeStatus === "FINALIST" ||
      profile?.questBridgeStatus === "MATCHED",
  });

  const active = new Set(findings.map((f) => `${f.code}:${f.entityKey}`));

  // Resolve anything that no longer fires rather than deleting it, so the
  // timeline keeps a record that the conflict existed and was fixed.
  await db.ruleFinding.updateMany({
    where: { userId, resolvedAt: null },
    data: { resolvedAt: new Date() },
  });

  for (const finding of findings) {
    await db.ruleFinding.upsert({
      where: {
        userId_code_entityKey: {
          userId,
          code: finding.code,
          entityKey: finding.entityKey,
        },
      },
      update: {
        severity: finding.severity,
        message: finding.message,
        explanation: finding.explanation,
        citationUrl: finding.citationUrl,
        entityIds: finding.entityIds,
        resolvedAt: null,
      },
      create: {
        userId,
        code: finding.code,
        severity: finding.severity,
        entityKey: finding.entityKey,
        message: finding.message,
        explanation: finding.explanation,
        citationUrl: finding.citationUrl,
        entityIds: finding.entityIds,
      },
    });
  }

  return findings.filter((f) => active.has(`${f.code}:${f.entityKey}`));
}

export async function getActiveFindings(userId: string) {
  return db.ruleFinding.findMany({
    where: { userId, resolvedAt: null, dismissedAt: null },
    orderBy: [{ severity: "asc" }, { createdAt: "desc" }],
  });
}
