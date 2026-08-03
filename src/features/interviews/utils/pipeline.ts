import { addDays, differenceInCalendarDays } from "date-fns";

import type { InterviewStatus } from "@prisma/client";

/**
 * Colleges publish two different interview deadlines and students routinely
 * conflate them: the last day to *request* an interview, and the last day to
 * *complete* one. Missing the request window forecloses the interview entirely,
 * and it usually closes weeks before the completion date — so the request date
 * is the one worth surfacing.
 */

/** Admissions convention: a thank-you note lands within two days or not at all. */
export const THANK_YOU_WINDOW_DAYS = 2;

export type Urgency = "lapsed" | "urgent" | "soon" | "calm" | "settled";

export interface InterviewLike {
  status: InterviewStatus;
  isEvaluative: boolean;
  requestByAt: Date | null;
  completeByAt: Date | null;
  scheduledAt: Date | null;
  thankYouSentAt: Date | null;
}

export interface NextAction {
  label: string;
  detail: string | null;
  dueAt: Date | null;
  /** Calendar days until `dueAt`; 0 is today, negative is overdue. */
  daysLeft: number | null;
  urgency: Urgency;
}

function urgencyFor(daysLeft: number | null): Urgency {
  if (daysLeft === null) return "calm";
  if (daysLeft < 0) return "lapsed";
  if (daysLeft <= 2) return "urgent";
  if (daysLeft <= 7) return "soon";
  return "calm";
}

/**
 * The single thing to do next for one interview, and how much time is left.
 * Ordering is by status rather than by date because the status determines which
 * of the two deadlines is the live one.
 */
export function nextInterviewAction(interview: InterviewLike, now: Date): NextAction {
  const { status, scheduledAt, requestByAt, completeByAt, thankYouSentAt } = interview;

  const settled = (label: string, detail: string | null = null): NextAction => ({
    label,
    detail,
    dueAt: null,
    daysLeft: null,
    urgency: "settled",
  });

  const due = (label: string, detail: string | null, dueAt: Date | null): NextAction => {
    const daysLeft = dueAt === null ? null : differenceInCalendarDays(dueAt, now);
    return { label, detail, dueAt, daysLeft, urgency: urgencyFor(daysLeft) };
  };

  switch (status) {
    case "NOT_AVAILABLE":
      return settled("Not offered", "This college does not interview.");

    case "WAIVED":
      return settled("Waived", "The college waived the interview.");

    case "DECLINED":
      return settled("Declined");

    case "COMPLETED": {
      if (thankYouSentAt !== null) return settled("Done", "Thank-you note sent.");
      // Without a completion timestamp the interview date is the best anchor.
      const by =
        scheduledAt === null ? null : addDays(scheduledAt, THANK_YOU_WINDOW_DAYS);
      return due("Send a thank-you note", "Within two days of the interview.", by);
    }

    case "SCHEDULED":
      return due("Interview scheduled", null, scheduledAt);

    case "REQUESTED":
      // The request is in; what remains is getting it on the calendar before the
      // completion window shuts.
      return due(
        "Requested — waiting on the college",
        "Follow up if you have not heard back.",
        completeByAt,
      );

    case "AVAILABLE":
      return due(
        "Request an interview",
        requestByAt === null ? "No request deadline recorded." : null,
        requestByAt ?? completeByAt,
      );
  }
}

const URGENCY_RANK: Record<Urgency, number> = {
  lapsed: 0,
  urgent: 1,
  soon: 2,
  calm: 3,
  settled: 4,
};

export interface RankedInterview<T> {
  interview: T;
  action: NextAction;
}

/**
 * Most-pressing first: overdue, then soonest deadline, then everything settled.
 * Evaluative interviews outrank informational ones at equal urgency, since only
 * the former are read by the admissions committee.
 */
export function rankInterviews<T extends InterviewLike>(
  interviews: readonly T[],
  now: Date,
): RankedInterview<T>[] {
  return interviews
    .map((interview) => ({ interview, action: nextInterviewAction(interview, now) }))
    .sort((a, b) => {
      const rank = URGENCY_RANK[a.action.urgency] - URGENCY_RANK[b.action.urgency];
      if (rank !== 0) return rank;

      const aDays = a.action.daysLeft;
      const bDays = b.action.daysLeft;
      if (aDays !== null && bDays !== null && aDays !== bDays) return aDays - bDays;
      if (aDays !== null && bDays === null) return -1;
      if (aDays === null && bDays !== null) return 1;

      if (a.interview.isEvaluative !== b.interview.isEvaluative) {
        return a.interview.isEvaluative ? -1 : 1;
      }
      return 0;
    });
}
