"use client";

import { useTransition } from "react";
import type { ApplicationRound } from "@prisma/client";
import { setApplicationRound } from "@/app/(app)/applications/_actions";

const OPTIONS: { value: ApplicationRound; label: string; note?: string }[] = [
  { value: "ED1", label: "Early Decision I", note: "binding" },
  { value: "ED2", label: "Early Decision II", note: "binding" },
  { value: "EA", label: "Early Action" },
  { value: "REA", label: "Restrictive Early Action", note: "exclusive" },
  { value: "SCEA", label: "Single-Choice Early Action", note: "exclusive" },
  { value: "RD", label: "Regular Decision" },
  { value: "ROLLING", label: "Rolling" },
  { value: "QUESTBRIDGE_MATCH", label: "QuestBridge Match", note: "binding" },
  { value: "PRIORITY", label: "Priority" },
];

export function RoundPicker({
  applicationId,
  round,
}: {
  applicationId: string;
  round: ApplicationRound;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="flex items-center gap-2">
      <span className="sr-only">Application round</span>
      <select
        value={round}
        disabled={pending}
        onChange={(event) =>
          startTransition(async () => {
            await setApplicationRound({
              applicationId,
              round: event.target.value as ApplicationRound,
            });
          })
        }
        className="border-border bg-surface text-fg focus-visible:border-accent h-8 rounded-[8px] border px-2 text-[13px] outline-none disabled:opacity-60"
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
            {option.note ? ` · ${option.note}` : ""}
          </option>
        ))}
      </select>
      {pending && <span className="text-fg-subtle text-[12px]">Rebuilding…</span>}
    </label>
  );
}
