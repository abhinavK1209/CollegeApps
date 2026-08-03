"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { regenerateChecklist } from "@/server/services/requirement-engine";
import { refreshRuleFindings } from "@/server/services/rule-engine";

export type Result = { ok: true } | { ok: false; error: string };

const ROUNDS = [
  "ED1",
  "ED2",
  "EA",
  "REA",
  "SCEA",
  "RD",
  "ROLLING",
  "QUESTBRIDGE_MATCH",
  "PRIORITY",
  "TRANSFER",
] as const;

const setRoundSchema = z.object({
  applicationId: z.string().min(1),
  round: z.enum(ROUNDS),
});

/**
 * Changing the round rebuilds the checklist and re-runs the rule engine, since
 * both deadlines and binding-round conflicts depend on it.
 */
export async function setApplicationRound(
  input: z.infer<typeof setRoundSchema>,
): Promise<Result> {
  const parsed = setRoundSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid round." };

  const { applicationId, round } = parsed.data;

  const existing = await db.application.findFirst({
    where: { id: applicationId, userId: LOCAL_USER_ID },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Application not found." };

  await db.application.update({
    where: { id: applicationId },
    data: { round, status: "PLANNING" },
  });

  await regenerateChecklist(LOCAL_USER_ID, applicationId);
  await refreshRuleFindings(LOCAL_USER_ID);

  revalidatePath("/applications");
  revalidatePath(`/applications/${applicationId}`);
  return { ok: true };
}

const requirementSchema = z.object({
  requirementId: z.string().min(1),
  status: z.enum([
    "NOT_STARTED",
    "IN_PROGRESS",
    "SUBMITTED",
    "CONFIRMED_RECEIVED",
    "WAIVED",
    "NOT_APPLICABLE",
  ]),
});

export async function setRequirementStatus(
  input: z.infer<typeof requirementSchema>,
): Promise<Result> {
  const parsed = requirementSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid status." };

  const { requirementId, status } = parsed.data;

  const requirement = await db.requirement.findFirst({
    where: { id: requirementId, application: { userId: LOCAL_USER_ID } },
    select: { id: true, applicationId: true },
  });
  if (!requirement) return { ok: false, error: "Requirement not found." };

  const now = new Date();
  await db.requirement.update({
    where: { id: requirementId },
    data: {
      status,
      isUserOverridden: true,
      submittedAt: status === "SUBMITTED" || status === "CONFIRMED_RECEIVED" ? now : null,
      // The distinction the whole product turns on: submitted is not received.
      confirmedReceivedAt: status === "CONFIRMED_RECEIVED" ? now : null,
    },
  });

  revalidatePath(`/applications/${requirement.applicationId}`);
  revalidatePath("/applications");
  return { ok: true };
}

export async function dismissFinding(findingId: string): Promise<Result> {
  const finding = await db.ruleFinding.findFirst({
    where: { id: findingId, userId: LOCAL_USER_ID },
    select: { id: true },
  });
  if (!finding) return { ok: false, error: "Not found." };

  await db.ruleFinding.update({
    where: { id: findingId },
    data: { dismissedAt: new Date() },
  });
  revalidatePath("/applications");
  return { ok: true };
}

/** For applications that predate automatic derivation, or after a data change. */
export async function buildChecklist(applicationId: string): Promise<Result> {
  const application = await db.application.findFirst({
    where: { id: applicationId, userId: LOCAL_USER_ID },
    select: { id: true },
  });
  if (!application) return { ok: false, error: "Application not found." };

  await regenerateChecklist(LOCAL_USER_ID, applicationId);
  await refreshRuleFindings(LOCAL_USER_ID);

  revalidatePath(`/applications/${applicationId}`);
  revalidatePath("/applications");
  return { ok: true };
}
