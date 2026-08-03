import { describe, expect, it } from "vitest";
import { rankTasks, scoreTask, type ScorableTask } from "./scoring";

const NOW = new Date("2026-11-01T12:00:00Z").getTime();
const DAY = 86_400_000;

function task(overrides: Partial<ScorableTask> = {}): ScorableTask {
  return {
    id: "t1",
    title: "Task",
    priority: 2,
    dueAt: null,
    estimateMinutes: 60,
    status: "TODO",
    updatedAt: new Date(NOW),
    ...overrides,
  };
}

describe("scoreTask", () => {
  it("ranks overdue work above everything else", () => {
    const overdue = scoreTask(task({ dueAt: new Date(NOW - 3 * DAY) }), NOW);
    const dueToday = scoreTask(task({ dueAt: new Date(NOW) }), NOW);
    expect(overdue.score).toBeGreaterThan(dueToday.score);
    expect(overdue.isOverdue).toBe(true);
    expect(overdue.reason).toBe("3 days late.");
  });

  it("says 'Due today' rather than 'in 0 days'", () => {
    expect(scoreTask(task({ dueAt: new Date(NOW + 3600_000) }), NOW).reason).toBe(
      "Due today.",
    );
  });

  it("uses singular day for one day late", () => {
    expect(scoreTask(task({ dueAt: new Date(NOW - 1.5 * DAY) }), NOW).reason).toBe(
      "1 day late.",
    );
  });

  it("scores urgent priority above low priority at equal dates", () => {
    const due = new Date(NOW + 5 * DAY);
    const p0 = scoreTask(task({ dueAt: due, priority: 0 }), NOW);
    const p3 = scoreTask(task({ dueAt: due, priority: 3 }), NOW);
    expect(p0.score).toBeGreaterThan(p3.score);
  });

  it("rewards work that unblocks other work", () => {
    const blocking = scoreTask(task({ unblocks: 3 }), NOW);
    const isolated = scoreTask(task({ unblocks: 0 }), NOW);
    expect(blocking.score).toBeGreaterThan(isolated.score);
    expect(blocking.reason).toBe("Unblocks 3 other tasks.");
  });

  it("surfaces quick wins", () => {
    const quick = scoreTask(task({ estimateMinutes: 10 }), NOW);
    expect(quick.reason).toBe("Takes under 15 minutes.");
    expect(quick.score).toBeGreaterThan(scoreTask(task(), NOW).score);
  });

  it("nudges stale in-progress work", () => {
    const stale = scoreTask(
      task({ status: "IN_PROGRESS", updatedAt: new Date(NOW - 10 * DAY) }),
      NOW,
    );
    expect(stale.reason).toBe("Started over a week ago and untouched since.");
  });

  it("treats undated work as low urgency, not zero", () => {
    const undated = scoreTask(task({ dueAt: null }), NOW);
    expect(undated.score).toBeGreaterThan(0);
    expect(undated.daysUntilDue).toBeNull();
    expect(undated.reason).toBe("No deadline set.");
  });

  it("stops distinguishing beyond thirty days out", () => {
    const far = scoreTask(task({ dueAt: new Date(NOW + 60 * DAY) }), NOW);
    const farther = scoreTask(task({ dueAt: new Date(NOW + 90 * DAY) }), NOW);
    expect(far.score).toBe(farther.score);
  });
});

describe("rankTasks", () => {
  it("puts the most urgent first", () => {
    const ranked = rankTasks(
      [
        task({ id: "later", dueAt: new Date(NOW + 20 * DAY) }),
        task({ id: "overdue", dueAt: new Date(NOW - 2 * DAY) }),
        task({ id: "soon", dueAt: new Date(NOW + 2 * DAY) }),
      ],
      NOW,
    );
    expect(ranked.map((t) => t.id)).toEqual(["overdue", "soon", "later"]);
  });

  it("handles an empty list", () => {
    expect(rankTasks([], NOW)).toEqual([]);
  });
});
