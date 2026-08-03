import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { computeNetPrice, formatCents } from "@/features/financial-aid/utils/net-price";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Financial aid" };

export default async function FinancialAidPage() {
  const [aidProfile, profile, requirements, awards] = await Promise.all([
    db.financialAidProfile.findUnique({ where: { userId: LOCAL_USER_ID } }),
    db.studentProfile.findUnique({ where: { userId: LOCAL_USER_ID } }),
    db.requirement.findMany({
      where: {
        application: { userId: LOCAL_USER_ID },
        type: { in: ["FAFSA", "CSS_PROFILE", "IDOC", "NONCUSTODIAL_PROFILE"] },
      },
      include: { application: { include: { college: { select: { name: true } } } } },
    }),
    db.aidAward.findMany({
      where: { application: { userId: LOCAL_USER_ID } },
      include: { application: { include: { college: { select: { name: true } } } } },
    }),
  ]);

  const grouped = new Map<string, typeof requirements>();
  for (const requirement of requirements) {
    const key = requirement.application.college.name;
    grouped.set(key, [...(grouped.get(key) ?? []), requirement]);
  }

  const comparison = awards
    .map((award) => ({
      name: award.application.college.name,
      ...computeNetPrice(award),
    }))
    .sort((a, b) => a.netPriceCents - b.netPriceCents);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Financial aid
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          The second application nobody warns you about.
        </p>
      </header>

      {profile?.parentsSeparated && aidProfile?.noncustodialRequired && (
        <div className="border-info/30 bg-info-subtle mb-6 rounded-[14px] border p-4">
          <p className="text-fg text-[13.5px] font-medium">
            You&rsquo;ll need a second CSS Profile.
          </p>
          <p className="text-fg-muted mt-1 text-[13px]">
            Because your parents are separated, most CSS Profile schools require a
            Noncustodial Profile — and the noncustodial parent has to create{" "}
            <em>their own</em> College Board account to file it. It is a common reason aid
            packages stall in January.
          </p>
        </div>
      )}

      {grouped.size === 0 ? (
        <div className="border-border rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">No aid requirements yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13.5px]">
            Add schools to your list with financial aid turned on in your profile, and
            FAFSA, CSS Profile, and IDOC requirements appear per school.
          </p>
        </div>
      ) : (
        <section className="mb-8">
          <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
            Forms by school
          </h2>
          <div className="space-y-4">
            {[...grouped.entries()].map(([college, items]) => (
              <div key={college}>
                <p className="text-fg mb-1.5 text-[13.5px] font-medium">{college}</p>
                <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center justify-between gap-4 px-4 py-2.5"
                    >
                      <span className="text-fg text-[13px]">{item.label}</span>
                      <span className="text-fg-subtle text-[11.5px]">
                        {item.status.toLowerCase().replace(/_/g, " ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-fg-subtle mb-2.5 text-[11px] font-semibold tracking-[0.06em] uppercase">
          Compare offers
        </h2>
        {comparison.length === 0 ? (
          <div className="border-border rounded-[14px] border border-dashed py-12 text-center">
            <p className="text-fg text-[14px] font-medium">No award letters yet.</p>
            <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13px]">
              When offers arrive in March and April, they&rsquo;ll be normalised here —
              net price computed from cost of attendance minus gift aid, with loans and
              work-study shown separately rather than folded in.
            </p>
          </div>
        ) : (
          <div className="border-border bg-surface overflow-x-auto rounded-[14px] border">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-border text-fg-subtle border-b text-left">
                  <th className="px-4 py-2.5 font-medium">School</th>
                  <th className="px-4 py-2.5 text-right font-medium">Gift aid</th>
                  <th className="px-4 py-2.5 text-right font-medium">Net price</th>
                  <th className="px-4 py-2.5 text-right font-medium">4 years</th>
                  <th className="px-4 py-2.5 text-right font-medium">Loans</th>
                </tr>
              </thead>
              <tbody className="divide-border divide-y">
                {comparison.map((row) => (
                  <tr key={row.name}>
                    <td className="text-fg px-4 py-2.5">{row.name}</td>
                    <td className="text-fg-muted px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCents(row.giftAidCents)}
                    </td>
                    <td className="text-fg px-4 py-2.5 text-right font-mono font-semibold tabular-nums">
                      {formatCents(row.netPriceCents)}
                    </td>
                    <td className="text-fg-muted px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCents(row.fourYearCents)}
                    </td>
                    <td className="text-fg-subtle px-4 py-2.5 text-right font-mono tabular-nums">
                      {formatCents(row.loansOfferedCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <p className="text-fg-subtle mt-2 text-[12px]">
          Loans and work-study are never subtracted from net price. They are debt and
          wages, not discounts — award letters frequently present them as if they reduce
          what you owe.
        </p>
      </section>
    </div>
  );
}
