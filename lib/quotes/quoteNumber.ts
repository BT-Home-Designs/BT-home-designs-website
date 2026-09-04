import type { PrismaClient } from "@prisma/client";

/**
 * Generates the next quote number for the current year, e.g. "Q-2026-0001".
 * Purely a starting value — quoteNumber is editable afterward by an
 * authorized internal user (see prisma/schema.prisma comment on
 * Quote.quoteNumber) and nothing else in the schema references it, so
 * renaming one later never breaks a relationship.
 *
 * Retries on a unique-constraint collision (e.g. concurrent creation)
 * rather than assuming the count-based guess is always free.
 */
export async function generateQuoteNumber(prisma: PrismaClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `Q-${year}-`;

  const countThisYear = await prisma.quote.count({
    where: { quoteNumber: { startsWith: prefix } },
  });

  let attempt = countThisYear + 1;
  for (let tries = 0; tries < 25; tries++) {
    const candidate = `${prefix}${String(attempt).padStart(4, "0")}`;
    const existing = await prisma.quote.findUnique({ where: { quoteNumber: candidate } });
    if (!existing) return candidate;
    attempt++;
  }

  throw new Error("Could not generate a unique quote number after 25 attempts.");
}
