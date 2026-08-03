import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Zap } from "lucide-react";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { getRankedTasks, getTaskCounts } from "@/server/services/task.service";
import { listApplications } from "@/server/services/application.service";
import { getActiveFindings, refreshRuleFindings } from "@/server/services/rule-engine";
import { completion } from "@/features/applications/utils/completion";
import { RuleFindings } from "@/features/applications/components/rule-findings";
import { TaskRow } from "@/features/tasks/components/task-row";
import { ProgressRing } from "@/components/charts/progress-ring";
import { Confetti } from "@/components/feedback/confetti";
import { detectMilestones, MILESTONE_COPY } from "@/server/services/milestone.service";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard" };

const DAY = 86_400_000;

function greeting(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  // eslint-disable-next-line react-hooks/purity -- Server Component: once per request.
  const nowMs = Date.now();

  await refreshRuleFindings(LOCAL_USER_ID);
  const freshMilestones = await detectMilestones(LOCAL_USER_ID);

  const [tasks, counts, applications, findings, deadlines, requirements] =
    await Promise.all([
      getRankedTasks(LOCAL_USER_ID, nowMs),
      getTaskCounts(LOCAL_USER_ID, nowMs),
      listApplications(LOCAL_USER_ID),
      getActiveFindings(LOCAL_USER_ID),
      db.deadline.findMany({
        where: { userId: LOCAL_USER_ID, isHard: true, completedAt: null },
        orderBy: { dueAt: "asc" },
        take: 3,
        include: { application: { include: { college: { select: { name: true } } } } },
      }),
      db.requirement.findMany({
        where: { application: { userId: LOCAL_USER_ID } },
        select: { type: true, status: true, isRequired: true },
      }),
    ]);

  const next = tasks[0];
  const late = tasks.filter((t) => t.isOverdue);
  const today = tasks.filter((t) => !t.isOverdue).slice(0, 5);

  const overall = completion(requirements);
  const submitted = applications.filter((a) => a.submittedAt !== null).length;
  const nextDeadline = deadlines[0];
  const daysToNext =
    nextDeadline === undefined
      ? null
      : Math.floor(nextDeadline.dueAt.getTime() / DAY) - Math.floor(nowMs / DAY);

  const recStatus = requirements.filter(
    (r) => r.type === "TEACHER_REC" || r.type === "COUNSELOR_REC",
  );
  const aidStatus = requirements.filter(
    (r) => r.type === "FAFSA" || r.type === "CSS_PROFILE" || r.type === "IDOC",
  );

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-7">
        <h1 className="text-fg text-[36px] leading-[40px] font-semibold tracking-[-0.025em]">
          {greeting(new Date(nowMs).getUTCHours())}.
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          {daysToNext === null
            ? "No deadlines yet. Add a school and pick a round."
            : daysToNext < 0
              ? `Your ${nextDeadline?.application?.college.name} deadline passed ${Math.abs(daysToNext)} days ago.`
              : `${daysToNext} days until your ${nextDeadline?.application?.college.name} deadline.`}
        </p>
      </header>

      {freshMilestones[0] && <Confetti message={MILESTONE_COPY[freshMilestones[0]]} />}

      <RuleFindings findings={findings} />

      {next && (
        <section className="border-accent/30 bg-accent-subtle mb-6 rounded-[14px] border p-5">
          <p className="text-accent mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
            <Zap className="size-3.5" strokeWidth={2} />
            Next best action
          </p>
          <p className="text-fg text-[16px] font-medium">{next.title}</p>
          <p className="text-fg-muted mt-1 text-[13px]">
            {next.reason}
            {next.estimateMinutes ? ` About ${next.estimateMinutes} minutes.` : ""}
            {next.collegeName ? ` · ${next.collegeName}` : ""}
          </p>
          {next.applicationId && (
            <Link
              href={`/applications/${next.applicationId}`}
              className="text-accent mt-3 inline-flex items-center gap-1 text-[13.5px] font-medium"
            >
              Open <ArrowRight className="size-3.5" strokeWidth={2} />
            </Link>
          )}
        </section>
      )}

      {late.length > 0 && (
        <section className="mb-6">
          <h2 className="text-danger mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Late · {late.length}
          </h2>
          <ul className="border-danger/30 divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
            {late.slice(0, 4).map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        </section>
      )}

      <section className="mb-7">
        <h2 className="text-fg-subtle mb-2 flex items-center justify-between text-[11px] font-semibold tracking-[0.06em] uppercase">
          Today
          {counts.open > today.length && (
            <Link href="/tasks" className="text-fg-muted normal-case">
              +{counts.open - today.length} more
            </Link>
          )}
        </h2>
        {today.length === 0 ? (
          <div className="border-border rounded-[14px] border border-dashed py-10 text-center">
            <p className="text-fg text-[14px] font-medium">Nothing due today.</p>
            <p className="text-fg-muted mt-1 text-[13px]">
              {nextDeadline
                ? `Next up is ${nextDeadline.title}.`
                : "Add a school to get started."}
            </p>
          </div>
        ) : (
          <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
            {today.map((task) => (
              <TaskRow key={task.id} task={task} />
            ))}
          </ul>
        )}
      </section>

      <section className="mb-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          label="Applications"
          value={overall}
          caption={`${applications.length} schools`}
        />
        <Stat
          label="Submitted"
          value={
            applications.length ? Math.round((submitted / applications.length) * 100) : 0
          }
          caption={`${submitted} of ${applications.length}`}
        />
        <Stat
          label="Recommendations"
          value={completion(recStatus)}
          caption={`${recStatus.length} needed`}
        />
        <Stat
          label="Financial aid"
          value={completion(aidStatus)}
          caption={`${aidStatus.length} forms`}
        />
      </section>

      {deadlines.length > 0 && (
        <section>
          <h2 className="text-fg-subtle mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Upcoming deadlines
          </h2>
          <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
            {deadlines.map((deadline) => {
              const days =
                Math.floor(deadline.dueAt.getTime() / DAY) - Math.floor(nowMs / DAY);
              return (
                <li
                  key={deadline.id}
                  className="flex items-center justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-fg truncate text-[13.5px]">{deadline.title}</p>
                    <p className="text-fg-subtle truncate text-[12px]">
                      {deadline.application?.college.name ?? "—"}
                      {deadline.confidence === "LOW" && " · typical date, verify it"}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 font-mono text-[13px] tabular-nums ${
                      days < 0
                        ? "text-danger"
                        : days <= 14
                          ? "text-warning"
                          : "text-fg-muted"
                    }`}
                  >
                    {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({
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
