import { db } from "@/server/db";

export interface SearchHit {
  id: string;
  type: "college" | "application" | "essay" | "task" | "scholarship";
  title: string;
  subtitle: string;
  href: string;
}

/**
 * Cross-entity search for the command palette. Deliberately a handful of narrow
 * queries rather than a full-text index — at a single student's data volume it
 * is instant, and it keeps the ranking legible.
 */
export async function search(userId: string, query: string): Promise<SearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const contains = { contains: q, mode: "insensitive" as const };

  const [applications, colleges, essays, tasks, scholarships] = await Promise.all([
    db.application.findMany({
      where: { userId, archivedAt: null, college: { name: contains } },
      include: { college: { select: { name: true, city: true, state: true } } },
      take: 5,
    }),
    db.college.findMany({
      where: { OR: [{ name: contains }, { aliases: { hasSome: [q, q.toUpperCase()] } }] },
      take: 5,
    }),
    db.essay.findMany({
      where: { userId, archivedAt: null, title: contains },
      take: 5,
    }),
    db.task.findMany({
      where: { userId, status: { in: ["TODO", "IN_PROGRESS"] }, title: contains },
      take: 5,
    }),
    db.scholarship.findMany({
      where: { userId, archivedAt: null, name: contains },
      take: 4,
    }),
  ]);

  const listed = new Set(applications.map((a) => a.collegeId));

  return [
    // Schools already on the list rank above the wider directory.
    ...applications.map((application) => ({
      id: application.id,
      type: "application" as const,
      title: application.college.name,
      subtitle: `On your list · ${application.round}`,
      href: `/applications/${application.id}`,
    })),
    ...colleges
      .filter((college) => !listed.has(college.id))
      .map((college) => ({
        id: college.id,
        type: "college" as const,
        title: college.name,
        subtitle: [college.city, college.state].filter(Boolean).join(", "),
        href: `/colleges?q=${encodeURIComponent(college.name)}`,
      })),
    ...essays.map((essay) => ({
      id: essay.id,
      type: "essay" as const,
      title: essay.title,
      subtitle: essay.status.toLowerCase().replace(/_/g, " "),
      href: `/essays/${essay.id}`,
    })),
    ...tasks.map((task) => ({
      id: task.id,
      type: "task" as const,
      title: task.title,
      subtitle: "Task",
      href: "/tasks",
    })),
    ...scholarships.map((scholarship) => ({
      id: scholarship.id,
      type: "scholarship" as const,
      title: scholarship.name,
      subtitle: scholarship.scope.toLowerCase(),
      href: "/scholarships",
    })),
  ];
}
