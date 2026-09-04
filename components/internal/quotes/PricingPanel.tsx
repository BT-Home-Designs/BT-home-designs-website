import { formatCentsAsCurrency, formatInches } from "@/lib/format";
import { isMatrixSupportedProductType } from "@/lib/quotes/matrixSupportedProductTypes";
import type { PricingSnapshotDTO } from "@/lib/quotes/dto";

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Priced",
  OUT_OF_MATRIX_RANGE: "MANUAL PRICING REQUIRED — out of matrix range",
  UNKNOWN_FABRIC: "MANUAL REVIEW REQUIRED — unknown fabric",
  INVALID_DIMENSIONS: "MANUAL REVIEW REQUIRED — invalid dimensions",
  CONFIGURATION_ERROR: "DO NOT PRICE — configuration error",
};

/**
 * Internal-only pricing display (vendor retail / dealer cost). Never
 * rendered on any public-facing surface. Selling price is intentionally
 * absent from this panel — see the "Selling Price" line rendered
 * separately by LineItemCard, which always reads NOT CONFIGURED.
 */
export function PricingPanel({ productType, snapshot }: { productType: string | null; snapshot: PricingSnapshotDTO | null }) {
  if (productType && !isMatrixSupportedProductType(productType)) {
    return (
      <div className="rounded-sm border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
        <span className="font-semibold">MANUAL PRICING REQUIRED</span> — this product type does not use the matrix
        pricing engine yet.
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-cream/40 px-3 py-2.5 text-[12px] text-charcoal-soft">
        Select a fabric and enter width/height to calculate pricing.
      </div>
    );
  }

  if (!snapshot.isCurrent) {
    return (
      <div className="rounded-sm border border-amber-300 bg-amber-50 px-3 py-2.5 text-[12px] text-amber-900">
        <span className="font-semibold">Pricing is out of date</span> — fabric or dimensions changed since this was
        last priced. Save this line item to recalculate.
      </div>
    );
  }

  if (snapshot.pricingStatus !== "SUCCESS") {
    return (
      <div className="space-y-1.5 rounded-sm border border-red-300 bg-red-50 px-3 py-2.5 text-[12px] text-red-900">
        <p className="font-semibold">{STATUS_LABELS[snapshot.pricingStatus] ?? snapshot.pricingStatus}</p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <dt className="text-red-700">Fabric</dt>
          <dd>{snapshot.sourceFabricName}</dd>
          <dt className="text-red-700">Entered size</dt>
          <dd>
            {formatInches(snapshot.actualWidth)} × {formatInches(snapshot.actualHeight)}
          </dd>
        </dl>
      </div>
    );
  }

  return (
    <div className="space-y-2 rounded-sm border border-charcoal/15 bg-cream/50 px-3 py-2.5 text-[12px]">
      <p className="font-semibold uppercase tracking-wide text-oak-dark">Internal Pricing</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        <dt className="text-charcoal-soft">Pricing Status</dt>
        <dd className="text-charcoal">{STATUS_LABELS[snapshot.pricingStatus] ?? snapshot.pricingStatus}</dd>
        <dt className="text-charcoal-soft">Product Type</dt>
        <dd className="text-charcoal">{snapshot.productType ?? "—"}</dd>
        <dt className="text-charcoal-soft">Fabric</dt>
        <dd className="text-charcoal">{snapshot.sourceFabricName}</dd>
        <dt className="text-charcoal-soft">Price Group</dt>
        <dd className="text-charcoal">{snapshot.priceGroup ?? "—"}</dd>
        <dt className="text-charcoal-soft">Actual Width</dt>
        <dd className="text-charcoal">{formatInches(snapshot.actualWidth)}</dd>
        <dt className="text-charcoal-soft">Actual Height</dt>
        <dd className="text-charcoal">{formatInches(snapshot.actualHeight)}</dd>
        <dt className="text-charcoal-soft">Selected Width Tier</dt>
        <dd className="text-charcoal">{formatInches(snapshot.selectedWidthTier)}</dd>
        <dt className="text-charcoal-soft">Selected Height Tier</dt>
        <dd className="text-charcoal">{formatInches(snapshot.selectedHeightTier)}</dd>
        <dt className="font-medium text-charcoal-soft">Vendor Retail</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.retailCents)}</dd>
        <dt className="font-medium text-charcoal-soft">Dealer Cost</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.dealerCostCents)}</dd>
      </dl>
      {snapshot.warnings.length > 0 && (
        <div className="space-y-1 rounded-sm border border-amber-300 bg-amber-50 px-2.5 py-2 text-amber-900">
          {snapshot.warnings.map((warning) => (
            <p key={warning} className="font-medium">
              ⚠ {warning}
            </p>
          ))}
        </div>
      )}
      <p className="pt-1 text-[10px] text-charcoal-soft/70">
        Engine {snapshot.pricingEngineVersion} · Vendor retail and dealer cost are internal only.
      </p>
    </div>
  );
}
