/**
 * Product types the verified matrix pricing engine (Phase 3) can price.
 * Zero server/Prisma dependency so both server code (lib/quotes/pricing.ts)
 * and client UI (line item forms, so they can show "MANUAL PRICING
 * REQUIRED" immediately without a round trip) can import it.
 */
export const MATRIX_SUPPORTED_PRODUCT_TYPES = ["ROLLER_SHADE", "NEOLUX"] as const;

export function isMatrixSupportedProductType(productType: string | null | undefined): boolean {
  if (!productType) return false;
  return (MATRIX_SUPPORTED_PRODUCT_TYPES as readonly string[]).includes(productType);
}
