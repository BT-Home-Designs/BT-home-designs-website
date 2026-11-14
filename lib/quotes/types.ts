/**
 * Data model for customer quotes (v1).
 *
 * All money is stored as integer cents. Never store or compute money as
 * floating-point dollars — see lib/quotes/money.ts.
 *
 * A quote has two copies of its content:
 *   - `draft`: what the owner is editing in /admin. Never shown to customers.
 *   - `published.content`: the frozen copy customers see at their private
 *     link. Only changes when the owner clicks Publish.
 */

export const TREATMENT_TYPES = [
  "Custom Drapery",
  "Roller Shades",
  "Motorized Shades",
  "Roman Shades",
  "Woven Wood Shades",
  "Zebra Shades",
  "Plantation Shutters",
  "Exterior Shades",
  "Hardware",
  "Other",
] as const;

export type Selection = { id: string; label: string; value: string };

export type QuotePhoto = {
  id: string; // file id in the quote file store
  caption: string;
  selected: boolean; // shows a "Selected" badge (e.g. chosen pleat style)
};

/** One presentation page: a room, a design direction, hardware, etc. */
export type DesignPage = {
  id: string;
  title: string; // e.g. "Drapery Design Direction"
  room: string; // e.g. "Slider + Living Room"
  treatment: string; // one of TREATMENT_TYPES or free text
  description: string;
  selections: Selection[]; // fabric, color, lining, hardware, finish...
  photos: QuotePhoto[];
};

export type LineItem = {
  id: string;
  room: string;
  description: string;
  quantity: number; // up to 2 decimals
  unitPriceCents: number; // customer price
  taxable: boolean;
  /** INTERNAL ONLY — never sent to customer pages or PDFs. */
  internalCostCents: number | null;
};

export type TermsSection = { id: string; title: string; body: string };

export type PaymentLink = { url: string; label: string };

export type DepositSetting = {
  mode: "percent" | "amount";
  percent: number; // e.g. 50 (up to 2 decimals)
  amountCents: number;
};

export type QuoteContent = {
  customer: { name: string; email: string; phone: string; address: string };
  projectName: string; // e.g. "Little Elm Residence"
  coverTitle: string; // e.g. "Custom Drapery Quote"
  intro: string;
  quoteDate: string; // YYYY-MM-DD
  expirationDate: string; // YYYY-MM-DD or ""
  coverPhotoId: string | null;
  pages: DesignPage[];
  lineItems: LineItem[];
  taxRatePercent: number; // e.g. 8.25 (up to 4 decimals)
  deposit: DepositSetting;
  paymentLinks: { deposit: PaymentLink; full: PaymentLink; balance: PaymentLink };
  requireApprovalBeforePayment: boolean;
  terms: TermsSection[];
  approvalStatement: string;
  /** INTERNAL ONLY — never sent to customer pages or PDFs. */
  internalNotes: string;
  /** Marks clearly-labeled demo data. Shows a banner on every customer view. */
  isSample: boolean;
};

export type CustomerSafeLineItem = Omit<LineItem, "internalCostCents">;

export type TotalsSnapshot = {
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  depositCents: number;
};

export type Approval = {
  id: string;
  version: number;
  scopeHash: string;
  name: string;
  at: string; // ISO timestamp
  approvalStatement: string;
  terms: TermsSection[];
  lineItems: CustomerSafeLineItem[];
  taxRatePercent: number;
  totals: TotalsSnapshot;
  ipAddress: string;
  userAgent: string;
  supersededAt: string | null;
  supersededByVersion: number | null;
  emailStatus: EmailStatus;
};

export type ChangeRequest = {
  id: string;
  version: number;
  name: string;
  message: string;
  at: string;
  resolvedAt: string | null;
  emailStatus: EmailStatus;
};

export type Payment = {
  id: string;
  date: string; // YYYY-MM-DD
  amountCents: number;
  note: string;
  recordedAt: string;
  updatedAt: string;
};

export type EmailStatus = "sent" | "not_configured" | "failed" | "pending";

export type QuoteEvent = { at: string; type: string; message: string };

export type PublishedVersion = {
  version: number;
  publishedAt: string;
  scopeHash: string;
  content: QuoteContent;
};

export type Quote = {
  id: string;
  token: string; // private customer link token (unguessable)
  number: string; // e.g. BT-2026-0001
  rev: number; // optimistic concurrency counter
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  linkRevoked: boolean;
  draft: QuoteContent;
  published: PublishedVersion | null;
  publishHistory: { version: number; publishedAt: string; scopeHash: string }[];
  approvals: Approval[];
  changeRequests: ChangeRequest[];
  payments: Payment[];
  events: QuoteEvent[];
};
