"use client";

import { useTransition } from "react";

import { markThankYouSent, setInterviewStatus } from "@/app/(app)/interviews/_actions";
import type { NextAction, Urgency } from "@/features/interviews/utils/pipeline";

const URGENCY_STYLES: Record<Urgency, string> = {
  lapsed: "bg-danger-subtle text-danger",
  urgent: "bg-warning-subtle text-warning",
  soon: "bg-accent-subtle text-accent",
  calm: "text-fg-subtle",
  settled: "text-fg-subtle",
};

const SELECT =
  "border-border bg-surface text-fg h-8 rounded-[9px] border px-2 text-[12.5px] outline-none focus-visible:border-accent";

function countdown(action: NextAction): string {
  if (action.daysLeft === null) return "";
  if (action.daysLeft < 0) {
    const days = Math.abs(action.daysLeft);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
  if (action.daysLeft === 0) return "today";
  if (action.daysLeft === 1) return "tomorrow";
  return `${action.daysLeft} days`;
}

export function InterviewRow({
  interviewId,
  collegeName,
  typeLabel,
  isEvaluative,
  status,
  action,
}: {
  interviewId: string;
  collegeName: string;
  typeLabel: string;
  isEvaluative: boolean;
  status: string;
  action: NextAction;
}) {
  const [pending, startTransition] = useTransition();

  const needsThankYou = action.label === "Send a thank-you note";

  return (
    <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0 flex-1">
        <p className="text-fg truncate text-[13.5px] font-medium">{collegeName}</p>
        <p className="text-fg-subtle truncate text-[12px]">
          {typeLabel}
          {!isEvaluative && " · informational"}
          {action.detail !== null && ` · ${action.detail}`}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[12px] font-medium ${URGENCY_STYLES[action.urgency]}`}
        >
          {action.label}
          {action.daysLeft !== null && ` · ${countdown(action)}`}
        </span>

        {needsThankYou ? (
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await markThankYouSent(interviewId);
              })
            }
            className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-8 items-center rounded-[9px] px-3 text-[12.5px] font-medium transition-colors duration-100 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Sent"}
          </button>
        ) : (
          <form
            action={(formData) => {
              startTransition(async () => {
                await setInterviewStatus(formData);
              });
            }}
          >
            <input type="hidden" name="interviewId" value={interviewId} />
            <select
              name="status"
              defaultValue={status}
              aria-label={`Interview status for ${collegeName}`}
              disabled={pending}
              onChange={(event) => event.currentTarget.form?.requestSubmit()}
              className={SELECT}
            >
              <option value="NOT_AVAILABLE">Not offered</option>
              <option value="AVAILABLE">Available</option>
              <option value="REQUESTED">Requested</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="COMPLETED">Completed</option>
              <option value="DECLINED">Declined</option>
              <option value="WAIVED">Waived</option>
            </select>
          </form>
        )}
      </div>
    </li>
  );
}
