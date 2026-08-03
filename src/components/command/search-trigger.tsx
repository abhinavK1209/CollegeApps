"use client";

import { Search } from "lucide-react";

/** Dispatches the same shortcut the palette listens for, so there is one path. */
export function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true, bubbles: true }),
        )
      }
      className="border-border text-fg-subtle hover:text-fg hidden h-8 items-center gap-2 rounded-[10px] border px-2.5 text-[12.5px] transition-colors duration-100 md:flex"
    >
      <Search className="size-3.5" strokeWidth={1.5} />
      Search
      <kbd className="border-border text-fg-subtle rounded border px-1 font-mono text-[10px]">
        ⌘K
      </kbd>
    </button>
  );
}
