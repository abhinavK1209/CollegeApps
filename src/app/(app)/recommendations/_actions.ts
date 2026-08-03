"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import {
  addRecommender,
  advanceRecommendation,
} from "@/server/services/recommendation.service";

export type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().optional().or(z.literal("")),
  role: z.enum(["TEACHER", "COUNSELOR", "MENTOR", "EMPLOYER", "COACH", "OTHER"]),
  subject: z.string().trim().max(80).optional().or(z.literal("")),
});

export async function createRecommender(formData: FormData): Promise<Result> {
  const parsed = schema.safeParse({
    name: formData.get("name") ?? "",
    email: formData.get("email") ?? "",
    role: formData.get("role") ?? "TEACHER",
    subject: formData.get("subject") ?? "",
  });
  if (!parsed.success) return { ok: false, error: "Check the name and email." };

  await addRecommender(LOCAL_USER_ID, parsed.data);
  revalidatePath("/recommendations");
  return { ok: true };
}

export async function advance(recommendationId: string): Promise<Result> {
  const updated = await advanceRecommendation(LOCAL_USER_ID, recommendationId);
  if (!updated) return { ok: false, error: "Not found." };
  revalidatePath("/recommendations");
  return { ok: true };
}

/** The gate that blocks every Common App recommendation invite. */
export async function signFerpaWaiver(): Promise<Result> {
  await db.studentProfile.updateMany({
    where: { userId: LOCAL_USER_ID },
    data: { ferpaWaiverSignedAt: new Date() },
  });
  revalidatePath("/recommendations");
  revalidatePath("/dashboard");
  revalidatePath("/applications");
  return { ok: true };
}
