"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";

const profileSchema = z.object({
  graduationYear: z.coerce.number().int().min(2024).max(2035),
  highSchoolName: z.string().trim().max(200).optional().or(z.literal("")),
  gpaUnweighted: z.coerce.number().min(0).max(5).nullable().optional(),
  gpaWeighted: z.coerce.number().min(0).max(6).nullable().optional(),
  residencyState: z.string().trim().max(2).optional().or(z.literal("")),
  intendedMajors: z.string().trim().max(300).optional().or(z.literal("")),
  needsFinancialAid: z.coerce.boolean(),
  parentsSeparated: z.coerce.boolean(),
  isFirstGeneration: z.coerce.boolean(),
  satTotal: z.coerce.number().int().min(400).max(1600).nullable().optional(),
  actComposite: z.coerce.number().int().min(1).max(36).nullable().optional(),
});

export type ProfileResult = { ok: true } | { ok: false; error: string };

function emptyToNull(value: unknown): number | null {
  if (value === "" || value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export async function saveProfile(formData: FormData): Promise<ProfileResult> {
  const raw = {
    graduationYear: formData.get("graduationYear"),
    highSchoolName: formData.get("highSchoolName") ?? "",
    gpaUnweighted: emptyToNull(formData.get("gpaUnweighted")),
    gpaWeighted: emptyToNull(formData.get("gpaWeighted")),
    residencyState: formData.get("residencyState") ?? "",
    intendedMajors: formData.get("intendedMajors") ?? "",
    needsFinancialAid: formData.get("needsFinancialAid") === "on",
    parentsSeparated: formData.get("parentsSeparated") === "on",
    isFirstGeneration: formData.get("isFirstGeneration") === "on",
    satTotal: emptyToNull(formData.get("satTotal")),
    actComposite: emptyToNull(formData.get("actComposite")),
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first ? `${first.path.join(".")}: ${first.message}` : "Invalid input.",
    };
  }

  const data = parsed.data;
  const majors = (data.intendedMajors ?? "")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);

  const profileFields = {
    graduationYear: data.graduationYear,
    highSchoolName: data.highSchoolName || null,
    gpaUnweighted: data.gpaUnweighted ?? null,
    gpaWeighted: data.gpaWeighted ?? null,
    residencyState: data.residencyState ? data.residencyState.toUpperCase() : null,
    intendedMajors: majors,
    needsFinancialAid: data.needsFinancialAid,
    parentsSeparated: data.parentsSeparated,
    isFirstGeneration: data.isFirstGeneration,
  };

  await db.studentProfile.upsert({
    where: { userId: LOCAL_USER_ID },
    update: profileFields,
    create: { userId: LOCAL_USER_ID, ...profileFields },
  });

  // Separated parents means most CSS Profile schools require a second Profile
  // from the noncustodial parent's own College Board account. Surface it early
  // rather than in January — see research P-08.
  await db.financialAidProfile.upsert({
    where: { userId: LOCAL_USER_ID },
    update: { noncustodialRequired: data.parentsSeparated },
    create: { userId: LOCAL_USER_ID, noncustodialRequired: data.parentsSeparated },
  });

  await syncScore("SAT", data.satTotal ?? null);
  await syncScore("ACT", data.actComposite ?? null);

  revalidatePath("/profile");
  revalidatePath("/colleges");
  return { ok: true };
}

/** Keeps at most one canonical row per test type; the explorer reads the best. */
async function syncScore(type: "SAT" | "ACT", score: number | null) {
  await db.testScore.deleteMany({ where: { userId: LOCAL_USER_ID, type } });
  if (score === null) return;
  await db.testScore.create({
    data: { userId: LOCAL_USER_ID, type, score, takenOn: new Date() },
  });
}
