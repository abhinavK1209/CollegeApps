import { describe, expect, it } from "vitest";

import { documentChecklist, EXPECTED_DOCUMENTS } from "./checklist";

describe("documentChecklist", () => {
  it("hides aid paperwork when the student is not applying for aid", () => {
    const entries = documentChecklist([], { applyingForAid: false });

    expect(entries.some((entry) => entry.type === "TAX_RETURN")).toBe(false);
    expect(entries.some((entry) => entry.type === "W2")).toBe(false);
    expect(entries.some((entry) => entry.type === "TRANSCRIPT")).toBe(true);
  });

  it("includes aid paperwork when the student is applying for aid", () => {
    const entries = documentChecklist([], { applyingForAid: true });

    expect(entries).toHaveLength(EXPECTED_DOCUMENTS.length);
    expect(entries.some((entry) => entry.type === "TAX_RETURN")).toBe(true);
  });

  it("counts every tracked document against its slot", () => {
    const entries = documentChecklist(
      [{ type: "W2" }, { type: "W2" }, { type: "TRANSCRIPT" }],
      { applyingForAid: true },
    );

    // Multiple W-2s is the normal case — IDOC wants one per job.
    expect(entries.find((entry) => entry.type === "W2")?.count).toBe(2);
    expect(entries.find((entry) => entry.type === "TRANSCRIPT")?.count).toBe(1);
    expect(entries.find((entry) => entry.type === "RESUME")?.count).toBe(0);
  });

  it("ignores tracked documents that are not on the expected list", () => {
    const entries = documentChecklist([{ type: "PORTFOLIO" }, { type: "OTHER" }], {
      applyingForAid: false,
    });

    expect(entries.every((entry) => entry.count === 0)).toBe(true);
  });
});
