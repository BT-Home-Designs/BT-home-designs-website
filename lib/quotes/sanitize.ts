import { newId } from "./ids";
import type { DesignPage, LineItem, PaymentLink, QuoteContent, Selection, TermsSection } from "./types";

/**
 * Server-side normalization of quote content coming from the admin editor.
 * Everything is re-validated here — the browser is never trusted for
 * money, lengths, or ids.
 */

const LIMITS = { short: 200, medium: 2000, long: 20000 };

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.slice(0, max) : "";
}

function bool(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function nonNegInt(value: unknown, max = 1_000_000_000_00): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), max);
}

function decimal(value: unknown, places: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Number(n.toFixed(places)), max);
}

function id(value: unknown): string {
  return typeof value === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(value) ? value : newId();
}

function fileId(value: unknown): string | null {
  return typeof value === "string" && /^[0-9a-f-]{36}$/.test(value) ? value : null;
}

function date(value: unknown): string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function arr(value: unknown, max: number): unknown[] {
  return Array.isArray(value) ? value.slice(0, max) : [];
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function selection(raw: unknown): Selection {
  const o = obj(raw);
  return { id: id(o.id), label: str(o.label, LIMITS.short), value: str(o.value, LIMITS.medium) };
}

function page(raw: unknown): DesignPage {
  const o = obj(raw);
  return {
    id: id(o.id),
    title: str(o.title, LIMITS.short),
    room: str(o.room, LIMITS.short),
    treatment: str(o.treatment, LIMITS.short),
    description: str(o.description, LIMITS.medium * 2),
    selections: arr(o.selections, 40).map(selection),
    photos: arr(o.photos, 24).flatMap((p) => {
      const po = obj(p);
      const fid = fileId(po.id);
      return fid ? [{ id: fid, caption: str(po.caption, LIMITS.short), selected: bool(po.selected) }] : [];
    }),
  };
}

function lineItem(raw: unknown): LineItem {
  const o = obj(raw);
  const cost = o.internalCostCents;
  return {
    id: id(o.id),
    room: str(o.room, LIMITS.short),
    description: str(o.description, LIMITS.medium),
    quantity: decimal(o.quantity, 2, 100_000) || 0,
    unitPriceCents: nonNegInt(o.unitPriceCents),
    taxable: bool(o.taxable, true),
    internalCostCents: cost === null || cost === undefined || cost === "" ? null : nonNegInt(cost),
  };
}

function terms(raw: unknown): TermsSection {
  const o = obj(raw);
  return { id: id(o.id), title: str(o.title, LIMITS.short), body: str(o.body, LIMITS.long) };
}

function link(raw: unknown, fallbackLabel: string): PaymentLink {
  const o = obj(raw);
  return { url: str(o.url, 2000).trim(), label: str(o.label, 60).trim() || fallbackLabel };
}

export const DEFAULT_LINK_LABELS = {
  deposit: "Pay Deposit",
  full: "Pay in Full",
  balance: "Pay Remaining Balance",
} as const;

export function sanitizeContent(raw: unknown): QuoteContent {
  const o = obj(raw);
  const customer = obj(o.customer);
  const deposit = obj(o.deposit);
  const links = obj(o.paymentLinks);
  return {
    customer: {
      name: str(customer.name, LIMITS.short),
      email: str(customer.email, LIMITS.short),
      phone: str(customer.phone, 40),
      address: str(customer.address, 400),
    },
    projectName: str(o.projectName, LIMITS.short),
    coverTitle: str(o.coverTitle, LIMITS.short),
    intro: str(o.intro, LIMITS.medium * 2),
    quoteDate: date(o.quoteDate),
    expirationDate: date(o.expirationDate),
    coverPhotoId: fileId(o.coverPhotoId),
    pages: arr(o.pages, 30).map(page),
    lineItems: arr(o.lineItems, 200).map(lineItem),
    taxRatePercent: decimal(o.taxRatePercent, 4, 100),
    deposit: {
      mode: deposit.mode === "amount" ? "amount" : "percent",
      percent: decimal(deposit.percent, 2, 100),
      amountCents: nonNegInt(deposit.amountCents),
    },
    paymentLinks: {
      deposit: link(links.deposit, DEFAULT_LINK_LABELS.deposit),
      full: link(links.full, DEFAULT_LINK_LABELS.full),
      balance: link(links.balance, DEFAULT_LINK_LABELS.balance),
    },
    requireApprovalBeforePayment: bool(o.requireApprovalBeforePayment, true),
    terms: arr(o.terms, 30).map(terms),
    approvalStatement: str(o.approvalStatement, LIMITS.medium * 2),
    internalNotes: str(o.internalNotes, LIMITS.long),
    isSample: bool(o.isSample),
  };
}

export function emptyContent(today: string): QuoteContent {
  return sanitizeContent({
    quoteDate: today,
    coverTitle: "Custom Window Treatment Quote",
    pages: [],
    lineItems: [],
    taxRatePercent: 0,
    deposit: { mode: "percent", percent: 0, amountCents: 0 },
    requireApprovalBeforePayment: true,
    terms: [],
    approvalStatement: "",
  });
}
