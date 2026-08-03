import Link from "next/link";
import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import {
  buildMonthGrid,
  dayKey,
  MONTH_NAMES,
  WEEKDAYS,
} from "@/features/calendar/utils/month";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Calendar" };

interface PageProps {
  searchParams: Promise<{ m?: string; y?: string }>;
}

export default async function CalendarPage({ searchParams }: PageProps) {
  const params = await searchParams;
  // eslint-disable-next-line react-hooks/purity -- Server Component: once per request.
  const nowMs = Date.now();
  const now = new Date(nowMs);

  const year = params.y ? Number(params.y) : now.getUTCFullYear();
  const month = params.m ? Number(params.m) : now.getUTCMonth();

  const rangeStart = new Date(Date.UTC(year, month - 1, 1));
  const rangeEnd = new Date(Date.UTC(year, month + 2, 1));

  const [deadlines, tasks] = await Promise.all([
    db.deadline.findMany({
      where: { userId: LOCAL_USER_ID, dueAt: { gte: rangeStart, lt: rangeEnd } },
      include: { application: { include: { college: { select: { name: true } } } } },
    }),
    db.task.findMany({
      where: {
        userId: LOCAL_USER_ID,
        status: { in: ["TODO", "IN_PROGRESS"] },
        dueAt: { gte: rangeStart, lt: rangeEnd },
      },
    }),
  ]);

  const byDay = new Map<string, { label: string; kind: "deadline" | "task" }[]>();
  for (const deadline of deadlines) {
    const key = dayKey(deadline.dueAt);
    byDay.set(key, [
      ...(byDay.get(key) ?? []),
      {
        label: deadline.application?.college.name ?? deadline.title,
        kind: "deadline",
      },
    ]);
  }
  for (const task of tasks) {
    if (!task.dueAt) continue;
    const key = dayKey(task.dueAt);
    byDay.set(key, [...(byDay.get(key) ?? []), { label: task.title, kind: "task" }]);
  }

  const cells = buildMonthGrid(year, month, nowMs);
  const prev = month === 0 ? { m: 11, y: year - 1 } : { m: month - 1, y: year };
  const next = month === 11 ? { m: 0, y: year + 1 } : { m: month + 1, y: year };

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <header className="mb-5 flex items-center justify-between">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          {MONTH_NAMES[month]} {year}
        </h1>
        <div className="flex gap-2">
          <Link
            href={`/calendar?m=${prev.m}&y=${prev.y}`}
            className="border-border text-fg-muted hover:text-fg rounded-[10px] border px-3 py-1.5 text-[13px]"
          >
            Previous
          </Link>
          <Link
            href={`/calendar?m=${next.m}&y=${next.y}`}
            className="border-border text-fg-muted hover:text-fg rounded-[10px] border px-3 py-1.5 text-[13px]"
          >
            Next
          </Link>
        </div>
      </header>

      <div className="border-border bg-surface overflow-hidden rounded-[14px] border">
        <div className="border-border grid grid-cols-7 border-b">
          {WEEKDAYS.map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="text-fg-subtle px-2 py-2 text-center text-[11px] font-semibold"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((cell) => {
            const events = byDay.get(dayKey(cell.date)) ?? [];
            return (
              <div
                key={cell.date.toISOString()}
                className={cn(
                  "border-border min-h-[92px] border-r border-b p-1.5 last:border-r-0",
                  !cell.isCurrentMonth && "bg-bg-subtle",
                )}
              >
                <span
                  className={cn(
                    "inline-grid size-5 place-items-center rounded-full font-mono text-[11px] tabular-nums",
                    cell.isToday
                      ? "bg-accent text-accent-fg font-semibold"
                      : cell.isCurrentMonth
                        ? "text-fg-muted"
                        : "text-fg-subtle",
                  )}
                >
                  {cell.date.getUTCDate()}
                </span>
                <ul className="mt-1 space-y-0.5">
                  {events.slice(0, 3).map((event, index) => (
                    <li
                      key={`${event.label}-${index}`}
                      title={event.label}
                      className={cn(
                        "truncate rounded px-1 py-0.5 text-[10.5px]",
                        event.kind === "deadline"
                          ? "bg-danger-subtle text-danger"
                          : "bg-accent-subtle text-accent",
                      )}
                    >
                      {event.label}
                    </li>
                  ))}
                  {events.length > 3 && (
                    <li className="text-fg-subtle px-1 text-[10.5px]">
                      +{events.length - 3}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-fg-subtle mt-3 text-[12px]">
        <span className="text-danger">Red</span> is a hard deadline.{" "}
        <span className="text-accent">Blue</span> is work scheduled backwards from one.
      </p>
    </div>
  );
}
