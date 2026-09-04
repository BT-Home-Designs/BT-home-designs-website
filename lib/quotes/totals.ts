import type { DiscountType, DepositType } from "@prisma/client";

/**
 * Quote-level customer totals — computed ONLY from configured customer
 * selling prices (see lib/quotes/sellingPrice.ts), never from dealer
 * cost. Internal cost/profit totals are a separate, internal-only
 * summary (see lib/pricing/profitability.ts applied per line item) and
 * never feed into these numbers.
 *
 * All money is integer cents; discountType/depositType interpret
 * discountValue/depositValue as basis points when PERCENTAGE or cents
 * when FIXED_AMOUNT (matching Quote.discountValue/depositValue in
 * prisma/schema.prisma). Every intermediate result is rounded to the
 * nearest cent (half-up) at the single point it's computed — no chained
 * floating-point money math.
 */
export interface QuoteTotalsInput {
  /** Selling price (cents) of each line item that currently HAS a configured selling price. */
  lineItemSellingPricesCents: readonly number[];
  discountType: DiscountType | null;
  discountValue: number | null;
  /** Basis points, e.g. 825 = 8.25%. */
  taxRateBps: number;
  depositType: DepositType | null;
  depositValue: number | null;
  depositPaidCents: number;
}

export interface QuoteTotalsResult {
  subtotalCents: number;
  discountCents: number;
  taxableSubtotalCents: number;
  taxCents: number;
  grandTotalCents: number;
  /** Based on the grand total (post-discount, post-tax). */
  depositRequiredCents: number;
  depositPaidCents: number;
  remainingBalanceCents: number;
}

export function calculateQuoteTotals(input: QuoteTotalsInput): QuoteTotalsResult {
  const subtotalCents = input.lineItemSellingPricesCents.reduce((sum, cents) => sum + cents, 0);

  let discountCents = 0;
  if (input.discountType === "PERCENTAGE" && input.discountValue !== null) {
    discountCents = Math.round((subtotalCents * input.discountValue) / 10000);
  } else if (input.discountType === "FIXED_AMOUNT" && input.discountValue !== null) {
    discountCents = input.discountValue;
  }
  // A discount never makes the taxable subtotal negative.
  discountCents = Math.min(Math.max(discountCents, 0), subtotalCents);

  const taxableSubtotalCents = subtotalCents - discountCents;
  const taxCents = Math.round((taxableSubtotalCents * input.taxRateBps) / 10000);
  const grandTotalCents = taxableSubtotalCents + taxCents;

  let depositRequiredCents = 0;
  if (input.depositType === "PERCENTAGE" && input.depositValue !== null) {
    depositRequiredCents = Math.round((grandTotalCents * input.depositValue) / 10000);
  } else if (input.depositType === "FIXED_AMOUNT" && input.depositValue !== null) {
    depositRequiredCents = input.depositValue;
  }

  const remainingBalanceCents = grandTotalCents - input.depositPaidCents;

  return {
    subtotalCents,
    discountCents,
    taxableSubtotalCents,
    taxCents,
    grandTotalCents,
    depositRequiredCents,
    depositPaidCents: input.depositPaidCents,
    remainingBalanceCents,
  };
}
