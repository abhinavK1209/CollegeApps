"use client";

import { useActionState } from "react";
import { Plus } from "lucide-react";

import { trackInterview } from "@/app/(app)/interviews/_actions";

const INPUT =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";

export interface TrackableApplication {
  id: string;
  collegeName: string;
}

export function TrackInterviewForm({
  applications,
}: {
  applications: readonly TrackableApplication[];
}) {
  const [state, formAction, pending] = useActionState<
    { ok: boolean; error?: string } | null,
    FormData
  >(async (_prev, formData) => trackInterview(formData), null);

  if (applications.length === 0) return null;

  return (
    <form
      action={formAction}
      className="border-border bg-surface flex flex-wrap items-end gap-2 rounded-[14px] border p-3"
    >
      <select
        name="applicationId"
        required
        aria-label="College"
        className={`${INPUT} min-w-[170px] flex-1`}
      >
        {applications.map((application) => (
          <option key={application.id} value={application.id}>
            {application.collegeName}
          </option>
        ))}
      </select>

      <select name="type" aria-label="Interview type" className={INPUT}>
        <option value="ALUMNI">Alumni</option>
        <option value="ON_CAMPUS">On campus</option>
        <option value="VIRTUAL">Virtual</option>
        <option value="FACULTY">Faculty</option>
        <option value="GROUP">Group</option>
        <option value="THIRD_PARTY">Third party</option>
      </select>

      <label className="text-fg-muted flex h-9 items-center gap-1.5 text-[12.5px]">
        <input type="date" name="requestByAt" aria-label="Request by" className={INPUT} />
        request by
      </label>

      <label className="text-fg-muted flex h-9 items-center gap-1.5 text-[12.5px]">
        <input
          type="date"
          name="completeByAt"
          aria-label="Complete by"
          className={INPUT}
        />
        complete by
      </label>

      <label className="text-fg-muted flex h-9 items-center gap-1.5 text-[12.5px]">
        <input type="checkbox" name="isEvaluative" defaultChecked className="size-3.5" />
        evaluative
      </label>

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
