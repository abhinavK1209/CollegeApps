import { describe, expect, it } from "vitest";
import { rankScholarships, type ScholarshipInput } from "./expected-value";

const NOW = new Date("2026-11-01T12:00:00Z").getTime();
const DAY = 86_400_000;

function scholarship(overrides: Partial<ScholarshipInput> = {}): ScholarshipInput {
  return {
    id: "s1",
    name: "Award",
    amountCents: 100_000,
    effortEstimateMinutes: 60,
    scope: "NATIONAL",
    deadlineAt: null,
    ...overrides,
  };
}

describe("rankScholarships", () => {
  it("prefers a local award over a national one of equal size and effort", () => {
    const [first] = rankScholarships(
      [
        scholarship({ id: "national", scope: "NATIONAL" }),
        scholarship({ id: "local", scope: "LOCAL" }),
      ],
      NOW,
    );
    expect(first?.id).toBe("local");
  });

  it("prefers less effort for the same money", () => {
    const [first] = rankScholarships(
      [
        scholarship({ id: "slow", effortEstimateMinutes: 600 }),
        scholarship({ id: "fast", effortEstimateMinutes: 30 }),
      ],
      NOW,
    );
    expect(first?.id).toBe("fast");
  });

  it("can rank a small local award above a big national one", () => {
    // $500 local in 30 minutes beats $5,000 national needing 40 hours.
    const [first] = rankScholarships(
      [
        scholarship({
          id: "big-national",
          amountCents: 500_000,
          effortEstimateMinutes: 2400,
          scope: "NATIONAL",
        }),
        scholarship({
          id: "small-local",
          amountCents: 50_000,
          effortEstimateMinutes: 30,
          scope: "LOCAL",
        }),
      ],
      NOW,
    );
    expect(first?.id).toBe("small-local");
  });

  it("surfaces imminent deadlines in the reason", () => {
    const [only] = rankScholarships(
      [scholarship({ deadlineAt: new Date(NOW + 3 * DAY) })],
      NOW,
    );
    expect(only?.reason).toBe("Closes in 3 days.");
  });

  it("marks passed deadlines", () => {
    const [only] = rankScholarships(
      [scholarship({ deadlineAt: new Date(NOW - 2 * DAY) })],
      NOW,
    );
    expect(only?.reason).toBe("Deadline passed.");
  });

  it("asks for missing data instead of inventing a rank", () => {
    const [only] = rankScholarships([scholarship({ amountCents: null })], NOW);
    expect(only?.expectedValuePerHour).toBe(0);
    expect(only?.reason).toContain("Add an amount");
  });

  it("assumes a default effort when none is given", () => {
    const [only] = rankScholarships([scholarship({ effortEstimateMinutes: null })], NOW);
    expect(only?.expectedValuePerHour).toBeGreaterThan(0);
  });

  it("handles an empty list", () => {
    expect(rankScholarships([], NOW)).toEqual([]);
  });
});
