import type { RequirementStatus, RequirementType } from "@prisma/client";

/** Essays and the document supply chain carry more weight than a fee payment. */
const WEIGHTS: Partial<Record<RequirementType, number>> = {
  ESSAY: 3,
  TEACHER_REC: 2,
  COUNSELOR_REC: 2,
  SCHOOL_REPORT: 2,
  TRANSCRIPT: 2,
};

/**
 * Submission caps a requirement at 0.9. The final tenth is the college
 * confirming it actually arrived.
 *
 * This is the product's central opinion expressed as arithmetic: research shows
 * applications fail after submission, not at it, so an application where
 * everything is "sent" but nothing is confirmed should never read as done.
 */
const PROGRESS: Record<RequirementStatus, number> = {
  NOT_STARTED: 0,
  IN_PROGRESS: 0.5,
  SUBMITTED: 0.9,
  CONFIRMED_RECEIVED: 1,
  WAIVED: 1,
  NOT_APPLICABLE: 1,
};

export interface CompletionInput {
  type: RequirementType;
  status: RequirementStatus;
  isRequired: boolean;
}

/** Weighted completion percentage over required requirements only. */
export function completion(requirements: CompletionInput[]): number {
  const required = requirements.filter((r) => r.isRequired);
  if (required.length === 0) return 0;

  let earned = 0;
  let total = 0;
  for (const requirement of required) {
    const weight = WEIGHTS[requirement.type] ?? 1;
    total += weight;
    earned += weight * PROGRESS[requirement.status];
  }
  return Math.round((earned / total) * 100);
}
