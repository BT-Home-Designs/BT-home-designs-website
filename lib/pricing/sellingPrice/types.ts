/**
 * SQUARE_FOOT_FORMULA is a valid QuoteLineItem.sellingPriceMethod (see
 * prisma/schema.prisma) but is never a real SellingPriceRule row — it's
 * computed directly by lib/quotes/shutterPricing.ts, not by
 * applySellingPriceRule below. Included here only so that type flows
 * through cleanly; engine.ts rejects it the same way it rejects MANUAL.
 */
export type SellingPriceRuleType = "MULTIPLIER" | "MARKUP_PERCENT" | "TARGET_MARGIN" | "FIXED_AMOUNT" | "MANUAL" | "SQUARE_FOOT_FORMULA";

/**
 * The 4 automatic rule shapes (mirrors the Prisma SellingPriceRule model).
 * Exactly the field(s) relevant to `ruleType` should be set — see
 * engine.ts for what happens when a required value is missing.
 */
export interface SellingPriceRuleConfig {
  ruleType: SellingPriceRuleType;
  /** MULTIPLIER: sellingPrice = cost x (multiplierBps / 10000). E.g. 15000 = 1.5x. */
  multiplierBps?: number | null;
  /** MARKUP_PERCENT: sellingPrice = cost x (1 + markupPercentBps / 10000). E.g. 2500 = 25% markup. */
  markupPercentBps?: number | null;
  /** TARGET_MARGIN: sellingPrice = cost / (1 - targetMarginBps / 10000). E.g. 2000 = 20% margin. Must be < 10000. */
  targetMarginBps?: number | null;
  /** FIXED_AMOUNT: sellingPrice = fixedAmountCents, regardless of cost. */
  fixedAmountCents?: number | null;
}

export type SellingPriceCalculationStatus = "OK" | "CONFIGURATION_ERROR";

export interface SellingPriceCalculation {
  status: SellingPriceCalculationStatus;
  /** Integer cents, rounded half-up to the nearest cent. Null when status is CONFIGURATION_ERROR. */
  sellingPriceCents: number | null;
  /** Present when status is CONFIGURATION_ERROR, explaining why. */
  message: string | null;
}
