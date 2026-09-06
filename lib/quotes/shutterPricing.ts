import { prisma } from "@/lib/db/prisma";
import type { SquareFootPriceSnapshot } from "@prisma/client";
import { calculateSquareFootCost } from "@/lib/pricing/squareFoot/engine";
import { NOT_CONFIGURED_UPDATE } from "./sellingPrice";

export interface ShutterRepriceResult {
  /** false = square-foot pricing was never attempted (not a SQUARE_FOOT product, or dimensions missing). */
  attempted: boolean;
  /** The line item's current square-foot snapshot after this call. Null when not attempted. */
  snapshot: SquareFootPriceSnapshot | null;
  reasonNotAttempted: string | null;
}

async function clearCurrentSquareFootSnapshotIfSet(lineItemId: string, currentId: string | null) {
  if (currentId === null) return;
  await prisma.quoteLineItem.update({ where: { id: lineItemId }, data: { currentSquareFootSnapshotId: null } });
}

/**
 * Prices a Plantation-Shutter-style line item using its product's
 * SquareFootPricingRule: (width x height / 144) x rate, plus arch panel
 * and door cutout charges, x quantity. Mirrors repriceLineItemIfNeeded's
 * (matrix) state machine exactly:
 *
 *  - Not a SQUARE_FOOT product, or width/height missing: pointer cleared
 *    to null, nothing attempted.
 *  - Inputs (width, height, arch count, cutout count, quantity) unchanged
 *    since the current snapshot: no new row, pointer left as-is.
 *  - Otherwise: a NEW, immutable SquareFootPriceSnapshot is created —
 *    success or failure — and the pointer moves to it, exactly like the
 *    matrix engine's snapshots. A missing/inactive SquareFootPricingRule
 *    or invalid dimensions produces a CONFIGURATION_ERROR /
 *    INVALID_DIMENSIONS row, never a fabricated price.
 *
 * On SUCCESS, also sets the line item's customer selling price directly
 * (sellingPriceMethod = SQUARE_FOOT_FORMULA) since there is no "cost" to
 * apply a SellingPriceRule to here — unless sellingPriceMethod is already
 * MANUAL, which this never overwrites.
 */
export async function repriceShutterLineItemIfNeeded(lineItemId: string): Promise<ShutterRepriceResult> {
  const lineItem = await prisma.quoteLineItem.findUniqueOrThrow({
    where: { id: lineItemId },
    include: { product: true, currentSquareFootSnapshot: true },
  });

  if (!lineItem.product || lineItem.product.defaultPricingStrategyType !== "SQUARE_FOOT") {
    await clearCurrentSquareFootSnapshotIfSet(lineItem.id, lineItem.currentSquareFootSnapshotId);
    return { attempted: false, snapshot: null, reasonNotAttempted: "This product does not use square-foot pricing." };
  }
  if (lineItem.width === null || lineItem.height === null) {
    await clearCurrentSquareFootSnapshotIfSet(lineItem.id, lineItem.currentSquareFootSnapshotId);
    return { attempted: false, snapshot: null, reasonNotAttempted: "Width and height are required to price this item." };
  }

  const width = lineItem.width.toNumber();
  const height = lineItem.height.toNumber();
  const archPanelCount = lineItem.archPanelCount ?? 0;
  const doorCutoutCount = lineItem.doorCutoutCount ?? 0;
  const quantity = lineItem.quantity;

  const current = lineItem.currentSquareFootSnapshot;
  const inputsUnchanged =
    current !== null &&
    current.actualWidth !== null &&
    current.actualHeight !== null &&
    current.actualWidth.toNumber() === width &&
    current.actualHeight.toNumber() === height &&
    (current.archPanelCount ?? 0) === archPanelCount &&
    (current.doorCutoutCount ?? 0) === doorCutoutCount &&
    current.quantity === quantity;

  if (inputsUnchanged) {
    return { attempted: true, snapshot: current, reasonNotAttempted: null };
  }

  const rule = await prisma.squareFootPricingRule.findFirst({
    where: { productId: lineItem.productId!, status: "ACTIVE" },
  });

  const baseFields = {
    quoteLineItemId: lineItemId,
    actualWidth: width,
    actualHeight: height,
    archPanelCount,
    doorCutoutCount,
    quantity,
  };

  let snapshot: SquareFootPriceSnapshot;

  if (!rule) {
    snapshot = await prisma.squareFootPriceSnapshot.create({
      data: { ...baseFields, status: "CONFIGURATION_ERROR" },
    });
  } else {
    const sqft = calculateSquareFootCost({ widthInches: width, heightInches: height, ratePerSquareFootCents: rule.ratePerSquareFootCents });

    if (sqft.status !== "OK") {
      snapshot = await prisma.squareFootPriceSnapshot.create({
        data: { ...baseFields, status: "INVALID_DIMENSIONS" },
      });
    } else {
      const perUnitBaseCents = sqft.costCents!;
      const archChargeTotalCents = archPanelCount * rule.archChargeCents;
      const doorCutoutChargeTotalCents = doorCutoutCount * rule.doorCutoutChargeCents;
      const perUnitTotalCents = perUnitBaseCents + archChargeTotalCents + doorCutoutChargeTotalCents;
      const totalCents = perUnitTotalCents * quantity;

      snapshot = await prisma.squareFootPriceSnapshot.create({
        data: {
          ...baseFields,
          status: "SUCCESS",
          appliedRatePerSquareFootCents: rule.ratePerSquareFootCents,
          appliedArchChargeCents: rule.archChargeCents,
          appliedDoorCutoutChargeCents: rule.doorCutoutChargeCents,
          squareFeet: sqft.squareFeet,
          perUnitBaseCents,
          archChargeTotalCents,
          doorCutoutChargeTotalCents,
          totalCents,
        },
      });
    }
  }

  await prisma.quoteLineItem.update({
    where: { id: lineItemId },
    data: { currentSquareFootSnapshotId: snapshot.id },
  });

  // Propagate to customer selling price directly — never overwrite a manual override.
  if (lineItem.sellingPriceMethod !== "MANUAL") {
    if (snapshot.status === "SUCCESS") {
      await prisma.quoteLineItem.update({
        where: { id: lineItemId },
        data: {
          sellingPriceStatus: "SET",
          sellingPriceCents: snapshot.totalCents,
          sellingPriceMethod: "SQUARE_FOOT_FORMULA",
          sellingPriceRuleId: null,
          sellingPriceSetById: null,
          sellingPriceSetAt: new Date(),
          sellingPriceReason: null,
        },
      });
    } else {
      await prisma.quoteLineItem.update({ where: { id: lineItemId }, data: NOT_CONFIGURED_UPDATE });
    }
  }

  return { attempted: true, snapshot, reasonNotAttempted: null };
}
