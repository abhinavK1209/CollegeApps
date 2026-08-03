import { describe, expect, it } from "vitest";
import {
  findForeignCollegeMentions,
  rankReuse,
  readingTimeSeconds,
  scoreReuse,
  wordCount,
  type ReuseCandidate,
  type ReuseTarget,
} from "./reuse";

function candidate(overrides: Partial<ReuseCandidate> = {}): ReuseCandidate {
  return {
    essayId: "e1",
    title: "Why Michigan",
    promptKind: "WHY_US",
    topicTags: ["research", "place"],
    wordCount: 400,
    status: "FINAL",
    ...overrides,
  };
}

function target(overrides: Partial<ReuseTarget> = {}): ReuseTarget {
  return {
    promptKind: "WHY_US",
    topicTags: ["research", "place"],
    wordMax: 250,
    ...overrides,
  };
}

describe("scoreReuse", () => {
  it("scores an exact-kind, same-topic essay highly", () => {
    expect(scoreReuse(candidate(), target()).score).toBeGreaterThan(60);
  });

  it("says how many words to cut", () => {
    const result = scoreReuse(candidate({ wordCount: 400 }), target({ wordMax: 250 }));
    expect(result.wordDelta).toBe(150);
    expect(result.notes.join(" ")).toContain("Cut about 150 words");
  });

  it("flags an essay that is far too short", () => {
    const result = scoreReuse(candidate({ wordCount: 100 }), target({ wordMax: 650 }));
    expect(result.wordDelta).toBe(-550);
    expect(result.notes.join(" ")).toContain("Expand by about 550");
  });

  it("scores an unrelated prompt kind near zero", () => {
    const result = scoreReuse(
      candidate({ promptKind: "WHY_US", topicTags: ["place"] }),
      target({ promptKind: "CHALLENGE", topicTags: ["failure"] }),
    );
    expect(result.score).toBeLessThan(30);
  });

  it("gives partial credit to adjacent prompt kinds", () => {
    const adjacent = scoreReuse(
      candidate({ promptKind: "WHY_MAJOR" }),
      target({ promptKind: "WHY_US" }),
    );
    const unrelated = scoreReuse(
      candidate({ promptKind: "CREATIVE" }),
      target({ promptKind: "WHY_US" }),
    );
    expect(adjacent.score).toBeGreaterThan(unrelated.score);
  });

  it("demotes and labels UC-to-CommonApp reuse", () => {
    const result = scoreReuse(
      candidate({ promptKind: "UC_PIQ", wordCount: 350 }),
      target({ promptKind: "COMMUNITY", wordMax: 350 }),
    );
    expect(result.requiresRewrite).toBe(true);
    expect(result.notes.join(" ")).toContain("rewriting, not trimming");
  });

  it("does not flag rewrite within the same system", () => {
    expect(scoreReuse(candidate(), target()).requiresRewrite).toBe(false);
  });

  it("prefers a finished essay over a rough draft", () => {
    const done = scoreReuse(candidate({ status: "FINAL" }), target());
    const rough = scoreReuse(candidate({ status: "BRAINSTORM" }), target());
    expect(done.score).toBeGreaterThan(rough.score);
  });
});

describe("rankReuse", () => {
  it("sorts by score and drops weak matches", () => {
    const ranked = rankReuse(
      [
        candidate({ essayId: "good" }),
        candidate({ essayId: "weak", promptKind: "CREATIVE", topicTags: ["art"] }),
      ],
      target(),
    );
    expect(ranked[0]?.essayId).toBe("good");
    expect(ranked.some((s) => s.essayId === "weak")).toBe(false);
  });
});

describe("findForeignCollegeMentions", () => {
  const names = ["Michigan", "Duke", "Brown", "Rice"];

  it("catches the wrong school name in a draft", () => {
    const found = findForeignCollegeMentions(
      "What excites me most about Michigan is the research culture.",
      names,
      "Duke University",
    );
    expect(found).toEqual(["Michigan"]);
  });

  it("ignores the intended college", () => {
    expect(
      findForeignCollegeMentions(
        "Duke's marine lab changed things.",
        names,
        "Duke University",
      ),
    ).toEqual([]);
  });

  it("does not match inside longer words", () => {
    // "Brown" must not fire on "brownstone".
    expect(
      findForeignCollegeMentions(
        "I sat on the brownstone steps.",
        names,
        "Duke University",
      ),
    ).toEqual([]);
  });

  it("is case-insensitive", () => {
    expect(findForeignCollegeMentions("michigan changed me", names, "Duke")).toEqual([
      "Michigan",
    ]);
  });

  it("returns empty for clean text", () => {
    expect(findForeignCollegeMentions("A clean essay.", names, "Duke")).toEqual([]);
  });
});

describe("wordCount and readingTime", () => {
  it("counts words ignoring extra whitespace", () => {
    expect(wordCount("  one   two \n three ")).toBe(3);
    expect(wordCount("")).toBe(0);
    expect(wordCount("   ")).toBe(0);
  });

  it("estimates reading time", () => {
    expect(readingTimeSeconds(225)).toBe(60);
    expect(readingTimeSeconds(0)).toBe(0);
  });
});
