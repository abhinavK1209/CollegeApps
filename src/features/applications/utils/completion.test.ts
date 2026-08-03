import { describe, expect, it } from "vitest";
import type { RequirementStatus, RequirementType } from "@prisma/client";
import { completion, type CompletionInput } from "./completion";

function req(
  type: RequirementType,
  status: RequirementStatus,
  isRequired = true,
): CompletionInput {
  return { type, status, isRequired };
}

describe("completion", () => {
  it("is 0 with nothing required", () => {
    expect(completion([])).toBe(0);
    expect(completion([req("ESSAY", "CONFIRMED_RECEIVED", false)])).toBe(0);
  });

  it("caps a fully submitted application at 90%", () => {
    const all: CompletionInput[] = [
      req("ESSAY", "SUBMITTED"),
      req("TEACHER_REC", "SUBMITTED"),
      req("TRANSCRIPT", "SUBMITTED"),
      req("FEE_OR_WAIVER", "SUBMITTED"),
    ];
    // The whole point: "sent everything" is not "done".
    expect(completion(all)).toBe(90);
  });

  it("reaches 100 only once everything is confirmed received", () => {
    const all: CompletionInput[] = [
      req("ESSAY", "CONFIRMED_RECEIVED"),
      req("TEACHER_REC", "CONFIRMED_RECEIVED"),
      req("TRANSCRIPT", "CONFIRMED_RECEIVED"),
    ];
    expect(completion(all)).toBe(100);
  });

  it("weights essays above fees", () => {
    const essayDone = completion([
      req("ESSAY", "CONFIRMED_RECEIVED"),
      req("FEE_OR_WAIVER", "NOT_STARTED"),
    ]);
    const feeDone = completion([
      req("ESSAY", "NOT_STARTED"),
      req("FEE_OR_WAIVER", "CONFIRMED_RECEIVED"),
    ]);
    expect(essayDone).toBeGreaterThan(feeDone);
    expect(essayDone).toBe(75); // 3 of 4 weight
    expect(feeDone).toBe(25);
  });

  it("counts in-progress as half", () => {
    expect(completion([req("FEE_OR_WAIVER", "IN_PROGRESS")])).toBe(50);
  });

  it("treats waived and not-applicable as satisfied", () => {
    expect(completion([req("TEST_SCORES", "WAIVED")])).toBe(100);
    expect(completion([req("INTERVIEW", "NOT_APPLICABLE")])).toBe(100);
  });

  it("ignores optional requirements entirely", () => {
    const withOptional = completion([
      req("ESSAY", "CONFIRMED_RECEIVED"),
      req("TEST_SCORES", "NOT_STARTED", false),
    ]);
    expect(withOptional).toBe(100);
  });

  it("is 0 for a brand-new application", () => {
    expect(
      completion([req("ESSAY", "NOT_STARTED"), req("TRANSCRIPT", "NOT_STARTED")]),
    ).toBe(0);
  });
});
