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

/** Each non-empty field becomes one requested add-on line in the cost breakdown. */
function requestedAddOnNames(lineItem: LineItemWithRelations): string[] {
  const names: string[] = [];
  if (lineItem.motorization) names.push("Motorization");
  if (lineItem.remote) names.push("Remote");
  if (lineItem.hub) names.push("Hub");
  if (lineItem.solarCharger) names.push("Solar Charger");
  if (lineItem.installation) names.push("Installation");
  names.push(...lineItem.hardwareOptions);
  return names;
}

/**
 * `knownAddOnCostsCents` comes from the FixedPriceOption catalog (see
 * prisma/schema.prisma) — fetched once per page load by the caller, not
 * queried per line item here. Empty until BT Home Designs supplies real
 * add-on costs, so every add-on resolves NOT_CONFIGURED for now.
 */
export function toLineItemDTO(lineItem: LineItemWithRelations, knownAddOnCostsCents: ReadonlyMap<string, number> = new Map()): LineItemDTO {
  const currentSnapshot = lineItem.currentPricingSnapshot ? toPricingSnapshotDTO(lineItem.currentPricingSnapshot) : null;

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
    costBreakdown,
    profitability,
  };
}

export const LINE_ITEM_INCLUDE = lineItemWithRelations.include;
