"use client";

import { useTransition } from "react";
import { Wand2 } from "lucide-react";
import { buildChecklist } from "@/app/(app)/applications/_actions";

export function BuildChecklistButton({ applicationId }: { applicationId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await buildChecklist(applicationId);
        })
      }
      className="bg-accent text-accent-fg hover:bg-accent-hover mt-4 inline-flex h-9 items-center gap-1.5 rounded-[10px] px-4 text-[13.5px] font-medium transition-colors duration-100 disabled:opacity-60"
    >
      <Wand2 className="size-3.5" strokeWidth={1.5} />
      {pending ? "Building…" : "Build my checklist"}
    </button>
  );
}
