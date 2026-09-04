import type { MatrixPriceResult } from "./types";

/**
 * Fields of a PricingSnapshot row (see prisma/schema.prisma) that a
 * MatrixPriceResult determines. Deliberately excludes `id`, `createdAt`
 * (DB-assigned) and `quoteLineItemId` (supplied by whichever future
 * quote-editing code creates the line item this snapshot belongs to — no
 * such code exists yet in Phase 3).
 *
 * Kept separate from engine.ts so the pricing engine itself has zero
 * dependency on Prisma or any specific persistence layer.
 */
export interface PricingSnapshotInput {
  pricingEngineVersion: string;
  pricingStatus: MatrixPriceResult["status"];
  sourceFabricName: string;
  normalizedFabricName: string;
  productType: MatrixPriceResult["productType"];
  priceGroup: MatrixPriceResult["priceGroup"];
  actualWidth: number | null;
  actualHeight: number | null;
  selectedWidthTier: number | null;
  selectedHeightTier: number | null;
  retailCents: number | null;
  dealerMultiplierBps: number | null;
  dealerCostCents: number | null;
  warnings: readonly string[];
}

/**
 * A PricingSnapshot's actualWidth/actualHeight columns are SQL numeric
 * (Decimal) and cannot represent NaN/Infinity — this is the only place a
 * MatrixPriceResult's raw `number` is narrowed to `number | null` for
 * storage. The result's own `status`/`message`/`warnings` still explain an
 * INVALID_DIMENSIONS failure even when the entered value itself can't be
 * persisted.
 */
function toStorableDimension(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

export function matrixPriceResultToSnapshotInput(result: MatrixPriceResult): PricingSnapshotInput {
  return {
    pricingEngineVersion: result.pricingEngineVersion,
    pricingStatus: result.status,
    sourceFabricName: result.sourceFabricName,
    normalizedFabricName: result.normalizedFabricName,
    productType: result.productType,
    priceGroup: result.priceGroup,
    actualWidth: toStorableDimension(result.actualWidth),
    actualHeight: toStorableDimension(result.actualHeight),
    selectedWidthTier: result.selectedWidthTier,
    selectedHeightTier: result.selectedHeightTier,
    retailCents: result.retailCents,
    dealerMultiplierBps: result.dealerMultiplierBps,
    dealerCostCents: result.dealerCostCents,
    warnings: result.warnings,
  };
}
