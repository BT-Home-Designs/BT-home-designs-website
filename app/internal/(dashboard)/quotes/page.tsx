import type { Metadata } from "next";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { listQuotes } from "@/lib/quotes/quotes";

export const metadata: Metadata = {
  title: "Quotes",
  robots: { index: false, follow: false },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  ACCEPTED: "Accepted",
  DEPOSIT_PAID: "Deposit Paid",
  ORDERED: "Ordered",
  IN_PRODUCTION: "In Production",
  READY_FOR_INSTALLATION: "Ready for Installation",
  INSTALLED: "Installed",
  PAID_IN_FULL: "Paid in Full",
  CANCELLED: "Cancelled",
};

export default async function QuotesPage() {
  await requireInternalUser();
  const quotes = await listQuotes();

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Internal</p>
          <h1 className="font-display text-3xl text-charcoal">Quotes</h1>
        </div>
        <Link
          href="/internal/quotes/new"
          className="rounded-sm bg-matte-black px-5 py-2.5 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90"
        >
          New Quote
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto rounded-sm border border-charcoal/10">
        <table className="w-full min-w-[720px] text-left text-[13px]">
          <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-charcoal-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Quote #</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Quote Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Last Updated</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {quotes.map((quote) => (
              <tr key={quote.id} className="hover:bg-cream/30">
                <td className="px-4 py-3 font-medium text-charcoal">{quote.quoteNumber}</td>
                <td className="px-4 py-3 text-charcoal-soft">{quote.customer.name}</td>
                <td className="px-4 py-3 text-charcoal-soft">{quote.quoteDate.toLocaleDateString("en-US")}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-cream px-2.5 py-1 text-[11px] font-medium text-charcoal-soft">
                    {STATUS_LABELS[quote.status] ?? quote.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{quote.updatedAt.toLocaleString("en-US")}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/internal/quotes/${quote.id}`} className="font-medium text-oak-dark hover:underline">
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {quotes.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-charcoal-soft">
                  No quotes yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
