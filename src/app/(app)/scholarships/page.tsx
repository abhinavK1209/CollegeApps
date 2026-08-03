import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { rankScholarships } from "@/features/scholarships/utils/expected-value";
import { formatCents } from "@/features/financial-aid/utils/net-price";
import { AddScholarshipForm } from "@/features/scholarships/components/add-scholarship-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Scholarships" };

export default async function ScholarshipsPage() {
  // eslint-disable-next-line react-hooks/purity -- Server Component: once per request.
  const nowMs = Date.now();
  const scholarships = await db.scholarship.findMany({
    where: { userId: LOCAL_USER_ID, archivedAt: null },
  });

  const ranked = rankScholarships(scholarships, nowMs);
  const awarded = scholarships
    .filter((s) => s.status === "AWARDED")
    .reduce((sum, s) => sum + (s.awardedAmountCents ?? 0), 0);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Scholarships
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Ranked by dollars per hour of work, weighted toward local awards — they have far
          better odds and are the ones most often missed.
          {awarded > 0 && ` ${formatCents(awarded)} won so far.`}
        </p>
      </header>

      <AddScholarshipForm />

      {ranked.length === 0 ? (
        <div className="border-border mt-6 rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">Nothing tracked yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13.5px]">
            Start with local ones — your counselor&rsquo;s email list, community
            foundations, and your parents&rsquo; employers. Three in four students win
            nothing nationally after nine hours of searching.
          </p>
        </div>
      ) : (
        <ul className="border-border divide-border bg-surface mt-6 divide-y overflow-hidden rounded-[14px] border">
          {ranked.map((scholarship) => (
            <li
              key={scholarship.id}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="text-fg truncate text-[13.5px] font-medium">
                  {scholarship.name}
                </p>
                <p className="text-fg-subtle truncate text-[12px]">
                  {scholarship.scope.toLowerCase()} · {scholarship.reason}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-fg font-mono text-[13px] tabular-nums">
                  {scholarship.amountCents ? formatCents(scholarship.amountCents) : "—"}
                </p>
                {scholarship.expectedValuePerHour > 0 && (
                  <p className="text-fg-subtle font-mono text-[11px] tabular-nums">
                    {Math.round(scholarship.expectedValuePerHour)}/hr
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
