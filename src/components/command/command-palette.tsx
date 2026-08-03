"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { SearchHit } from "@/server/services/search.service";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<SearchHit["type"], string> = {
  application: "On your list",
  college: "College",
  essay: "Essay",
  task: "Task",
  scholarship: "Scholarship",
};

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset at the close call sites rather than in an effect keyed on `open`,
  // which would set state during render and cause a cascading re-render.
  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setHits([]);
    setActive(0);
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((value) => {
          if (value) {
            setQuery("");
            setHits([]);
            setActive(0);
          }
          return !value;
        });
      }
      if (event.key === "Escape") close();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const runSearch = useDebouncedCallback((value: string) => {
    if (value.trim().length < 2) {
      setHits([]);
      return;
    }
    void fetch(`/api/v1/search?q=${encodeURIComponent(value)}`)
      .then((response) => response.json() as Promise<{ results: SearchHit[] }>)
      .then((data) => {
        setHits(data.results);
        setActive(0);
      });
  }, 180);

  const go = useCallback(
    (hit: SearchHit) => {
      close();
      router.push(hit.href);
    },
    [router, close],
  );

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-start justify-center bg-black/40 pt-[12vh] backdrop-blur-[6px]"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal
        aria-label="Search"
        onClick={(event) => event.stopPropagation()}
        className="border-border bg-overlay w-[min(560px,92vw)] overflow-hidden rounded-[20px] border shadow-[var(--shadow-lg)]"
      >
        <div className="border-border flex items-center gap-2.5 border-b px-4">
          <Search className="text-fg-subtle size-4 shrink-0" strokeWidth={1.5} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Search colleges, essays, tasks…"
            onChange={(event) => {
              setQuery(event.target.value);
              runSearch(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((i) => Math.min(i + 1, hits.length - 1));
              }
              if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              }
              if (event.key === "Enter") {
                const hit = hits[active];
                if (hit) go(hit);
              }
            }}
            className="text-fg placeholder:text-fg-subtle h-12 w-full bg-transparent text-[14px] outline-none"
          />
        </div>

        {hits.length > 0 ? (
          <ul className="max-h-[50vh] overflow-y-auto p-1.5">
            {hits.map((hit, index) => (
              <li key={`${hit.type}-${hit.id}`}>
                <button
                  type="button"
                  onMouseEnter={() => setActive(index)}
                  onClick={() => go(hit)}
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-[10px] px-3 py-2 text-left",
                    index === active ? "bg-accent-subtle" : "hover:bg-surface-raised",
                  )}
                >
                  <span className="min-w-0">
                    <span className="text-fg block truncate text-[13.5px]">
                      {hit.title}
                    </span>
                    <span className="text-fg-subtle block truncate text-[12px]">
                      {hit.subtitle}
                    </span>
                  </span>
                  <span className="text-fg-subtle shrink-0 text-[11px]">
                    {TYPE_LABEL[hit.type]}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          query.trim().length >= 2 && (
            <p className="text-fg-subtle px-4 py-6 text-center text-[13px]">
              Nothing matches “{query}”.
            </p>
          )
        )}

        <div className="border-border text-fg-subtle flex gap-3 border-t px-4 py-2 text-[11px]">
          <span>↑↓ navigate</span>
          <span>↵ open</span>
          <span>esc close</span>
        </div>
      </div>
    </div>
  );
}
