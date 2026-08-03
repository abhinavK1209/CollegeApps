"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import {
  createEssay,
  preSubmitCheck,
  saveVersion,
  setEssayStatus,
} from "@/server/services/essay.service";
import type { PreSubmitCheck } from "@/server/services/essay.service";

export type Result<T = undefined> = { ok: true; data?: T } | { ok: false; error: string };

const STATUSES = [
  "NOT_STARTED",
  "BRAINSTORM",
  "OUTLINE",
  "DRAFTING",
  "REVISING",
  "REVIEW",
  "FINAL",
  "SUBMITTED",
] as const;

const PROMPT_KINDS = [
  "PERSONAL_STATEMENT",
  "WHY_US",
  "WHY_MAJOR",
  "COMMUNITY",
  "DIVERSITY",
  "ACTIVITY",
  "INTELLECTUAL_INTEREST",
  "CHALLENGE",
  "SHORT_ANSWER",
  "CREATIVE",
  "ADDITIONAL_INFO",
  "UC_PIQ",
  "OTHER",
] as const;

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  promptText: z.string().trim().max(4000).optional(),
  wordLimit: z.coerce.number().int().min(1).max(2000).nullable().optional(),
  promptKind: z.enum(PROMPT_KINDS).optional(),
  topicTags: z.string().trim().max(300).optional(),
});

export async function addEssay(formData: FormData): Promise<Result<string>> {
  const parsed = createSchema.safeParse({
    title: formData.get("title") ?? "",
    promptText: formData.get("promptText") ?? undefined,
    wordLimit: formData.get("wordLimit") || null,
    promptKind: formData.get("promptKind") ?? undefined,
    topicTags: formData.get("topicTags") ?? undefined,
  });
  if (!parsed.success) return { ok: false, error: "Give the essay a title." };

  const essay = await createEssay(LOCAL_USER_ID, {
    title: parsed.data.title,
    promptText: parsed.data.promptText,
    wordLimit: parsed.data.wordLimit ?? null,
    promptKind: parsed.data.promptKind,
    topicTags: (parsed.data.topicTags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
  });

  revalidatePath("/essays");
  return { ok: true, data: essay.id };
}

export async function autosave(essayId: string, content: string): Promise<Result> {
  const version = await saveVersion(LOCAL_USER_ID, essayId, content, {
    isAutosave: true,
  });
  return version ? { ok: true } : { ok: false, error: "Essay not found." };
}

export async function saveNamedVersion(
  essayId: string,
  content: string,
  label: string,
): Promise<Result> {
  const version = await saveVersion(LOCAL_USER_ID, essayId, content, {
    isAutosave: false,
    label: label || undefined,
  });
  if (!version) return { ok: false, error: "Essay not found." };

  revalidatePath(`/essays/${essayId}`);
  revalidatePath("/essays");
  return { ok: true };
}

const statusSchema = z.enum(STATUSES);

export async function updateStatus(
  essayId: string,
  status: (typeof STATUSES)[number],
): Promise<Result> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) return { ok: false, error: "Unknown status." };

  const updated = await setEssayStatus(LOCAL_USER_ID, essayId, parsed.data);
  if (!updated) return { ok: false, error: "Essay not found." };

  revalidatePath(`/essays/${essayId}`);
  revalidatePath("/essays");
  return { ok: true };
}

export async function runPreSubmitCheck(
  essayId: string,
): Promise<Result<PreSubmitCheck>> {
  const result = await preSubmitCheck(LOCAL_USER_ID, essayId);
  return result ? { ok: true, data: result } : { ok: false, error: "Essay not found." };
}
