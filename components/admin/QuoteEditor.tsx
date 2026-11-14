"use client";

import { ArrowDown, ArrowUp, Check, ChevronLeft, Copy, ExternalLink, Eye, FileDown, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  publishAction,
  revokeLinkAction,
  newLinkAction,
  saveDraftAction,
  setArchivedAction,
  duplicateQuoteAction,
  type ActionResult,
} from "@/app/admin/actions";
import { StatusPill } from "@/components/quote/StatusPill";
import type { AdminQuote } from "@/lib/quotes/admin";
import { isValidSquareUrl } from "@/lib/quotes/links";
import { formatCents, lineTotalCents } from "@/lib/quotes/money";
import { computeTotals, scopeFingerprint } from "@/lib/quotes/totals";
import type { LineItem, PaymentLink, QuoteContent } from "@/lib/quotes/types";
import { cn } from "@/lib/utils";
import { Card, Field, MoneyInput, NumberInput, SmallButton, TextArea, TextInput, inputCls, move, uid } from "./fields";
import { PagesEditor } from "./PagesEditor";
import { ActivityPanel, ApprovalsPanel, ChangeRequestsPanel, LinkPanel, PaymentsPanel } from "./SidePanels";

export function QuoteEditor({ initial }: { initial: AdminQuote }) {
  const router = useRouter();
  const [quote, setQuote] = useState(initial);
  const [content, setContent] = useState<QuoteContent>(initial.draft);
  const [saved, setSaved] = useState(JSON.stringify(initial.draft));
  const [notice, setNotice] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const dirty = JSON.stringify(content) !== saved;
  const set = <K extends keyof QuoteContent>(key: K, value: QuoteContent[K]) => setContent((c) => ({ ...c, [key]: value }));

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  /** Apply a server result. Keeps local edits unless the action replaced the draft. */
  const apply = (res: ActionResult, replaceDraft = false) => {
    if (!res.ok) {
      setNotice({ tone: "error", text: res.error });
      return false;
    }
    setQuote(res.quote);
    if (replaceDraft) {
      setContent(res.quote.draft);
      setSaved(JSON.stringify(res.quote.draft));
    }
    if (res.message) setNotice({ tone: "ok", text: res.message });
    return true;
  };

  const act = (fn: () => Promise<ActionResult>, replaceDraft = false) =>
    startTransition(async () => {
      apply(await fn(), replaceDraft);
    });

  const save = () => act(() => saveDraftAction(quote.id, content), true);

  const scopeChanged = quote.published ? scopeFingerprint(content) !== scopeFingerprint(quote.published.content) : false;
  const publish = () => {
    if (quote.isApprovedCurrent && scopeChanged) {
      const ok = confirm(
        "This quote is already approved. You changed pricing, scope, or terms, so publishing will require the customer to approve again.\n\nThe earlier approval stays in the history. Publish anyway?"
      );
      if (!ok) return;
    }
    act(() => publishAction(quote.id, content), true);
  };

  const preview = () =>
    startTransition(async () => {
      if (dirty) {
        const res = await saveDraftAction(quote.id, content);
        if (!apply(res, true)) return;
      }
      window.open(`/admin/preview/${quote.id}`, "_blank", "noopener");
    });

  const paid = quote.payments.reduce((s, p) => s + p.amountCents, 0);
  const totals = useMemo(() => computeTotals(content, paid), [content, paid]);
  const internalCost = content.lineItems.reduce((s, i) => s + (i.internalCostCents ?? 0), 0);
  const hasCosts = content.lineItems.some((i) => i.internalCostCents !== null);

  return (
    <div>
      {/* Sticky action bar */}
      <div className="sticky top-0 z-30 border-b border-charcoal/10 bg-[#f4f1ea]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center gap-2 px-4 py-2.5 sm:px-6">
          <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-charcoal-soft hover:text-bt-green">
            <ChevronLeft className="h-4 w-4" /> Quotes
          </Link>
          <span className="font-display text-lg text-bt-green">{quote.number}</span>
          <StatusPill status={quote.status} label={quote.statusLabel} />
          {content.isSample && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">SAMPLE</span>}
          <span className="text-[12px] text-charcoal-soft">
            {dirty ? "● Unsaved changes" : quote.published ? (quote.hasUnpublishedChanges ? `Saved · unpublished edits (live: v${quote.published.version})` : `Published v${quote.published.version}`) : "Saved draft · not published"}
          </span>
          <div className="ml-auto flex flex-wrap gap-2">
            <BarButton onClick={save} disabled={pending || !dirty}>
              Save draft
            </BarButton>
            <BarButton onClick={preview} disabled={pending}>
              <Eye className="h-4 w-4" /> Preview
            </BarButton>
            <BarButton onClick={publish} disabled={pending || quote.archived} primary>
              {quote.published ? "Publish update" : "Publish"}
            </BarButton>
          </div>
        </div>
        {notice && (
          <div className={cn("px-4 py-2 text-center text-sm", notice.tone === "ok" ? "bg-bt-green text-bt-cream" : "bg-red-700 text-white")} role={notice.tone === "error" ? "alert" : "status"}>
            {notice.text}
            <button type="button" className="ml-3 underline" onClick={() => setNotice(null)}>
              Dismiss
            </button>
          </div>
        )}
        {quote.isApprovedCurrent && scopeChanged && (
          <div className="bg-amber-100 px-4 py-1.5 text-center text-[13px] text-amber-900">
            Heads up: your edits change pricing/scope/terms of an approved quote. Publishing will require a new customer approval.
          </div>
        )}
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_400px]">
        {/* Main editing column */}
        <div className="min-w-0 space-y-5">
          <Card id="customer" title="Customer & project">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Customer name">
                <TextInput value={content.customer.name} onChange={(v) => set("customer", { ...content.customer, name: v })} />
              </Field>
              <Field label="Project name (cover title)">
                <TextInput value={content.projectName} onChange={(v) => set("projectName", v)} placeholder="e.g. Little Elm Residence" />
              </Field>
              <Field label="Customer email" hint="Owner-only. Not shown on the quote.">
                <TextInput type="email" value={content.customer.email} onChange={(v) => set("customer", { ...content.customer, email: v })} />
              </Field>
              <Field label="Customer phone" hint="Owner-only. Not shown on the quote.">
                <TextInput type="tel" value={content.customer.phone} onChange={(v) => set("customer", { ...content.customer, phone: v })} />
              </Field>
              <Field label="Project address" className="sm:col-span-2">
                <TextInput value={content.customer.address} onChange={(v) => set("customer", { ...content.customer, address: v })} />
              </Field>
              <Field label="Cover subtitle">
                <TextInput value={content.coverTitle} onChange={(v) => set("coverTitle", v)} placeholder="e.g. Custom Drapery Quote" />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Quote date">
                  <input type="date" value={content.quoteDate} onChange={(e) => set("quoteDate", e.target.value)} className={inputCls} />
                </Field>
                <Field label="Expires">
                  <input type="date" value={content.expirationDate} onChange={(e) => set("expirationDate", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <Field label="Cover introduction" className="sm:col-span-2">
                <TextArea value={content.intro} onChange={(v) => set("intro", v)} rows={3} />
              </Field>
              <Field label="Cover photo" className="sm:col-span-2" hint="Pick any photo you've added to a design page.">
                <select value={content.coverPhotoId ?? ""} onChange={(e) => set("coverPhotoId", e.target.value || null)} className={inputCls}>
                  <option value="">No cover photo (show logo)</option>
                  {content.pages.flatMap((p, pi) =>
                    p.photos.map((ph, k) => (
                      <option key={`${ph.id}-${pi}-${k}`} value={ph.id}>
                        {p.title || `Page ${pi + 1}`} — photo {k + 1}
                        {ph.caption ? ` (${ph.caption})` : ""}
                      </option>
                    ))
                  )}
                </select>
              </Field>
            </div>
          </Card>

          <PagesEditor
            quoteId={quote.id}
            pages={content.pages}
            onChange={(pages) => set("pages", pages)}
            updatePages={(fn) => setContent((c) => ({ ...c, pages: fn(c.pages) }))}
          />

          <Card id="pricing" title="Line items & pricing" subtitle="Unit prices are what the customer pays. Internal cost is for your eyes only — it never appears on the customer page or PDF.">
            <LineItems items={content.lineItems} onChange={(v) => set("lineItems", v)} />
            <div className="mt-5 grid gap-4 border-t border-charcoal/10 pt-4 sm:grid-cols-2">
              <Field label="Sales tax rate (%)" hint="Applied to taxable lines.">
                <NumberInput value={content.taxRatePercent} onChange={(n) => set("taxRatePercent", n)} max={100} ariaLabel="Tax rate percent" />
              </Field>
              <div>
                <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-soft">Deposit required</span>
                <div className="flex gap-2">
                  <select
                    aria-label="Deposit type"
                    value={content.deposit.mode}
                    onChange={(e) => set("deposit", { ...content.deposit, mode: e.target.value === "amount" ? "amount" : "percent" })}
                    className={cn(inputCls, "w-36")}
                  >
                    <option value="percent">Percent</option>
                    <option value="amount">Dollar amount</option>
                  </select>
                  {content.deposit.mode === "percent" ? (
                    <div className="relative flex-1">
                      <NumberInput value={content.deposit.percent} onChange={(n) => set("deposit", { ...content.deposit, percent: n })} max={100} ariaLabel="Deposit percent" className="pr-7" />
                      <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal-soft">%</span>
                    </div>
                  ) : (
                    <MoneyInput className="flex-1" cents={content.deposit.amountCents} onChange={(c) => set("deposit", { ...content.deposit, amountCents: c ?? 0 })} ariaLabel="Deposit amount" />
                  )}
                </div>
                <span className="mt-1 block text-[12px] text-charcoal-soft">= {formatCents(totals.depositCents)} (set 0 for no deposit)</span>
              </div>
            </div>
          </Card>

          <Card id="payment-links" title="Square payment links" subtitle="Create the invoice or payment link in Square, then paste it here. Customers are sent to exactly this URL. Buttons only show for valid Square links (https on square.link, squareup.com, or square.site).">
            <div className="space-y-4">
              <PaymentLinkRow
                title="Deposit"
                link={content.paymentLinks.deposit}
                onChange={(l) => set("paymentLinks", { ...content.paymentLinks, deposit: l })}
                hint="Shown until recorded payments cover the deposit."
              />
              <PaymentLinkRow
                title="Full payment"
                link={content.paymentLinks.full}
                onChange={(l) => set("paymentLinks", { ...content.paymentLinks, full: l })}
                hint="Shown only while no payment has been recorded."
                copyFrom={content.paymentLinks.deposit.url}
              />
              <PaymentLinkRow
                title="Remaining balance"
                link={content.paymentLinks.balance}
                onChange={(l) => set("paymentLinks", { ...content.paymentLinks, balance: l })}
                hint="Shown after at least one payment is recorded and a balance remains."
                copyFrom={content.paymentLinks.deposit.url}
              />
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={content.requireApprovalBeforePayment}
                  onChange={(e) => set("requireApprovalBeforePayment", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--bt-green)]"
                />
                <span>Only show payment buttons after the customer approves the quote</span>
              </label>
              <p className="rounded-sm bg-bt-cream px-3 py-2 text-[12px] leading-snug text-charcoal-soft">
                Clicking a payment button never marks anything as paid. After Square confirms a payment, record it under <strong>Payments</strong> on the right — the customer&apos;s balance updates from what you record.
              </p>
            </div>
          </Card>

          <Card
            id="terms"
            title="Terms & approval"
            subtitle="Write your own payment terms, lead times, cancellation, and warranty language. Nothing is pre-filled — the customer agrees to exactly what you enter here."
          >
            <div className="space-y-3">
              {content.terms.map((t, i) => (
                <div key={t.id} className="rounded-sm border border-charcoal/10 p-3">
                  <div className="flex gap-2">
                    <TextInput aria-label="Section title" value={t.title} onChange={(v) => set("terms", content.terms.map((x, j) => (j === i ? { ...x, title: v } : x)))} placeholder="Section title (e.g. Payment & Order)" />
                    <SmallButton title="Move up" onClick={() => set("terms", move(content.terms, i, -1))} disabled={i === 0}>
                      <ArrowUp className="h-3.5 w-3.5" />
                    </SmallButton>
                    <SmallButton title="Move down" onClick={() => set("terms", move(content.terms, i, 1))} disabled={i === content.terms.length - 1}>
                      <ArrowDown className="h-3.5 w-3.5" />
                    </SmallButton>
                    <SmallButton tone="danger" title="Remove section" onClick={() => set("terms", content.terms.filter((_, j) => j !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </SmallButton>
                  </div>
                  <TextArea aria-label="Section text" className="mt-2" rows={4} value={t.body} onChange={(v) => set("terms", content.terms.map((x, j) => (j === i ? { ...x, body: v } : x)))} />
                </div>
              ))}
              <SmallButton onClick={() => set("terms", [...content.terms, { id: uid(), title: "", body: "" }])}>
                <Plus className="h-3.5 w-3.5" /> Add terms section
              </SmallButton>
              <Field label="Approval statement" hint="Shown next to the Approve button and saved with each approval.">
                <TextArea value={content.approvalStatement} onChange={(v) => set("approvalStatement", v)} rows={3} placeholder="e.g. By approving, the client approves the project specifications and authorizes…" />
              </Field>
            </div>
          </Card>

          <Card id="internal" title="Internal notes" subtitle="Private to you. Never shown to the customer.">
            <TextArea value={content.internalNotes} onChange={(v) => set("internalNotes", v)} rows={3} />
          </Card>

          <Card title="More actions">
            <div className="flex flex-wrap gap-2">
              <SmallButton
                onClick={() =>
                  startTransition(async () => {
                    const res = await duplicateQuoteAction(quote.id);
                    if (res.ok) router.push(`/admin/quotes/${res.quote.id}`);
                    else setNotice({ tone: "error", text: res.error });
                  })
                }
                disabled={pending || dirty}
                title={dirty ? "Save first" : undefined}
              >
                <Copy className="h-3.5 w-3.5" /> Duplicate quote
              </SmallButton>
              <SmallButton
                tone={quote.archived ? "default" : "danger"}
                onClick={() => (quote.archived || confirm("Archive this quote? Its customer link will stop working until you unarchive it.")) && act(() => setArchivedAction(quote.id, !quote.archived))}
                disabled={pending}
              >
                {quote.archived ? "Unarchive" : "Archive quote"}
              </SmallButton>
              <a href={`/api/admin/quotes/${quote.id}/pdf?draft=1`} target="_blank" rel="noopener" className="inline-flex min-h-8 items-center gap-1 rounded-sm border border-charcoal/15 px-2.5 text-[12px] font-medium hover:bg-charcoal/5">
                <FileDown className="h-3.5 w-3.5" /> PDF of saved draft
              </a>
            </div>
          </Card>
        </div>

        {/* Side column */}
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-[72px] xl:max-h-[calc(100dvh-88px)] xl:overflow-y-auto xl:pb-4">
          <section className="rounded-md bg-bt-green p-4 text-bt-cream">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-bt-gold-light">Draft totals</p>
            <dl className="mt-2 space-y-1 text-sm tabular-nums">
              <TotRow label="Subtotal" v={totals.subtotalCents} />
              <TotRow label={`Tax (${content.taxRatePercent}%)`} v={totals.taxCents} />
              <TotRow label="Total" v={totals.totalCents} strong />
              <TotRow label="Deposit required" v={totals.depositCents} />
              <TotRow label="Payments recorded" v={paid} />
              <TotRow label="Remaining balance" v={totals.remainingCents} strong />
            </dl>
            {hasCosts && (
              <p className="mt-3 border-t border-bt-cream/20 pt-2 text-[12px] text-bt-cream/80">
                Internal: cost {formatCents(internalCost)} · margin {formatCents(totals.subtotalCents - internalCost)}
                {totals.subtotalCents > 0 && ` (${Math.round(((totals.subtotalCents - internalCost) / totals.subtotalCents) * 100)}%)`}
              </p>
            )}
            {quote.publishedTotals && quote.publishedTotals.totalCents !== totals.totalCents && (
              <p className="mt-2 text-[12px] text-bt-gold-light">Customer currently sees total {formatCents(quote.publishedTotals.totalCents)} (published v{quote.published?.version}).</p>
            )}
          </section>
          <LinkPanel quote={quote} pending={pending} onRevoke={() => act(() => revokeLinkAction(quote.id))} onNewLink={() => act(() => newLinkAction(quote.id))} />
          <ChangeRequestsPanel quote={quote} pending={pending} act={act} />
          <ApprovalsPanel quote={quote} />
          <PaymentsPanel quote={quote} pending={pending} act={act} />
          <ActivityPanel quote={quote} />
        </aside>
      </div>
    </div>
  );
}

function BarButton({ children, onClick, disabled, primary }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; primary?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-9 items-center gap-1.5 rounded-sm px-3.5 text-[13px] font-semibold transition disabled:opacity-40",
        primary ? "bg-bt-green text-bt-cream hover:bg-bt-green-deep" : "border border-bt-green/30 bg-white text-bt-green hover:bg-bt-green/5"
      )}
    >
      {children}
    </button>
  );
}

function TotRow({ label, v, strong }: { label: string; v: number; strong?: boolean }) {
  return (
    <div className={cn("flex justify-between", strong && "font-semibold text-white")}>
      <dt>{label}</dt>
      <dd>{formatCents(v)}</dd>
    </div>
  );
}

function LineItems({ items, onChange }: { items: LineItem[]; onChange: (v: LineItem[]) => void }) {
  const upd = (i: number, patch: Partial<LineItem>) => onChange(items.map((x, j) => (j === i ? { ...x, ...patch } : x)));
  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="rounded-sm bg-bt-cream px-3 py-3 text-sm text-charcoal-soft">No line items yet.</p>}
      {items.map((item, i) => {
        const total = lineTotalCents(item.quantity, item.unitPriceCents);
        return (
          <div key={item.id} className="rounded-sm border border-charcoal/10 p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
              <Field label="Room">
                <TextInput value={item.room} onChange={(v) => upd(i, { room: v })} />
              </Field>
              <Field label="Description">
                <TextInput value={item.description} onChange={(v) => upd(i, { description: v })} />
              </Field>
            </div>
            <div className="mt-2 grid grid-cols-2 items-end gap-2 sm:grid-cols-[90px_minmax(0,1fr)_minmax(0,1fr)_auto_auto]">
              <Field label="Qty">
                <NumberInput value={item.quantity} onChange={(n) => upd(i, { quantity: n })} ariaLabel="Quantity" />
              </Field>
              <Field label="Unit price">
                <MoneyInput cents={item.unitPriceCents} onChange={(c) => upd(i, { unitPriceCents: c ?? 0 })} ariaLabel="Unit price" />
              </Field>
              <Field label="Internal cost (private)">
                <MoneyInput cents={item.internalCostCents} onChange={(c) => upd(i, { internalCostCents: c })} allowEmpty ariaLabel="Internal cost" />
              </Field>
              <label className="flex min-h-10 items-center gap-1.5 text-[13px]">
                <input type="checkbox" checked={item.taxable} onChange={(e) => upd(i, { taxable: e.target.checked })} className="h-4 w-4 accent-[var(--bt-green)]" />
                Taxable
              </label>
              <div className="flex min-h-10 items-center justify-end gap-1">
                <span className="mr-2 font-semibold tabular-nums">{formatCents(total)}</span>
                <SmallButton title="Move up" onClick={() => onChange(move(items, i, -1))} disabled={i === 0} className="border-0 px-1">
                  <ArrowUp className="h-3.5 w-3.5" />
                </SmallButton>
                <SmallButton title="Move down" onClick={() => onChange(move(items, i, 1))} disabled={i === items.length - 1} className="border-0 px-1">
                  <ArrowDown className="h-3.5 w-3.5" />
                </SmallButton>
                <SmallButton tone="danger" title="Remove line" onClick={() => onChange(items.filter((_, j) => j !== i))} className="px-1">
                  <Trash2 className="h-3.5 w-3.5" />
                </SmallButton>
              </div>
            </div>
          </div>
        );
      })}
      <SmallButton onClick={() => onChange([...items, { id: uid(), room: "", description: "", quantity: 1, unitPriceCents: 0, taxable: true, internalCostCents: null }])}>
        <Plus className="h-3.5 w-3.5" /> Add line item
      </SmallButton>
    </div>
  );
}

function PaymentLinkRow({ title, link, onChange, hint, copyFrom }: { title: string; link: PaymentLink; onChange: (l: PaymentLink) => void; hint: string; copyFrom?: string }) {
  const valid = isValidSquareUrl(link.url);
  return (
    <div className="rounded-sm border border-charcoal/10 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-bt-green">{title}</p>
        {link.url ? (
          valid ? (
            <span className="inline-flex items-center gap-1 text-[12px] text-bt-green">
              <Check className="h-3.5 w-3.5" /> Valid Square link
            </span>
          ) : (
            <span className="text-[12px] text-red-700">Not a valid https Square link — button will be hidden</span>
          )
        ) : (
          <span className="text-[12px] text-charcoal-soft">No link — button hidden</span>
        )}
        {copyFrom && isValidSquareUrl(copyFrom) && link.url !== copyFrom && (
          <SmallButton className="ml-auto" onClick={() => onChange({ ...link, url: copyFrom })}>
            Use the same link as the deposit
          </SmallButton>
        )}
      </div>
      <div className="mt-2 grid gap-2 sm:grid-cols-[minmax(0,3fr)_minmax(0,1fr)_auto]">
        <TextInput aria-label={`${title} Square URL`} value={link.url} onChange={(v) => onChange({ ...link, url: v })} placeholder="https://square.link/u/…" inputMode="url" />
        <TextInput aria-label={`${title} button label`} value={link.label} onChange={(v) => onChange({ ...link, label: v })} placeholder="Button label" />
        {valid ? (
          <a href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-1 rounded-sm border border-charcoal/15 px-2.5 text-[12px] hover:bg-charcoal/5" title="Open this link to check it">
            <ExternalLink className="h-3.5 w-3.5" /> Test
          </a>
        ) : (
          <span />
        )}
      </div>
      <p className="mt-1 text-[12px] text-charcoal-soft">{hint}</p>
    </div>
  );
}
