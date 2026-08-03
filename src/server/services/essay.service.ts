import type { EssayStatus, PromptKind } from "@prisma/client";
import { db } from "@/server/db";
import {
  findForeignCollegeMentions,
  rankReuse,
  readingTimeSeconds,
  wordCount,
  type ReuseSuggestion,
} from "@/features/essays/utils/reuse";

export async function listEssays(userId: string) {
  return db.essay.findMany({
    where: { userId, archivedAt: null },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      assignments: {
        include: { application: { include: { college: { select: { name: true } } } } },
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getEssay(userId: string, essayId: string) {
  return db.essay.findFirst({
    where: { id: essayId, userId },
    include: {
      versions: { orderBy: { versionNumber: "desc" } },
      assignments: {
        include: { application: { include: { college: { select: { name: true } } } } },
      },
    },
  });
}

export async function createEssay(
  userId: string,
  input: {
    title: string;
    promptText?: string;
    wordLimit?: number | null;
    promptKind?: PromptKind;
    topicTags?: string[];
  },
) {
  const essay = await db.essay.create({
    data: {
      userId,
      title: input.title,
      promptText: input.promptText ?? null,
      wordLimit: input.wordLimit ?? null,
      promptKind: input.promptKind ?? "OTHER",
      topicTags: input.topicTags ?? [],
      status: "BRAINSTORM",
    },
  });

  await db.activityEvent.create({
    data: {
      userId,
      entityType: "ESSAY",
      entityId: essay.id,
      action: "CREATED",
      summary: `Started "${essay.title}"`,
    },
  });

  return essay;
}

/**
 * Saves an immutable snapshot. Autosaves within the same five-minute window
 * replace each other so history stays readable; explicit saves always create a
 * new numbered version.
 */
export async function saveVersion(
  userId: string,
  essayId: string,
  content: string,
  options: { isAutosave: boolean; label?: string },
) {
  const essay = await db.essay.findFirst({
    where: { id: essayId, userId },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });
  if (!essay) return null;

  const words = wordCount(content);
  const stats = {
    content,
    wordCount: words,
    charCount: content.length,
    readingTimeSeconds: readingTimeSeconds(words),
  };

  const latest = essay.versions[0];
  const withinAutosaveWindow =
    options.isAutosave &&
    latest?.isAutosave === true &&
    Date.now() - latest.createdAt.getTime() < 5 * 60_000;

  if (withinAutosaveWindow && latest) {
    return db.essayVersion.update({ where: { id: latest.id }, data: stats });
  }

  const version = await db.essayVersion.create({
    data: {
      essayId,
      versionNumber: (latest?.versionNumber ?? 0) + 1,
      isAutosave: options.isAutosave,
      label: options.label ?? null,
      ...stats,
    },
  });

  if (!options.isAutosave) {
    await db.activityEvent.create({
      data: {
        userId,
        entityType: "ESSAY",
        entityId: essayId,
        action: "VERSION_SAVED",
        summary: `Saved version ${version.versionNumber} of "${essay.title}"`,
      },
    });
  }

  return version;
}

export async function setEssayStatus(
  userId: string,
  essayId: string,
  status: EssayStatus,
) {
  const essay = await db.essay.findFirst({ where: { id: essayId, userId } });
  if (!essay) return null;
  return db.essay.update({ where: { id: essayId }, data: { status } });
}

/** Reuse candidates for an essay's prompt, drawn from the student's other work. */
export async function getReuseSuggestions(
  userId: string,
  essayId: string,
): Promise<ReuseSuggestion[]> {
  const essay = await db.essay.findFirst({
    where: { id: essayId, userId },
    select: { promptKind: true, topicTags: true, wordLimit: true },
  });
  if (!essay) return [];

  const others = await db.essay.findMany({
    where: { userId, id: { not: essayId }, archivedAt: null },
    include: { versions: { orderBy: { versionNumber: "desc" }, take: 1 } },
  });

  return rankReuse(
    others.map((other) => ({
      essayId: other.id,
      title: other.title,
      promptKind: other.promptKind,
      topicTags: other.topicTags,
      wordCount: other.versions[0]?.wordCount ?? 0,
      status: other.status,
    })),
    {
      promptKind: essay.promptKind,
      topicTags: essay.topicTags,
      wordMax: essay.wordLimit,
    },
  );
}

export interface PreSubmitCheck {
  overLimitBy: number | null;
  foreignColleges: string[];
  isEmpty: boolean;
}

/** Runs before an essay is marked final — catches the wrong-school-name error. */
export async function preSubmitCheck(
  userId: string,
  essayId: string,
): Promise<PreSubmitCheck | null> {
  const essay = await db.essay.findFirst({
    where: { id: essayId, userId },
    include: {
      versions: { orderBy: { versionNumber: "desc" }, take: 1 },
      assignments: {
        include: { application: { include: { college: { select: { name: true } } } } },
      },
    },
  });
  if (!essay) return null;

  const content = essay.versions[0]?.content ?? "";
  const words = wordCount(content);
  const intended = essay.assignments[0]?.application?.college.name ?? null;

  const colleges = await db.college.findMany({ select: { name: true, aliases: true } });
  const names = colleges.flatMap((c) => [c.name, ...c.aliases]);

  return {
    overLimitBy:
      essay.wordLimit !== null && words > essay.wordLimit
        ? words - essay.wordLimit
        : null,
    foreignColleges: findForeignCollegeMentions(content, names, intended),
    isEmpty: words === 0,
  };
}
