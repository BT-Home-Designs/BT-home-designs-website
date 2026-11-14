import { lineTotalCents, percentOfCents } from "./money";
import type { QuoteContent, TotalsSnapshot } from "./types";

/** Pure (browser-safe) totals math shared by the editor, customer page, and PDF. */
export type Totals = TotalsSnapshot & {
  taxableCents: number;
  paidCents: number;
  remainingCents: number;
  depositDueCents: number;
};

export function computeTotals(content: QuoteContent, paidCents: number): Totals {
  let subtotalCents = 0;
  let taxableCents = 0;
  for (const item of content.lineItems) {
    const line = lineTotalCents(item.quantity, item.unitPriceCents);
    subtotalCents += line;
    if (item.taxable) taxableCents += line;
  }
  const taxCents = percentOfCents(taxableCents, content.taxRatePercent);
  const totalCents = subtotalCents + taxCents;

  const rawDeposit =
    content.deposit.mode === "percent"
      ? percentOfCents(totalCents, content.deposit.percent)
      : content.deposit.amountCents;
  const depositCents = Math.max(0, Math.min(rawDeposit, totalCents));

  return {
    subtotalCents,
    taxableCents,
    taxCents,
    totalCents,
    depositCents,
    paidCents,
    remainingCents: totalCents - paidCents,
    depositDueCents: Math.max(0, depositCents - paidCents),
  };
}


/**
 * Fingerprint of everything the customer is agreeing to: pricing, scope
 * (rooms/selections/descriptions), tax, deposit, and terms. If this
 * changes after approval, the old approval is superseded and a new one is
 * required. Photos, captions, intro copy, payment links, and internal
 * cost/notes deliberately do NOT affect it.
 */
export function scopeFingerprint(content: QuoteContent): string {
  const scope = {
    pages: content.pages.map((p) => ({
      title: p.title,
      room: p.room,
      treatment: p.treatment,
      description: p.description,
      selections: p.selections.map((s) => [s.label, s.value]),
    })),
    lineItems: content.lineItems.map((i) => [i.room, i.description, i.quantity, i.unitPriceCents, i.taxable]),
    tax: content.taxRatePercent,
    deposit: content.deposit.mode === "percent" ? ["percent", content.deposit.percent] : ["amount", content.deposit.amountCents],
    terms: content.terms.map((t) => [t.title, t.body]),
    approvalStatement: content.approvalStatement,
  };
  return JSON.stringify(scope);
}

