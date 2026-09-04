/**
 * Generic fixed-cost option/add-on infrastructure for the FIXED_PRICE
 * pricing strategy — a flat per-unit cost x quantity. Backed by the
 * FixedPriceOption catalog (prisma/schema.prisma), which has no rows
 * until BT Home Designs supplies verified costs; see costBreakdown.ts for
 * how an unconfigured option is treated (never $0, never guessed).
 */
export interface FixedPriceInput {
  unitCostCents: number;
  quantity: number;
}

export type FixedPriceStatus = "OK" | "INVALID_QUANTITY" | "INVALID_UNIT_COST";

export interface FixedPriceResult {
  status: FixedPriceStatus;
  totalCents: number | null;
}

export function calculateFixedPriceCost(input: FixedPriceInput): FixedPriceResult {
  if (!Number.isInteger(input.quantity) || input.quantity < 1) {
    return { status: "INVALID_QUANTITY", totalCents: null };
  }
  if (!Number.isFinite(input.unitCostCents) || input.unitCostCents < 0) {
    return { status: "INVALID_UNIT_COST", totalCents: null };
  }
  return { status: "OK", totalCents: input.unitCostCents * input.quantity };
}
