import { prisma } from "@/lib/db/prisma";

/**
 * name -> costCents, for every ACTIVE FixedPriceOption. A
 * PENDING_VERIFICATION or INACTIVE option is deliberately excluded — this
 * is what keeps an amount that was only ever "approximate" (e.g. the
 * roller-shade cordless upgrade) from being silently applied to a real
 * quote until it's confirmed and flipped to ACTIVE.
 */
export async function getKnownAddOnCostsCents(): Promise<Map<string, number>> {
  const options = await prisma.fixedPriceOption.findMany({ where: { status: "ACTIVE" } });
  return new Map(options.map((option) => [option.name, option.costCents]));
}

/** All options in a given category, active or not — for populating a UI dropdown with clear status. */
export async function listFixedPriceOptionsByCategory(category: string) {
  return prisma.fixedPriceOption.findMany({ where: { category }, orderBy: { name: "asc" } });
}
