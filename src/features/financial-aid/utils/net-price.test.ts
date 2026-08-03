import { describe, expect, it } from "vitest";
import { computeNetPrice, formatCents, type AwardInput } from "./net-price";

function award(overrides: Partial<AwardInput> = {}): AwardInput {
  return {
    costOfAttendanceCents: 8_920_000,
    institutionalGrantCents: 0,
    federalGrantCents: 0,
    stateGrantCents: 0,
    meritScholarshipCents: 0,
    outsideScholarshipCents: 0,
    workStudyCents: 0,
    subsidizedLoanCents: 0,
    unsubsidizedLoanCents: 0,
    parentPlusLoanCents: 0,
    ...overrides,
  };
}

describe("computeNetPrice", () => {
  it("subtracts every kind of gift aid", () => {
    const result = computeNetPrice(
      award({
        institutionalGrantCents: 6_100_000,
        federalGrantCents: 739_500,
        outsideScholarshipCents: 350_000,
      }),
    );
    expect(result.giftAidCents).toBe(7_189_500);
    expect(result.netPriceCents).toBe(1_730_500);
  });

  it("never subtracts loans", () => {
    const withLoans = computeNetPrice(
      award({ institutionalGrantCents: 5_000_000, subsidizedLoanCents: 550_000 }),
    );
    const withoutLoans = computeNetPrice(award({ institutionalGrantCents: 5_000_000 }));
    // A loan must not make a college look cheaper.
    expect(withLoans.netPriceCents).toBe(withoutLoans.netPriceCents);
  });

  it("never subtracts work-study", () => {
    const result = computeNetPrice(
      award({ institutionalGrantCents: 5_000_000, workStudyCents: 300_000 }),
    );
    expect(result.netPriceCents).toBe(3_920_000);
    expect(result.workStudyCents).toBe(300_000);
  });

  it("reports what share of the package is debt", () => {
    const result = computeNetPrice(
      award({ institutionalGrantCents: 5_000_000, subsidizedLoanCents: 5_000_000 }),
    );
    expect(result.debtShare).toBeCloseTo(0.5, 5);
  });

  it("floors at zero when aid exceeds cost", () => {
    expect(
      computeNetPrice(award({ institutionalGrantCents: 10_000_000 })).netPriceCents,
    ).toBe(0);
  });

  it("projects four years", () => {
    const result = computeNetPrice(award({ institutionalGrantCents: 6_920_000 }));
    expect(result.netPriceCents).toBe(2_000_000);
    expect(result.fourYearCents).toBe(8_000_000);
  });

  it("handles a package with no aid at all", () => {
    const result = computeNetPrice(award());
    expect(result.netPriceCents).toBe(8_920_000);
    expect(result.debtShare).toBe(0);
  });
});

describe("formatCents", () => {
  it("renders whole dollars with separators", () => {
    expect(formatCents(1_730_500)).toBe("$17,305");
    expect(formatCents(0)).toBe("$0");
  });
});
