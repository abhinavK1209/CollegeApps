"use client";

import { useTransition } from "react";
import { signFerpaWaiver } from "@/app/(app)/recommendations/_actions";

export function FerpaButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signFerpaWaiver();
        })
      }
      className="bg-accent text-accent-fg hover:bg-accent-hover mt-3 inline-flex h-9 items-center rounded-[10px] px-4 text-[13.5px] font-medium transition-colors duration-100 disabled:opacity-60"
    >
      {pending ? "Recording…" : "I've signed it"}
    </button>
  );
}
