"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addScholarship } from "@/app/(app)/scholarships/_actions";

const INPUT =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";

export function AddScholarshipForm() {
  const [state, formAction, pending] = useActionState<
    { ok: boolean; error?: string } | null,
    FormData
  >(async (_prev, formData) => addScholarship(formData), null);

  return (
    <form
      action={formAction}
      className="border-border bg-surface flex flex-wrap items-end gap-2 rounded-[14px] border p-3"
    >
      <input
        name="name"
        required
        placeholder="Scholarship name"
        aria-label="Name"
        className={`${INPUT} min-w-[160px] flex-1`}
      />
      <select name="scope" aria-label="Scope" className={INPUT} defaultValue="LOCAL">
        <option value="LOCAL">Local</option>
        <option value="REGIONAL">Regional</option>
        <option value="STATE">State</option>
        <option value="INSTITUTIONAL">From a college</option>
        <option value="NATIONAL">National</option>
      </select>
      <input
        name="amount"
        type="number"
        min="0"
        placeholder="$"
        aria-label="Amount in dollars"
        className={`${INPUT} w-[95px]`}
      />
      <input
        name="effort"
        type="number"
        min="1"
        placeholder="mins"
        aria-label="Effort in minutes"
        className={`${INPUT} w-[85px]`}
      />
      <input
        name="deadline"
        type="date"
        aria-label="Deadline"
        className={`${INPUT} w-[150px]`}
      />
      <button
        type="submit"
        disabled={pending}
        className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[13.5px] font-medium transition-colors duration-100 disabled:opacity-60"
      >
        <Plus className="size-3.5" strokeWidth={2} />
        Add
      </button>
      {state?.ok === false && (
        <p className="text-danger w-full text-[12.5px]">{state.error}</p>
      )}
    </form>
  );
}
