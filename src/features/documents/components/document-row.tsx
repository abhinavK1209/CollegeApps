"use client";

import { useTransition } from "react";
import { ExternalLink, X } from "lucide-react";

import { deleteDocument } from "@/app/(app)/documents/_actions";

export function DocumentRow({
  documentId,
  name,
  typeLabel,
  location,
  url,
}: {
  documentId: string;
  name: string;
  typeLabel: string;
  location: string | null;
  url: string | null;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <li className="flex items-center justify-between gap-3 px-4 py-3">
      <div className="min-w-0">
        <p className="text-fg truncate text-[13.5px] font-medium">{name}</p>
        <p className="text-fg-subtle truncate text-[12px]">
          {typeLabel}
          {location !== null && ` · ${location}`}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        {url !== null && (
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${name}`}
            className="text-fg-subtle hover:text-fg inline-flex size-8 items-center justify-center rounded-[9px] transition-colors duration-100"
          >
            <ExternalLink className="size-3.5" strokeWidth={2} />
          </a>
        )}
        <button
          type="button"
          disabled={pending}
          aria-label={`Stop tracking ${name}`}
          onClick={() =>
            startTransition(async () => {
              await deleteDocument(documentId);
            })
          }
          className="text-fg-subtle hover:text-danger inline-flex size-8 items-center justify-center rounded-[9px] transition-colors duration-100 disabled:opacity-60"
        >
          <X className="size-3.5" strokeWidth={2} />
        </button>
      </div>
    </li>
  );
}
