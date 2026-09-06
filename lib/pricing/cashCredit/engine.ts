/**
 * The general approved BT Home Designs cash/credit-card customer pricing
 * formula (see docs/business-rules.md):
 *
 *   Total Internal Cost = Cost of Goods + Labor
 *   Cash Price           = Total Internal Cost x (1 + markupBps/10000)
 *   Credit Card Fee      = Cash Price x cardFeeBps/10000
 *   Credit Card Price    = Cash Price + Credit Card Fee
 *
 * Fail-closed: either Cost of Goods or Labor being unknown (null) makes
 * the whole result NOT_CONFIGURED — never a $0 substitute for a missing
 * component, never a partial price.
 */
export interface CashCreditPriceInput {
  /** Null = unknown/not yet priced. */
  costOfGoodsCents: number | null;
  /** Null = unknown/not yet priced. A job with no installation requested is 0, not null. */
  laborCents: number | null;
  /** Basis points, e.g. 7500 = 75%. */
  markupBps: number;
  /** Basis points, e.g. 600 = 6%. */
  cardFeeBps: number;
}

export type CashCreditPricingStatus = "SUCCESS" | "NOT_CONFIGURED";

export interface CashCreditPriceResult {
  status: CashCreditPricingStatus;
  costOfGoodsCents: number | null;
  laborCents: number | null;
  totalInternalCostCents: number | null;
  appliedMarkupBps: number | null;
  markupAmountCents: number | null;
  cashPriceCents: number | null;
  appliedCardFeeBps: number | null;
  creditCardFeeCents: number | null;
  creditCardPriceCents: number | null;
}

function notConfigured(input: CashCreditPriceInput): CashCreditPriceResult {
  return {
    status: "NOT_CONFIGURED",
    costOfGoodsCents: input.costOfGoodsCents,
    laborCents: input.laborCents,
    totalInternalCostCents: null,
    appliedMarkupBps: null,
    markupAmountCents: null,
    cashPriceCents: null,
    appliedCardFeeBps: null,
    creditCardFeeCents: null,
    creditCardPriceCents: null,
  };
}

export function calculateCashCreditPrice(input: CashCreditPriceInput): CashCreditPriceResult {
  if (input.costOfGoodsCents === null || input.laborCents === null) {
    return notConfigured(input);
  }
  if (!Number.isInteger(input.markupBps) || input.markupBps < 0 || !Number.isInteger(input.cardFeeBps) || input.cardFeeBps < 0) {
    return notConfigured(input);
  }

  const totalInternalCostCents = input.costOfGoodsCents + input.laborCents;

  // Single rounding for cashPriceCents (cost x (10000+markup)/10000), then
  // derive markupAmountCents by subtraction — guarantees
  // costOfGoods + labor + markupAmount === cashPrice exactly, with no
  // separate rounding of the markup amount that could drift by a cent.
  const cashPriceCents = Math.round((totalInternalCostCents * (10000 + input.markupBps)) / 10000);
  const markupAmountCents = cashPriceCents - totalInternalCostCents;

  const creditCardFeeCents = Math.round((cashPriceCents * input.cardFeeBps) / 10000);
  const creditCardPriceCents = cashPriceCents + creditCardFeeCents;

  return {
    status: "SUCCESS",
    costOfGoodsCents: input.costOfGoodsCents,
    laborCents: input.laborCents,
    totalInternalCostCents,
    appliedMarkupBps: input.markupBps,
    markupAmountCents,
    cashPriceCents,
    appliedCardFeeBps: input.cardFeeBps,
    creditCardFeeCents,
    creditCardPriceCents,
  };
}
