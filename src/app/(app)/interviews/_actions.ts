"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";

export type Result = { ok: true } | { ok: false; error: string };

const INTERVIEW_TYPES = [
  "ALUMNI",
  "ON_CAMPUS",
  "VIRTUAL",
  "FACULTY",
  "GROUP",
  "THIRD_PARTY",
] as const;

const INTERVIEW_STATUSES = [
  "NOT_AVAILABLE",
  "AVAILABLE",
  "REQUESTED",
  "SCHEDULED",
  "COMPLETED",
  "DECLINED",
  "WAIVED",
] as const;

/** Empty date inputs arrive as "", which must mean "unset", not "epoch". */
const optionalDate = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null));

const trackSchema = z.object({
  applicationId: z.string().trim().min(1),
  type: z.enum(INTERVIEW_TYPES),
  isEvaluative: z.boolean(),
  requestByAt: optionalDate,
  completeByAt: optionalDate,
});

/** End-of-day so a deadline is not treated as passed on the morning it is due. */
function endOfDay(date: string): Date {
  return new Date(`${date}T23:59:00Z`);
}

async function ownsApplication(applicationId: string): Promise<boolean> {
  const count = await db.application.count({
    where: { id: applicationId, userId: LOCAL_USER_ID },
  });
  return count === 1;
}

export async function trackInterview(formData: FormData): Promise<Result> {
  const parsed = trackSchema.safeParse({
    applicationId: formData.get("applicationId") ?? "",
    type: formData.get("type") ?? "ALUMNI",
    isEvaluative: formData.get("isEvaluative") === "on",
    requestByAt: formData.get("requestByAt") ?? "",
    completeByAt: formData.get("completeByAt") ?? "",
  });
  if (!parsed.success)
    return { ok: false, error: "Pick a college and an interview type." };

  const { applicationId, type, isEvaluative, requestByAt, completeByAt } = parsed.data;
  if (!(await ownsApplication(applicationId))) {
    return { ok: false, error: "That application no longer exists." };
  }

  const dates = {
    requestByAt: requestByAt ? endOfDay(requestByAt) : null,
    completeByAt: completeByAt ? endOfDay(completeByAt) : null,
  };

  // One interview per application, so re-tracking updates rather than duplicates.
  await db.interview.upsert({
    where: { applicationId },
    update: { type, isEvaluative, ...dates },
    create: { applicationId, type, isEvaluative, status: "AVAILABLE", ...dates },
  });

  revalidatePath("/interviews");
  return { ok: true };
}

const statusSchema = z.object({
  interviewId: z.string().trim().min(1),
  status: z.enum(INTERVIEW_STATUSES),
  scheduledAt: optionalDate,
});

export async function setInterviewStatus(formData: FormData): Promise<Result> {
  const parsed = statusSchema.safeParse({
    interviewId: formData.get("interviewId") ?? "",
    status: formData.get("status") ?? "AVAILABLE",
    scheduledAt: formData.get("scheduledAt") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Could not update that interview." };

  const { interviewId, status, scheduledAt } = parsed.data;
  const interview = await db.interview.findFirst({
    where: { id: interviewId, application: { userId: LOCAL_USER_ID } },
    select: { id: true, scheduledAt: true },
  });
  if (!interview) return { ok: false, error: "That interview no longer exists." };

  await db.interview.update({
    where: { id: interviewId },
    data: {
      status,
      // A supplied date wins; otherwise keep whatever was already scheduled.
      scheduledAt: scheduledAt
        ? new Date(`${scheduledAt}T00:00:00Z`)
        : interview.scheduledAt,
    },
  });

  revalidatePath("/interviews");
  return { ok: true };
}

export async function markThankYouSent(interviewId: string): Promise<Result> {
  const interview = await db.interview.findFirst({
    where: { id: interviewId, application: { userId: LOCAL_USER_ID } },
    select: { id: true },
  });
  if (!interview) return { ok: false, error: "That interview no longer exists." };

  await db.interview.update({
    where: { id: interviewId },
    data: { thankYouSentAt: new Date() },
  });

  revalidatePath("/interviews");
  return { ok: true };
}
