import { prisma } from "@/lib/db/prisma";
import type { QuoteLineItem, PricingSnapshot, SquareFootPriceSnapshot, CashCreditPriceSnapshot } from "@prisma/client";
import { calculateCashCreditPrice } from "@/lib/pricing/cashCredit/engine";
import { getKnownAddOnCostsCents } from "./fixedPriceOptions";

type LineItemForCostBasis = QuoteLineItem & {
  currentPricingSnapshot: PricingSnapshot | null;
  currentSquareFootSnapshot: SquareFootPriceSnapshot | null;
};

/**
 * The base Cost of Goods, before accessories — from whichever pricing
 * engine actually applies to this line item's product, never vendor
 * retail and never invented when neither engine has produced a result:
 *  - Roller Shade / Neolux: the matrix engine's dealer cost (only when
 *    the current PricingSnapshot is SUCCESS).
 *  - Plantation Shutter: the square-foot engine's COGS total — width x
 *    height / 144 x $17.25, plus arch/cutout charges (see
 *    lib/quotes/shutterPricing.ts) — only when the current
 *    SquareFootPriceSnapshot is SUCCESS. Per docs/business-rules.md this
 *    rate is an internal cost input, not a customer price.
 */
function resolveBaseCostOfGoodsCents(lineItem: LineItemForCostBasis): number | null {
  if (lineItem.currentPricingSnapshot?.pricingStatus === "SUCCESS") {
    return lineItem.currentPricingSnapshot.dealerCostCents;
  }
  if (lineItem.currentSquareFootSnapshot?.status === "SUCCESS") {
    return lineItem.currentSquareFootSnapshot.totalCents;
  }
  return null;
}

/**
 * Cost of Goods = the base cost above plus any requested accessory
 * (motorization/remote/hub/solar charger) cost from the FixedPriceOption
 * catalog — per docs/business-rules.md, these are internal cost-of-goods
 * inputs, never a customer-facing price by themselves. Null (unknown)
 * whenever the base cost is unavailable or any requested accessory isn't
 * ACTIVE-priced — a missing component makes the whole cost basis unknown,
 * never partially summed.
 */
function resolveCostOfGoodsCents(lineItem: LineItemForCostBasis, knownCosts: ReadonlyMap<string, number>): number | null {
  const baseCostOfGoodsCents = resolveBaseCostOfGoodsCents(lineItem);
  if (baseCostOfGoodsCents === null) return null;

  const accessoryNames = [lineItem.motorization, lineItem.remote, lineItem.hub, lineItem.solarCharger].filter((v): v is string => v !== null);

  let accessoryCents = 0;
  for (const name of accessoryNames) {
    const cost = knownCosts.get(name);
    if (cost === undefined) return null;
    accessoryCents += cost;
  }

  return baseCostOfGoodsCents + accessoryCents;
}

/**
 * Labor = 0 when installation isn't requested at all — a known value, not
 * "unknown". When requested: Base Installation, plus the Motorized/
 * Cordless add-on when those apply, all from the FixedPriceOption catalog.
 * Null whenever any of those isn't ACTIVE-priced.
 */
function resolveLaborCents(lineItem: LineItemForCostBasis, knownCosts: ReadonlyMap<string, number>): number | null {
  if (!lineItem.installation) return 0;

  const names = ["Base Installation"];
  if (lineItem.motorization) names.push("Motorized Installation Add-On");
  if (lineItem.controlType?.toLowerCase().includes("cordless")) names.push("Cordless Installation Add-On");

  let total = 0;
  for (const name of names) {
    const cost = knownCosts.get(name);
    if (cost === undefined) return null;
    total += cost;
  }
  return total;
}

export interface CashCreditAttemptResult {
  snapshot: CashCreditPriceSnapshot;
}

/**
 * Computes (or reuses) this line item's current CASH_CREDIT_FORMULA
 * snapshot. Never touches QuoteLineItem.sellingPrice* fields — the caller
 * (applyAutomaticSellingPrice in sellingPrice.ts) decides what to do with
 * the result, since this formula is only one of several automatic paths.
 *
 * Reuses the existing snapshot (no new row) when the cost basis and
 * config rate haven't changed since the pointer's snapshot was made —
 * same rationale as repriceLineItemIfNeeded / repriceShutterLineItemIfNeeded.
 * The CashCreditPricingConfig rate is frozen onto every snapshot, so
 * editing it later never changes a quote that already has one.
 */
export async function attemptCashCreditFormula(lineItemId: string): Promise<CashCreditAttemptResult> {
  const [lineItem, knownCosts, config] = await Promise.all([
    prisma.quoteLineItem.findUniqueOrThrow({
      where: { id: lineItemId },
      include: { currentPricingSnapshot: true, currentSquareFootSnapshot: true, currentCashCreditSnapshot: true },
    }),
    getKnownAddOnCostsCents(),
    prisma.cashCreditPricingConfig.findFirst({ where: { status: "ACTIVE" } }),
  ]);

  const costOfGoodsCents = resolveCostOfGoodsCents(lineItem, knownCosts);
  const laborCents = resolveLaborCents(lineItem, knownCosts);

  const result = config
    ? calculateCashCreditPrice({ costOfGoodsCents, laborCents, markupBps: config.markupBps, cardFeeBps: config.cardFeeBps })
    : calculateCashCreditPrice({ costOfGoodsCents: null, laborCents: null, markupBps: 0, cardFeeBps: 0 });
  // (No ACTIVE config: force NOT_CONFIGURED via null inputs — never invent a rate.)

  const current = lineItem.currentCashCreditSnapshot;
  const unchanged =
    current !== null &&
    current.status === result.status &&
    current.costOfGoodsCents === result.costOfGoodsCents &&
    current.laborCents === result.laborCents &&
    current.appliedMarkupBps === result.appliedMarkupBps &&
    current.appliedCardFeeBps === result.appliedCardFeeBps;

  if (unchanged) {
    return { snapshot: current };
  }

  const snapshot = await prisma.cashCreditPriceSnapshot.create({
    data: {
      quoteLineItemId: lineItemId,
      status: result.status,
      costOfGoodsCents: result.costOfGoodsCents,
      laborCents: result.laborCents,
      totalInternalCostCents: result.totalInternalCostCents,
      appliedMarkupBps: result.appliedMarkupBps,
      markupAmountCents: result.markupAmountCents,
      cashPriceCents: result.cashPriceCents,
      appliedCardFeeBps: result.appliedCardFeeBps,
      creditCardFeeCents: result.creditCardFeeCents,
      creditCardPriceCents: result.creditCardPriceCents,
    },
  });

  await prisma.quoteLineItem.update({ where: { id: lineItemId }, data: { currentCashCreditSnapshotId: snapshot.id } });

  return { snapshot };
}
