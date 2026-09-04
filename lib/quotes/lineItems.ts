import { prisma } from "@/lib/db/prisma";
import { repriceLineItemIfNeeded } from "./pricing";

export interface LineItemFieldsInput {
  room: string | null;
  windowIdentifier: string | null;
  productId: string | null;
  width: number | null;
  height: number | null;
  quantity: number;
  fabricId: string | null;
  colorId: string | null;
  mountType: string | null;
  controlType: string | null;
  motorization: string | null;
  remote: string | null;
  hub: string | null;
  solarCharger: string | null;
  hardwareOptions: string[];
  installation: string | null;
  notes: string | null;
}

function cleanOptional(value: string | null): string | null {
  if (value === null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Adds a new, mostly-empty line item at the end of the quote. */
export async function addLineItem(quoteId: string) {
  const aggregate = await prisma.quoteLineItem.aggregate({
    where: { quoteId },
    _max: { sortOrder: true },
  });
  const nextSortOrder = (aggregate._max.sortOrder ?? -1) + 1;

  return prisma.quoteLineItem.create({
    data: { quoteId, sortOrder: nextSortOrder, quantity: 1 },
  });
}

/**
 * Persists the full set of editable fields for one line item (the form
 * always submits its complete current state, not a partial patch) and
 * then re-prices it if the product/fabric/dimensions support it.
 * `vendorId` is not a separate input — it's derived from the selected
 * product, so the UI doesn't ask staff to pick a vendor independently of
 * the product they just chose.
 */
export async function updateLineItem(id: string, input: LineItemFieldsInput) {
  let vendorId: string | null = null;
  let pricingStrategyType: "MATRIX_PRICE" | "SQUARE_FOOT" | "FIXED_PRICE" | "MANUAL_PRICE" | "COMPOSITE_PRICE" | null = null;

  if (input.productId) {
    const product = await prisma.product.findUniqueOrThrow({ where: { id: input.productId } });
    vendorId = product.vendorId;
    pricingStrategyType = product.defaultPricingStrategyType;
  }

  const lineItem = await prisma.quoteLineItem.update({
    where: { id },
    data: {
      room: cleanOptional(input.room),
      windowIdentifier: cleanOptional(input.windowIdentifier),
      productId: input.productId,
      vendorId,
      pricingStrategyType,
      width: input.width,
      height: input.height,
      quantity: input.quantity,
      fabricId: input.fabricId,
      colorId: input.colorId,
      mountType: cleanOptional(input.mountType),
      controlType: cleanOptional(input.controlType),
      motorization: cleanOptional(input.motorization),
      remote: cleanOptional(input.remote),
      hub: cleanOptional(input.hub),
      solarCharger: cleanOptional(input.solarCharger),
      hardwareOptions: input.hardwareOptions,
      installation: cleanOptional(input.installation),
      notes: cleanOptional(input.notes),
    },
  });

  const repriceResult = await repriceLineItemIfNeeded(id);
  return { lineItem, repriceResult };
}

/**
 * Copies every editable field to a new line item placed immediately after
 * the original, then prices the copy independently. The copy gets its own
 * PricingSnapshot history from this point forward — it never inherits the
 * original item's audit trail.
 */
export async function duplicateLineItem(id: string) {
  const original = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id } });

  // Shift every later item's sortOrder up by one to make room right after `original`.
  await prisma.quoteLineItem.updateMany({
    where: { quoteId: original.quoteId, sortOrder: { gt: original.sortOrder } },
    data: { sortOrder: { increment: 1 } },
  });

  const copy = await prisma.quoteLineItem.create({
    data: {
      quoteId: original.quoteId,
      sortOrder: original.sortOrder + 1,
      room: original.room,
      windowIdentifier: original.windowIdentifier,
      productId: original.productId,
      vendorId: original.vendorId,
      width: original.width,
      height: original.height,
      quantity: original.quantity,
      fabricId: original.fabricId,
      colorId: original.colorId,
      mountType: original.mountType,
      controlType: original.controlType,
      motorization: original.motorization,
      remote: original.remote,
      hub: original.hub,
      solarCharger: original.solarCharger,
      hardwareOptions: original.hardwareOptions,
      installation: original.installation,
      notes: original.notes,
      pricingStrategyType: original.pricingStrategyType,
    },
  });

  await repriceLineItemIfNeeded(copy.id);
  return copy;
}

export async function deleteLineItem(id: string) {
  await prisma.quoteLineItem.delete({ where: { id } });
}

/**
 * Swaps this line item's position with its immediate neighbor. Simple
 * up/down reordering — no drag-and-drop dependency, which is unnecessary
 * for the common case of nudging one item at a time.
 */
export async function reorderLineItem(id: string, direction: "up" | "down") {
  const item = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id } });
  const siblings = await prisma.quoteLineItem.findMany({
    where: { quoteId: item.quoteId },
    orderBy: { sortOrder: "asc" },
  });

  const index = siblings.findIndex((s) => s.id === id);
  const swapIndex = direction === "up" ? index - 1 : index + 1;
  if (swapIndex < 0 || swapIndex >= siblings.length) {
    return; // already at the top/bottom — no-op
  }

  const neighbor = siblings[swapIndex];
  await prisma.$transaction([
    prisma.quoteLineItem.update({ where: { id: item.id }, data: { sortOrder: neighbor.sortOrder } }),
    prisma.quoteLineItem.update({ where: { id: neighbor.id }, data: { sortOrder: item.sortOrder } }),
  ]);
}

export async function listLineItemsForQuote(quoteId: string) {
  return prisma.quoteLineItem.findMany({
    where: { quoteId },
    orderBy: { sortOrder: "asc" },
    include: { product: true, vendor: true, fabric: true, color: true },
  });
}
