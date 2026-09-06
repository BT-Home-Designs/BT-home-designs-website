import { formatCentsAsCurrency } from "@/lib/format";
import type { CashCreditSnapshotDTO } from "@/lib/quotes/dto";

/**
 * INTERNAL ONLY — the full cash/credit-card formula breakdown (see
 * docs/business-rules.md): Cost of Goods, Labor, Total Internal Cost,
 * Markup Amount, Cash Price, Credit Card Fee, Credit Card Price. Shown for
 * any product using the formula (Roller Shade / Neolux via matrix dealer
 * cost, Plantation Shutter via its square-foot COGS) — never rendered
 * outside an authenticated internal page, and never shown to a customer.
 */
export function CashCreditBreakdownPanel({ snapshot }: { snapshot: CashCreditSnapshotDTO | null }) {
  if (!snapshot || snapshot.status !== "SUCCESS") {
    return null;
  }

  return (
    <div className="space-y-2 rounded-sm border border-charcoal/15 bg-cream/50 px-3 py-2.5 text-[12px]">
      <p className="font-semibold uppercase tracking-wide text-oak-dark">Cash / Credit Formula Breakdown</p>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
        <dt className="text-charcoal-soft">Cost of Goods</dt>
        <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.costOfGoodsCents)}</dd>
        <dt className="text-charcoal-soft">Labor</dt>
        <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.laborCents)}</dd>
        <dt className="font-medium text-charcoal-soft">Total Internal Cost</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.totalInternalCostCents)}</dd>
        <dt className="text-charcoal-soft">Markup Amount ({snapshot.appliedMarkupBps !== null ? `${(snapshot.appliedMarkupBps / 100).toFixed(0)}%` : "—"})</dt>
        <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.markupAmountCents)}</dd>
        <dt className="font-medium text-charcoal-soft">Cash Price</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.cashPriceCents)}</dd>
        <dt className="text-charcoal-soft">Credit Card Fee ({snapshot.appliedCardFeeBps !== null ? `${(snapshot.appliedCardFeeBps / 100).toFixed(0)}%` : "—"})</dt>
        <dd className="text-charcoal">{formatCentsAsCurrency(snapshot.creditCardFeeCents)}</dd>
        <dt className="font-medium text-charcoal-soft">Credit Card Price</dt>
        <dd className="font-medium text-charcoal">{formatCentsAsCurrency(snapshot.creditCardPriceCents)}</dd>
      </dl>
    </div>
  );
}
