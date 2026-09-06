import { formatCentsAsCurrency, formatInches } from "@/lib/format";
import type { SquareFootSnapshotDTO } from "@/lib/quotes/dto";

const STATUS_LABELS: Record<string, string> = {
  SUCCESS: "Priced",
  INVALID_DIMENSIONS: "MANUAL REVIEW REQUIRED — invalid dimensions",
  CONFIGURATION_ERROR: "DO NOT PRICE — configuration error",
};

/**
 * Plantation Shutter customer pricing — the square-foot-formula analogue
 * of PricingPanel, but for the customer-facing side. Shutter dealer/vendor
 * cost is deliberately NOT_CONFIGURED (see AGENTS.md / project history,
 * Phase 6: "do not assume vendor/dealer cost for shutters unless
 * separately supplied"), so this panel never shows an internal cost or
 * profit figure — those always read NOT CONFIGURED / NOT AVAILABLE here,
 * never a fabricated number.
 */
export function ShutterPricingPanel({ snapshot }: { snapshot: SquareFootSnapshotDTO | null }) {
  if (!snapshot) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-cream/40 px-3 py-2.5 text-[12px] text-charcoal-soft">
        Enter width and height to calculate shutter pricing.
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
    <div className="space-y-2 rounded-sm border border-oak/30 bg-oak-light/10 px-3 py-2.5 text-[12px]">
      <p className="font-semibold uppercase tracking-wide text-oak-dark">Customer Price — Plantation Shutter</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        <dt className="text-charcoal-soft">Size</dt>
        <dd className="text-charcoal">
          {formatInches(snapshot.actualWidth)} × {formatInches(snapshot.actualHeight)} ({snapshot.squareFeet?.toFixed(3) ?? "—"} sq ft)
        </dd>
        <dt className="text-charcoal-soft">Quantity</dt>
        <dd className="text-charcoal">{snapshot.quantity}</dd>
        <dt className="font-medium text-charcoal-soft">Customer Base Sq Ft Price</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.perUnitBaseCents)}</dd>
        {(snapshot.archPanelCount ?? 0) > 0 && (
          <>
            <dt className="text-charcoal-soft">Arch Charges ({snapshot.archPanelCount} panel{snapshot.archPanelCount === 1 ? "" : "s"})</dt>
            <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.archChargeTotalCents)}</dd>
          </>
        )}
        {(snapshot.doorCutoutCount ?? 0) > 0 && (
          <>
            <dt className="text-charcoal-soft">Door Cutout Charges ({snapshot.doorCutoutCount} cutout{snapshot.doorCutoutCount === 1 ? "" : "s"})</dt>
            <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.doorCutoutChargeTotalCents)}</dd>
          </>
        )}
      </dl>

      <div className="flex items-center justify-between border-t border-oak/20 pt-2 font-medium">
        <span className="text-charcoal-soft">Customer Line Total</span>
        <span className="text-charcoal">{formatCentsAsCurrency(snapshot.totalCents)}</span>
      </div>

      <div className="space-y-1 border-t border-charcoal/10 pt-2">
        <div className="flex items-center justify-between">
          <span className="text-charcoal-soft">Internal Dealer Cost</span>
          <span className="font-medium text-amber-700">NOT CONFIGURED</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-charcoal-soft">Gross Profit / Margin</span>
          <span className="font-medium text-amber-700">NOT AVAILABLE</span>
        </div>
      </div>
      <p className="pt-1 text-[10px] text-charcoal-soft/70">
        Rate {formatCentsAsCurrency(snapshot.appliedRatePerSquareFootCents)}/sq ft · vendor/dealer cost for shutters has not been supplied.
      </p>
    </div>
  );
}
