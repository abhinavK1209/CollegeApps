import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { getRankedTasks, getTaskCounts } from "@/server/services/task.service";
import { TaskRow } from "@/features/tasks/components/task-row";
import { RegenerateButton } from "@/features/tasks/components/regenerate-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Tasks" };

export default async function TasksPage() {
  // eslint-disable-next-line react-hooks/purity -- Server Component: once per request.
  const nowMs = Date.now();
  const [tasks, counts] = await Promise.all([
    getRankedTasks(LOCAL_USER_ID, nowMs),
    getTaskCounts(LOCAL_USER_ID, nowMs),
  ]);

  const late = tasks.filter((t) => t.isOverdue);
  const rest = tasks.filter((t) => !t.isOverdue);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
            Tasks
          </h1>
          <p className="text-fg-muted mt-1.5 text-[15px] tabular-nums">
            {counts.open === 0
              ? "Nothing open."
              : `${counts.open} open · ${counts.dueToday} due today`}
          </p>
        </div>
        <RegenerateButton />
      </header>

      {tasks.length === 0 ? (
        <div className="border-border rounded-[14px] border border-dashed py-16 text-center">
          <p className="text-fg text-[15px] font-medium">No tasks yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-sm text-[13.5px]">
            Tasks are scheduled backwards from each application&rsquo;s deadline —
            recommenders four weeks out, essays three weeks out, submission two days
            early. Add a school, then rebuild the schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {late.length > 0 && (
            <section>
              <h2 className="text-danger mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
                Late · {late.length}
              </h2>
              <ul className="border-danger/30 divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
                {late.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </ul>
            </section>
          )}

          <section>
            <h2 className="text-fg-subtle mb-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
              Ranked by what matters next
            </h2>
            <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
              {rest.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
}
