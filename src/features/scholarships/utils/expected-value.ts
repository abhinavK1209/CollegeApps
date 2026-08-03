import type { ScholarshipScope } from "@prisma/client";

/**
 * Ranks scholarships by dollars-per-hour of effort, weighted by how winnable the
 * scope is.
 *
 * Three in four students win nothing after averaging nine hours of searching and
 * applying, and the awards they most often miss are local ones — distributed
 * through counselor emails and community organizations rather than national
 * databases, with far better odds. Ranking by prize size alone sends students
 * straight at the national lotteries they will lose.
 */
const SCOPE_MULTIPLIER: Record<ScholarshipScope, number> = {
  LOCAL: 3,
  REGIONAL: 2,
  STATE: 1.5,
  INSTITUTIONAL: 1.25,
  NATIONAL: 0.6,
};

export interface ScholarshipInput {
  id: string;
  name: string;
  amountCents: number | null;
  effortEstimateMinutes: number | null;
  scope: ScholarshipScope;
  deadlineAt: Date | null;
}

export interface RankedScholarship extends ScholarshipInput {
  /** Effort-adjusted dollars per hour, scaled by winnability. */
  expectedValuePerHour: number;
  reason: string;
  daysUntilDeadline: number | null;
}

const DAY = 86_400_000;
const DEFAULT_EFFORT_MINUTES = 120;

export function rankScholarships(
  scholarships: ScholarshipInput[],
  nowMs: number,
): RankedScholarship[] {
  return scholarships
    .map((scholarship) => {
      const amount = (scholarship.amountCents ?? 0) / 100;
      const hours = (scholarship.effortEstimateMinutes ?? DEFAULT_EFFORT_MINUTES) / 60;
      const multiplier = SCOPE_MULTIPLIER[scholarship.scope];
      const expectedValuePerHour = hours > 0 ? (amount / hours) * multiplier : 0;

      const daysUntilDeadline =
        scholarship.deadlineAt === null
          ? null
          : Math.floor(scholarship.deadlineAt.getTime() / DAY) - Math.floor(nowMs / DAY);

      return {
        ...scholarship,
        expectedValuePerHour,
        daysUntilDeadline,
        reason: explain(scholarship.scope, amount, hours, daysUntilDeadline),
      };
    })
    .sort((a, b) => b.expectedValuePerHour - a.expectedValuePerHour);
}

function explain(
  scope: ScholarshipScope,
  amount: number,
  hours: number,
  days: number | null,
): string {
  if (days !== null && days < 0) return "Deadline passed.";
  if (days !== null && days <= 7) return `Closes in ${days} days.`;
  if (scope === "LOCAL") return "Local award — far better odds than national ones.";
  if (hours > 0 && amount > 0) {
    return `About $${Math.round(amount / hours).toLocaleString("en-US")} per hour of work.`;
  }
  return "Add an amount and effort estimate to rank this.";
}
