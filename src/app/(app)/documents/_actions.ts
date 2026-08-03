"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";

export type Result = { ok: true } | { ok: false; error: string };

const DOCUMENT_TYPES = [
  "TRANSCRIPT",
  "RESUME",
  "BRAG_SHEET",
  "AWARD_LETTER",
  "TAX_RETURN",
  "W2",
  "ESSAY_EXPORT",
  "PORTFOLIO",
  "TEST_REPORT",
  "ACCEPTANCE_LETTER",
  "OTHER",
] as const;

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  type: z.enum(DOCUMENT_TYPES),
  location: z
    .string()
    .trim()
    .max(200)
    .optional()
    .transform((value) => (value ? value : null)),
  url: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null))
    .refine(
      (value) => value === null || /^https?:\/\//.test(value),
      "Links must start with http:// or https://",
    ),
});

export async function addDocument(formData: FormData): Promise<Result> {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    type: formData.get("type") ?? "OTHER",
    location: formData.get("location") ?? "",
    url: formData.get("url") ?? "",
  });
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue?.message ?? "Check the name and type." };
  }

  const { name, type, location, url } = parsed.data;

  await db.document.create({
    data: { userId: LOCAL_USER_ID, name, type, location, url },
  });

  revalidatePath("/documents");
  return { ok: true };
}

export async function deleteDocument(documentId: string): Promise<Result> {
  // deleteMany rather than delete: scoping by userId in the same statement means
  // a wrong id cannot delete someone else's row once auth lands.
  const { count } = await db.document.deleteMany({
    where: { id: documentId, userId: LOCAL_USER_ID },
  });
  if (count === 0) return { ok: false, error: "That document no longer exists." };

  revalidatePath("/documents");
  return { ok: true };
}
