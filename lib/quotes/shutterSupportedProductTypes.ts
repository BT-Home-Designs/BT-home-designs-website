/**
 * Product types the square-foot shutter pricing engine (Phase 6) can price
 * — see lib/quotes/shutterPricing.ts. Zero server/Prisma dependency, same
 * reasoning as matrixSupportedProductTypes.ts: both server code and client
 * UI need this without a round trip.
 */
export const SHUTTER_SUPPORTED_PRODUCT_TYPES = ["PLANTATION_SHUTTER"] as const;

export function isShutterSupportedProductType(productType: string | null | undefined): boolean {
  if (!productType) return false;
  return (SHUTTER_SUPPORTED_PRODUCT_TYPES as readonly string[]).includes(productType);
}
