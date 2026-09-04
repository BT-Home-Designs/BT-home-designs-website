import { PrismaClient } from "@prisma/client";

// Standard Next.js singleton pattern: in dev, hot-reloading re-executes this
// module on every edit, which would otherwise open a new PrismaClient (and a
// new DB connection pool) each time. Stashing the instance on `globalThis`
// survives the reload. In production each serverless invocation gets a
// fresh module scope, so the global is a no-op there.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
