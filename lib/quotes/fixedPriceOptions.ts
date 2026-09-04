import { prisma } from "@/lib/db/prisma";

/** name -> costCents, for every active FixedPriceOption. Empty until real add-on costs are supplied. */
export async function getKnownAddOnCostsCents(): Promise<Map<string, number>> {
  const options = await prisma.fixedPriceOption.findMany({ where: { active: true } });
  return new Map(options.map((option) => [option.name, option.costCents]));
}
