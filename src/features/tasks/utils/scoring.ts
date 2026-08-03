/**
 * Ranks open work so the app can answer "what should I do right now?" with one
 * item instead of a backlog.
 *
 * Deterministic and explainable — every score carries a human-readable reason
 * that the UI shows verbatim. A ranking a student cannot interrogate is a
 * ranking they will not trust.
 */

export interface ScorableTask {
  id: string;
  title: string;
  priority: number;
  dueAt: Date | null;
  estimateMinutes: number | null;
  status: string;
  updatedAt: Date;
  /** How many other open tasks this one unblocks. */
  unblocks?: number;
}

export interface ScoredTask extends ScorableTask {
  score: number;
  reason: string;
  daysUntilDue: number | null;
  isOverdue: boolean;
}

const DAY = 86_400_000;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Whole calendar days between today and the due date, so something due at 11:59
 * tonight reads as "today" rather than "in 1 day". Compared at UTC day
 * boundaries, which keeps ranking stable regardless of the hour it runs.
 */
function calendarDaysUntil(due: Date, nowMs: number): number {
  const toDay = (ms: number) => Math.floor(ms / DAY);
  return toDay(due.getTime()) - toDay(nowMs);
}

export function scoreTask(task: ScorableTask, nowMs: number): ScoredTask {
  const daysUntilDue =
    task.dueAt === null ? null : calendarDaysUntil(new Date(task.dueAt), nowMs);
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  // Overdue outranks everything; beyond 30 days out, urgency stops mattering.
  const urgency =
    daysUntilDue === null ? 0.15 : isOverdue ? 1.2 : clamp(1 - daysUntilDue / 30, 0, 1);

  const criticality = [1, 0.75, 0.5, 0.25][clamp(task.priority, 0, 3)] ?? 0.5;
  const fanout = clamp((task.unblocks ?? 0) / 3, 0, 1);
  const quickWin = (task.estimateMinutes ?? 60) <= 15 ? 1 : 0;
  const staleness =
    task.status === "IN_PROGRESS" && nowMs - new Date(task.updatedAt).getTime() > 7 * DAY
      ? 1
      : 0;

  const score =
    urgency * 40 + criticality * 25 + fanout * 10 + quickWin * 5 + staleness * 5;

  return { ...task, score, reason: explain(), daysUntilDue, isOverdue };

  function explain(): string {
    if (isOverdue && daysUntilDue !== null) {
      const days = Math.abs(daysUntilDue);
      return `${days} ${days === 1 ? "day" : "days"} late.`;
    }
    if (daysUntilDue !== null && daysUntilDue <= 3) {
      return daysUntilDue === 0
        ? "Due today."
        : `Due in ${daysUntilDue} ${daysUntilDue === 1 ? "day" : "days"}.`;
    }
    if ((task.unblocks ?? 0) > 0) {
      const n = task.unblocks ?? 0;
      return `Unblocks ${n} other ${n === 1 ? "task" : "tasks"}.`;
    }
    if (quickWin) return "Takes under 15 minutes.";
    if (staleness) return "Started over a week ago and untouched since.";
    if (daysUntilDue !== null) return `Due in ${daysUntilDue} days.`;
    return "No deadline set.";
  }
}

/** Highest-scoring first. Blocked and done work is excluded upstream. */
export function rankTasks(tasks: ScorableTask[], nowMs: number): ScoredTask[] {
  return tasks.map((task) => scoreTask(task, nowMs)).sort((a, b) => b.score - a.score);
}
