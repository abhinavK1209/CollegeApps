import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { completion } from "@/features/applications/utils/completion";
import { ProgressRing } from "@/components/charts/progress-ring";
import { roundLabel } from "@/server/services/round-conventions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Analytics" };

const FUNNEL = [
  "RESEARCHING",
  "PLANNING",
  "IN_PROGRESS",
  "SUBMITTED",
  "DECIDED",
] as const;

export default async function AnalyticsPage() {
  const [applications, requirements, tasks, essays] = await Promise.all([
    db.application.findMany({
      where: { userId: LOCAL_USER_ID, archivedAt: null },
      include: { college: { select: { name: true } }, requirements: true },
    }),
    db.requirement.findMany({
      where: { application: { userId: LOCAL_USER_ID } },
      select: { type: true, status: true, isRequired: true },
    }),
    db.task.findMany({
      where: { userId: LOCAL_USER_ID },
      select: { status: true },
    }),
    db.essay.findMany({
      where: { userId: LOCAL_USER_ID, archivedAt: null },
      select: { status: true },
    }),
  ]);

  const funnel = FUNNEL.map((status) => ({
    status,
    count: applications.filter((a) => a.status === status).length,
  }));
  const maxFunnel = Math.max(1, ...funnel.map((f) => f.count));

  const byRound = new Map<string, number>();
  for (const application of applications) {
    const label = roundLabel(application.round);
    byRound.set(label, (byRound.get(label) ?? 0) + 1);
  }

  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const finalEssays = essays.filter(
    (e) => e.status === "FINAL" || e.status === "SUBMITTED",
  ).length;

  const perApplication = applications
    .map((application) => ({
      name: application.college.name,
      percent: completion(application.requirements),
    }))
    .sort((a, b) => b.percent - a.percent);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Analytics
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Where the work actually stands.
        </p>
      </header>

      <section className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Metric
          label="Overall"
          value={completion(requirements)}
          caption="all requirements"
        />
        <Metric
          label="Tasks done"
          value={tasks.length ? Math.round((doneTasks / tasks.length) * 100) : 0}
          caption={`${doneTasks} of ${tasks.length}`}
        />
        <Metric
          label="Essays final"
          value={essays.length ? Math.round((finalEssays / essays.length) * 100) : 0}
          caption={`${finalEssays} of ${essays.length}`}
        />
        <Metric
          label="Confirmed"
          value={
            requirements.length
              ? Math.round(
                  (requirements.filter((r) => r.status === "CONFIRMED_RECEIVED").length /
                    requirements.length) *
                    100,
                )
              : 0
          }
          caption="received by colleges"
        />
      </section>

      <section className="mb-8">
        <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Application funnel
        </h2>
        <div className="border-border bg-surface space-y-2 rounded-[14px] border p-4">
          {funnel.map((stage) => (
            <div key={stage.status} className="flex items-center gap-3">
              <span className="text-fg-muted w-[92px] shrink-0 text-[12.5px]">
                {stage.status.toLowerCase().replace(/_/g, " ")}
              </span>
              <div className="bg-bg-subtle h-5 flex-1 overflow-hidden rounded-[6px]">
                <div
                  className="bg-accent h-full rounded-[6px] transition-[width] duration-300"
                  style={{ width: `${(stage.count / maxFunnel) * 100}%` }}
                />
              </div>
              <span className="text-fg w-6 shrink-0 text-right font-mono text-[12.5px] tabular-nums">
                {stage.count}
              </span>
            </div>
          ))}
        </div>
      </section>

      {byRound.size > 0 && (
        <section className="mb-8">
          <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Rounds
          </h2>
          <div className="flex flex-wrap gap-2">
            {[...byRound.entries()].map(([label, count]) => (
              <span
                key={label}
                className="border-border text-fg-muted rounded-full border px-3 py-1 text-[12.5px]"
              >
                {label} <span className="text-fg font-mono tabular-nums">{count}</span>
              </span>
            ))}
          </div>
        </section>
      )}

      {perApplication.length > 0 && (
        <section>
          <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Completion by school
          </h2>
          <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
            {perApplication.map((row) => (
              <li key={row.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-fg w-[180px] shrink-0 truncate text-[13px]">
                  {row.name}
                </span>
                <div className="bg-bg-subtle h-1.5 flex-1 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
                <span className="text-fg-muted w-9 shrink-0 text-right font-mono text-[12px] tabular-nums">
                  {row.percent}%
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Metric({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="border-border bg-surface flex flex-col items-center gap-2 rounded-[14px] border p-4">
      <ProgressRing value={value} />
      <div className="text-center">
        <p className="text-fg text-[12.5px] font-medium">{label}</p>
        <p className="text-fg-subtle text-[11px]">{caption}</p>
      </div>
    </div>
  );
}
