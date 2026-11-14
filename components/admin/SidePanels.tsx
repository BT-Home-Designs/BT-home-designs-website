"use client";

import { Check, Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useState, useSyncExternalStore } from "react";
import { addPaymentAction, deletePaymentAction, resolveChangeRequestAction, updatePaymentAction, type ActionResult } from "@/app/admin/actions";
import type { AdminQuote } from "@/lib/quotes/admin";
import { formatDate, formatDateTime } from "@/lib/quotes/format";
import { centsToInput, formatCents } from "@/lib/quotes/money";
import { cn } from "@/lib/utils";
import { SmallButton, inputCls } from "./fields";

type Act = (fn: () => Promise<ActionResult>) => void;

function Panel({ title, children, badge }: { title: string; children: React.ReactNode; badge?: React.ReactNode }) {
  return (
    <section className="rounded-md border border-charcoal/10 bg-white p-4">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg text-bt-green">
        {title} {badge}
      </h2>
      {children}
    </section>
  );
}

const emailNote: Record<string, string> = {
  sent: "email sent",
  not_configured: "email not configured",
  failed: "email failed (saved anyway)",
  pending: "email pending",
};

export function LinkPanel({ quote, pending, onRevoke, onNewLink }: { quote: AdminQuote; pending: boolean; onRevoke: () => void; onNewLink: () => void }) {
  const [copied, setCopied] = useState(false);
  const live = Boolean(quote.published) && !quote.archived && !quote.linkRevoked;
  const origin = useSyncExternalStore(
    () => () => {},
    () => window.location.origin,
    () => ""
  );
  const url = `${origin}/q/${quote.token}`;
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt("Copy this link:", url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <Panel title="Customer link">
      {!quote.published ? (
        <p className="text-sm text-charcoal-soft">Publish the quote to activate its private link. Drafts are never visible to customers.</p>
      ) : quote.archived ? (
        <p className="text-sm text-charcoal-soft">Archived — the link is disabled. Unarchive to re-enable it.</p>
      ) : quote.linkRevoked ? (
        <p className="text-sm text-red-700">This link has been revoked. Create a new link to share the quote again.</p>
      ) : null}
      {live && (
        <>
          <div className="flex gap-2">
            <input readOnly value={url} aria-label="Private customer link" onFocus={(e) => e.target.select()} className={cn(inputCls, "min-w-0 flex-1 text-[12px]")} />
            <SmallButton tone="primary" onClick={copy} title="Copy link">
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
            </SmallButton>
          </div>
          <p className="mt-1.5 text-[12px] text-charcoal-soft">Private and unguessable. Anyone with this link can view this quote, so send it only to your customer.</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <a href={url} target="_blank" rel="noopener" className="inline-flex min-h-8 items-center gap-1 rounded-sm border border-charcoal/15 px-2.5 text-[12px] hover:bg-charcoal/5">
              <ExternalLink className="h-3.5 w-3.5" /> Open as customer
            </a>
            <SmallButton tone="danger" disabled={pending} onClick={() => confirm("Revoke this link? The customer will no longer be able to open the quote with it.") && onRevoke()}>
              Revoke link
            </SmallButton>
          </div>
        </>
      )}
      {quote.published && !quote.archived && (
        <SmallButton className="mt-2" disabled={pending} onClick={() => confirm("Create a brand-new private link? The current link will stop working.") && onNewLink()}>
          Create new link
        </SmallButton>
      )}
    </Panel>
  );
}

export function ChangeRequestsPanel({ quote, pending, act }: { quote: AdminQuote; pending: boolean; act: Act }) {
  const list = [...quote.changeRequests].reverse();
  return (
    <Panel title="Change requests" badge={quote.openChangeRequests > 0 && <span className="rounded-full bg-amber-500 px-2 py-0.5 font-sans text-[11px] font-bold text-white">{quote.openChangeRequests} open</span>}>
      {list.length === 0 ? (
        <p className="text-sm text-charcoal-soft">None yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((c) => (
            <li key={c.id} className={cn("rounded-sm border p-3 text-sm", c.resolvedAt ? "border-charcoal/10 opacity-70" : "border-amber-300 bg-amber-50")}>
              <p className="text-[12px] text-charcoal-soft">
                <strong className="text-charcoal">{c.name}</strong> · {formatDateTime(c.at)} · v{c.version} · {emailNote[c.emailStatus]}
              </p>
              <p className="mt-1 whitespace-pre-line">{c.message}</p>
              <SmallButton className="mt-2" disabled={pending} onClick={() => act(() => resolveChangeRequestAction(quote.id, c.id, !c.resolvedAt))}>
                {c.resolvedAt ? "Reopen" : "Mark resolved"}
              </SmallButton>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

export function ApprovalsPanel({ quote }: { quote: AdminQuote }) {
  const list = [...quote.approvals].reverse();
  return (
    <Panel title="Approvals">
      {list.length === 0 ? (
        <p className="text-sm text-charcoal-soft">Not approved yet.</p>
      ) : (
        <ul className="space-y-3">
          {list.map((a) => (
            <li key={a.id} className={cn("rounded-sm border p-3 text-sm", a.supersededAt ? "border-charcoal/10 bg-charcoal/[0.03]" : "border-bt-green/30 bg-bt-green/5")}>
              <p className="font-semibold text-bt-green">
                {a.supersededAt ? "Superseded approval" : "Current approval"} — {a.name}
              </p>
              <p className="text-[12px] text-charcoal-soft">
                {formatDateTime(a.at)} · version {a.version} · total {formatCents(a.totals.totalCents)} · deposit {formatCents(a.totals.depositCents)} · {emailNote[a.emailStatus]}
              </p>
              {a.supersededAt && <p className="text-[12px] text-amber-800">Replaced by changes published in v{a.supersededByVersion} on {formatDateTime(a.supersededAt)}.</p>}
              <details className="mt-1.5 text-[12px]">
                <summary className="cursor-pointer text-bt-green">Exactly what was approved</summary>
                <div className="mt-2 space-y-2 text-charcoal-soft">
                  <ul className="space-y-0.5">
                    {a.lineItems.map((l) => (
                      <li key={l.id}>
                        {l.room ? `${l.room}: ` : ""}
                        {l.description} — {l.quantity} × {formatCents(l.unitPriceCents)}
                      </li>
                    ))}
                  </ul>
                  <p>
                    Subtotal {formatCents(a.totals.subtotalCents)} · tax ({a.taxRatePercent}%) {formatCents(a.totals.taxCents)}
                  </p>
                  {a.terms.map((t) => (
                    <div key={t.id}>
                      <p className="font-semibold text-charcoal">{t.title}</p>
                      <p className="whitespace-pre-line">{t.body}</p>
                    </div>
                  ))}
                  {a.approvalStatement && <p className="italic">“{a.approvalStatement}”</p>}
                  <p>
                    IP {a.ipAddress} · {a.userAgent.slice(0, 80)}
                  </p>
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  );
}

function today() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date());
}

export function PaymentsPanel({ quote, pending, act }: { quote: AdminQuote; pending: boolean; act: Act }) {
  const [form, setForm] = useState({ date: today(), amount: "", note: "" });
  const [editing, setEditing] = useState<string | null>(null);
  const [edit, setEdit] = useState({ date: "", amount: "", note: "" });
  const total = quote.publishedTotals;
  const paid = quote.payments.reduce((s, p) => s + p.amountCents, 0);

  return (
    <Panel title="Payments">
      <p className="mb-3 text-[12px] leading-snug text-charcoal-soft">
        Record payments here only after Square confirms them. The customer&apos;s remaining balance is calculated from these entries.
      </p>
      {total && (
        <p className="mb-3 text-sm tabular-nums">
          Paid <strong>{formatCents(paid)}</strong> of {formatCents(total.totalCents)} · Balance <strong>{formatCents(Math.max(0, total.remainingCents))}</strong>
          {total.remainingCents < 0 && <span className="ml-1 text-red-700">(overpaid by {formatCents(-total.remainingCents)})</span>}
        </p>
      )}
      <ul className="mb-3 space-y-2">
        {quote.payments.map((p) =>
          editing === p.id ? (
            <li key={p.id} className="space-y-2 rounded-sm border border-bt-gold/50 p-2">
              <PaymentFields value={edit} onChange={setEdit} />
              <div className="flex gap-2">
                <SmallButton
                  tone="primary"
                  disabled={pending}
                  onClick={() => {
                    act(() => updatePaymentAction(quote.id, p.id, edit));
                    setEditing(null);
                  }}
                >
                  Save
                </SmallButton>
                <SmallButton onClick={() => setEditing(null)}>Cancel</SmallButton>
              </div>
            </li>
          ) : (
            <li key={p.id} className="flex items-start gap-2 rounded-sm border border-charcoal/10 p-2 text-sm">
              <div className="min-w-0 flex-1">
                <p className="tabular-nums">
                  <strong>{formatCents(p.amountCents)}</strong> · {formatDate(p.date)}
                </p>
                {p.note && <p className="text-[12px] text-charcoal-soft">{p.note}</p>}
              </div>
              <SmallButton
                title="Edit payment"
                className="border-0 px-1.5"
                onClick={() => {
                  setEditing(p.id);
                  setEdit({ date: p.date, amount: centsToInput(p.amountCents), note: p.note });
                }}
              >
                <Pencil className="h-3.5 w-3.5" />
              </SmallButton>
              <SmallButton tone="danger" title="Remove payment" className="px-1.5" disabled={pending} onClick={() => confirm("Remove this payment record?") && act(() => deletePaymentAction(quote.id, p.id))}>
                <Trash2 className="h-3.5 w-3.5" />
              </SmallButton>
            </li>
          )
        )}
      </ul>
      <form
        className="space-y-2 rounded-sm bg-bt-cream p-3"
        onSubmit={(e) => {
          e.preventDefault();
          act(() => addPaymentAction(quote.id, form));
          setForm({ date: today(), amount: "", note: "" });
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-soft">Record a confirmed payment</p>
        <PaymentFields value={form} onChange={setForm} />
        <button type="submit" disabled={pending || !form.amount} className="min-h-9 rounded-sm bg-bt-green px-3.5 text-[13px] font-semibold text-bt-cream disabled:opacity-40">
          Record payment
        </button>
      </form>
    </Panel>
  );
}

function PaymentFields({ value, onChange }: { value: { date: string; amount: string; note: string }; onChange: (v: { date: string; amount: string; note: string }) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <input type="date" aria-label="Payment date" value={value.date} onChange={(e) => onChange({ ...value, date: e.target.value })} className={inputCls} required />
      <div className="relative">
        <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-soft">$</span>
        <input aria-label="Payment amount" inputMode="decimal" placeholder="0.00" value={value.amount} onChange={(e) => onChange({ ...value, amount: e.target.value })} className={cn(inputCls, "pl-6 tabular-nums")} required />
      </div>
      <input aria-label="Payment note" placeholder="Note (e.g. Square invoice #1043, deposit)" value={value.note} onChange={(e) => onChange({ ...value, note: e.target.value })} className={cn(inputCls, "col-span-2")} />
    </div>
  );
}

export function ActivityPanel({ quote }: { quote: AdminQuote }) {
  return (
    <Panel title="Activity">
      <details>
        <summary className="cursor-pointer text-sm text-bt-green">Show history ({quote.events.length})</summary>
        <ul className="mt-2 space-y-1.5 text-[12px]">
          {[...quote.events].reverse().map((e, i) => (
            <li key={i}>
              <span className="text-charcoal-soft">{formatDateTime(e.at)}</span> — {e.message}
            </li>
          ))}
        </ul>
      </details>
    </Panel>
  );
}
