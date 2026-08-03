"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { LOCAL_USER_ID } from "@/lib/constants";
import {
  addCollegeToList,
  removeCollegeFromList,
} from "@/server/services/application.service";
import { regenerateChecklist } from "@/server/services/requirement-engine";
import { refreshRuleFindings } from "@/server/services/rule-engine";
import { backScheduleApplication } from "@/server/services/scheduling.service";

const toggleSchema = z.object({
  collegeId: z.string().min(1),
  tier: z.enum(["REACH", "TARGET", "LIKELY"]).nullable(),
  listed: z.boolean(),
});

export type ActionResult = { ok: true } | { ok: false; error: string };

/**
 * Thin adapter: validate, delegate to the service, revalidate. All list logic
 * lives in application.service so it stays callable from tests and scripts.
 */
export async function toggleCollegeInList(
  input: z.infer<typeof toggleSchema>,
): Promise<ActionResult> {
  const parsed = toggleSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Invalid request." };
  }

  const { collegeId, tier, listed } = parsed.data;

  try {
    if (listed) {
      await removeCollegeFromList(LOCAL_USER_ID, collegeId);
    } else {
      // Adding a school immediately derives its checklist and deadlines — the
      // student never builds a tracker by hand.
      const application = await addCollegeToList(LOCAL_USER_ID, collegeId, tier);
      await regenerateChecklist(LOCAL_USER_ID, application.id);
      await backScheduleApplication(LOCAL_USER_ID, application.id);
    }
    await refreshRuleFindings(LOCAL_USER_ID);
  } catch {
    return { ok: false, error: "Could not update your list. Try again." };
  }

  revalidatePath("/colleges");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  revalidatePath("/applications");
  return { ok: true };
}
