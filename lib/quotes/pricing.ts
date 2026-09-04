import { prisma } from "@/lib/db/prisma";
import type { PricingSnapshot } from "@prisma/client";
import { priceMatrixItem } from "@/lib/pricing/matrix-engine/engine";
import { matrixPriceResultToSnapshotInput } from "@/lib/pricing/matrix-engine/toSnapshotInput";
import { normalizeFabricName } from "@/lib/pricing/matrix-engine/fabricCatalog";
import { isMatrixSupportedProductType } from "./matrixSupportedProductTypes";

export interface RepriceResult {
  /** false = matrix pricing was never attempted (unsupported product, or fabric/dimensions missing). */
  attempted: boolean;
  /**
   * The line item's current snapshot after this call — i.e. exactly what
   * QuoteLineItem.currentPricingSnapshotId now points at. Null when not
   * attempted (the pointer is cleared in that case, not left stale).
   * Check `.pricingStatus` to tell a usable price from a failure that
   * still needs manual review — this is "current" in the sense of "the
   * latest attempt for the current inputs," not "a successful price."
   */
  snapshot: PricingSnapshot | null;
  reasonNotAttempted: string | null;
}

/**
 * Re-prices a line item against the verified matrix engine if (and only
 * if) its product supports matrix pricing and a fabric + width + height
 * are present, and keeps QuoteLineItem.currentPricingSnapshotId pointing
 * at the result:
 *
 *  - Inputs unchanged since the current pointer's snapshot was made: no
 *    new snapshot, pointer left as-is (avoids a redundant row on every
 *    unrelated field save).
 *  - Inputs changed (or there's no current snapshot yet): a NEW,
 *    immutable PricingSnapshot row is created — success or failure — and
 *    the pointer is moved to it. This is what guarantees the pointer
 *    never keeps referencing a stale success after a fabric/size/product
 *    change: the very next reprice attempt (success or not) replaces it.
 *  - Pricing not attempted at all (unsupported product, or fabric/
 *    dimensions missing): the pointer is cleared to null. There is no
 *    "current price" to show — never leave it referencing whatever used
 *    to be there before the input was cleared/changed.
 *
 * The append-only history in PricingSnapshot (queryable via
 * quoteLineItemId) is never affected by any of this — rows are only ever
 * added, never updated or deleted.
 */
export async function repriceLineItemIfNeeded(lineItemId: string): Promise<RepriceResult> {
  const lineItem = await prisma.quoteLineItem.findUniqueOrThrow({
    where: { id: lineItemId },
    include: { product: true, fabric: true, currentPricingSnapshot: true },
  });

  if (!lineItem.product || !isMatrixSupportedProductType(lineItem.product.productType)) {
    await clearCurrentSnapshotIfSet(lineItem.id, lineItem.currentPricingSnapshotId);
    return { attempted: false, snapshot: null, reasonNotAttempted: "The selected product does not use the matrix pricing engine yet." };
  }
  if (!lineItem.fabric) {
    await clearCurrentSnapshotIfSet(lineItem.id, lineItem.currentPricingSnapshotId);
    return { attempted: false, snapshot: null, reasonNotAttempted: "No fabric selected." };
  }
  if (lineItem.width === null || lineItem.height === null) {
    await clearCurrentSnapshotIfSet(lineItem.id, lineItem.currentPricingSnapshotId);
    return { attempted: false, snapshot: null, reasonNotAttempted: "Width and height are required to price this item." };
  }

  const width = lineItem.width.toNumber();
  const height = lineItem.height.toNumber();
  const normalizedFabricName = normalizeFabricName(lineItem.fabric.sourceName);

  const current = lineItem.currentPricingSnapshot;
  const inputsUnchanged =
    current !== null &&
    current.normalizedFabricName === normalizedFabricName &&
    current.actualWidth !== null &&
    current.actualHeight !== null &&
    current.actualWidth.toNumber() === width &&
    current.actualHeight.toNumber() === height;

  if (inputsUnchanged) {
    return { attempted: true, snapshot: current, reasonNotAttempted: null };
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

  // Move the pointer to the new attempt regardless of its status — a
  // failure must never leave the pointer on an old successful snapshot
  // (see repriceLineItemIfNeeded's doc comment).
  await prisma.quoteLineItem.update({
    where: { id: lineItemId },
    data: { currentPricingSnapshotId: snapshot.id },
  });

  return { attempted: true, snapshot, reasonNotAttempted: null };
}

async function clearCurrentSnapshotIfSet(lineItemId: string, currentPricingSnapshotId: string | null) {
  if (currentPricingSnapshotId === null) return;
  await prisma.quoteLineItem.update({
    where: { id: lineItemId },
    data: { currentPricingSnapshotId: null },
  });
}

export async function getCurrentSnapshot(lineItemId: string) {
  const lineItem = await prisma.quoteLineItem.findUniqueOrThrow({
    where: { id: lineItemId },
    include: { currentPricingSnapshot: true },
  });
  return lineItem.currentPricingSnapshot;
}

/** Full, immutable pricing history for a line item, oldest first — never affected by the current-snapshot pointer. */
export async function getSnapshotHistory(lineItemId: string) {
  return prisma.pricingSnapshot.findMany({
    where: { quoteLineItemId: lineItemId },
    orderBy: { createdAt: "asc" },
  });
}
