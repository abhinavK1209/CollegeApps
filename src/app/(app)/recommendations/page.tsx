import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { listRecommenders } from "@/server/services/recommendation.service";
import { AddRecommenderForm } from "@/features/recommendations/components/add-recommender-form";
import { FerpaButton } from "@/features/recommendations/components/ferpa-button";
import { RecStatusButton } from "@/features/recommendations/components/rec-pipeline";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Recommendations" };

export default async function RecommendationsPage() {
  const [recommenders, profile] = await Promise.all([
    listRecommenders(LOCAL_USER_ID),
    db.studentProfile.findUnique({ where: { userId: LOCAL_USER_ID } }),
  ]);

  const ferpaSigned = profile?.ferpaWaiverSignedAt != null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Recommendations
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Asking is not the same as submitted. Each letter moves through its own pipeline,
          per school.
        </p>
      </header>

      {!ferpaSigned && (
        <div className="border-warning/30 bg-warning-subtle mb-6 rounded-[14px] border p-4">
          <p className="text-fg text-[13.5px] font-medium">
            Sign the FERPA waiver before inviting anyone.
          </p>
          <p className="text-fg-muted mt-1 text-[13px]">
            On the Common App you cannot invite recommenders until it&rsquo;s signed — it
            gates the entire pipeline. Sign it in the Common App under Recommenders and
            FERPA, then record it here.
          </p>
          <FerpaButton />
        </div>
      )}

      <AddRecommenderForm />

      {recommenders.length === 0 ? (
        <div className="border-border mt-6 rounded-[14px] border border-dashed py-14 text-center">
          <p className="text-fg text-[15px] font-medium">No recommenders yet.</p>
          <p className="text-fg-muted mx-auto mt-1 max-w-md text-[13.5px]">
            Ask in spring of junior year or early senior fall — teachers cap how many
            letters they write, and the good ones fill up first.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-5">
          {recommenders.map((recommender) => {
            const confirmed = recommender.recommendations.filter(
              (r) => r.status === "CONFIRMED_RECEIVED",
            ).length;
            return (
              <section key={recommender.id}>
                <h2 className="text-fg mb-2 flex items-baseline gap-2 text-[14px] font-semibold">
                  {recommender.name}
                  <span className="text-fg-subtle text-[12px] font-normal">
                    {recommender.subject ?? recommender.role.toLowerCase()} · {confirmed}/
                    {recommender.recommendations.length} confirmed
                  </span>
                </h2>
                {recommender.recommendations.length === 0 ? (
                  <p className="text-fg-subtle text-[13px]">
                    Not assigned to any school yet — add colleges to your list first.
                  </p>
                ) : (
                  <ul className="border-border divide-border bg-surface divide-y overflow-hidden rounded-[14px] border">
                    {recommender.recommendations.map((recommendation) => (
                      <li
                        key={recommendation.id}
                        className="flex items-center justify-between gap-4 px-4 py-2.5"
                      >
                        <span className="text-fg truncate text-[13.5px]">
                          {recommendation.application.college.name}
                        </span>
                        <RecStatusButton
                          recommendationId={recommendation.id}
                          status={recommendation.status}
                          blocked={!ferpaSigned && recommendation.status === "AGREED"}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
