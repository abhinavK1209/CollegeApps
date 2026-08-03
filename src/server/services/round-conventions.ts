import type { ApplicationRound, DeadlineKind } from "@prisma/client";

/**
 * Typical deadline conventions by round.
 *
 * These are NOT per-college claims. Colleges publish their own dates and they
 * vary; what is stable is the convention (ED1 clusters on Nov 1, RD on Jan 1).
 * Every deadline generated from this table is written with confidence LOW and a
 * label saying it is typical, so the UI can prompt the student to verify against
 * the college's own site. See risk R1 — a confidently wrong date is worse than
 * an openly approximate one.
 *
 * Once a real date is entered, `isUserOverridden` protects it from regeneration.
 */
export interface RoundConvention {
  /** Month is 1-indexed. Year offset is relative to the application cycle. */
  application: { month: number; day: number; yearOffset: -1 | 0 };
  /** Institutional aid forms are usually due with, or shortly after, the app. */
  aid?: { month: number; day: number; yearOffset: -1 | 0 };
  decisionRelease?: { month: number; day: number; yearOffset: -1 | 0 };
  isBinding: boolean;
  /** Restricts what else may be filed in the early round. */
  isExclusiveEarly: boolean;
  label: string;
}

/**
 * yearOffset -1 means the calendar year before the entering-class year: for a
 * 2027 entering class, ED1 falls on Nov 1 2026 and RD on Jan 1 2027.
 */
export const ROUND_CONVENTIONS: Record<ApplicationRound, RoundConvention> = {
  ED1: {
    application: { month: 11, day: 1, yearOffset: -1 },
    aid: { month: 11, day: 1, yearOffset: -1 },
    decisionRelease: { month: 12, day: 15, yearOffset: -1 },
    isBinding: true,
    isExclusiveEarly: true,
    label: "Early Decision I",
  },
  ED2: {
    application: { month: 1, day: 1, yearOffset: 0 },
    aid: { month: 2, day: 1, yearOffset: 0 },
    decisionRelease: { month: 2, day: 15, yearOffset: 0 },
    isBinding: true,
    isExclusiveEarly: false,
    label: "Early Decision II",
  },
  EA: {
    application: { month: 11, day: 1, yearOffset: -1 },
    aid: { month: 11, day: 15, yearOffset: -1 },
    decisionRelease: { month: 12, day: 20, yearOffset: -1 },
    isBinding: false,
    isExclusiveEarly: false,
    label: "Early Action",
  },
  REA: {
    application: { month: 11, day: 1, yearOffset: -1 },
    aid: { month: 11, day: 1, yearOffset: -1 },
    decisionRelease: { month: 12, day: 15, yearOffset: -1 },
    isBinding: false,
    isExclusiveEarly: true,
    label: "Restrictive Early Action",
  },
  SCEA: {
    application: { month: 11, day: 1, yearOffset: -1 },
    aid: { month: 11, day: 1, yearOffset: -1 },
    decisionRelease: { month: 12, day: 15, yearOffset: -1 },
    isBinding: false,
    isExclusiveEarly: true,
    label: "Single-Choice Early Action",
  },
  RD: {
    application: { month: 1, day: 1, yearOffset: 0 },
    aid: { month: 2, day: 1, yearOffset: 0 },
    decisionRelease: { month: 3, day: 25, yearOffset: 0 },
    isBinding: false,
    isExclusiveEarly: false,
    label: "Regular Decision",
  },
  ROLLING: {
    application: { month: 12, day: 1, yearOffset: -1 },
    isBinding: false,
    isExclusiveEarly: false,
    label: "Rolling",
  },
  QUESTBRIDGE_MATCH: {
    // Fixed nationally by QuestBridge rather than by each college, so these are
    // the one set of dates in this table that are genuinely precise.
    application: { month: 9, day: 26, yearOffset: -1 },
    decisionRelease: { month: 12, day: 1, yearOffset: -1 },
    isBinding: true,
    isExclusiveEarly: true,
    label: "QuestBridge National College Match",
  },
  PRIORITY: {
    application: { month: 12, day: 1, yearOffset: -1 },
    aid: { month: 12, day: 1, yearOffset: -1 },
    isBinding: false,
    isExclusiveEarly: false,
    label: "Priority",
  },
  TRANSFER: {
    application: { month: 3, day: 1, yearOffset: 0 },
    isBinding: false,
    isExclusiveEarly: false,
    label: "Transfer",
  },
};

export const BINDING_ROUNDS: ApplicationRound[] = (
  Object.entries(ROUND_CONVENTIONS) as [ApplicationRound, RoundConvention][]
)
  .filter(([, c]) => c.isBinding)
  .map(([round]) => round);

export const EXCLUSIVE_EARLY_ROUNDS: ApplicationRound[] = (
  Object.entries(ROUND_CONVENTIONS) as [ApplicationRound, RoundConvention][]
)
  .filter(([, c]) => c.isExclusiveEarly)
  .map(([round]) => round);

/** Builds a UTC date from a convention entry and the entering-class year. */
export function conventionDate(
  entry: { month: number; day: number; yearOffset: -1 | 0 },
  cycleYear: number,
): Date {
  // 23:59 local-to-college is the norm; stored UTC with the zone alongside.
  return new Date(
    Date.UTC(cycleYear + entry.yearOffset, entry.month - 1, entry.day, 23, 59, 0),
  );
}

export function roundLabel(round: ApplicationRound): string {
  return ROUND_CONVENTIONS[round].label;
}

export const DEADLINE_TITLES: Partial<Record<DeadlineKind, string>> = {
  APPLICATION: "Application due",
  CSS_PROFILE: "CSS Profile due",
  FAFSA_PRIORITY: "FAFSA priority date",
  INSTITUTIONAL_AID: "Institutional aid forms due",
  DECISION_RELEASE: "Decision expected",
  MID_YEAR_REPORT: "Mid-year report due",
};
