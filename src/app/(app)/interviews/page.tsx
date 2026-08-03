import type { Metadata } from "next";

import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { InterviewRow } from "@/features/interviews/components/interview-row";
import { TrackInterviewForm } from "@/features/interviews/components/track-interview-form";
import { rankInterviews } from "@/features/interviews/utils/pipeline";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Interviews" };

const TYPE_LABELS: Record<string, string> = {
  ALUMNI: "Alumni interview",
  ON_CAMPUS: "On-campus interview",
  VIRTUAL: "Virtual interview",
  FACULTY: "Faculty interview",
  GROUP: "Group interview",
  THIRD_PARTY: "Third-party interview",
};

export default async function InterviewsPage() {
  const now = new Date();

  const [interviews, untracked] = await Promise.all([
    db.interview.findMany({
      where: { application: { userId: LOCAL_USER_ID, archivedAt: null } },
      include: { application: { select: { college: { select: { name: true } } } } },
    }),
    db.application.findMany({
      where: { userId: LOCAL_USER_ID, archivedAt: null, interview: null },
      select: { id: true, college: { select: { name: true } } },
      orderBy: { college: { name: "asc" } },
    }),
  ]);

  const ranked = rankInterviews(interviews, now);
  const actionable = ranked.filter((r) => r.action.urgency !== "settled").length;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Interviews
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Colleges publish two deadlines — the last day to <em>request</em> an interview
          and the last day to <em>complete</em> one. The request window closes first and
          closes quietly, so it is the one tracked here.
          {actionable > 0 && ` ${actionable} need attention.`}
        </p>
      </header>

      <TrackInterviewForm
        applications={untracked.map((application) => ({
          id: application.id,
          collegeName: application.college.name,
        }))}
      />

      {ranked.length === 0 ? (
        <div className="border-border mt-6 rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">No interviews tracked yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13.5px]">
            {untracked.length === 0
              ? "Add an application first, then track its interview here."
              : "Most alumni interviews are offered after you submit, and many are request-only — check each college's admissions site for its request deadline."}
          </p>
        </div>
      ) : (
        <ul className="border-border divide-border bg-surface mt-6 divide-y overflow-hidden rounded-[14px] border">
          {ranked.map(({ interview, action }) => (
            <InterviewRow
              key={interview.id}
              interviewId={interview.id}
              collegeName={interview.application.college.name}
              typeLabel={TYPE_LABELS[interview.type] ?? "Interview"}
              isEvaluative={interview.isEvaluative}
              status={interview.status}
              action={action}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
