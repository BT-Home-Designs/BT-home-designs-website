import { formatCentsAsCurrency, formatInches } from "@/lib/format";
import type { SquareFootSnapshotDTO } from "@/lib/quotes/dto";

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Priced",
  INVALID_DIMENSIONS: "MANUAL REVIEW REQUIRED — invalid dimensions",
  CONFIGURATION_ERROR: "DO NOT PRICE — configuration error",
};

/**
 * Plantation Shutter INTERNAL COST OF GOODS — the square-foot-formula
 * analogue of PricingPanel's dealer-cost section, INTERNAL ONLY. Per
 * docs/business-rules.md (confirmed Phase 7): the $17.25/sq ft rate and
 * the arch/cutout charges are internal cost-of-goods inputs, not a
 * customer price — the actual customer Cash/Credit Card price is shown in
 * CustomerPricePanel, driven by lib/quotes/cashCreditPricing.ts running
 * this COGS total through the standard markup formula.
 */
export function ShutterPricingPanel({ snapshot }: { snapshot: SquareFootSnapshotDTO | null }) {
  if (!snapshot) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-cream/40 px-3 py-2.5 text-[12px] text-charcoal-soft">
        Enter width and height to calculate shutter cost of goods.
      </div>
    );
  }

  if (snapshot.status !== "SUCCESS") {
    return (
      <div className="space-y-1.5 rounded-sm border border-red-300 bg-red-50 px-3 py-2.5 text-[12px] text-red-900">
        <p className="font-semibold">{STATUS_LABELS[snapshot.status] ?? snapshot.status}</p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5">
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
      <p className="font-semibold uppercase tracking-wide text-oak-dark">Internal Cost of Goods — Plantation Shutter</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        <dt className="text-charcoal-soft">Size</dt>
        <dd className="text-charcoal">
          {formatInches(snapshot.actualWidth)} × {formatInches(snapshot.actualHeight)} ({snapshot.squareFeet?.toFixed(3) ?? "—"} sq ft)
        </dd>
        <dt className="text-charcoal-soft">Quantity</dt>
        <dd className="text-charcoal">{snapshot.quantity}</dd>
        <dt className="font-medium text-charcoal-soft">Base Sq Ft Cost</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.perUnitBaseCents)}</dd>
        {(snapshot.archPanelCount ?? 0) > 0 && (
          <>
            <dt className="text-charcoal-soft">Arch Cost ({snapshot.archPanelCount} panel{snapshot.archPanelCount === 1 ? "" : "s"})</dt>
            <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.archChargeTotalCents)}</dd>
          </>
        )}
        {(snapshot.doorCutoutCount ?? 0) > 0 && (
          <>
            <dt className="text-charcoal-soft">Door Cutout Cost ({snapshot.doorCutoutCount} cutout{snapshot.doorCutoutCount === 1 ? "" : "s"})</dt>
            <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.doorCutoutChargeTotalCents)}</dd>
          </>
        )}
      </dl>

      <div className="flex items-center justify-between border-t border-charcoal/10 pt-2 font-medium">
        <span className="text-charcoal-soft">Total Cost of Goods</span>
        <span className="text-charcoal">{formatCentsAsCurrency(snapshot.totalCents)}</span>
      </div>
      <p className="pt-1 text-[10px] text-charcoal-soft/70">
        Rate {formatCentsAsCurrency(snapshot.appliedRatePerSquareFootCents)}/sq ft — internal cost input, not the customer price. See Customer
        Price below.
      </p>
    </div>
  );
}
