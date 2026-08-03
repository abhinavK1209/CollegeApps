import type { RecommendationStatus, RecommenderRole } from "@prisma/client";
import { db } from "@/server/db";
import { CURRENT_CYCLE_YEAR } from "@/lib/constants";

/** The pipeline students conflate: "I asked" is three states away from done. */
export const REC_PIPELINE: RecommendationStatus[] = [
  "NOT_ASKED",
  "ASKED",
  "AGREED",
  "INVITED",
  "SUBMITTED",
  "CONFIRMED_RECEIVED",
];

export async function listRecommenders(userId: string) {
  return db.recommender.findMany({
    where: { userId },
    include: {
      recommendations: {
        include: { application: { include: { college: { select: { name: true } } } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function addRecommender(
  userId: string,
  input: { name: string; email?: string; role: RecommenderRole; subject?: string },
) {
  const recommender = await db.recommender.create({
    data: {
      userId,
      name: input.name,
      email: input.email || null,
      role: input.role,
      subject: input.subject || null,
    },
  });

  // A recommender is only useful once attached to applications, so wire them to
  // every school that needs a letter — the UC application needs none.
  const applications = await db.application.findMany({
    where: { userId, cycleYear: CURRENT_CYCLE_YEAR, archivedAt: null },
    include: { college: { select: { platforms: true } } },
  });

  const eligible = applications.filter((a) => !a.college.platforms.includes("UC"));

  if (eligible.length > 0) {
    await db.recommendation.createMany({
      data: eligible.map((application) => ({
        recommenderId: recommender.id,
        applicationId: application.id,
      })),
      skipDuplicates: true,
    });
  }

  return recommender;
}

export async function advanceRecommendation(userId: string, recommendationId: string) {
  const recommendation = await db.recommendation.findFirst({
    where: { id: recommendationId, recommender: { userId } },
  });
  if (!recommendation) return null;

  const index = REC_PIPELINE.indexOf(recommendation.status);
  const next = REC_PIPELINE[(index + 1) % REC_PIPELINE.length] ?? "NOT_ASKED";
  const now = new Date();

  return db.recommendation.update({
    where: { id: recommendationId },
    data: {
      status: next,
      askedAt: next === "ASKED" ? now : recommendation.askedAt,
      agreedAt: next === "AGREED" ? now : recommendation.agreedAt,
      invitedAt: next === "INVITED" ? now : recommendation.invitedAt,
      submittedAt: next === "SUBMITTED" ? now : recommendation.submittedAt,
      confirmedReceivedAt:
        next === "CONFIRMED_RECEIVED" ? now : recommendation.confirmedReceivedAt,
    },
  });
}
