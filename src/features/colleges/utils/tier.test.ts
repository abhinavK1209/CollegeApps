import { describe, expect, it } from "vitest";
import { suggestTier, type TierInputs } from "./tier";

const NO_DATA: TierInputs = {
  admitRate: null,
  sat25: null,
  sat75: null,
  act25: null,
  act75: null,
};

describe("suggestTier", () => {
  it("refuses to guess with no data at all", () => {
    const result = suggestTier(NO_DATA, {});
    expect(result.tier).toBeNull();
    expect(result.confidence).toBe("none");
  });

  it("calls a sub-20% admit rate a reach even for a perfect scorer", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.04, sat25: 1500, sat75: 1580 },
      { satTotal: 1600 },
    );
    expect(result.tier).toBe("REACH");
    expect(result.reason).toContain("4%");
  });

  it("flags low confidence when only an admit rate is known", () => {
    const result = suggestTier({ ...NO_DATA, admitRate: 0.65 }, {});
    expect(result.tier).toBe("TARGET");
    expect(result.confidence).toBe("low");
    expect(result.reason).toContain("test scores");
  });

  it("calls it likely when scores clear the 75th at a non-selective school", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.72, sat25: 1150, sat75: 1330 },
      { satTotal: 1450 },
    );
    expect(result.tier).toBe("LIKELY");
  });

  it("stays a reach when scores fit but selectivity is high", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.28, sat25: 1400, sat75: 1530 },
      { satTotal: 1480 },
    );
    expect(result.tier).toBe("REACH");
  });

  it("is a target when scores sit mid-range at a moderately selective school", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.55, sat25: 1250, sat75: 1430 },
      { satTotal: 1350 },
    );
    expect(result.tier).toBe("TARGET");
  });

  it("is a reach when scores fall below the middle 50%", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.6, sat25: 1300, sat75: 1460 },
      { satTotal: 1150 },
    );
    expect(result.tier).toBe("REACH");
  });

  it("uses ACT when SAT is absent", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.7, act25: 24, act75: 30 },
      { actComposite: 33 },
    );
    expect(result.tier).toBe("LIKELY");
  });

  it("takes the better of SAT and ACT", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.7, sat25: 1300, sat75: 1450, act25: 24, act75: 30 },
      { satTotal: 1100, actComposite: 33 },
    );
    expect(result.tier).toBe("LIKELY");
  });

  it("handles a degenerate range without dividing by zero", () => {
    const result = suggestTier(
      { ...NO_DATA, admitRate: 0.6, sat25: 1400, sat75: 1400 },
      { satTotal: 1400 },
    );
    expect(result.tier).not.toBeNull();
  });
});
