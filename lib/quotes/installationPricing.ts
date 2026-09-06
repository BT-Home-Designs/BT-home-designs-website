import { prisma } from "@/lib/db/prisma";
import { calculateInstallationTripMinimum } from "@/lib/pricing/installation/tripMinimum";
import { calculateCashCreditPrice } from "@/lib/pricing/cashCredit/engine";

export interface QuoteInstallerMinimumResult {
  applies: boolean;
  shadeCount: number;
  minimumChargeCents: number | null;
  /** The $125 minimum's own cash/credit-formula contribution (Cost of Goods = 0, Labor = $125). Null unless `applies`. */
  cashPriceCents: number | null;
  creditCardPriceCents: number | null;
}

/**
 * Quote-level (not per-line-item) installer minimum trip fee — see
 * docs/business-rules.md: for a job under 5 shades, $125 is ADDED to the
 * job's normal calculated labor (never a floor/max, never a replacement),
 * then that $125 flows through the same cash/credit markup formula as
 * every other cost, before being added to the quote's cash/credit totals.
 *
 * "Shades" = total quantity of Roller Shade / Neolux line items in the
 * quote (the product types the per-shade LABOR installation charges apply
 * to). Computed live at read time — this fee has no per-line-item home to
 * snapshot against; it never alters any line item's own frozen Cost of
 * Goods/Labor/Cash/Credit Card snapshot or selling price, and always
 * reads the CURRENT ACTIVE rule/config (so, unlike a line item's own
 * price, this quote-level figure is not itself historically frozen).
 */
export async function calculateQuoteInstallerMinimum(quoteId: string): Promise<QuoteInstallerMinimumResult> {
  const [shadeAggregate, rule, config] = await Promise.all([
    prisma.quoteLineItem.aggregate({
      where: { quoteId, product: { productType: { in: ["ROLLER_SHADE", "NEOLUX"] } } },
      _sum: { quantity: true },
    }),
    prisma.installationTripMinimumRule.findFirst(),
    prisma.cashCreditPricingConfig.findFirst({ where: { status: "ACTIVE" } }),
  ]);

  const shadeCount = shadeAggregate._sum.quantity ?? 0;

  const tripMinimum = calculateInstallationTripMinimum({
    normalLaborCents: 0, // this fee is its own additive line, not blended into any one line item's labor
    shadeCount,
    rule: rule ? { minimumChargeCents: rule.minimumChargeCents, qualifiesUnderShadeCount: rule.qualifiesUnderShadeCount, status: rule.status } : null,
  });

  if (!tripMinimum.applied || !config) {
    return { applies: false, shadeCount, minimumChargeCents: rule?.minimumChargeCents ?? null, cashPriceCents: null, creditCardPriceCents: null };
  }

  const formula = calculateCashCreditPrice({
    costOfGoodsCents: 0,
    laborCents: tripMinimum.totalLaborCents,
    markupBps: config.markupBps,
    cardFeeBps: config.cardFeeBps,
  });

  return {
    applies: formula.status === "SUCCESS",
    shadeCount,
    minimumChargeCents: rule!.minimumChargeCents,
    cashPriceCents: formula.cashPriceCents,
    creditCardPriceCents: formula.creditCardPriceCents,
  };
}
