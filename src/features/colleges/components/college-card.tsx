"use client";

import { useTransition } from "react";
import { Check, Plus } from "lucide-react";
import type { SchoolTier } from "@prisma/client";
import { toggleCollegeInList } from "@/app/(app)/colleges/_actions";
import type { CollegeListItem } from "@/server/services/college.service";
import { suggestTier } from "@/features/colleges/utils/tier";
import type { StudentStats } from "@/features/colleges/utils/tier";
import { cn } from "@/lib/utils";

const TIER_STYLES: Record<SchoolTier, string> = {
  REACH: "bg-warning-subtle text-warning",
  TARGET: "bg-accent-subtle text-accent",
  LIKELY: "bg-success-subtle text-success",
};

const PLATFORM_LABELS: Record<string, string> = {
  COMMON_APP: "Common App",
  COALITION: "Coalition",
  UC: "UC",
  APPLY_TEXAS: "ApplyTexas",
  QUESTBRIDGE: "QuestBridge",
  DIRECT: "Direct",
  OTHER: "Other",
};

function formatPercent(value: number | null): string {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function formatMoney(cents: number | null): string {
  if (cents === null) return "—";
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

function formatRange(low: number | null, high: number | null): string {
  return low !== null && high !== null ? `${low}–${high}` : "—";
}

export function CollegeCard({
  college,
  listed,
  studentStats,
}: {
  college: CollegeListItem;
  listed: boolean;
  studentStats: StudentStats;
}) {
  const [pending, startTransition] = useTransition();

  const admitRate = college.admitRate === null ? null : Number(college.admitRate);
  const suggestion = suggestTier({ ...college, admitRate }, studentStats);

  function onToggle() {
    startTransition(async () => {
      await toggleCollegeInList({
        collegeId: college.id,
        tier: suggestion.tier,
        listed,
      });
    });
  }

  return (
    <article className="border-border bg-surface hover:border-border-strong rounded-[14px] border p-4 transition-colors duration-150">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-fg truncate text-[15px] font-semibold tracking-[-0.01em]">
            {college.name}
          </h3>
          <p className="text-fg-muted mt-0.5 truncate text-[13px]">
            {[college.city, college.state].filter(Boolean).join(", ")}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggle}
          disabled={pending}
          aria-label={
            listed ? `Remove ${college.name} from list` : `Add ${college.name} to list`
          }
          className={cn(
            "grid size-8 shrink-0 place-items-center rounded-full border transition-colors duration-100 disabled:opacity-50",
            listed
              ? "border-success bg-success text-white"
              : "border-border text-fg-subtle hover:border-accent hover:text-accent",
          )}
        >
          {listed ? (
            <Check className="size-4" strokeWidth={2} />
          ) : (
            <Plus className="size-4" strokeWidth={2} />
          )}
        </button>
      </div>

      <dl className="mt-3.5 grid grid-cols-3 gap-3">
        <div>
          <dt className="text-fg-subtle text-[11px] font-medium">Admit rate</dt>
          <dd className="text-fg font-mono text-[13px] tabular-nums">
            {formatPercent(admitRate)}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle text-[11px] font-medium">SAT mid-50</dt>
          <dd className="text-fg font-mono text-[13px] tabular-nums">
            {formatRange(college.sat25, college.sat75)}
          </dd>
        </div>
        <div>
          <dt className="text-fg-subtle text-[11px] font-medium">Cost / yr</dt>
          <dd className="text-fg font-mono text-[13px] tabular-nums">
            {formatMoney(college.costOfAttendanceCents)}
          </dd>
        </div>
      </dl>

      <div className="mt-3.5 flex flex-wrap items-center gap-1.5">
        {suggestion.tier && (
          <span
            title={suggestion.reason}
            className={cn(
              "rounded-full px-2 py-0.5 text-[11px] font-semibold",
              TIER_STYLES[suggestion.tier],
            )}
          >
            {suggestion.tier[0] + suggestion.tier.slice(1).toLowerCase()}
            {suggestion.confidence === "low" && " ?"}
          </span>
        )}
        {college.platforms.map((platform) => (
          <span
            key={platform}
            className="border-border text-fg-muted rounded-full border px-2 py-0.5 text-[11px]"
          >
            {PLATFORM_LABELS[platform] ?? platform}
          </span>
        ))}
        {college.isQuestBridgePartner && (
          <span className="border-round-questbridge text-round-questbridge rounded-full border px-2 py-0.5 text-[11px]">
            QuestBridge
          </span>
        )}
        {college.requiresCssProfile && (
          <span className="border-border text-fg-muted rounded-full border px-2 py-0.5 text-[11px]">
            CSS Profile
          </span>
        )}
      </div>
    </article>
  );
}
