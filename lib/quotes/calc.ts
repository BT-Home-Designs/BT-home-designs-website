import { createHash } from "crypto";
import { computeTotals, scopeFingerprint } from "./totals";
import type { Approval, Quote, QuoteContent } from "./types";

export { computeTotals, scopeFingerprint, type Totals } from "./totals";

export function sumPayments(quote: Quote): number {
  return quote.payments.reduce((sum, p) => sum + p.amountCents, 0);
}

export function scopeHash(content: QuoteContent): string {
  return createHash("sha256").update(scopeFingerprint(content)).digest("hex").slice(0, 16);
}

/** The approval that covers the currently published version, if any. */
export function currentApproval(quote: Quote): Approval | null {
  if (!quote.published) return null;
  const hash = quote.published.scopeHash;
  const valid = quote.approvals.filter((a) => !a.supersededAt && a.scopeHash === hash);
  return valid.length ? valid[valid.length - 1] : null;
}

/** Today's date (YYYY-MM-DD) in the business's time zone. */
export function todayInBusinessTz(now: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(now);
}

export function isExpired(content: QuoteContent, now: Date = new Date()): boolean {
  return Boolean(content.expirationDate) && content.expirationDate < todayInBusinessTz(now);
}

export type StatusKey =
  | "draft"
  | "archived"
  | "revoked"
  | "expired"
  | "changes_requested"
  | "awaiting_approval"
  | "approved_awaiting_deposit"
  | "approved"
  | "deposit_received"
  | "paid_in_full";

export const STATUS_LABELS: Record<StatusKey, string> = {
  draft: "Draft",
  archived: "Archived",
  revoked: "Link Revoked",
  expired: "Expired",
  changes_requested: "Changes Requested",
  awaiting_approval: "Awaiting Approval",
  approved_awaiting_deposit: "Approved—Awaiting Deposit",
  approved: "Approved",
  deposit_received: "Deposit Received",
  paid_in_full: "Paid in Full",
};

/**
 * Status is derived ONLY from published content, approvals, and payments
 * the owner recorded by hand. Nothing a customer clicks (Pay buttons,
 * returning from Square) can move a quote into a paid state.
 */
export function quoteStatus(quote: Quote, now: Date = new Date()): StatusKey {
  if (quote.archived) return "archived";
  if (!quote.published) return "draft";
  if (quote.linkRevoked) return "revoked";
  const content = quote.published.content;
  const totals = computeTotals(content, sumPayments(quote));
  const approval = currentApproval(quote);

  if (totals.totalCents > 0 && totals.paidCents >= totals.totalCents) return "paid_in_full";
  if (approval) {
    if (totals.depositCents === 0) return "approved";
    return totals.paidCents >= totals.depositCents ? "deposit_received" : "approved_awaiting_deposit";
  }
  const lastPublish = quote.published.publishedAt;
  if (quote.changeRequests.some((c) => !c.resolvedAt && c.at >= lastPublish)) return "changes_requested";
  if (isExpired(content, now)) return "expired";
  return "awaiting_approval";
}
