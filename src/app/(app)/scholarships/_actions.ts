"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";

export type Result = { ok: true } | { ok: false; error: string };

const schema = z.object({
  name: z.string().trim().min(1).max(160),
  amountDollars: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
  scope: z.enum(["LOCAL", "REGIONAL", "STATE", "NATIONAL", "INSTITUTIONAL"]),
  effortEstimateMinutes: z.coerce.number().int().min(1).max(10_000).nullable().optional(),
  deadline: z.string().trim().optional(),
});

export async function addScholarship(formData: FormData): Promise<Result> {
  const raw = {
    name: formData.get("name") ?? "",
    amountDollars: formData.get("amount") || null,
    scope: formData.get("scope") ?? "LOCAL",
    effortEstimateMinutes: formData.get("effort") || null,
    deadline: formData.get("deadline") ?? "",
  };
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "Check the name and amount." };

  const { name, amountDollars, scope, effortEstimateMinutes, deadline } = parsed.data;

  await db.scholarship.create({
    data: {
      userId: LOCAL_USER_ID,
      name,
      scope,
      amountCents: amountDollars ? Math.round(amountDollars * 100) : null,
      effortEstimateMinutes: effortEstimateMinutes ?? null,
      deadlineAt: deadline ? new Date(`${deadline}T23:59:00Z`) : null,
    },
  });

  revalidatePath("/scholarships");
  return { ok: true };
}
