export interface ProfitabilityInput {
  /** Null when the line item's selling price is NOT_CONFIGURED. */
  sellingPriceCents: number | null;
  /** Null when internal cost isn't fully known (e.g. an unconfigured add-on — see costBreakdown.ts). */
  totalInternalCostCents: number | null;
}

export interface ProfitabilityResult {
  grossProfitCents: number | null;
  /** Basis points, e.g. 2500 = 25.00%. */
  grossMarginBps: number | null;
}

/**
 * Gross Profit = Customer Selling Price - Total Internal Cost.
 * Gross Margin % = Gross Profit / Customer Selling Price.
 *
 * Both are null (not zero, not a guess) whenever either input is
 * unavailable — an internal-only calculation, never shown when selling
 * price is NOT_CONFIGURED. A $0 selling price is handled explicitly
 * (margin is undefined, not a division-by-zero crash or Infinity).
 */
export function calculateLineItemProfitability(input: ProfitabilityInput): ProfitabilityResult {
  if (input.sellingPriceCents === null || input.totalInternalCostCents === null) {
    return { grossProfitCents: null, grossMarginBps: null };
  }

  const grossProfitCents = input.sellingPriceCents - input.totalInternalCostCents;
  const grossMarginBps = input.sellingPriceCents === 0 ? null : Math.round((grossProfitCents * 10000) / input.sellingPriceCents);

  return { grossProfitCents, grossMarginBps };
}
