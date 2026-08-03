import { describe, expect, it } from "vitest";

import { nextInterviewAction, rankInterviews, type InterviewLike } from "./pipeline";

const NOW = new Date("2026-10-15T12:00:00Z");

function interview(overrides: Partial<InterviewLike> = {}): InterviewLike {
  return {
    status: "AVAILABLE",
    isEvaluative: true,
    requestByAt: null,
    completeByAt: null,
    scheduledAt: null,
    thankYouSentAt: null,
    ...overrides,
  };
}

describe("nextInterviewAction", () => {
  it("counts down to the request deadline, not the completion deadline", () => {
    // The whole point: the request window closes weeks before the interview
    // must happen, and it is the one that forecloses the opportunity.
    const action = nextInterviewAction(
      interview({
        status: "AVAILABLE",
        requestByAt: new Date("2026-10-20T23:59:00Z"),
        completeByAt: new Date("2026-12-01T23:59:00Z"),
      }),
      NOW,
    );

    expect(action.label).toBe("Request an interview");
    expect(action.dueAt).toEqual(new Date("2026-10-20T23:59:00Z"));
    expect(action.daysLeft).toBe(5);
    expect(action.urgency).toBe("soon");
  });

  it("falls back to the completion deadline when no request date is known", () => {
    const action = nextInterviewAction(
      interview({ status: "AVAILABLE", completeByAt: new Date("2026-10-16T23:59:00Z") }),
      NOW,
    );

    expect(action.dueAt).toEqual(new Date("2026-10-16T23:59:00Z"));
    expect(action.urgency).toBe("urgent");
  });

  it("marks a passed request deadline as lapsed", () => {
    const action = nextInterviewAction(
      interview({ status: "AVAILABLE", requestByAt: new Date("2026-10-10T23:59:00Z") }),
      NOW,
    );

    expect(action.daysLeft).toBe(-5);
    expect(action.urgency).toBe("lapsed");
  });

  it("switches to the completion deadline once the request is in", () => {
    const action = nextInterviewAction(
      interview({
        status: "REQUESTED",
        requestByAt: new Date("2026-10-01T23:59:00Z"),
        completeByAt: new Date("2026-11-30T23:59:00Z"),
      }),
      NOW,
    );

    expect(action.label).toBe("Requested — waiting on the college");
    expect(action.dueAt).toEqual(new Date("2026-11-30T23:59:00Z"));
    // A request deadline already behind us must not drag this to "lapsed".
    expect(action.urgency).toBe("calm");
  });

  it("counts down to the interview itself once scheduled", () => {
    const action = nextInterviewAction(
      interview({ status: "SCHEDULED", scheduledAt: new Date("2026-10-17T15:00:00Z") }),
      NOW,
    );

    expect(action.label).toBe("Interview scheduled");
    expect(action.daysLeft).toBe(2);
    expect(action.urgency).toBe("urgent");
  });

  it("asks for a thank-you note within two days of the interview", () => {
    const action = nextInterviewAction(
      interview({ status: "COMPLETED", scheduledAt: new Date("2026-10-14T15:00:00Z") }),
      NOW,
    );

    expect(action.label).toBe("Send a thank-you note");
    expect(action.dueAt).toEqual(new Date("2026-10-16T15:00:00Z"));
    expect(action.urgency).toBe("urgent");
  });

  it("settles once the thank-you note is sent", () => {
    const action = nextInterviewAction(
      interview({
        status: "COMPLETED",
        scheduledAt: new Date("2026-10-01T15:00:00Z"),
        thankYouSentAt: new Date("2026-10-02T09:00:00Z"),
      }),
      NOW,
    );

    expect(action.urgency).toBe("settled");
    expect(action.dueAt).toBeNull();
  });

  it.each(["NOT_AVAILABLE", "WAIVED", "DECLINED"] as const)(
    "treats %s as needing nothing",
    (status) => {
      const action = nextInterviewAction(
        interview({ status, requestByAt: new Date("2026-10-01T00:00:00Z") }),
        NOW,
      );
      expect(action.urgency).toBe("settled");
      expect(action.daysLeft).toBeNull();
    },
  );
});

describe("rankInterviews", () => {
  it("puts lapsed first, then soonest, and settled last", () => {
    const lapsed = interview({
      status: "AVAILABLE",
      requestByAt: new Date("2026-10-01T00:00:00Z"),
    });
    const urgent = interview({
      status: "AVAILABLE",
      requestByAt: new Date("2026-10-16T00:00:00Z"),
    });
    const calm = interview({
      status: "AVAILABLE",
      requestByAt: new Date("2026-12-01T00:00:00Z"),
    });
    const settled = interview({ status: "WAIVED" });

    const order = rankInterviews([settled, calm, urgent, lapsed], NOW).map(
      (r) => r.interview,
    );

    expect(order).toEqual([lapsed, urgent, calm, settled]);
  });

  it("breaks ties toward the evaluative interview", () => {
    const informational = interview({
      status: "AVAILABLE",
      isEvaluative: false,
      requestByAt: new Date("2026-10-20T00:00:00Z"),
    });
    const evaluative = interview({
      status: "AVAILABLE",
      isEvaluative: true,
      requestByAt: new Date("2026-10-20T00:00:00Z"),
    });

    const order = rankInterviews([informational, evaluative], NOW).map(
      (r) => r.interview,
    );

    expect(order).toEqual([evaluative, informational]);
  });
});
