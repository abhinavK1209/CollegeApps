import type { SchoolTier } from "@prisma/client";

export interface TierInputs {
  admitRate: number | null;
  sat25: number | null;
  sat75: number | null;
  act25: number | null;
  act75: number | null;
}

export interface StudentStats {
  satTotal?: number | null;
  actComposite?: number | null;
}

export type TierSuggestion =
  | { tier: SchoolTier; confidence: "high" | "low"; reason: string }
  | { tier: null; confidence: "none"; reason: string };

/**
 * Suggests reach / target / likely from admit rate and test-score position.
 *
 * Deliberately conservative and explainable — it returns a reason string that the
 * UI shows verbatim, and it refuses to guess when it lacks data rather than
 * producing a confident-looking number from nothing. This is a planning aid, not
 * an admissions prediction; see docs/01-PRD.md §3 (chancing is an explicit
 * non-goal because it raises anxiety without being accurate).
 */
export function suggestTier(college: TierInputs, student: StudentStats): TierSuggestion {
  const { admitRate } = college;
  const scorePosition = positionInRange(college, student);

  if (admitRate === null && scorePosition === null) {
    return {
      tier: null,
      confidence: "none",
      reason: "No admission data yet — import College Scorecard statistics.",
    };
  }

  // Sub-20% admit rates are a reach for everyone. Nothing in a student profile
  // reliably overrides that, and implying otherwise would be dishonest.
  if (admitRate !== null && admitRate < 0.2) {
    return {
      tier: "REACH",
      confidence: "high",
      reason: `Admits ${formatRate(admitRate)} of applicants — a reach regardless of scores.`,
    };
  }

  if (scorePosition === null) {
    if (admitRate === null) {
      return { tier: null, confidence: "none", reason: "Not enough data." };
    }
    const tier: SchoolTier =
      admitRate < 0.5 ? "REACH" : admitRate < 0.8 ? "TARGET" : "LIKELY";
    return {
      tier,
      confidence: "low",
      reason: `Based on a ${formatRate(admitRate)} admit rate. Add your test scores for a better estimate.`,
    };
  }

  const selectivity = admitRate ?? 0.5;

  if (scorePosition >= 0.75 && selectivity >= 0.5) {
    return {
      tier: "LIKELY",
      confidence: "high",
      reason: `Your scores are at or above the 75th percentile and it admits ${formatRate(selectivity)}.`,
    };
  }

  if (scorePosition >= 0.5) {
    return {
      tier: selectivity < 0.35 ? "REACH" : "TARGET",
      confidence: "high",
      reason:
        selectivity < 0.35
          ? `Your scores fit, but it admits only ${formatRate(selectivity)}.`
          : "Your scores sit in the middle of its admitted range.",
    };
  }

  return {
    tier: "REACH",
    confidence: "high",
    reason: "Your scores are below its middle 50% range.",
  };
}

/**
 * Where the student's score falls in the college's middle-50% band.
 * 0 = at the 25th percentile, 1 = at the 75th. Clamped to [0, 1.5].
 * Prefers SAT when both are available, and returns the better of the two.
 */
function positionInRange(college: TierInputs, student: StudentStats): number | null {
  const positions: number[] = [];

  if (student.satTotal && college.sat25 && college.sat75) {
    positions.push(interpolate(student.satTotal, college.sat25, college.sat75));
  }
  if (student.actComposite && college.act25 && college.act75) {
    positions.push(interpolate(student.actComposite, college.act25, college.act75));
  }

  if (positions.length === 0) return null;
  return Math.max(...positions);
}

function interpolate(score: number, p25: number, p75: number): number {
  if (p75 <= p25) return score >= p75 ? 1 : 0;
  return Math.min(1.5, Math.max(0, (score - p25) / (p75 - p25)));
}

function formatRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}
