import Link from "next/link";
import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { listEssays } from "@/server/services/essay.service";
import { NewEssayForm } from "@/features/essays/components/new-essay-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Essays" };

export default async function EssaysPage() {
  const essays = await listEssays(LOCAL_USER_ID);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Essays
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          One essay can answer several prompts. Version history is kept, and a pre-submit
          check catches the wrong college name before you send it.
        </p>
      </header>

      <NewEssayForm />

      {essays.length === 0 ? (
        <div className="border-border mt-6 rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">No essays yet.</p>
          <p className="text-fg-muted mt-1 text-[13.5px]">
            Add your Common App personal statement first — it anchors everything else.
          </p>
        </div>
      ) : (
        <ul className="border-border divide-border bg-surface mt-6 divide-y overflow-hidden rounded-[14px] border">
          {essays.map((essay) => {
            const latest = essay.versions[0];
            const words = latest?.wordCount ?? 0;
            const over = essay.wordLimit !== null && words > essay.wordLimit;
            return (
              <li key={essay.id}>
                <Link
                  href={`/essays/${essay.id}`}
                  className="hover:bg-surface-raised flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-100"
                >
                  <div className="min-w-0">
                    <p className="text-fg truncate text-[14px] font-medium">
                      {essay.title}
                    </p>
                    <p className="text-fg-subtle truncate text-[12px]">
                      {essay.status.toLowerCase().replace(/_/g, " ")}
                      {essay.assignments.length > 0 &&
                        ` · ${essay.assignments
                          .map((a) => a.application?.college.name)
                          .filter(Boolean)
                          .join(", ")}`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[12.5px] tabular-nums ${
                      over ? "text-danger" : "text-fg-muted"
                    }`}
                  >
                    {words}
                    {essay.wordLimit !== null && ` / ${essay.wordLimit}`}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
