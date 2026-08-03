import { db } from "@/server/db";
import { rankTasks, type ScoredTask } from "@/features/tasks/utils/scoring";

export interface TaskWithContext extends ScoredTask {
  collegeName: string | null;
  applicationId: string | null;
  labels: string[];
  /** Titles of incomplete prerequisites, shown so "blocked" is never a mystery. */
  blockedBy: string[];
}

/** Open work, ranked. Blocked tasks are excluded — they aren't actionable. */
export async function getRankedTasks(
  userId: string,
  nowMs: number,
): Promise<TaskWithContext[]> {
  const tasks = await db.task.findMany({
    where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
    include: {
      application: { select: { id: true, college: { select: { name: true } } } },
      blocking: { select: { blockedTaskId: true } },
      blockedBy: {
        select: {
          blockingTask: { select: { title: true, status: true } },
        },
      },
    },
  });

  // A task whose prerequisites are unfinished is not actionable, so it never
  // enters the ranked queue. Without this the app cheerfully suggests submitting
  // an application whose essays do not exist.
  const actionable = tasks.filter((task) =>
    task.blockedBy.every((edge) => edge.blockingTask.status === "DONE"),
  );

  const scored = rankTasks(
    actionable.map((task) => ({
      id: task.id,
      title: task.title,
      priority: task.priority,
      dueAt: task.dueAt,
      estimateMinutes: task.estimateMinutes,
      status: task.status,
      updatedAt: task.updatedAt,
      unblocks: task.blocking.length,
    })),
    nowMs,
  );

  const byId = new Map(actionable.map((t) => [t.id, t]));
  return scored.map((task) => {
    const source = byId.get(task.id);
    return {
      ...task,
      collegeName: source?.application?.college.name ?? null,
      applicationId: source?.application?.id ?? null,
      labels: source?.labels ?? [],
      blockedBy: (source?.blockedBy ?? [])
        .filter((edge) => edge.blockingTask.status !== "DONE")
        .map((edge) => edge.blockingTask.title),
    };
  });
}

export async function getTaskCounts(userId: string, nowMs: number) {
  const open = await db.task.findMany({
    where: { userId, status: { in: ["TODO", "IN_PROGRESS"] } },
    select: { dueAt: true },
  });

  const startOfTomorrow = new Date(nowMs);
  startOfTomorrow.setUTCHours(24, 0, 0, 0);

  return {
    open: open.length,
    overdue: open.filter((t) => t.dueAt !== null && t.dueAt.getTime() < nowMs).length,
    dueToday: open.filter(
      (t) =>
        t.dueAt !== null &&
        t.dueAt.getTime() >= nowMs &&
        t.dueAt.getTime() < startOfTomorrow.getTime(),
    ).length,
  };
}

export async function toggleTaskDone(userId: string, taskId: string) {
  const task = await db.task.findFirst({
    where: { id: taskId, userId },
    select: { id: true, status: true, title: true },
  });
  if (!task) return null;

  const done = task.status === "DONE";
  const updated = await db.task.update({
    where: { id: taskId },
    data: {
      status: done ? "TODO" : "DONE",
      completedAt: done ? null : new Date(),
    },
  });

  if (!done) {
    await db.activityEvent.create({
      data: {
        userId,
        entityType: "TASK",
        entityId: taskId,
        action: "COMPLETED",
        summary: `Completed "${task.title}"`,
      },
    });
  }

  return updated;
}
