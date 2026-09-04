/**
 * Pricing strategy architecture (Part 2).
 *
 * A QuoteLineItem is priced by exactly one strategy, named by
 * PricingStrategyType (mirrors the Prisma enum of the same name). Only
 * MATRIX_PRICE has a real implementation as of Phase 3 — see
 * lib/pricing/matrix-engine/engine.ts. The rest are typed placeholders:
 * their business rules have not been supplied, so no calculation logic
 * exists for them yet. Do not invent one.
 *
 * None of this file (or anything under lib/pricing/) may import from React
 * or Next.js UI code — the pricing layer is plain, framework-independent
 * TypeScript so it can be unit tested and reused outside any specific page.
 */

export type PricingStrategyType = "MATRIX_PRICE" | "SQUARE_FOOT" | "FIXED_PRICE" | "MANUAL_PRICE" | "COMPOSITE_PRICE";

/**
 * Not yet implemented — placeholder shape only. A square-foot strategy
 * will need a confirmed per-square-foot rate table before this can be
 * built; do not assume a rate.
 */
export interface SquareFootPriceInput {
  readonly strategyType: "SQUARE_FOOT";
}

/**
 * Not yet implemented — placeholder shape only. A fixed-price strategy
 * (flat per-unit charges: a specific remote, a hub, a trip minimum, etc.)
 * will need a confirmed price list before this can be built.
 */
export interface FixedPriceInput {
  readonly strategyType: "FIXED_PRICE";
}

/**
 * Not yet implemented — placeholder shape only. Represents a staff-entered
 * price with a required reason, for anything the other strategies can't or
 * shouldn't auto-price.
 */
export interface ManualPriceInput {
  readonly strategyType: "MANUAL_PRICE";
}

/**
 * Not yet implemented — placeholder shape only. Will sum multiple
 * strategies for one line item (e.g. MATRIX_PRICE for the shade body +
 * FIXED_PRICE for motorization + FIXED_PRICE for a remote).
 */
export interface CompositePriceInput {
  readonly strategyType: "COMPOSITE_PRICE";
}
