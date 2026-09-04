import { prisma } from "@/lib/db/prisma";
import type { PricingSnapshot } from "@prisma/client";
import { priceMatrixItem } from "@/lib/pricing/matrix-engine/engine";
import { matrixPriceResultToSnapshotInput } from "@/lib/pricing/matrix-engine/toSnapshotInput";
import { normalizeFabricName } from "@/lib/pricing/matrix-engine/fabricCatalog";
import { isMatrixSupportedProductType } from "./matrixSupportedProductTypes";

export interface RepriceResult {
  /** false = matrix pricing was never attempted (unsupported product, or fabric/dimensions missing). */
  attempted: boolean;
  /** The current snapshot (freshly created, or the existing one if inputs are unchanged). Null when not attempted. */
  snapshot: PricingSnapshot | null;
  reasonNotAttempted: string | null;
}

/**
 * Re-prices a line item against the verified matrix engine if (and only
 * if) its product supports matrix pricing and a fabric + width + height
 * are present. A NEW PricingSnapshot row is created only when the priced
 * inputs (fabric, width, height) actually differ from the most recent
 * existing snapshot — so saving an unrelated field (e.g. notes) never
 * creates a redundant snapshot, and an old snapshot is never mutated in
 * place (see prisma/schema.prisma — PricingSnapshot is append-only).
 */
export async function repriceLineItemIfNeeded(lineItemId: string): Promise<RepriceResult> {
  const lineItem = await prisma.quoteLineItem.findUniqueOrThrow({
    where: { id: lineItemId },
    include: { product: true, fabric: true },
  });

  if (!lineItem.product || !isMatrixSupportedProductType(lineItem.product.productType)) {
    return { attempted: false, snapshot: null, reasonNotAttempted: "The selected product does not use the matrix pricing engine yet." };
  }
  if (!lineItem.fabric) {
    return { attempted: false, snapshot: null, reasonNotAttempted: "No fabric selected." };
  }
  if (lineItem.width === null || lineItem.height === null) {
    return { attempted: false, snapshot: null, reasonNotAttempted: "Width and height are required to price this item." };
  }

  const width = lineItem.width.toNumber();
  const height = lineItem.height.toNumber();
  const normalizedFabricName = normalizeFabricName(lineItem.fabric.sourceName);

  const latestSnapshot = await prisma.pricingSnapshot.findFirst({
    where: { quoteLineItemId: lineItemId },
    orderBy: { createdAt: "desc" },
  });

  const inputsUnchanged =
    latestSnapshot !== null &&
    latestSnapshot.normalizedFabricName === normalizedFabricName &&
    latestSnapshot.actualWidth !== null &&
    latestSnapshot.actualHeight !== null &&
    latestSnapshot.actualWidth.toNumber() === width &&
    latestSnapshot.actualHeight.toNumber() === height;

  if (inputsUnchanged) {
    return { attempted: true, snapshot: latestSnapshot, reasonNotAttempted: null };
  }

  const result = priceMatrixItem({ fabricSourceName: lineItem.fabric.sourceName, width, height });
  const snapshotInput = matrixPriceResultToSnapshotInput(result);

  const snapshot = await prisma.pricingSnapshot.create({
    data: {
      quoteLineItemId: lineItemId,
      ...snapshotInput,
      warnings: [...snapshotInput.warnings],
    },
  });

  return { attempted: true, snapshot, reasonNotAttempted: null };
}

export async function getLatestSnapshot(lineItemId: string) {
  return prisma.pricingSnapshot.findFirst({
    where: { quoteLineItemId: lineItemId },
    orderBy: { createdAt: "desc" },
  });
}
