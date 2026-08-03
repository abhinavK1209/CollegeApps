import type { Metadata } from "next";

import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { AddDocumentForm } from "@/features/documents/components/add-document-form";
import { DocumentRow } from "@/features/documents/components/document-row";
import { documentChecklist } from "@/features/documents/utils/checklist";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Documents" };

const TYPE_LABELS: Record<string, string> = {
  TRANSCRIPT: "Transcript",
  RESUME: "Résumé",
  BRAG_SHEET: "Brag sheet",
  AWARD_LETTER: "Award letter",
  TAX_RETURN: "Tax return",
  W2: "W-2",
  ESSAY_EXPORT: "Essay export",
  PORTFOLIO: "Portfolio",
  TEST_REPORT: "Test report",
  ACCEPTANCE_LETTER: "Acceptance letter",
  OTHER: "Other",
};

export default async function DocumentsPage() {
  const [documents, aidProfile] = await Promise.all([
    db.document.findMany({
      where: { userId: LOCAL_USER_ID },
      orderBy: [{ type: "asc" }, { createdAt: "desc" }],
    }),
    db.financialAidProfile.findUnique({ where: { userId: LOCAL_USER_ID } }),
  ]);

  const checklist = documentChecklist(documents, {
    applyingForAid: aidProfile !== null,
  });
  const missing = checklist.filter((entry) => entry.count === 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Documents
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          A register of what exists and where it lives — the transcript your counselor
          sends, the tax return in a parent&rsquo;s files, the award letter inside a
          portal. Nothing is uploaded here, so nothing sensitive is stored.
        </p>
      </header>

      <AddDocumentForm />

      {missing.length > 0 && (
        <section className="mt-6">
          <h2 className="text-fg-muted mb-2 text-[12px] font-medium tracking-[0.04em] uppercase">
            Not tracked yet
          </h2>
          <ul className="border-border divide-border divide-y overflow-hidden rounded-[14px] border border-dashed">
            {missing.map((entry) => (
              <li key={entry.type} className="px-4 py-3">
                <p className="text-fg text-[13.5px] font-medium">{entry.label}</p>
                <p className="text-fg-subtle text-[12px]">{entry.reason}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {documents.length === 0 ? (
        <div className="border-border mt-6 rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">Nothing tracked yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13.5px]">
            Start with the transcript request and the brag sheet — both gate someone
            else&rsquo;s work, so they are the ones worth knowing the status of.
          </p>
        </div>
      ) : (
        <ul className="border-border divide-border bg-surface mt-6 divide-y overflow-hidden rounded-[14px] border">
          {documents.map((document) => (
            <DocumentRow
              key={document.id}
              documentId={document.id}
              name={document.name}
              typeLabel={TYPE_LABELS[document.type] ?? "Document"}
              location={document.location}
              url={document.url}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
