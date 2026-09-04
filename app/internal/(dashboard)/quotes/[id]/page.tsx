import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { getQuoteWithDetails } from "@/lib/quotes/quotes";
import { prisma } from "@/lib/db/prisma";
import { toLineItemDTO } from "@/lib/quotes/dto";
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

  const [products, fabrics, colors] = await Promise.all([
    prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.fabric.findMany({ where: { active: true }, orderBy: { sourceName: "asc" } }),
    prisma.color.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

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
        initialLineItems={quote.lineItems.map(toLineItemDTO)}
        products={products.map((p) => ({ id: p.id, name: p.name, productType: p.productType }))}
        fabrics={fabrics.map((f) => ({ id: f.id, sourceName: f.sourceName, productId: f.productId }))}
        colors={colors.map((c) => ({ id: c.id, name: c.name, fabricId: c.fabricId }))}
      />
    </div>
  );
}
