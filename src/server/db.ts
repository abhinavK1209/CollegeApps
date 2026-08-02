import { PrismaClient } from "@prisma/client";

/**
 * Next.js dev-mode hot reload re-evaluates modules, which would otherwise spawn a
 * new pooled client on every reload and exhaust connections. Cache it on globalThis.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
