import Link from "next/link";
import type { Metadata } from "next";
import type { SchoolTier } from "@prisma/client";
import { LOCAL_USER_ID } from "@/lib/constants";
import { listApplications } from "@/server/services/application.service";
import { getActiveFindings, refreshRuleFindings } from "@/server/services/rule-engine";
import { RuleFindings } from "@/features/applications/components/rule-findings";
import { roundLabel } from "@/server/services/round-conventions";
import { cn } from "@/lib/utils";

// Reads user data from the database, so it must never be prerendered at build
// time. Once auth lands, the session lookup makes this implicit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My list" };

const TIER_ORDER: (SchoolTier | "UNSORTED")[] = ["REACH", "TARGET", "LIKELY", "UNSORTED"];

const TIER_LABELS: Record<string, string> = {
  REACH: "Reach",
  TARGET: "Target",
  LIKELY: "Likely",
  UNSORTED: "Not yet tiered",
};

const TIER_DOT: Record<string, string> = {
  REACH: "bg-warning",
  TARGET: "bg-accent",
  LIKELY: "bg-success",
  UNSORTED: "bg-fg-subtle",
};

function formatMoney(cents: number | null): string {
  return cents === null ? "—" : `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}

export default async function ApplicationsPage() {
  // Re-evaluate on every view: rounds, decisions, and the list itself all change
  // what conflicts exist, and a stale compliance warning is worse than none.
  await refreshRuleFindings(LOCAL_USER_ID);
  const [applications, findings] = await Promise.all([
    listApplications(LOCAL_USER_ID),
    getActiveFindings(LOCAL_USER_ID),
  ]);

  const grouped = TIER_ORDER.map((tier) => ({
    tier,
    items: applications.filter((a) => (a.tier ?? "UNSORTED") === tier),
  })).filter((group) => group.items.length > 0);

  const counts = {
    reach: applications.filter((a) => a.tier === "REACH").length,
    target: applications.filter((a) => a.tier === "TARGET").length,
    likely: applications.filter((a) => a.tier === "LIKELY").length,
  };

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          My list
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          {applications.length === 0
            ? "Nothing here yet."
            : `${applications.length} schools · ${counts.reach} reach · ${counts.target} target · ${counts.likely} likely`}
        </p>
      </header>

      <RuleFindings findings={findings} />

      {applications.length === 0 ? (
        <div className="border-border rounded-[14px] border border-dashed py-16 text-center">
          <p className="text-fg text-[15px] font-medium">Your list is empty.</p>
          <p className="text-fg-muted mt-1 text-[13.5px]">
            Add a school and its deadlines, essays, and requirements come with it.
          </p>
          <Link
            href="/colleges"
            className="bg-accent text-accent-fg hover:bg-accent-hover mt-4 inline-flex h-9 items-center rounded-[10px] px-4 text-[13.5px] font-medium transition-colors duration-100"
          >
            Browse colleges
          </Link>
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map(({ tier, items }) => (
            <section key={tier}>
              <h2 className="text-fg-subtle mb-2.5 flex items-center gap-2 text-[11px] font-semibold tracking-[0.06em] uppercase">
                <span className={cn("size-2 rounded-full", TIER_DOT[tier])} />
                {TIER_LABELS[tier]}
                <span className="tabular-nums">{items.length}</span>
              </h2>
              <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
                {items.map((application) => (
                  <li key={application.id}>
                    <Link
                      href={`/applications/${application.id}`}
                      className="hover:bg-surface-raised flex items-center justify-between gap-4 px-4 py-3 transition-colors duration-100"
                    >
                      <div className="min-w-0">
                        <p className="text-fg truncate text-[14px] font-medium">
                          {application.college.name}
                        </p>
                        <p className="text-fg-muted truncate text-[12.5px]">
                          {[application.college.city, application.college.state]
                            .filter(Boolean)
                            .join(", ")}
                        </p>
                      </div>
                      <div className="flex shrink-0 items-center gap-4">
                        <span className="text-fg-muted font-mono text-[12.5px] tabular-nums">
                          {formatMoney(application.college.costOfAttendanceCents)}
                        </span>
                        <span className="border-border text-fg-muted rounded-full border px-2 py-0.5 text-[11px]">
                          {roundLabel(application.round)}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
