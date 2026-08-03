"use client";

import { useTransition } from "react";
import { AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import type { RuleFinding } from "@prisma/client";
import { dismissFinding } from "@/app/(app)/applications/_actions";
import { cn } from "@/lib/utils";

const SEVERITY = {
  BLOCKER: {
    Icon: ShieldAlert,
    box: "border-danger/30 bg-danger-subtle",
    accent: "text-danger",
  },
  WARNING: {
    Icon: AlertTriangle,
    box: "border-warning/30 bg-warning-subtle",
    accent: "text-warning",
  },
  INFO: { Icon: Info, box: "border-info/30 bg-info-subtle", accent: "text-info" },
} as const;

export function RuleFindings({ findings }: { findings: RuleFinding[] }) {
  if (findings.length === 0) return null;

  return (
    <div className="mb-6 space-y-2.5">
      {findings.map((finding) => (
        <FindingCard key={finding.id} finding={finding} />
      ))}
    </div>
  );
}

function FindingCard({ finding }: { finding: RuleFinding }) {
  const [pending, startTransition] = useTransition();
  const { Icon, box, accent } = SEVERITY[finding.severity];

  return (
    <div className={cn("rounded-[14px] border p-4", box)}>
      <div className="flex items-start gap-3">
        <Icon className={cn("mt-0.5 size-4 shrink-0", accent)} strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <p className="text-fg text-[13.5px] font-medium">{finding.message}</p>
          {finding.explanation && (
            <p className="text-fg-muted mt-1 text-[13px]">{finding.explanation}</p>
          )}
          {finding.citationUrl && (
            <a
              href={finding.citationUrl}
              target="_blank"
              rel="noreferrer"
              className={cn(
                "mt-1.5 inline-block text-[12.5px] underline underline-offset-2",
                accent,
              )}
            >
              Read the rule
            </a>
          )}
        </div>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await dismissFinding(finding.id);
            })
          }
          aria-label="Dismiss this warning"
          title="Dismiss — use this if you've checked and it's intentional"
          className="text-fg-subtle hover:text-fg shrink-0 rounded p-1 transition-colors duration-100 disabled:opacity-50"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}
