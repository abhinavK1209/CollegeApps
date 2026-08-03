import type { PromptKind } from "@prisma/client";

/**
 * Scores how well an existing essay could answer a new prompt.
 *
 * Reuse is the single biggest lever on workload — a student with 14 schools
 * writes 20+ supplements, and many ask the same question at different word
 * counts. It is also the biggest hazard: the classic failure is submitting an
 * essay that names the wrong college.
 *
 * The scorer is deliberately conservative. It never claims two prompts are
 * interchangeable; it says how close they are and what would have to change.
 */

export interface ReuseCandidate {
  essayId: string;
  title: string;
  promptKind: PromptKind;
  topicTags: string[];
  wordCount: number;
  status: string;
  /** The platform this essay was written for, if known. */
  platform?: string | null;
}

export interface ReuseTarget {
  promptKind: PromptKind;
  topicTags: string[];
  wordMax: number | null;
  platform?: string | null;
}

export interface ReuseSuggestion {
  essayId: string;
  title: string;
  /** 0–100. */
  score: number;
  /** Words to cut (positive) or add (negative) to fit the target. */
  wordDelta: number | null;
  notes: string[];
  /** True when the systems differ enough that trimming is the wrong approach. */
  requiresRewrite: boolean;
}

/** Prompts that answer adjacent questions and often share material. */
const ADJACENT: Partial<Record<PromptKind, PromptKind[]>> = {
  WHY_US: ["WHY_MAJOR", "INTELLECTUAL_INTEREST"],
  WHY_MAJOR: ["WHY_US", "INTELLECTUAL_INTEREST"],
  INTELLECTUAL_INTEREST: ["WHY_MAJOR", "ACTIVITY"],
  COMMUNITY: ["DIVERSITY", "CHALLENGE"],
  DIVERSITY: ["COMMUNITY"],
  ACTIVITY: ["INTELLECTUAL_INTEREST", "CHALLENGE"],
  CHALLENGE: ["COMMUNITY", "ACTIVITY"],
};

const MATURITY: Record<string, number> = {
  FINAL: 1,
  SUBMITTED: 1,
  REVIEW: 0.85,
  REVISING: 0.7,
  DRAFTING: 0.3,
  OUTLINE: 0.1,
  BRAINSTORM: 0.05,
  NOT_STARTED: 0,
};

function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a.map((t) => t.toLowerCase()));
  const setB = new Set(b.map((t) => t.toLowerCase()));
  let shared = 0;
  for (const tag of setA) if (setB.has(tag)) shared += 1;
  return shared / (setA.size + setB.size - shared);
}

function kindMatch(source: PromptKind, target: PromptKind): number {
  if (source === target) return 1;
  if (ADJACENT[target]?.includes(source)) return 0.5;
  return 0;
}

export function scoreReuse(
  candidate: ReuseCandidate,
  target: ReuseTarget,
): ReuseSuggestion {
  const notes: string[] = [];

  // UC Personal Insight Questions are not shortened Common App essays. They
  // reward front-loaded, action-and-outcome prose answering the question
  // directly, where the Common App rewards reflective narrative. Suggesting a
  // trim across that boundary produces bad essays, so it is demoted and
  // labelled rather than hidden.
  const crossesUcBoundary =
    (candidate.promptKind === "UC_PIQ") !== (target.promptKind === "UC_PIQ");

  const kind = kindMatch(candidate.promptKind, target.promptKind);
  const tags = jaccard(candidate.topicTags, target.topicTags);

  let fit = 1;
  let wordDelta: number | null = null;
  if (target.wordMax !== null && target.wordMax > 0) {
    wordDelta = candidate.wordCount - target.wordMax;
    fit = Math.max(0, 1 - Math.abs(wordDelta) / target.wordMax);
    if (wordDelta > 0) {
      notes.push(`Cut about ${wordDelta} words.`);
    } else if (wordDelta < -Math.round(target.wordMax * 0.25)) {
      notes.push(`Expand by about ${Math.abs(wordDelta)} words.`);
    }
  }

  const maturity = MATURITY[candidate.status] ?? 0.3;

  let score = (0.45 * kind + 0.25 * tags + 0.2 * fit + 0.1 * maturity) * 100;

  if (crossesUcBoundary) {
    score *= 0.55;
    notes.push("Different application system — UC answers need rewriting, not trimming.");
  }

  return {
    essayId: candidate.essayId,
    title: candidate.title,
    score: Math.round(score),
    wordDelta,
    notes,
    requiresRewrite: crossesUcBoundary,
  };
}

export function rankReuse(
  candidates: ReuseCandidate[],
  target: ReuseTarget,
  minScore = 25,
): ReuseSuggestion[] {
  return candidates
    .map((candidate) => scoreReuse(candidate, target))
    .filter((suggestion) => suggestion.score >= minScore)
    .sort((a, b) => b.score - a.score);
}

/**
 * Finds other colleges named in a draft — the "Why Michigan?" essay submitted to
 * Duke problem. Matches whole words only, and ignores the intended target.
 */
export function findForeignCollegeMentions(
  text: string,
  collegeNames: string[],
  intendedCollege: string | null,
): string[] {
  const found = new Set<string>();
  const haystack = text.toLowerCase();
  const intended = intendedCollege?.toLowerCase() ?? "";

  for (const name of collegeNames) {
    const needle = name.toLowerCase();
    if (!needle || needle.length < 4) continue;
    if (intended.includes(needle)) continue;

    const pattern = new RegExp(`\\b${escapeRegex(needle)}\\b`);
    if (pattern.test(haystack)) found.add(name);
  }

  return [...found];
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function wordCount(text: string): number {
  const trimmed = text.trim();
  return trimmed === "" ? 0 : trimmed.split(/\s+/).length;
}

/** Roughly 225 words per minute for prose read closely. */
export function readingTimeSeconds(words: number): number {
  return Math.round((words / 225) * 60);
}
