import type { Metadata } from "next";
import { LOCAL_USER_ID } from "@/lib/constants";
import { db } from "@/server/db";
import { ProfileForm } from "@/features/profile/components/profile-form";

// Reads user data from the database, so it must never be prerendered at build
// time. Once auth lands, the session lookup makes this implicit.
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const [profile, scores] = await Promise.all([
    db.studentProfile.findUnique({ where: { userId: LOCAL_USER_ID } }),
    db.testScore.findMany({
      where: { userId: LOCAL_USER_ID, type: { in: ["SAT", "ACT"] } },
      select: { type: true, score: true },
    }),
  ]);

  const sat = scores.find((s) => s.type === "SAT")?.score ?? null;
  const act = scores.find((s) => s.type === "ACT")?.score ?? null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <header className="mb-6">
        <h1 className="text-fg text-[28px] leading-[34px] font-semibold tracking-[-0.02em]">
          Profile
        </h1>
        <p className="text-fg-muted mt-1.5 text-[15px]">
          Your scores drive the reach / target / likely suggestions on every college.
        </p>
      </header>

      <ProfileForm
        defaults={{
          graduationYear: profile?.graduationYear ?? new Date().getFullYear() + 1,
          highSchoolName: profile?.highSchoolName ?? "",
          gpaUnweighted: profile?.gpaUnweighted?.toString() ?? "",
          gpaWeighted: profile?.gpaWeighted?.toString() ?? "",
          residencyState: profile?.residencyState ?? "",
          intendedMajors: profile?.intendedMajors.join(", ") ?? "",
          needsFinancialAid: profile?.needsFinancialAid ?? true,
          parentsSeparated: profile?.parentsSeparated ?? false,
          isFirstGeneration: profile?.isFirstGeneration ?? false,
          satTotal: sat?.toString() ?? "",
          actComposite: act?.toString() ?? "",
        }}
      />
    </div>
  );
}
