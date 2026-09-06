"use server";

import { revalidatePath } from "next/cache";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { prisma } from "@/lib/db/prisma";
import { addLineItem, updateLineItem, duplicateLineItem, deleteLineItem, reorderLineItem, type LineItemFieldsInput } from "@/lib/quotes/lineItems";
import { updateQuoteHeader, type QuoteHeaderInput } from "@/lib/quotes/quotes";
import { toLineItemDTO, LINE_ITEM_INCLUDE, type LineItemDTO } from "@/lib/quotes/dto";
import { getKnownAddOnCostsCents } from "@/lib/quotes/fixedPriceOptions";
import { setManualSellingPrice, clearSellingPrice } from "@/lib/quotes/sellingPrice";
import type { QuoteStatus, DiscountType, DepositType } from "@prisma/client";

async function loadLineItemDTO(id: string): Promise<LineItemDTO> {
  const [item, knownAddOnCostsCents] = await Promise.all([
    prisma.quoteLineItem.findUniqueOrThrow({ where: { id }, include: LINE_ITEM_INCLUDE }),
    getKnownAddOnCostsCents(),
  ]);
  return toLineItemDTO(item, knownAddOnCostsCents);
}

async function loadLineItemDTOs(quoteId: string): Promise<LineItemDTO[]> {
  const [items, knownAddOnCostsCents] = await Promise.all([
    prisma.quoteLineItem.findMany({ where: { quoteId }, orderBy: { sortOrder: "asc" }, include: LINE_ITEM_INCLUDE }),
    getKnownAddOnCostsCents(),
  ]);
  return items.map((item) => toLineItemDTO(item, knownAddOnCostsCents));
}

function getOptional(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Parses a positive/negative/zero number the same way the form's native
 * number input would, WITHOUT rejecting 0 or negative values here — those
 * must reach the pricing engine as INVALID_DIMENSIONS so the UI can show
 * that status, rather than being silently swallowed by form parsing. Only
 * a genuinely empty field becomes null ("not entered yet").
 */
function parseOptionalNumber(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : NaN; // NaN is intentionally preserved, not nulled — see INVALID_DIMENSIONS.
}

/** A non-negative whole count (e.g. arch panels, door cutouts). Empty -> null, invalid/negative -> 0. */
function parseOptionalCount(formData: FormData, key: string): number | null {
  const value = formData.get(key);
  if (typeof value !== "string" || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
}

function parseLineItemForm(formData: FormData): LineItemFieldsInput {
  const hardwareOptionsRaw = formData.get("hardwareOptions");
  const hardwareOptions =
    typeof hardwareOptionsRaw === "string" && hardwareOptionsRaw.trim() !== ""
      ? hardwareOptionsRaw
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

  const quantityRaw = Number(formData.get("quantity"));
  const quantity = Number.isFinite(quantityRaw) && quantityRaw >= 1 ? Math.floor(quantityRaw) : 1;

  return {
    room: getOptional(formData, "room"),
    windowIdentifier: getOptional(formData, "windowIdentifier"),
    productId: getOptional(formData, "productId"),
    width: parseOptionalNumber(formData, "width"),
    height: parseOptionalNumber(formData, "height"),
    quantity,
    archPanelCount: parseOptionalCount(formData, "archPanelCount"),
    doorCutoutCount: parseOptionalCount(formData, "doorCutoutCount"),
    fabricId: getOptional(formData, "fabricId"),
    colorId: getOptional(formData, "colorId"),
    mountType: getOptional(formData, "mountType"),
    controlType: getOptional(formData, "controlType"),
    motorization: getOptional(formData, "motorization"),
    remote: getOptional(formData, "remote"),
    hub: getOptional(formData, "hub"),
    solarCharger: getOptional(formData, "solarCharger"),
    hardwareOptions,
    installation: getOptional(formData, "installation"),
    notes: getOptional(formData, "notes"),
  };
}

export async function addLineItemAction(quoteId: string): Promise<LineItemDTO> {
  await requireInternalUser();
  const created = await addLineItem(quoteId);
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTO(created.id);
}

export async function updateLineItemAction(lineItemId: string, quoteId: string, formData: FormData): Promise<LineItemDTO> {
  await requireInternalUser();
  const input = parseLineItemForm(formData);
  const { lineItem } = await updateLineItem(lineItemId, input);
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTO(lineItem.id);
}

export async function duplicateLineItemAction(lineItemId: string, quoteId: string): Promise<LineItemDTO[]> {
  await requireInternalUser();
  await duplicateLineItem(lineItemId);
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTOs(quoteId);
}

export async function deleteLineItemAction(lineItemId: string, quoteId: string): Promise<void> {
  await requireInternalUser();
  await deleteLineItem(lineItemId);
  revalidatePath(`/internal/quotes/${quoteId}`);
}

export async function reorderLineItemAction(lineItemId: string, quoteId: string, direction: "up" | "down"): Promise<LineItemDTO[]> {
  await requireInternalUser();
  await reorderLineItem(lineItemId, direction);
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTOs(quoteId);
}

/**
 * Sets an explicit manual selling price on one line item — requires a
 * reason, records who/when, and never touches the item's dealer cost /
 * pricing snapshot (see lib/quotes/sellingPrice.ts). Marks the price
 * MANUAL so a later automatic reprice pass never silently replaces it.
 */
export async function setManualSellingPriceAction(lineItemId: string, quoteId: string, formData: FormData): Promise<LineItemDTO> {
  const user = await requireInternalUser();
  const priceDollarsRaw = formData.get("sellingPriceDollars");
  const reason = String(formData.get("reason") ?? "");

  const priceDollars = typeof priceDollarsRaw === "string" ? Number(priceDollarsRaw) : NaN;
  if (!Number.isFinite(priceDollars) || priceDollars < 0) {
    throw new Error("Enter a valid, non-negative selling price.");
  }

  await setManualSellingPrice({
    lineItemId,
    sellingPriceCents: Math.round(priceDollars * 100),
    setByUserId: user.id,
    reason,
  });
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTO(lineItemId);
}

/** Reverts a line item's selling price to NOT_CONFIGURED (clears manual or rule-derived price). */
export async function clearSellingPriceAction(lineItemId: string, quoteId: string): Promise<LineItemDTO> {
  await requireInternalUser();
  await clearSellingPrice(lineItemId);
  revalidatePath(`/internal/quotes/${quoteId}`);
  return loadLineItemDTO(lineItemId);
}

/**
 * discountValue/depositValue are stored as basis points when their type is
 * PERCENTAGE and as cents when FIXED_AMOUNT (see prisma/schema.prisma).
 * The form always collects a plain decimal number (e.g. "10" for 10%, or
 * "50.00" for $50) — multiplying by 100 happens to convert correctly for
 * BOTH cases (percent -> basis points and dollars -> cents are both x100),
 * so no branching on type is needed here.
 */
function parseHeaderForm(formData: FormData): QuoteHeaderInput {
  const discountTypeRaw = formData.get("discountType");
  const depositTypeRaw = formData.get("depositType");
  const discountValueRaw = getOptional(formData, "discountValue");
  const depositValueRaw = getOptional(formData, "depositValue");
  const taxRatePercentRaw = getOptional(formData, "taxRatePercent");
  const depositPaidRaw = getOptional(formData, "depositPaid");
  const quoteDateRaw = formData.get("quoteDate");

  return {
    quoteNumber: String(formData.get("quoteNumber") ?? "").trim(),
    quoteDate: typeof quoteDateRaw === "string" && quoteDateRaw ? new Date(quoteDateRaw) : new Date(),
    status: (formData.get("status") as QuoteStatus) || "DRAFT",
    notes: getOptional(formData, "notes"),
    discountType: discountTypeRaw ? (discountTypeRaw as DiscountType) : null,
    discountValue: discountValueRaw !== null ? Math.round(Number(discountValueRaw) * 100) : null,
    taxRateBps: taxRatePercentRaw !== null ? Math.round(Number(taxRatePercentRaw) * 100) : 0,
    depositType: depositTypeRaw ? (depositTypeRaw as DepositType) : null,
    depositValue: depositValueRaw !== null ? Math.round(Number(depositValueRaw) * 100) : null,
    depositPaidCents: depositPaidRaw !== null ? Math.round(Number(depositPaidRaw) * 100) : 0,
  };
}

export async function updateQuoteHeaderAction(quoteId: string, formData: FormData) {
  await requireInternalUser();
  const input = parseHeaderForm(formData);
  await updateQuoteHeader(quoteId, input);
  revalidatePath(`/internal/quotes/${quoteId}`);
  revalidatePath("/internal/quotes");
}
