import { computeTotals, currentApproval, isExpired, quoteStatus, STATUS_LABELS, sumPayments, type StatusKey } from "./calc";
import { lineTotalCents } from "./money";
import { isValidSquareUrl } from "./links";
import type { Quote, QuoteContent } from "./types";

/**
 * The ONLY shape that reaches customer pages and PDFs. Built by explicit
 * whitelisting — internal cost, internal notes, customer email/phone,
 * IP addresses, and other quotes' data are never copied in.
 */
export type CustomerQuoteView = {
  number: string;
  version: number;
  scopeHash: string;
  status: StatusKey;
  statusLabel: string;
  isSample: boolean;
  isPreview: boolean;
  customerName: string;
  customerAddress: string;
  projectName: string;
  coverTitle: string;
  intro: string;
  quoteDate: string;
  expirationDate: string;
  expired: boolean;
  coverPhotoUrl: string | null;
  coverPhotoId: string | null;
  treatments: string[];
  pages: {
    id: string;
    title: string;
    room: string;
    treatment: string;
    description: string;
    selections: { label: string; value: string }[];
    photos: { id: string; url: string; caption: string; selected: boolean }[];
  }[];
  lineItems: { id: string; room: string; description: string; quantity: number; unitPriceCents: number; totalCents: number }[];
  totals: {
    subtotalCents: number;
    taxRatePercent: number;
    taxCents: number;
    totalCents: number;
    depositCents: number;
    paidCents: number;
    remainingCents: number;
    depositDueCents: number;
  };
  payments: { date: string; amountCents: number }[];
  paymentButtons: { kind: "deposit" | "full" | "balance"; label: string; url: string }[];
  paymentsAwaitApproval: boolean;
  terms: { id: string; title: string; body: string }[];
  approvalStatement: string;
  approval: { name: string; at: string; version: number } | null;
  hasSupersededApproval: boolean;
  canApprove: boolean;
  pdfUrl: string;
};

export type ViewMode = { kind: "customer"; token: string } | { kind: "admin"; quoteId: string; useDraft: boolean };

export function buildCustomerView(quote: Quote, mode: ViewMode): CustomerQuoteView {
  const isPreview = mode.kind === "admin" && mode.useDraft;
  const content: QuoteContent = isPreview || !quote.published ? quote.draft : quote.published.content;
  const fileUrl = (id: string) =>
    mode.kind === "customer" ? `/api/quote-files/${id}?t=${encodeURIComponent(mode.token)}` : `/api/quote-files/${id}`;

  const paid = sumPayments(quote);
  const totals = computeTotals(content, paid);
  const approval = isPreview ? null : currentApproval(quote);
  const status = quoteStatus(quote);
  const expired = isExpired(content);

  const canPay = !content.requireApprovalBeforePayment || Boolean(approval);
  const live = mode.kind === "customer" && !quote.archived && !quote.linkRevoked;
  const buttons: CustomerQuoteView["paymentButtons"] = [];
  const links = content.paymentLinks;
  if (canPay && totals.remainingCents > 0) {
    if (totals.depositDueCents > 0 && isValidSquareUrl(links.deposit.url)) {
      buttons.push({ kind: "deposit", label: links.deposit.label, url: links.deposit.url.trim() });
    }
    if (paid === 0 && isValidSquareUrl(links.full.url)) {
      buttons.push({ kind: "full", label: links.full.label, url: links.full.url.trim() });
    }
    if (paid > 0 && isValidSquareUrl(links.balance.url)) {
      buttons.push({ kind: "balance", label: links.balance.label, url: links.balance.url.trim() });
    }
  }
  const anyValidLink = [links.deposit, links.full, links.balance].some((l) => isValidSquareUrl(l.url));

  return {
    number: quote.number,
    version: isPreview ? (quote.published?.version ?? 0) + 1 : (quote.published?.version ?? 0),
    scopeHash: quote.published?.scopeHash ?? "",
    status,
    statusLabel: isPreview ? "Preview" : STATUS_LABELS[status],
    isSample: content.isSample,
    isPreview,
    customerName: content.customer.name,
    customerAddress: content.customer.address,
    projectName: content.projectName,
    coverTitle: content.coverTitle,
    intro: content.intro,
    quoteDate: content.quoteDate,
    expirationDate: content.expirationDate,
    expired,
    coverPhotoId: content.coverPhotoId,
    coverPhotoUrl: content.coverPhotoId ? fileUrl(content.coverPhotoId) : null,
    treatments: [...new Set(content.pages.map((p) => p.treatment).filter(Boolean))],
    pages: content.pages.map((p) => ({
      id: p.id,
      title: p.title,
      room: p.room,
      treatment: p.treatment,
      description: p.description,
      selections: p.selections.filter((s) => s.label || s.value).map((s) => ({ label: s.label, value: s.value })),
      photos: p.photos.map((ph) => ({ id: ph.id, url: fileUrl(ph.id), caption: ph.caption, selected: ph.selected })),
    })),
    lineItems: content.lineItems.map((i) => ({
      id: i.id,
      room: i.room,
      description: i.description,
      quantity: i.quantity,
      unitPriceCents: i.unitPriceCents,
      totalCents: lineTotalCents(i.quantity, i.unitPriceCents),
    })),
    totals: {
      subtotalCents: totals.subtotalCents,
      taxRatePercent: content.taxRatePercent,
      taxCents: totals.taxCents,
      totalCents: totals.totalCents,
      depositCents: totals.depositCents,
      paidCents: totals.paidCents,
      remainingCents: totals.remainingCents,
      depositDueCents: totals.depositDueCents,
    },
    payments: isPreview ? [] : quote.payments.map((p) => ({ date: p.date, amountCents: p.amountCents })).sort((a, b) => a.date.localeCompare(b.date)),
    paymentButtons: live || isPreview ? buttons : [],
    paymentsAwaitApproval: !canPay && anyValidLink && totals.remainingCents > 0,
    terms: content.terms.filter((t) => t.title || t.body).map((t) => ({ id: t.id, title: t.title, body: t.body })),
    approvalStatement: content.approvalStatement,
    approval: approval ? { name: approval.name, at: approval.at, version: approval.version } : null,
    hasSupersededApproval: !isPreview && quote.approvals.some((a) => a.supersededAt) && !approval,
    canApprove: live && !approval && !expired,
    pdfUrl: mode.kind === "customer" ? `/api/q/${mode.token}/pdf` : `/api/admin/quotes/${quote.id}/pdf${isPreview ? "?draft=1" : ""}`,
  };
}
