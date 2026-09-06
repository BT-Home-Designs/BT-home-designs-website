"use client";

import { useState, useTransition } from "react";
import { formatCentsAsCurrency } from "@/lib/format";
import type { LineItemDTO } from "@/lib/quotes/dto";
import { setManualSellingPriceAction, clearSellingPriceAction } from "@/app/internal/(dashboard)/quotes/[id]/actions";

const METHOD_LABELS: Record<string, string> = {
  MULTIPLIER: "Multiplier rule",
  MARKUP_PERCENT: "Markup % rule",
  TARGET_MARGIN: "Target margin rule",
  FIXED_AMOUNT: "Fixed amount rule",
  MANUAL: "Manually set",
  SQUARE_FOOT_FORMULA: "Square-foot formula",
  CASH_CREDIT_FORMULA: "Cash/credit-card formula",
};

function formatProfitCents(cents: number | null): string {
  return cents === null ? "NOT AVAILABLE" : formatCentsAsCurrency(cents);
}

function formatMarginBps(bps: number | null): string {
  if (bps === null) return "NOT AVAILABLE";
  return `${(bps / 100).toFixed(2)}%`;
}

/**
 * CUSTOMER PRICE — kept visually and structurally separate from the
 * internal cost panel. Never shows vendor retail/dealer cost. Gross
 * profit/margin are internal-only figures shown here because this whole
 * card only ever renders on an authenticated /internal page.
 */
export function CustomerPricePanel({ item, quoteId, onSaved }: { item: LineItemDTO; quoteId: string; onSaved: (updated: LineItemDTO) => void }) {
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualPrice, setManualPrice] = useState(item.sellingPriceCents !== null ? (item.sellingPriceCents / 100).toString() : "");
  const [manualReason, setManualReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSetManual(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const formData = new FormData();
    formData.set("sellingPriceDollars", manualPrice);
    formData.set("reason", manualReason);
    startTransition(async () => {
      try {
        const updated = await setManualSellingPriceAction(item.id, quoteId, formData);
        onSaved(updated);
        setShowManualForm(false);
        setManualReason("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to set manual selling price.");
      }
    });
  }

  function handleClear() {
    setError(null);
    startTransition(async () => {
      try {
        const updated = await clearSellingPriceAction(item.id, quoteId);
        onSaved(updated);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to clear selling price.");
      }
    });
  }

  return (
    <div className="space-y-2 rounded-sm border border-oak/30 bg-oak-light/10 px-3 py-2.5 text-[12px]">
      <p className="font-semibold uppercase tracking-wide text-oak-dark">Customer Price</p>

      {item.sellingPriceStatus === "NOT_CONFIGURED" ? (
        <p className="font-semibold text-charcoal">NOT CONFIGURED</p>
      ) : (
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
          <dt className="font-medium text-charcoal-soft">Selling Price</dt>
          <dd className="font-medium text-charcoal">{formatCentsAsCurrency(item.sellingPriceCents)}</dd>
          <dt className="text-charcoal-soft">Method</dt>
          <dd className="text-charcoal">{item.sellingPriceMethod ? (METHOD_LABELS[item.sellingPriceMethod] ?? item.sellingPriceMethod) : "—"}</dd>
          {item.sellingPriceMethod === "CASH_CREDIT_FORMULA" && item.currentCashCreditSnapshot?.status === "SUCCESS" && (
            <>
              <dt className="text-charcoal-soft">Cash / Check / ACH Price</dt>
              <dd className="text-charcoal">{formatCentsAsCurrency(item.currentCashCreditSnapshot.cashPriceCents)}</dd>
              <dt className="text-charcoal-soft">Credit Card Price</dt>
              <dd className="text-charcoal">{formatCentsAsCurrency(item.currentCashCreditSnapshot.creditCardPriceCents)}</dd>
            </>
          )}
          {item.sellingPriceMethod === "MANUAL" && (
            <>
              <dt className="text-charcoal-soft">Set By</dt>
              <dd className="text-charcoal">{item.sellingPriceSetByName ?? "—"}</dd>
              <dt className="text-charcoal-soft">Reason</dt>
              <dd className="text-charcoal">{item.sellingPriceReason ?? "—"}</dd>
            </>
          )}
          <dt className="text-charcoal-soft">Gross Profit</dt>
          <dd className={item.profitability.grossProfitCents === null ? "font-medium text-amber-700" : "text-charcoal"}>
            {formatProfitCents(item.profitability.grossProfitCents)}
          </dd>
          <dt className="text-charcoal-soft">Gross Margin</dt>
          <dd className={item.profitability.grossMarginBps === null ? "font-medium text-amber-700" : "text-charcoal"}>
            {formatMarginBps(item.profitability.grossMarginBps)}
          </dd>
        </dl>
      )}

      {!showManualForm ? (
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={() => setShowManualForm(true)} className="text-[11px] font-medium text-oak-dark hover:underline">
            Set manual price
          </button>
          {item.sellingPriceStatus === "SET" && (
            <button type="button" onClick={handleClear} disabled={isPending} className="text-[11px] font-medium text-charcoal-soft hover:underline">
              Clear
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={handleSetManual} className="space-y-2 border-t border-oak/20 pt-2">
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium text-charcoal-soft">Price ($)</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={manualPrice}
                onChange={(e) => setManualPrice(e.target.value)}
                className="w-full rounded-sm border border-charcoal/20 bg-warm-white px-2 py-1 text-[12px]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-medium text-charcoal-soft">Reason (required)</span>
              <input
                type="text"
                required
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                className="w-full rounded-sm border border-charcoal/20 bg-warm-white px-2 py-1 text-[12px]"
              />
            </label>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isPending}
              className="rounded-sm bg-matte-black px-3 py-1 text-[11px] font-medium text-warm-white disabled:opacity-50"
            >
              {isPending ? "Saving…" : "Save Manual Price"}
            </button>
            <button type="button" onClick={() => setShowManualForm(false)} className="text-[11px] text-charcoal-soft hover:underline">
              Cancel
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
