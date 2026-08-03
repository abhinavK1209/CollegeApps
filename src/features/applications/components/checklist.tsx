"use client";

import { useTransition } from "react";
import type { Requirement, RequirementStatus } from "@prisma/client";
import { setRequirementStatus } from "@/app/(app)/applications/_actions";
import { cn } from "@/lib/utils";
import { BuildChecklistButton } from "./build-checklist-button";

/**
 * Status is a two-phase pipeline, not a checkbox. "Submitted" is not "received" —
 * the college confirming receipt is a separate step, and it is where applications
 * actually fail. Progress is capped at 90% until confirmation.
 */
const CYCLE: Record<RequirementStatus, RequirementStatus> = {
  NOT_STARTED: "IN_PROGRESS",
  IN_PROGRESS: "SUBMITTED",
  SUBMITTED: "CONFIRMED_RECEIVED",
  CONFIRMED_RECEIVED: "NOT_STARTED",
  WAIVED: "NOT_STARTED",
  NOT_APPLICABLE: "NOT_STARTED",
};

const LABELS: Record<RequirementStatus, string> = {
  NOT_STARTED: "Not started",
  IN_PROGRESS: "In progress",
  SUBMITTED: "Submitted",
  CONFIRMED_RECEIVED: "Confirmed received",
  WAIVED: "Waived",
  NOT_APPLICABLE: "N/A",
};

const STYLES: Record<RequirementStatus, string> = {
  NOT_STARTED: "border-border text-fg-subtle",
  IN_PROGRESS: "border-accent/40 bg-accent-subtle text-accent",
  SUBMITTED: "border-warning/40 bg-warning-subtle text-warning",
  CONFIRMED_RECEIVED: "border-success/40 bg-success-subtle text-success",
  WAIVED: "border-border text-fg-subtle",
  NOT_APPLICABLE: "border-border text-fg-subtle",
};

export function Checklist({
  requirements,
  nowMs,
  applicationId,
}: {
  requirements: Requirement[];
  /** Server-supplied so render stays pure and hydration matches. */
  nowMs: number;
  applicationId: string;
}) {
  if (requirements.length === 0) {
    return (
      <div className="border-border rounded-[14px] border border-dashed py-12 text-center">
        <p className="text-fg text-[14px] font-medium">No checklist yet.</p>
        <p className="text-fg-muted mt-1 text-[13px]">
          Deadlines, essays, recommendations, and aid forms all derive from the college
          and the round.
        </p>
        <BuildChecklistButton applicationId={applicationId} />
      </div>
    );
  }

  return (
    <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
      {requirements.map((requirement) => (
        <ChecklistRow key={requirement.id} requirement={requirement} nowMs={nowMs} />
      ))}
    </ul>
  );
}

function ChecklistRow({
  requirement,
  nowMs,
}: {
  requirement: Requirement;
  nowMs: number;
}) {
  const [pending, startTransition] = useTransition();

  const unconfirmedDays =
    requirement.status === "SUBMITTED" && requirement.submittedAt
      ? Math.floor((nowMs - new Date(requirement.submittedAt).getTime()) / 86_400_000)
      : null;

  return (
    <li className="flex items-center justify-between gap-4 px-4 py-3">
      <div className="min-w-0">
        <p className="text-fg text-[13.5px]">
          {requirement.label}
          {!requirement.isRequired && (
            <span className="text-fg-subtle ml-1.5 text-[12px]">optional</span>
          )}
        </p>
        {unconfirmedDays !== null && unconfirmedDays >= 7 && (
          <p className="text-warning mt-0.5 text-[12px]">
            Submitted {unconfirmedDays} days ago and still unconfirmed — check the
            college&rsquo;s portal.
          </p>
        )}
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            await setRequirementStatus({
              requirementId: requirement.id,
              status: CYCLE[requirement.status],
            });
          })
        }
        title={`Mark as ${LABELS[CYCLE[requirement.status]]}`}
        className={cn(
          "shrink-0 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-100 disabled:opacity-50",
          STYLES[requirement.status],
        )}
      >
        {LABELS[requirement.status]}
      </button>
    </li>
  );
}
