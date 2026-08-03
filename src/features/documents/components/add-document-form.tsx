"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import { addDocument } from "@/app/(app)/documents/_actions";

const INPUT =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";

export function AddDocumentForm() {
  const [state, formAction, pending] = useActionState<
    { ok: boolean; error?: string } | null,
    FormData
  >(async (_prev, formData) => addDocument(formData), null);

  return (
    <form
      action={formAction}
      className="border-border bg-surface flex flex-wrap items-end gap-2 rounded-[14px] border p-3"
    >
      <input
        name="name"
        required
        placeholder="Document name"
        aria-label="Document name"
        className={`${INPUT} min-w-[160px] flex-1`}
      />

      <select name="type" aria-label="Document type" className={INPUT}>
        <option value="TRANSCRIPT">Transcript</option>
        <option value="RESUME">Résumé</option>
        <option value="BRAG_SHEET">Brag sheet</option>
        <option value="TEST_REPORT">Test report</option>
        <option value="TAX_RETURN">Tax return</option>
        <option value="W2">W-2</option>
        <option value="AWARD_LETTER">Award letter</option>
        <option value="ACCEPTANCE_LETTER">Acceptance letter</option>
        <option value="ESSAY_EXPORT">Essay export</option>
        <option value="PORTFOLIO">Portfolio</option>
        <option value="OTHER">Other</option>
      </select>

      <input
        name="location"
        placeholder="Where it lives"
        aria-label="Where it lives"
        className={`${INPUT} w-[160px]`}
      />

      <input
        name="url"
        type="url"
        placeholder="Link (optional)"
        aria-label="Link"
        className={`${INPUT} w-[170px]`}
      />

      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13.5px] font-medium transition-colors duration-100 disabled:opacity-60"
      >
        <Plus className="size-3.5" strokeWidth={2} />
        Track
      </button>

      {state?.ok === false && (
        <p className="text-danger w-full text-[12.5px]">{state.error}</p>
      )}
    </form>
  );
}
