import Link from "next/link";
import { createQuoteAction, createSampleQuoteAction } from "../actions";
import { StatusPill } from "@/components/quote/StatusPill";
import { toAdminQuote } from "@/lib/quotes/admin";
import { formatDate } from "@/lib/quotes/format";
import { formatCents } from "@/lib/quotes/money";
import { listQuotes } from "@/lib/quotes/service";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminHome({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
  const { view } = await searchParams;
  const showArchived = view === "archived";
  const all = (await listQuotes()).map(toAdminQuote);
  const quotes = all.filter((q) => q.archived === showArchived);

  return (
    <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-bt-green">Quotes</h1>
        <div className="ml-auto flex flex-wrap gap-2">
          <form action={createSampleQuoteAction}>
            <button className="min-h-10 rounded-sm border border-bt-green/40 px-4 text-sm font-medium text-bt-green hover:bg-bt-green/5">Add sample quote</button>
          </form>
          <form action={createQuoteAction}>
            <button className="min-h-10 rounded-sm bg-bt-green px-4 text-sm font-semibold text-bt-cream hover:bg-bt-green-deep">+ New quote</button>
          </form>
        </div>
      </div>

      <div className="mt-4 flex gap-4 border-b border-charcoal/10 text-sm">
        {[
          ["Active", "/admin", !showArchived],
          ["Archived", "/admin?view=archived", showArchived],
        ].map(([label, href, active]) => (
          <Link
            key={String(label)}
            href={String(href)}
            className={cn("-mb-px border-b-2 px-1 pb-2", active ? "border-bt-gold font-semibold text-bt-green" : "border-transparent text-charcoal-soft")}
          >
            {label} ({all.filter((q) => q.archived === (label === "Archived")).length})
          </Link>
        ))}
      </div>

      {quotes.length === 0 ? (
        <div className="mt-10 rounded-md border border-dashed border-charcoal/20 bg-white/60 p-10 text-center text-charcoal-soft">
          {showArchived ? "No archived quotes." : "No quotes yet. Click “+ New quote” to create your first one, or add a sample to explore."}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-charcoal/10 overflow-hidden rounded-md border border-charcoal/10 bg-white">
          {quotes.map((q) => {
            const t = q.publishedTotals;
            const c = q.draft;
            return (
              <li key={q.id}>
                <Link href={`/admin/quotes/${q.id}`} className="grid gap-2 px-4 py-3.5 hover:bg-bt-cream sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-center sm:gap-6">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-charcoal">
                      {c.projectName || "Untitled quote"} {c.isSample && <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">SAMPLE</span>}
                    </p>
                    <p className="truncate text-[13px] text-charcoal-soft">
                      {q.number} · {c.customer.name || "No customer yet"} · {formatDate(c.quoteDate)}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill status={q.status} label={q.statusLabel} />
                    {q.openChangeRequests > 0 && (
                      <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {q.openChangeRequests} change request{q.openChangeRequests > 1 ? "s" : ""}
                      </span>
                    )}
                    {q.published && q.hasUnpublishedChanges && <span className="text-[11px] text-charcoal-soft">• unpublished edits</span>}
                  </div>
                  <div className="text-[13px] tabular-nums sm:text-right">
                    {t ? (
                      <>
                        <p className="font-semibold">{formatCents(t.totalCents)}</p>
                        <p className="text-charcoal-soft">Balance {formatCents(Math.max(0, t.remainingCents))}</p>
                      </>
                    ) : (
                      <p className="text-charcoal-soft">Not published</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
