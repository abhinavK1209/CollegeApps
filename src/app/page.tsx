import { ThemeToggle } from "@/components/theme-toggle";

const SEMANTIC = [
  { name: "accent", meaning: "Primary action, selection, focus" },
  { name: "success", meaning: "Confirmed received, submitted, accepted" },
  { name: "warning", meaning: "Due soon, needs attention, unconfirmed" },
  { name: "danger", meaning: "Late, rule violation, denied" },
  { name: "info", meaning: "Derived or seeded, informational" },
] as const;

const ROUNDS = [
  { name: "ED I / ED II", token: "bg-round-ed", binding: true },
  { name: "REA / SCEA", token: "bg-round-rea", binding: false },
  { name: "Early Action", token: "bg-round-ea", binding: false },
  { name: "Regular", token: "bg-round-rd", binding: false },
  { name: "Rolling", token: "bg-round-rolling", binding: false },
  { name: "QuestBridge", token: "bg-round-questbridge", binding: true },
] as const;

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <header className="mb-16 flex items-start justify-between gap-6">
        <div>
          <p className="text-fg-subtle mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Phase 0 · Foundation
          </p>
          <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Sequence
          </h1>
          <p className="text-fg-muted mt-2 text-[15px]">
            An admissions operating system. Design tokens verified below — toggle the
            theme to check both modes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="mb-14">
        <h2 className="text-fg-subtle mb-4 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Semantic color
        </h2>
        <div className="border-border bg-surface divide-border divide-y overflow-hidden rounded-[14px] border shadow-[var(--shadow-sm)]">
          {SEMANTIC.map(({ name, meaning }) => (
            <div key={name} className="flex items-center gap-4 px-5 py-4">
              <div
                className="size-9 shrink-0 rounded-[10px]"
                style={{ backgroundColor: `var(--${name})` }}
              />
              <div className="min-w-0">
                <p className="text-fg font-mono text-[13px] font-medium">--{name}</p>
                <p className="text-fg-muted text-[13.5px]">{meaning}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-fg-subtle mt-3 text-[12px]">
          Red means <span className="text-fg-muted font-medium">late</span> — never
          &ldquo;you have work.&rdquo; Work that exists is not an error.
        </p>
      </section>

      <section className="mb-14">
        <h2 className="text-fg-subtle mb-4 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Application rounds
        </h2>
        <div className="flex flex-wrap gap-2">
          {ROUNDS.map(({ name, token, binding }) => (
            <span
              key={name}
              className="border-border bg-surface inline-flex items-center gap-2 rounded-full border py-1.5 pr-3 pl-2.5 text-[13px]"
            >
              <span className={`size-2 rounded-full ${token}`} />
              {name}
              {binding && (
                <span className="text-fg-subtle text-[11px] font-medium">binding</span>
              )}
            </span>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="text-fg-subtle mb-4 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Typography
        </h2>
        <div className="border-border bg-surface space-y-4 rounded-[14px] border p-6">
          <p className="text-[36px] leading-[40px] font-semibold tracking-[-0.025em]">
            Good evening, Maya.
          </p>
          <p className="text-fg-muted text-[15px]">
            Twelve days until your Duke ED deadline. You&rsquo;re on track.
          </p>
          <p className="font-mono text-[13px] font-medium tabular-nums">
            180 / 250 words · 1,042 chars · 48s read
          </p>
          <p className="font-serif text-[18px] leading-[1.75]">
            When I toured the Duke Marine Lab last spring, I expected to be shown a
            building. Instead a sophomore handed me a corer.
          </p>
        </div>
      </section>

      <footer className="border-border text-fg-subtle border-t pt-6 text-[13px]">
        Next: profile and the college explorer, so this can help build the school list.
      </footer>
    </main>
  );
}
