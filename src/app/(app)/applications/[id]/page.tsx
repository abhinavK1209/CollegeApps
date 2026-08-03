import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { roundLabel } from "@/server/services/round-conventions";
import { Checklist } from "@/features/applications/components/checklist";
import { completion } from "@/features/applications/utils/completion";
import { RoundPicker } from "@/features/applications/components/round-picker";

export const dynamic = "force-dynamic";

const DAY = 86_400_000;

function daysUntil(date: Date): number {
  return Math.ceil((new Date(date).getTime() - Date.now()) / DAY);
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const application = await db.application.findFirst({
    where: { id, userId: LOCAL_USER_ID },
    include: {
      college: true,
      requirements: { orderBy: [{ isRequired: "desc" }, { type: "asc" }] },
      deadlines: { orderBy: { dueAt: "asc" } },
    },
  });

  if (!application) notFound();

  // Server Component: evaluated once per request, so this is deterministic for
  // the render. Passed down so the client checklist stays pure and hydrates
  // consistently.
  // eslint-disable-next-line react-hooks/purity
  const nowMs = Date.now();

  const percent = completion(application.requirements);
  const hardDeadline = application.deadlines.find((d) => d.kind === "APPLICATION");
  const remaining = hardDeadline ? daysUntil(hardDeadline.dueAt) : null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link
        href="/applications"
        className="text-fg-muted hover:text-fg mb-5 inline-flex items-center gap-1.5 text-[13px]"
      >
        <ArrowLeft className="size-3.5" strokeWidth={1.5} />
        My list
      </Link>

      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
              {application.college.name}
            </h1>
            <p className="text-fg-muted mt-1 text-[14px]">
              {[application.college.city, application.college.state]
                .filter(Boolean)
                .join(", ")}{" "}
              · {roundLabel(application.round)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-fg font-mono text-[22px] font-semibold tabular-nums">
              {percent}%
            </p>
            <p className="text-fg-subtle text-[12px]">complete</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <RoundPicker applicationId={application.id} round={application.round} />
          {remaining !== null && (
            <span
              className={`text-[13px] tabular-nums ${
                remaining < 0
                  ? "text-danger"
                  : remaining <= 14
                    ? "text-warning"
                    : "text-fg-muted"
              }`}
            >
              {remaining < 0
                ? `${Math.abs(remaining)} days past the typical deadline`
                : `${remaining} days until the typical deadline`}
            </span>
          )}
          {(application.college.admissionsUrl ?? application.college.website) ? (
            <a
              href={
                application.college.admissionsUrl ?? application.college.website ?? "#"
              }
              target="_blank"
              rel="noreferrer"
              className="text-accent inline-flex items-center gap-1 text-[13px] underline underline-offset-2"
            >
              Verify on their site
              <ExternalLink className="size-3" strokeWidth={1.5} />
            </a>
          ) : null}
        </div>
      </header>

      {application.deadlines.length > 0 && (
        <section className="mb-7">
          <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Deadlines
          </h2>
          <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
            {application.deadlines.map((deadline) => (
              <li
                key={deadline.id}
                className="flex items-center justify-between gap-4 px-4 py-2.5"
              >
                <span className="text-fg text-[13.5px]">{deadline.title}</span>
                <span className="flex items-center gap-2.5">
                  {deadline.confidence === "LOW" && (
                    <span
                      title="Typical for this round, not scraped from the college. Verify it."
                      className="border-info/40 text-info rounded-full border px-2 py-0.5 text-[11px]"
                    >
                      typical
                    </span>
                  )}
                  <span className="text-fg-muted font-mono text-[13px] tabular-nums">
                    {formatDate(deadline.dueAt)}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <p className="text-fg-subtle mt-2 text-[12px]">
            Dates marked <span className="text-info">typical</span> come from round
            conventions, not from {application.college.name}. Confirm them on the
            college&rsquo;s own site before relying on them.
          </p>
        </section>
      )}

      <section>
        <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Checklist
        </h2>
        <Checklist
          requirements={application.requirements}
          nowMs={nowMs}
          applicationId={application.id}
        />
        <p className="text-fg-subtle mt-2 text-[12px]">
          Click a status to advance it. Submitted is not the same as received — progress
          stops at 90% until the college confirms.
        </p>
      </section>
    </div>
  );
}
