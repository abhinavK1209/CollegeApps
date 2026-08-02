"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};

/**
 * False during SSR and the hydration pass, true afterwards — without an effect,
 * so it can't trigger a cascading render.
 */
function useHasMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "dark", label: "Dark", Icon: Moon },
  { value: "system", label: "System", Icon: Monitor },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  // Theme is unknowable until hydration; render a stable placeholder first.
  const mounted = useHasMounted();

  return (
    <div className="border-border bg-surface-raised inline-flex items-center gap-1 rounded-full border p-1">
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value;
        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-label={`${label} theme`}
            aria-pressed={active}
            className={cn(
              "rounded-full p-2 transition-colors duration-100",
              active
                ? "bg-accent text-accent-fg"
                : "text-fg-subtle hover:text-fg hover:bg-bg-subtle",
            )}
          >
            <Icon className="size-4" strokeWidth={1.5} />
          </button>
        );
      })}
    </div>
  );
}
