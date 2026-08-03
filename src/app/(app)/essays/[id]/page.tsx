import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LOCAL_USER_ID } from "@/lib/constants";
import { getEssay, getReuseSuggestions } from "@/server/services/essay.service";
import { Composer } from "@/features/essays/components/composer";

export const dynamic = "force-dynamic";

export default async function EssayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [essay, suggestions] = await Promise.all([
    getEssay(LOCAL_USER_ID, id),
    getReuseSuggestions(LOCAL_USER_ID, id),
  ]);

  if (!essay) notFound();

  const latest = essay.versions[0];
  const explicitVersions = essay.versions.filter((v) => !v.isAutosave);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <Link
        href="/essays"
        className="text-fg-muted hover:text-fg mb-5 inline-flex items-center gap-1.5 text-[13px]"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        Essays
      </Link>

      <header className="mb-5">
        <h1 className="text-fg text-[24px] leading-[30px] font-semibold tracking-[-0.02em]">
          {essay.title}
        </h1>
        {essay.promptText && (
          <p className="text-fg-muted mt-1.5 max-w-2xl text-[14px]">{essay.promptText}</p>
        )}
      </header>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <Composer
          essayId={essay.id}
          initialContent={latest?.content ?? ""}
          wordLimit={essay.wordLimit}
          status={essay.status}
        />

        <aside className="space-y-5">
          <section>
            <h2 className="text-fg-subtle mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
              Reuse from your other essays
            </h2>
            {suggestions.length === 0 ? (
              <p className="text-fg-subtle text-[12.5px]">
                Nothing close enough yet. Suggestions appear once you have other essays
                with matching prompt kinds or topics.
              </p>
            ) : (
              <ul className="space-y-2">
                {suggestions.slice(0, 4).map((suggestion) => (
                  <li
                    key={suggestion.essayId}
                    className="border-border bg-surface rounded-[10px] border p-3"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <Link
                        href={`/essays/${suggestion.essayId}`}
                        className="text-fg truncate text-[13px] font-medium hover:underline"
                      >
                        {suggestion.title}
                      </Link>
                      <span className="text-accent shrink-0 font-mono text-[12px] tabular-nums">
                        {suggestion.score}%
                      </span>
                    </div>
                    {suggestion.notes.map((note) => (
                      <p
                        key={note}
                        className={`mt-1 text-[12px] ${
                          suggestion.requiresRewrite ? "text-warning" : "text-fg-muted"
                        }`}
                      >
                        {note}
                      </p>
                    ))}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="text-fg-subtle mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
              Versions
            </h2>
            {explicitVersions.length === 0 ? (
              <p className="text-fg-subtle text-[12.5px]">
                No saved versions yet. Typing autosaves; use Save version to mark a
                milestone you can come back to.
              </p>
            ) : (
              <ul className="space-y-1">
                {explicitVersions.slice(0, 8).map((version) => (
                  <li
                    key={version.id}
                    className="text-fg-muted flex items-center justify-between text-[12.5px]"
                  >
                    <span>v{version.versionNumber}</span>
                    <span className="font-mono tabular-nums">{version.wordCount}w</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
