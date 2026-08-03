"use client";

import { useTransition } from "react";
import type { RecommendationStatus } from "@prisma/client";
import { advance } from "@/app/(app)/recommendations/_actions";
import { cn } from "@/lib/utils";

const LABELS: Record<RecommendationStatus, string> = {
  NOT_ASKED: "Not asked",
  ASKED: "Asked",
  AGREED: "Agreed",
  DECLINED: "Declined",
  INVITED: "Invited",
  IN_PROGRESS: "Writing",
  SUBMITTED: "Submitted",
  CONFIRMED_RECEIVED: "Confirmed",
};

const STYLES: Record<RecommendationStatus, string> = {
  NOT_ASKED: "border-border text-fg-subtle",
  ASKED: "border-accent/40 bg-accent-subtle text-accent",
  AGREED: "border-accent/40 bg-accent-subtle text-accent",
  DECLINED: "border-danger/40 bg-danger-subtle text-danger",
  INVITED: "border-warning/40 bg-warning-subtle text-warning",
  IN_PROGRESS: "border-warning/40 bg-warning-subtle text-warning",
  SUBMITTED: "border-warning/40 bg-warning-subtle text-warning",
  CONFIRMED_RECEIVED: "border-success/40 bg-success-subtle text-success",
};

export function RecStatusButton({
  recommendationId,
  status,
  blocked,
}: {
  recommendationId: string;
  status: RecommendationStatus;
  /** True when the FERPA waiver is unsigned and the next step is Invite. */
  blocked: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending || blocked}
      title={
        blocked
          ? "Sign the FERPA waiver first — recommenders cannot be invited until you do."
          : "Advance to the next stage"
      }
      onClick={() =>
        startTransition(async () => {
          await advance(recommendationId);
        })
      }
      className={cn(
        "shrink-0 rounded-full border px-2.5 py-1 text-[11.5px] font-medium transition-colors duration-100 disabled:opacity-50",
        STYLES[status],
      )}
    >
      {LABELS[status]}
    </button>
  );
}
