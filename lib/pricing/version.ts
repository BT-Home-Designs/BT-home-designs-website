/**
 * Identifies which build of the pricing engine produced a given
 * PricingSnapshot. Bump this whenever matrices.ts, fabricCatalog.ts, or the
 * lookup/rounding logic in engine.ts changes, so a historical quote can be
 * distinguished ("priced under an older engine version") from one repriced
 * under the current rules — never bump it for unrelated changes.
 */
export const MATRIX_PRICING_ENGINE_VERSION = "roller-neolux-matrix-v1.0.0";
