"use client";

import { useState, useTransition } from "react";
import type { LineItemDTO } from "@/lib/quotes/dto";
import type { QuoteTotalsResult } from "@/lib/quotes/totals";
import { LineItemCard, type ProductOption, type FabricOption, type ColorOption } from "./LineItemCard";
import { QuoteHeaderForm, type QuoteHeaderDefaults } from "./QuoteHeaderForm";
import { QuoteTotalsSummary } from "./QuoteTotalsSummary";
import { addLineItemAction, updateQuoteHeaderAction } from "@/app/internal/(dashboard)/quotes/[id]/actions";

export function QuoteEditor({
  quoteId,
  headerDefaults,
  initialLineItems,
  products,
  fabrics,
  colors,
  totals,
  unconfiguredSellingPriceCount,
}: {
  quoteId: string;
  headerDefaults: QuoteHeaderDefaults;
  initialLineItems: LineItemDTO[];
  products: ProductOption[];
  fabrics: FabricOption[];
  colors: ColorOption[];
  totals: QuoteTotalsResult;
  unconfiguredSellingPriceCount: number;
}) {
  const [lineItems, setLineItems] = useState<LineItemDTO[]>(initialLineItems);
  const [isAdding, startAddTransition] = useTransition();
  const [addError, setAddError] = useState<string | null>(null);

  function handleAddLineItem() {
    setAddError(null);
    startAddTransition(async () => {
      try {
        const created = await addLineItemAction(quoteId);
        setLineItems((prev) => [...prev, created]);
      } catch (err) {
        setAddError(err instanceof Error ? err.message : "Failed to add line item.");
      }
    });
  }

  function handleSaved(updated: LineItemDTO) {
    setLineItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  }

  function handleDeleted(id: string) {
    setLineItems((prev) => prev.filter((item) => item.id !== id));
  }

  function handleReplaceAll(all: LineItemDTO[]) {
    setLineItems(all);
  }

  const updateHeaderAction = updateQuoteHeaderAction.bind(null, quoteId);

  return (
    <div className="space-y-8">
      <QuoteHeaderForm action={updateHeaderAction} defaults={headerDefaults} />

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl text-charcoal">
            Line Items <span className="text-[13px] font-normal text-charcoal-soft">({lineItems.length})</span>
          </h2>
          <button
            type="button"
            onClick={handleAddLineItem}
            disabled={isAdding}
            className="rounded-sm bg-matte-black px-4 py-2 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isAdding ? "Adding…" : "+ Add Line Item"}
          </button>
        </div>
        {addError && (
          <p role="alert" className="mb-3 text-[12px] text-red-700">
            {addError}
          </p>
        )}

        <div className="space-y-4">
          {lineItems.map((item, index) => (
            <LineItemCard
              key={item.id}
              item={item}
              quoteId={quoteId}
              index={index}
              isFirst={index === 0}
              isLast={index === lineItems.length - 1}
              products={products}
              fabrics={fabrics}
              colors={colors}
              onSaved={handleSaved}
              onDeleted={handleDeleted}
              onDuplicated={handleReplaceAll}
              onReordered={handleReplaceAll}
            />
          ))}
          {lineItems.length === 0 && (
            <div className="rounded-sm border border-dashed border-charcoal/20 px-4 py-10 text-center text-[13px] text-charcoal-soft">
              No line items yet. Add the first window treatment above.
            </div>
          )}
        </div>
      </div>

      {lineItems.length > 0 && <QuoteTotalsSummary totals={totals} unconfiguredCount={unconfiguredSellingPriceCount} />}
    </div>
  );
}
