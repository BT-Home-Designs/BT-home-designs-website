/**
 * Plain, JSON-serializable shapes for passing Prisma results across the
 * Server -> Client Component boundary. Prisma's Decimal (width/height) and
 * Date fields are not directly serializable there, so every conversion
 * happens once, here, rather than ad hoc in each page/action.
 */
import type { Prisma } from "@prisma/client";
import { calculateCompositeCost, type AddOnCostLine } from "@/lib/pricing/costBreakdown";
import { calculateLineItemProfitability } from "@/lib/pricing/profitability";

const lineItemWithRelations = {
  include: {
    product: true,
    vendor: true,
    fabric: true,
    color: true,
    currentPricingSnapshot: true,
    currentSquareFootSnapshot: true,
    currentCashCreditSnapshot: true,
    sellingPriceRule: true,
    sellingPriceSetBy: true,
  },
} satisfies Prisma.QuoteLineItemDefaultArgs;

export type LineItemWithRelations = Prisma.QuoteLineItemGetPayload<typeof lineItemWithRelations>;

export interface PricingSnapshotDTO {
  id: string;
  pricingEngineVersion: string;
  pricingStatus: string;
  sourceFabricName: string;
  normalizedFabricName: string;
  productType: string | null;
  priceGroup: string | null;
  actualWidth: number | null;
  actualHeight: number | null;
  selectedWidthTier: number | null;
  selectedHeightTier: number | null;
  retailCents: number | null;
  dealerMultiplierBps: number | null;
  dealerCostCents: number | null;
  warnings: string[];
  createdAt: string;
}

/**
 * Plantation Shutter square-foot pricing snapshot — mirrors PricingSnapshotDTO's
 * role for the matrix engine (see lib/quotes/shutterPricing.ts). `status` of
 * anything other than SUCCESS means the amount fields are null; there is
 * never a dealer-cost field here, since shutter dealer cost is NOT_CONFIGURED
 * (see AGENTS.md / project history, Phase 6).
 */
export interface SquareFootSnapshotDTO {
  id: string;
  status: string;
  actualWidth: number | null;
  actualHeight: number | null;
  archPanelCount: number | null;
  doorCutoutCount: number | null;
  quantity: number;
  appliedRatePerSquareFootCents: number | null;
  appliedArchChargeCents: number | null;
  appliedDoorCutoutChargeCents: number | null;
  squareFeet: number | null;
  perUnitBaseCents: number | null;
  archChargeTotalCents: number | null;
  doorCutoutChargeTotalCents: number | null;
  totalCents: number | null;
  createdAt: string;
}

/**
 * General cash/credit-card formula result (see docs/business-rules.md,
 * lib/quotes/cashCreditPricing.ts). costOfGoodsCents/laborCents/
 * markupAmountCents are INTERNAL ONLY — a customer-facing panel must
 * render only cashPriceCents ("Cash / Check / ACH Price") and
 * creditCardPriceCents ("Credit Card Price"), never the cost breakdown.
 */
export interface CashCreditSnapshotDTO {
  id: string;
  status: string;
  costOfGoodsCents: number | null;
  laborCents: number | null;
  totalInternalCostCents: number | null;
  appliedMarkupBps: number | null;
  markupAmountCents: number | null;
  cashPriceCents: number | null;
  appliedCardFeeBps: number | null;
  creditCardFeeCents: number | null;
  creditCardPriceCents: number | null;
  createdAt: string;
}

export interface CostBreakdownDTO {
  baseDealerCostCents: number | null;
  addOns: AddOnCostLine[];
  totalInternalCostCents: number | null;
}

export interface ProfitabilityDTO {
  grossProfitCents: number | null;
  grossMarginBps: number | null;
}

export interface LineItemDTO {
  id: string;
  quoteId: string;
  sortOrder: number;
  room: string | null;
  windowIdentifier: string | null;
  productId: string | null;
  productName: string | null;
  width: number | null;
  height: number | null;
  quantity: number;
  archPanelCount: number | null;
  doorCutoutCount: number | null;
  fabricId: string | null;
  fabricName: string | null;
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

  sellingPriceStatus: string;
  sellingPriceCents: number | null;
  /** One of the 5 SellingPriceRuleType values, or null when NOT_CONFIGURED. */
  sellingPriceMethod: string | null;
  sellingPriceSetByName: string | null;
  sellingPriceSetAt: string | null;
  sellingPriceReason: string | null;

  /**
   * Whatever QuoteLineItem.currentPricingSnapshotId points at — the latest
   * pricing attempt for this item's CURRENT fabric/width/height, success
   * or failure. Null means pricing was never attempted for the current
   * inputs (not "unpriced forever" — see lib/quotes/pricing.ts). Check
   * `.pricingStatus` to know whether it's a usable price.
   */
  currentSnapshot: PricingSnapshotDTO | null;

  /**
   * Whatever QuoteLineItem.currentSquareFootSnapshotId points at — the
   * Plantation Shutter analogue of `currentSnapshot`. Null for non-shutter
   * products, or when shutter pricing was never attempted for the current
   * inputs. Check `.status` to know whether it's a usable price.
   */
  currentShutterSnapshot: SquareFootSnapshotDTO | null;

  /**
   * Whatever QuoteLineItem.currentCashCreditSnapshotId points at — present
   * only when sellingPriceMethod is CASH_CREDIT_FORMULA (or was, before
   * the cost basis became incomplete again). Null otherwise.
   */
  currentCashCreditSnapshot: CashCreditSnapshotDTO | null;

  /** INTERNAL ONLY — never render outside an authenticated internal page. */
  costBreakdown: CostBreakdownDTO;
  /** INTERNAL ONLY — null whenever selling price or total cost is unavailable. */
  profitability: ProfitabilityDTO;
}

function toPricingSnapshotDTO(snapshot: NonNullable<LineItemWithRelations["currentPricingSnapshot"]>): PricingSnapshotDTO {
  return {
    id: snapshot.id,
    pricingEngineVersion: snapshot.pricingEngineVersion,
    pricingStatus: snapshot.pricingStatus,
    sourceFabricName: snapshot.sourceFabricName,
    normalizedFabricName: snapshot.normalizedFabricName,
    productType: snapshot.productType,
    priceGroup: snapshot.priceGroup,
    actualWidth: snapshot.actualWidth ? snapshot.actualWidth.toNumber() : null,
    actualHeight: snapshot.actualHeight ? snapshot.actualHeight.toNumber() : null,
    selectedWidthTier: snapshot.selectedWidthTier,
    selectedHeightTier: snapshot.selectedHeightTier,
    retailCents: snapshot.retailCents,
    dealerMultiplierBps: snapshot.dealerMultiplierBps,
    dealerCostCents: snapshot.dealerCostCents,
    warnings: snapshot.warnings,
    createdAt: snapshot.createdAt.toISOString(),
  };
}

function toSquareFootSnapshotDTO(snapshot: NonNullable<LineItemWithRelations["currentSquareFootSnapshot"]>): SquareFootSnapshotDTO {
  return {
    id: snapshot.id,
    status: snapshot.status,
    actualWidth: snapshot.actualWidth ? snapshot.actualWidth.toNumber() : null,
    actualHeight: snapshot.actualHeight ? snapshot.actualHeight.toNumber() : null,
    archPanelCount: snapshot.archPanelCount,
    doorCutoutCount: snapshot.doorCutoutCount,
    quantity: snapshot.quantity,
    appliedRatePerSquareFootCents: snapshot.appliedRatePerSquareFootCents,
    appliedArchChargeCents: snapshot.appliedArchChargeCents,
    appliedDoorCutoutChargeCents: snapshot.appliedDoorCutoutChargeCents,
    squareFeet: snapshot.squareFeet ? snapshot.squareFeet.toNumber() : null,
    perUnitBaseCents: snapshot.perUnitBaseCents,
    archChargeTotalCents: snapshot.archChargeTotalCents,
    doorCutoutChargeTotalCents: snapshot.doorCutoutChargeTotalCents,
    totalCents: snapshot.totalCents,
    createdAt: snapshot.createdAt.toISOString(),
  };
}

function toCashCreditSnapshotDTO(snapshot: NonNullable<LineItemWithRelations["currentCashCreditSnapshot"]>): CashCreditSnapshotDTO {
  return {
    id: snapshot.id,
    status: snapshot.status,
    costOfGoodsCents: snapshot.costOfGoodsCents,
    laborCents: snapshot.laborCents,
    totalInternalCostCents: snapshot.totalInternalCostCents,
    appliedMarkupBps: snapshot.appliedMarkupBps,
    markupAmountCents: snapshot.markupAmountCents,
    cashPriceCents: snapshot.cashPriceCents,
    appliedCardFeeBps: snapshot.appliedCardFeeBps,
    creditCardFeeCents: snapshot.creditCardFeeCents,
    creditCardPriceCents: snapshot.creditCardPriceCents,
    createdAt: snapshot.createdAt.toISOString(),
  };
}

/**
 * Each requested add-on becomes one line in the cost breakdown, matched
 * against the FixedPriceOption catalog by exact name — motorization/remote/
 * hub/solarCharger fields hold the selected option's own name directly (see
 * the dropdowns in LineItemCard), so no bucket-label translation is needed.
 * Installation is derived from `installation`/`motorization`/`controlType`
 * rather than stored as separate booleans, so each qualifying charge is
 * added exactly once — never double-charging base + add-on labor.
 */
function requestedAddOnNames(lineItem: LineItemWithRelations): string[] {
  const names: string[] = [];
  if (lineItem.motorization) names.push(lineItem.motorization);
  if (lineItem.remote) names.push(lineItem.remote);
  if (lineItem.hub) names.push(lineItem.hub);
  if (lineItem.solarCharger) names.push(lineItem.solarCharger);
  if (lineItem.installation) {
    names.push("Base Installation");
    if (lineItem.motorization) names.push("Motorized Installation Add-On");
    if (lineItem.controlType?.toLowerCase().includes("cordless")) names.push("Cordless Installation Add-On");
  }
  names.push(...lineItem.hardwareOptions);
  return names;
}

/**
 * `knownAddOnCostsCents` comes from the FixedPriceOption catalog (see
 * prisma/schema.prisma) — fetched once per page load by the caller, not
 * queried per line item here. Only ACTIVE options are included (see
 * lib/quotes/fixedPriceOptions.ts), so a PENDING_VERIFICATION option (e.g.
 * the roller-shade cordless upgrade) always resolves NOT_CONFIGURED here,
 * never a fabricated amount.
 */
export function toLineItemDTO(lineItem: LineItemWithRelations, knownAddOnCostsCents: ReadonlyMap<string, number> = new Map()): LineItemDTO {
  const currentSnapshot = lineItem.currentPricingSnapshot ? toPricingSnapshotDTO(lineItem.currentPricingSnapshot) : null;
  const currentShutterSnapshot = lineItem.currentSquareFootSnapshot ? toSquareFootSnapshotDTO(lineItem.currentSquareFootSnapshot) : null;
  const currentCashCreditSnapshot = lineItem.currentCashCreditSnapshot ? toCashCreditSnapshotDTO(lineItem.currentCashCreditSnapshot) : null;

  const costBreakdown = calculateCompositeCost({
    baseDealerCostCents: currentSnapshot?.pricingStatus === "SUCCESS" ? currentSnapshot.dealerCostCents : null,
    requestedAddOnNames: requestedAddOnNames(lineItem),
    knownCosts: knownAddOnCostsCents,
  });

  const profitability = calculateLineItemProfitability({
    sellingPriceCents: lineItem.sellingPriceStatus === "SET" ? lineItem.sellingPriceCents : null,
    totalInternalCostCents: costBreakdown.totalInternalCostCents,
  });

  return {
    id: lineItem.id,
    quoteId: lineItem.quoteId,
    sortOrder: lineItem.sortOrder,
    room: lineItem.room,
    windowIdentifier: lineItem.windowIdentifier,
    productId: lineItem.productId,
    productName: lineItem.product?.name ?? null,
    width: lineItem.width ? lineItem.width.toNumber() : null,
    height: lineItem.height ? lineItem.height.toNumber() : null,
    quantity: lineItem.quantity,
    archPanelCount: lineItem.archPanelCount,
    doorCutoutCount: lineItem.doorCutoutCount,
    fabricId: lineItem.fabricId,
    fabricName: lineItem.fabric?.sourceName ?? null,
    colorId: lineItem.colorId,
    mountType: lineItem.mountType,
    controlType: lineItem.controlType,
    motorization: lineItem.motorization,
    remote: lineItem.remote,
    hub: lineItem.hub,
    solarCharger: lineItem.solarCharger,
    hardwareOptions: lineItem.hardwareOptions,
    installation: lineItem.installation,
    notes: lineItem.notes,
    sellingPriceStatus: lineItem.sellingPriceStatus,
    sellingPriceCents: lineItem.sellingPriceCents,
    sellingPriceMethod: lineItem.sellingPriceMethod,
    sellingPriceSetByName: lineItem.sellingPriceSetBy?.name ?? null,
    sellingPriceSetAt: lineItem.sellingPriceSetAt ? lineItem.sellingPriceSetAt.toISOString() : null,
    sellingPriceReason: lineItem.sellingPriceReason,
    currentSnapshot,
    currentShutterSnapshot,
    currentCashCreditSnapshot,
    costBreakdown,
    profitability,
  };
}

export const LINE_ITEM_INCLUDE = lineItemWithRelations.include;
