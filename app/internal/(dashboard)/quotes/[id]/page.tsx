import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { getQuoteWithDetails } from "@/lib/quotes/quotes";
import { prisma } from "@/lib/db/prisma";
import { toLineItemDTO } from "@/lib/quotes/dto";
import { getKnownAddOnCostsCents } from "@/lib/quotes/fixedPriceOptions";
import { calculateQuoteTotals } from "@/lib/quotes/totals";
import { calculateQuoteInstallerMinimum } from "@/lib/quotes/installationPricing";
import { QuoteEditor } from "@/components/internal/quotes/QuoteEditor";
import type { QuoteHeaderDefaults } from "@/components/internal/quotes/QuoteHeaderForm";

export const metadata: Metadata = {
  title: "Edit Quote",
  robots: { index: false, follow: false },
};

/** bps/cents -> a plain decimal string for a form's number input, e.g. 825 -> "8.25". Null -> "". */
function centsOrBpsToDisplayValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return (value / 100).toString();
}

function toDateInputValue(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default async function QuoteEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireInternalUser();
  const { id } = await params;

  const quote = await getQuoteWithDetails(id);
  if (!quote) notFound();

  const [products, fabrics, colors, fixedPriceOptions, knownAddOnCostsCents] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.fabric.findMany({ where: { active: true }, orderBy: { sourceName: "asc" } }),
    prisma.color.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    // All statuses, not just ACTIVE — a PENDING_VERIFICATION/INACTIVE option
    // still needs to be visible in the UI (clearly labeled), just excluded
    // from getKnownAddOnCostsCents()'s automatic-cost lookup below.
    prisma.fixedPriceOption.findMany({ orderBy: { name: "asc" } }),
    getKnownAddOnCostsCents(),
  ]);

  const lineItems = quote.lineItems.map((li) => toLineItemDTO(li, knownAddOnCostsCents));
  const installerMinimum = await calculateQuoteInstallerMinimum(quote.id);

  const configuredSellingPrices = lineItems.filter((li) => li.sellingPriceStatus === "SET").map((li) => li.sellingPriceCents!);
  const unconfiguredCount = lineItems.length - configuredSellingPrices.length;
  // The installer minimum trip fee (see docs/business-rules.md) is a
  // quote-level charge, not tied to any one line item — its own Cash
  // Price contribution (already run through the standard markup formula)
  // is added into the subtotal the same way a priced line item's is.
  const totals = calculateQuoteTotals({
    lineItemSellingPricesCents: installerMinimum.applies
      ? [...configuredSellingPrices, installerMinimum.cashPriceCents!]
      : configuredSellingPrices,
    discountType: quote.discountType,
    discountValue: quote.discountValue,
    taxRateBps: quote.taxRateBps,
    depositType: quote.depositType,
    depositValue: quote.depositValue,
    depositPaidCents: quote.depositPaidCents,
  });

  const headerDefaults: QuoteHeaderDefaults = {
    quoteNumber: quote.quoteNumber,
    quoteDate: toDateInputValue(quote.quoteDate),
    status: quote.status,
    notes: quote.notes,
    discountType: quote.discountType,
    discountValue: centsOrBpsToDisplayValue(quote.discountValue),
    taxRatePercent: centsOrBpsToDisplayValue(quote.taxRateBps),
    depositType: quote.depositType,
    depositValue: centsOrBpsToDisplayValue(quote.depositValue),
    depositPaid: centsOrBpsToDisplayValue(quote.depositPaidCents),
    customerName: quote.customer.name,
    customerId: quote.customer.id,
  };

  return (
    <div>
      <p className="eyebrow mb-2">Internal — Quote {quote.quoteNumber}</p>
      <h1 className="mb-6 font-display text-3xl text-charcoal">{quote.customer.name}</h1>

      <QuoteEditor
        quoteId={quote.id}
        headerDefaults={headerDefaults}
        initialLineItems={lineItems}
        products={products.map((p) => ({ id: p.id, name: p.name, productType: p.productType }))}
        fabrics={fabrics.map((f) => ({ id: f.id, sourceName: f.sourceName, productId: f.productId }))}
        colors={colors.map((c) => ({ id: c.id, name: c.name, fabricId: c.fabricId }))}
        fixedPriceOptions={fixedPriceOptions.map((o) => ({ id: o.id, name: o.name, category: o.category, costCents: o.costCents, status: o.status }))}
        totals={totals}
        unconfiguredSellingPriceCount={unconfiguredCount}
        installerMinimum={installerMinimum}
      />
    </div>
  );
}
