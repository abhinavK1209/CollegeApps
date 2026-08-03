import { describe, expect, it } from "vitest";
import type { ApplicationRound } from "@prisma/client";
import { evaluateRules, type RuleInput } from "./rule-engine";

let counter = 0;
function app(
  collegeName: string,
  round: ApplicationRound,
  overrides: Partial<RuleInput> = {},
): RuleInput {
  counter += 1;
  return {
    id: `app-${counter}`,
    collegeId: `college-${counter}`,
    collegeName,
    round,
    decision: null,
    status: "IN_PROGRESS",
    isPublic: false,
    tier: null,
    ...overrides,
  };
}

const CTX = { ferpaWaiverSigned: true, questBridgeRanked: false };
const codes = (findings: { code: string }[]) => findings.map((f) => f.code);

describe("evaluateRules — binding rounds", () => {
  it("allows a single ED application", () => {
    const findings = evaluateRules([app("Duke", "ED1")], CTX);
    expect(codes(findings)).not.toContain("MULTIPLE_BINDING_ED");
  });

  it("flags two binding applications", () => {
    const findings = evaluateRules([app("Duke", "ED1"), app("Rice", "ED2")], CTX);
    expect(codes(findings)).toContain("MULTIPLE_BINDING_ED");
  });

  it("allows ED2 once the ED1 was denied", () => {
    const findings = evaluateRules(
      [app("Duke", "ED1", { decision: "DENIED" }), app("Rice", "ED2")],
      CTX,
    );
    expect(codes(findings)).not.toContain("MULTIPLE_BINDING_ED");
  });

  it("allows ED alongside any number of non-binding EA applications", () => {
    const findings = evaluateRules(
      [app("Duke", "ED1"), app("Michigan", "EA"), app("Purdue", "EA")],
      CTX,
    );
    expect(codes(findings)).not.toContain("MULTIPLE_BINDING_ED");
  });
});

describe("evaluateRules — restrictive early action", () => {
  it("permits REA plus a public-university EA, the standard carve-out", () => {
    const findings = evaluateRules(
      [app("Harvard", "REA"), app("Georgia Tech", "EA", { isPublic: true })],
      CTX,
    );
    expect(codes(findings)).not.toContain("REA_EXCLUSIVITY");
  });

  it("flags REA plus a private ED", () => {
    const findings = evaluateRules([app("Harvard", "REA"), app("Duke", "ED1")], CTX);
    expect(codes(findings)).toContain("REA_EXCLUSIVITY");
  });

  it("flags REA plus a private EA", () => {
    const findings = evaluateRules([app("Yale", "SCEA"), app("Tufts", "EA")], CTX);
    expect(codes(findings)).toContain("REA_EXCLUSIVITY");
  });

  it("permits REA alongside Regular Decision anywhere", () => {
    const findings = evaluateRules(
      [app("Stanford", "REA"), app("Columbia", "RD"), app("NYU", "RD")],
      CTX,
    );
    expect(codes(findings)).not.toContain("REA_EXCLUSIVITY");
  });

  it("permits REA alongside a binding public ED only when non-binding", () => {
    // A binding ED at a public university is still a conflict.
    const findings = evaluateRules(
      [app("Princeton", "REA"), app("UVA", "ED1", { isPublic: true })],
      CTX,
    );
    expect(codes(findings)).toContain("REA_EXCLUSIVITY");
  });
});

describe("evaluateRules — QuestBridge", () => {
  it("flags ranking colleges while holding a binding ED", () => {
    const findings = evaluateRules([app("Duke", "ED1")], {
      ...CTX,
      questBridgeRanked: true,
    });
    expect(codes(findings)).toContain("QUESTBRIDGE_ED_CONFLICT");
  });

  it("does not flag the Match round itself", () => {
    const findings = evaluateRules([app("Rice", "QUESTBRIDGE_MATCH")], {
      ...CTX,
      questBridgeRanked: true,
    });
    expect(codes(findings)).not.toContain("QUESTBRIDGE_ED_CONFLICT");
  });
});

describe("evaluateRules — post-decision obligations", () => {
  it("requires withdrawing others after a binding acceptance", () => {
    const findings = evaluateRules(
      [
        app("Duke", "ED1", { decision: "ACCEPTED" }),
        app("Michigan", "RD"),
        app("NYU", "RD"),
      ],
      CTX,
    );
    const finding = findings.find((f) => f.code === "ED_ACCEPTED_MUST_WITHDRAW");
    expect(finding).toBeDefined();
    expect(finding?.entityIds).toHaveLength(2);
  });

  it("stays quiet when nothing else is open", () => {
    const findings = evaluateRules(
      [
        app("Duke", "ED1", { decision: "ACCEPTED" }),
        app("NYU", "RD", { decision: "WITHDRAWN" }),
      ],
      CTX,
    );
    expect(codes(findings)).not.toContain("ED_ACCEPTED_MUST_WITHDRAW");
  });

  it("treats a deferral as still live, not resolved", () => {
    const findings = evaluateRules(
      [app("Duke", "ED1", { decision: "DEFERRED" }), app("Rice", "ED2")],
      CTX,
    );
    // Deferred ED1 no longer binds, but this app models it as live until the
    // student records the outcome — surfacing the conflict is the safe default.
    expect(codes(findings)).toContain("MULTIPLE_BINDING_ED");
  });
});

describe("evaluateRules — gates and balance", () => {
  it("warns about an unsigned FERPA waiver", () => {
    const findings = evaluateRules([app("Duke", "ED1")], {
      ...CTX,
      ferpaWaiverSigned: false,
    });
    expect(codes(findings)).toContain("MISSING_FERPA_WAIVER");
  });

  it("flags a list with no likely schools once it is large enough", () => {
    const findings = evaluateRules(
      [
        app("Duke", "RD", { tier: "REACH" }),
        app("Rice", "RD", { tier: "REACH" }),
        app("NYU", "RD", { tier: "TARGET" }),
        app("BU", "RD", { tier: "TARGET" }),
      ],
      CTX,
    );
    expect(codes(findings)).toContain("UNBALANCED_LIST");
  });

  it("stays quiet on a balanced list", () => {
    const findings = evaluateRules(
      [
        app("Duke", "RD", { tier: "REACH" }),
        app("NYU", "RD", { tier: "TARGET" }),
        app("Rutgers", "RD", { tier: "LIKELY" }),
        app("Delaware", "RD", { tier: "LIKELY" }),
      ],
      CTX,
    );
    expect(codes(findings)).not.toContain("UNBALANCED_LIST");
  });

  it("returns nothing for an empty list", () => {
    expect(evaluateRules([], CTX)).toHaveLength(0);
  });
});
