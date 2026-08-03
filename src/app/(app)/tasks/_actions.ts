"use server";

import { revalidatePath } from "next/cache";
import { LOCAL_USER_ID } from "@/lib/constants";
import { toggleTaskDone } from "@/server/services/task.service";
import { backScheduleAll } from "@/server/services/scheduling.service";

export type Result = { ok: true } | { ok: false; error: string };

export async function toggleTask(taskId: string): Promise<Result> {
  const updated = await toggleTaskDone(LOCAL_USER_ID, taskId);
  if (!updated) return { ok: false, error: "Task not found." };

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}

/** Rebuilds dated work from every application's hard deadlines. */
export async function regenerateSchedule(): Promise<Result> {
  await backScheduleAll(LOCAL_USER_ID);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true };
}
