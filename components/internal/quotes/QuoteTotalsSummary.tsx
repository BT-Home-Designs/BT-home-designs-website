import { formatCentsAsCurrency } from "@/lib/format";
import type { QuoteTotalsResult } from "@/lib/quotes/totals";

/**
 * Customer-facing totals only — computed strictly from configured line-
 * item selling prices (see lib/quotes/totals.ts). Never derived from
 * dealer cost. When any line item's selling price is still NOT_CONFIGURED,
 * that's surfaced plainly rather than silently omitted from the count.
 */
export function QuoteTotalsSummary({ totals, unconfiguredCount }: { totals: QuoteTotalsResult; unconfiguredCount: number }) {
  return (
    <div className="rounded-sm border border-charcoal/15 bg-warm-white p-5">
      <p className="mb-3 font-display text-lg text-charcoal">Quote Totals</p>
      {unconfiguredCount > 0 && (
        <p className="mb-3 rounded-sm border border-amber-300 bg-amber-50 px-3 py-2 text-[12px] text-amber-900">
          {unconfiguredCount} line item{unconfiguredCount === 1 ? "" : "s"} still {unconfiguredCount === 1 ? "has" : "have"} an
          unconfigured selling price — totals below only include priced line items and are incomplete until every item is priced.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-y-1.5 text-[13px]">
        <dt className="text-charcoal-soft">Subtotal</dt>
        <dd className="text-right text-charcoal">{formatCentsAsCurrency(totals.subtotalCents)}</dd>
        <dt className="text-charcoal-soft">Discount</dt>
        <dd className="text-right text-charcoal">-{formatCentsAsCurrency(totals.discountCents)}</dd>
        <dt className="text-charcoal-soft">Taxable Subtotal</dt>
        <dd className="text-right text-charcoal">{formatCentsAsCurrency(totals.taxableSubtotalCents)}</dd>
        <dt className="text-charcoal-soft">Tax</dt>
        <dd className="text-right text-charcoal">{formatCentsAsCurrency(totals.taxCents)}</dd>
        <dt className="font-semibold text-charcoal">Grand Total</dt>
        <dd className="text-right font-semibold text-charcoal">{formatCentsAsCurrency(totals.grandTotalCents)}</dd>
        <dt className="mt-2 text-charcoal-soft">Deposit Required</dt>
        <dd className="mt-2 text-right text-charcoal">{formatCentsAsCurrency(totals.depositRequiredCents)}</dd>
        <dt className="text-charcoal-soft">Deposit Paid</dt>
        <dd className="text-right text-charcoal">{formatCentsAsCurrency(totals.depositPaidCents)}</dd>
        <dt className="font-semibold text-charcoal">Remaining Balance</dt>
        <dd className="text-right font-semibold text-charcoal">{formatCentsAsCurrency(totals.remainingBalanceCents)}</dd>
      </dl>
    </div>
  );
}
