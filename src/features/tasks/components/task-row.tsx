"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { toggleTask } from "@/app/(app)/tasks/_actions";
import type { TaskWithContext } from "@/server/services/task.service";
import { cn } from "@/lib/utils";

const PRIORITY_LABEL = ["P0", "P1", "P2", "P3"];
const PRIORITY_STYLE = [
  "text-danger",
  "text-warning",
  "text-fg-subtle",
  "text-fg-subtle",
];

export function TaskRow({ task }: { task: TaskWithContext }) {
  const [pending, startTransition] = useTransition();

  return (
    <li
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 transition-opacity duration-150",
        pending && "opacity-50",
      )}
    >
      <button
        type="button"
        disabled={pending}
        aria-label={`Complete "${task.title}"`}
        onClick={() =>
          startTransition(async () => {
            await toggleTask(task.id);
          })
        }
        className="border-border hover:border-accent hover:text-accent grid size-[18px] shrink-0 place-items-center rounded-full border text-transparent transition-colors duration-100"
      >
        <Check className="size-3" strokeWidth={3} />
      </button>

      <div className="min-w-0 flex-1">
        <p className="text-fg truncate text-[13.5px]">{task.title}</p>
        <p className="text-fg-subtle truncate text-[12px]">
          <span className={PRIORITY_STYLE[task.priority] ?? "text-fg-subtle"}>
            {PRIORITY_LABEL[task.priority] ?? "P2"}
          </span>
          {" · "}
          <span className={task.isOverdue ? "text-danger" : undefined}>
            {task.reason}
          </span>
          {task.estimateMinutes ? ` · ${task.estimateMinutes}m` : ""}
        </p>
      </div>

      {task.collegeName && task.applicationId && (
        <Link
          href={`/applications/${task.applicationId}`}
          className="border-border text-fg-muted hover:text-fg hidden shrink-0 rounded-full border px-2 py-0.5 text-[11px] sm:block"
        >
          {task.collegeName}
        </Link>
      )}
    </li>
  );
}
