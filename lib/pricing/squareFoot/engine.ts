/**
 * Generic square-foot cost calculation infrastructure for the SQUARE_FOOT
 * pricing strategy. Deliberately NOT attached to any product — no
 * Product.defaultPricingStrategyType references it and no rate data
 * exists anywhere in the seed. Do not wire this to a real product until
 * BT Home Designs supplies that product's verified rate/rules.
 */
export interface SquareFootPriceInput {
  widthInches: number;
  heightInches: number;
  ratePerSquareFootCents: number;
}

export type SquareFootPriceStatus = "OK" | "INVALID_DIMENSIONS" | "INVALID_RATE";

export interface SquareFootPriceResult {
  status: SquareFootPriceStatus;
  squareFeet: number | null;
  costCents: number | null;
}

function isValidDimension(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function calculateSquareFootCost(input: SquareFootPriceInput): SquareFootPriceResult {
  if (!isValidDimension(input.widthInches) || !isValidDimension(input.heightInches)) {
    return { status: "INVALID_DIMENSIONS", squareFeet: null, costCents: null };
  }
  if (!Number.isFinite(input.ratePerSquareFootCents) || input.ratePerSquareFootCents < 0) {
    return { status: "INVALID_RATE", squareFeet: null, costCents: null };
  }

  const squareFeet = (input.widthInches * input.heightInches) / 144;
  const costCents = Math.round(squareFeet * input.ratePerSquareFootCents);

  return { status: "OK", squareFeet, costCents };
}
