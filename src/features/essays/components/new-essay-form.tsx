"use client";

import { useRouter } from "next/navigation";
import { useActionState } from "react";
import { Plus } from "lucide-react";
import { addEssay } from "@/app/(app)/essays/_actions";

const KINDS = [
  ["PERSONAL_STATEMENT", "Personal statement"],
  ["WHY_US", "Why us"],
  ["WHY_MAJOR", "Why this major"],
  ["COMMUNITY", "Community"],
  ["DIVERSITY", "Diversity"],
  ["ACTIVITY", "Activity"],
  ["INTELLECTUAL_INTEREST", "Intellectual interest"],
  ["CHALLENGE", "Challenge"],
  ["SHORT_ANSWER", "Short answer"],
  ["UC_PIQ", "UC personal insight"],
  ["OTHER", "Other"],
] as const;

const INPUT =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";

export function NewEssayForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    { ok: boolean; error?: string } | null,
    FormData
  >(async (_prev, formData) => {
    const result = await addEssay(formData);
    if (result.ok && result.data) router.push(`/essays/${result.data}`);
    return result.ok ? { ok: true } : { ok: false, error: result.error };
  }, null);

  return (
    <form
      action={formAction}
      className="border-border bg-surface flex flex-wrap items-end gap-2 rounded-[14px] border p-3"
    >
      <input
        name="title"
        required
        placeholder="Essay title, e.g. Why Duke?"
        aria-label="Essay title"
        className={`${INPUT} min-w-[180px] flex-1`}
      />
      <select name="promptKind" aria-label="Prompt kind" className={INPUT}>
        {KINDS.map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      <input
        name="wordLimit"
        type="number"
        min="1"
        max="2000"
        placeholder="Words"
        aria-label="Word limit"
        className={`${INPUT} w-[90px]`}
      />
      <input
        name="topicTags"
        placeholder="tags, comma separated"
        aria-label="Topic tags"
        className={`${INPUT} w-[190px]`}
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
