import type { DocumentType } from "@prisma/client";

/**
 * The documents an applicant is actually asked for, and why. Kept as data so the
 * page can show what is still missing rather than only what has been collected —
 * the failure mode is forgetting a document exists, not misfiling one.
 */
export interface ExpectedDocument {
  type: DocumentType;
  label: string;
  /** Why it is needed, in the words a student would recognize. */
  reason: string;
  /** Only requested when applying for need-based aid. */
  aidOnly: boolean;
}

export const EXPECTED_DOCUMENTS: readonly ExpectedDocument[] = [
  {
    type: "TRANSCRIPT",
    label: "Transcript",
    reason: "Sent by your counselor, but you are responsible for requesting it.",
    aidOnly: false,
  },
  {
    type: "RESUME",
    label: "Résumé",
    reason: "Many colleges allow an upload; recommenders almost always want one.",
    aidOnly: false,
  },
  {
    type: "BRAG_SHEET",
    label: "Brag sheet",
    reason: "What your counselor writes the recommendation from.",
    aidOnly: false,
  },
  {
    type: "TEST_REPORT",
    label: "Test score report",
    reason: "Official sends come from the testing agency, not from you.",
    aidOnly: false,
  },
  {
    type: "TAX_RETURN",
    label: "Tax return",
    reason: "CSS Profile and IDOC ask for the prior-prior year.",
    aidOnly: true,
  },
  {
    type: "W2",
    label: "W-2",
    reason: "IDOC wants every W-2 for the tax year, from every job.",
    aidOnly: true,
  },
];

export interface ChecklistEntry extends ExpectedDocument {
  /** How many tracked documents cover this slot. */
  count: number;
}

/**
 * Which expected documents are still missing, given what is tracked. `aidOnly`
 * rows drop out entirely when the student is not applying for need-based aid, so
 * the list never nags about paperwork that does not apply.
 */
export function documentChecklist(
  tracked: readonly { type: DocumentType }[],
  { applyingForAid }: { applyingForAid: boolean },
): ChecklistEntry[] {
  const counts = new Map<DocumentType, number>();
  for (const document of tracked) {
    counts.set(document.type, (counts.get(document.type) ?? 0) + 1);
  }

  return EXPECTED_DOCUMENTS.filter((expected) => applyingForAid || !expected.aidOnly).map(
    (expected) => ({ ...expected, count: counts.get(expected.type) ?? 0 }),
  );
}
