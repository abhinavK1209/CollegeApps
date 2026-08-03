"use client";

import { useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { regenerateSchedule } from "@/app/(app)/tasks/_actions";

export function RegenerateButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      title="Rebuild dated work from every application's deadlines. Completed and edited tasks are kept."
      onClick={() =>
        startTransition(async () => {
          await regenerateSchedule();
        })
      }
      className="border-border text-fg-muted hover:text-fg inline-flex h-9 items-center gap-1.5 rounded-[10px] border px-3 text-[13px] transition-colors duration-100 disabled:opacity-60"
    >
      <RefreshCw className="size-3.5" strokeWidth={1.5} />
      {pending ? "Rebuilding…" : "Rebuild schedule"}
    </button>
  );
}
