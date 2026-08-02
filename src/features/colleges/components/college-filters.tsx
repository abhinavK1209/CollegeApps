"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Search } from "lucide-react";
import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

const PLATFORMS = [
  { value: "", label: "Any platform" },
  { value: "COMMON_APP", label: "Common App" },
  { value: "COALITION", label: "Coalition" },
  { value: "UC", label: "UC" },
  { value: "APPLY_TEXAS", label: "ApplyTexas" },
  { value: "DIRECT", label: "Direct" },
];

const SELECTIVITY = [
  { value: "", label: "Any selectivity" },
  { value: "0.1", label: "Under 10% admit" },
  { value: "0.25", label: "Under 25% admit" },
  { value: "0.5", label: "Under 50% admit" },
];

const CONTROL =
  "border-border bg-surface text-fg h-9 rounded-[10px] border px-3 text-[13px] outline-none focus-visible:border-accent";

export function CollegeFilters({ states }: { states: string[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    startTransition(() => router.replace(`/colleges?${next.toString()}`));
  }

  const onQueryChange = useDebouncedCallback((value: string) => {
    setParam("q", value);
  }, 250);

  return (
    <div className="flex flex-wrap items-center gap-2" data-pending={pending}>
      <div className="relative min-w-[220px] flex-1">
        <Search
          className="text-fg-subtle pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          strokeWidth={1.5}
        />
        <input
          type="search"
          defaultValue={params.get("q") ?? ""}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Search by name, alias, or city…"
          aria-label="Search colleges"
          className={`${CONTROL} w-full pl-9`}
        />
      </div>

      <select
        aria-label="Filter by state"
        defaultValue={params.get("state") ?? ""}
        onChange={(event) => setParam("state", event.target.value)}
        className={CONTROL}
      >
        <option value="">Any state</option>
        {states.map((state) => (
          <option key={state} value={state}>
            {state}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by platform"
        defaultValue={params.get("platform") ?? ""}
        onChange={(event) => setParam("platform", event.target.value)}
        className={CONTROL}
      >
        {PLATFORMS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Filter by selectivity"
        defaultValue={params.get("maxAdmit") ?? ""}
        onChange={(event) => setParam("maxAdmit", event.target.value)}
        className={CONTROL}
      >
        {SELECTIVITY.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <label className="text-fg-muted flex h-9 cursor-pointer items-center gap-2 text-[13px]">
        <input
          type="checkbox"
          defaultChecked={params.get("qb") === "1"}
          onChange={(event) => setParam("qb", event.target.checked ? "1" : "")}
          className="accent-accent size-4"
        />
        QuestBridge only
      </label>
    </div>
  );
}
