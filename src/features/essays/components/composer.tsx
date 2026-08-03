"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";
import type { EssayStatus } from "@prisma/client";
import {
  autosave,
  runPreSubmitCheck,
  saveNamedVersion,
  updateStatus,
} from "@/app/(app)/essays/_actions";
import type { PreSubmitCheck } from "@/server/services/essay.service";
import { readingTimeSeconds, wordCount } from "@/features/essays/utils/reuse";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";

const STATUSES: EssayStatus[] = [
  "BRAINSTORM",
  "OUTLINE",
  "DRAFTING",
  "REVISING",
  "REVIEW",
  "FINAL",
  "SUBMITTED",
];

export function Composer({
  essayId,
  initialContent,
  wordLimit,
  status,
}: {
  essayId: string;
  initialContent: string;
  wordLimit: number | null;
  status: EssayStatus;
}) {
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState<"idle" | "saving" | "saved">("idle");
  const [check, setCheck] = useState<PreSubmitCheck | null>(null);
  const [pending, startTransition] = useTransition();
  const mounted = useRef(false);

  const words = wordCount(content);
  const overBy = wordLimit !== null && words > wordLimit ? words - wordLimit : 0;
  const pct = wordLimit ? Math.min(100, Math.round((words / wordLimit) * 100)) : 0;

  const persist = useDebouncedCallback((value: string) => {
    setSaved("saving");
    void autosave(essayId, value).then(() => setSaved("saved"));
  }, 1200);

  useEffect(() => {
    // Skip the initial mount so opening an essay doesn't write a version.
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    persist(content);
  }, [content, persist]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={status}
          disabled={pending}
          onChange={(event) =>
            startTransition(async () => {
              await updateStatus(essayId, event.target.value as EssayStatus);
            })
          }
          className="border-border bg-surface text-fg focus-visible:border-accent h-8 rounded-[8px] border px-2 text-[13px] outline-none"
        >
          {STATUSES.map((value) => (
            <option key={value} value={value}>
              {value[0] + value.slice(1).toLowerCase().replace(/_/g, " ")}
            </option>
          ))}
        </select>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await saveNamedVersion(essayId, content, "");
            })
          }
          className="border-border text-fg-muted hover:text-fg h-8 rounded-[8px] border px-3 text-[13px] transition-colors duration-100"
        >
          Save version
        </button>

        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const result = await runPreSubmitCheck(essayId);
              if (result.ok && result.data) setCheck(result.data);
            })
          }
          className="border-border text-fg-muted hover:text-fg inline-flex h-8 items-center gap-1.5 rounded-[8px] border px-3 text-[13px] transition-colors duration-100"
        >
          <ShieldCheck className="size-3.5" strokeWidth={1.5} />
          Pre-submit check
        </button>

        <span className="text-fg-subtle ml-auto text-[12px]">
          {saved === "saving" ? "Saving…" : saved === "saved" ? "Saved" : ""}
        </span>
      </div>

      {check && <CheckResult check={check} />}

      <textarea
        value={content}
        onChange={(event) => setContent(event.target.value)}
        placeholder="Start writing…"
        spellCheck
        className="border-border bg-surface text-fg placeholder:text-fg-subtle focus-visible:border-accent min-h-[420px] w-full rounded-[14px] border p-5 font-serif text-[18px] leading-[1.75] outline-none"
      />

      <div className="flex flex-wrap items-center gap-3">
        <span
          className={cn(
            "font-mono text-[13px] font-medium tabular-nums",
            overBy > 0 ? "text-danger" : "text-fg-muted",
          )}
        >
          {words}
          {wordLimit !== null && ` / ${wordLimit}`} words
        </span>
        <span className="text-fg-subtle font-mono text-[12px] tabular-nums">
          {content.length} chars · {readingTimeSeconds(words)}s read
        </span>
        {wordLimit !== null && (
          <div className="bg-border h-1.5 min-w-[120px] flex-1 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-300",
                overBy > 0 ? "bg-danger" : "bg-accent",
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
        {overBy > 0 && (
          <span className="text-danger text-[12.5px]">{overBy} over the limit</span>
        )}
      </div>
    </div>
  );
}

function CheckResult({ check }: { check: PreSubmitCheck }) {
  const problems: string[] = [];
  if (check.isEmpty) problems.push("This essay is empty.");
  if (check.overLimitBy !== null)
    problems.push(`It is ${check.overLimitBy} words over the limit.`);
  if (check.foreignColleges.length > 0)
    problems.push(
      `It mentions ${check.foreignColleges.join(", ")} — check you meant to.`,
    );

  if (problems.length === 0) {
    return (
      <div className="border-success/30 bg-success-subtle flex items-center gap-2 rounded-[14px] border p-3">
        <Check className="text-success size-4 shrink-0" strokeWidth={2} />
        <p className="text-fg text-[13px]">
          Within the word limit, and no other college is named.
        </p>
      </div>
    );
  }

  return (
    <div className="border-warning/30 bg-warning-subtle rounded-[14px] border p-3">
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-warning mt-0.5 size-4 shrink-0" strokeWidth={2} />
        <ul className="space-y-0.5">
          {problems.map((problem) => (
            <li key={problem} className="text-fg text-[13px]">
              {problem}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
