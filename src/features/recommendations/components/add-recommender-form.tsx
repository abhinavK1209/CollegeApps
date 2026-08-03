"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";
import { createRecommender } from "@/app/(app)/recommendations/_actions";

const INPUT =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";

export function AddRecommenderForm() {
  const [state, formAction, pending] = useActionState<
    { ok: boolean; error?: string } | null,
    FormData
  >(async (_prev, formData) => createRecommender(formData), null);

  return (
    <form
      action={formAction}
      className="border-border bg-surface flex flex-wrap items-end gap-2 rounded-[14px] border p-3"
    >
      <input
        name="name"
        required
        placeholder="Name"
        aria-label="Recommender name"
        className={`${INPUT} min-w-[150px] flex-1`}
      />
      <select name="role" aria-label="Role" className={INPUT}>
        <option value="TEACHER">Teacher</option>
        <option value="COUNSELOR">Counselor</option>
        <option value="MENTOR">Mentor</option>
        <option value="COACH">Coach</option>
        <option value="EMPLOYER">Employer</option>
        <option value="OTHER">Other</option>
      </select>
      <input
        name="subject"
        placeholder="Subject"
        aria-label="Subject"
        className={`${INPUT} w-[130px]`}
      />
      <input
        name="email"
        type="email"
        placeholder="Email"
        aria-label="Email"
        className={`${INPUT} w-[180px]`}
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
