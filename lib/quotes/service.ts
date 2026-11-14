import "server-only";
import { computeTotals, currentApproval, isExpired, scopeHash, sumPayments, todayInBusinessTz } from "./calc";
import { newId, newToken } from "./ids";
import { emptyContent, sanitizeContent } from "./sanitize";
import { getStore } from "./store";
import type { Approval, ChangeRequest, EmailStatus, Payment, Quote, QuoteContent } from "./types";

/**
 * All quote mutations go through `mutate`, which re-reads the latest
 * record, applies the change, and writes with an optimistic revision
 * check (retrying on conflict). That way a customer approving at the same
 * moment the owner saves a draft can never overwrite each other.
 */

export class QuoteError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function nowIso() {
  return new Date().toISOString();
}

async function mutate(id: string, fn: (q: Quote) => void | Promise<void>): Promise<Quote> {
  const store = await getStore();
  for (let attempt = 0; attempt < 12; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 15 + Math.random() * 40 * attempt)); // jittered backoff
    const quote = await store.get(id);
    if (!quote) throw new QuoteError("Quote not found.", 404);
    const expected = quote.rev;
    await fn(quote);
    quote.rev = expected + 1;
    quote.updatedAt = nowIso();
    if (await store.replace(quote, expected)) return quote;
  }
  throw new QuoteError("This quote was changed by someone else at the same moment. Please try again.", 409);
}

function log(q: Quote, type: string, message: string) {
  q.events.push({ at: nowIso(), type, message });
  if (q.events.length > 500) q.events.splice(0, q.events.length - 500);
}

async function nextNumber(): Promise<string> {
  const store = await getStore();
  const year = todayInBusinessTz().slice(0, 4);
  const seq = await store.nextSequence(`quote-${year}`);
  return `BT-${year}-${String(seq).padStart(4, "0")}`;
}

// ------------------------------------------------------------------ queries

export async function listQuotes(): Promise<Quote[]> {
  const quotes = await (await getStore()).list();
  return quotes.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getQuote(id: string): Promise<Quote | null> {
  return (await getStore()).get(id);
}

/**
 * Resolve a customer link. Returns null (→ generic "not available" page)
 * for unknown tokens, drafts, archived quotes, and revoked links, so a
 * customer can never tell those cases apart or reach unpublished content.
 */
export async function getPublishedByToken(token: string): Promise<Quote | null> {
  const quote = await (await getStore()).getByToken(token);
  if (!quote || !quote.published || quote.archived || quote.linkRevoked) return null;
  return quote;
}

// ----------------------------------------------------------- owner actions

export async function createQuote(content?: QuoteContent): Promise<Quote> {
  const store = await getStore();
  const now = nowIso();
  const quote: Quote = {
    id: newId(),
    token: newToken(),
    number: await nextNumber(),
    rev: 1,
    createdAt: now,
    updatedAt: now,
    archived: false,
    linkRevoked: false,
    draft: content ?? emptyContent(todayInBusinessTz()),
    published: null,
    publishHistory: [],
    approvals: [],
    changeRequests: [],
    payments: [],
    events: [{ at: now, type: "created", message: "Quote created" }],
  };
  await store.create(quote);
  return quote;
}

export async function saveDraft(id: string, raw: unknown): Promise<Quote> {
  const content = sanitizeContent(raw);
  return mutate(id, (q) => {
    q.draft = content;
  });
}

export type PublishResult = { quote: Quote; changed: boolean; requiresReapproval: boolean };

export async function publishQuote(id: string): Promise<PublishResult> {
  let changed = false;
  let requiresReapproval = false;
  const quote = await mutate(id, (q) => {
    if (q.archived) throw new QuoteError("Unarchive this quote before publishing.");
    const content = q.draft;
    if (!content.customer.name.trim() && !content.projectName.trim()) {
      throw new QuoteError("Add a customer or project name before publishing.");
    }
    if (content.lineItems.length === 0) throw new QuoteError("Add at least one line item before publishing.");
    if (q.published && JSON.stringify(q.published.content) === JSON.stringify(content)) return;

    changed = true;
    const hash = scopeHash(content);
    const version = (q.published?.version ?? 0) + 1;
    const at = nowIso();
    const hadApproval = Boolean(currentApproval(q));
    if (q.published && hash !== q.published.scopeHash) {
      for (const a of q.approvals) {
        if (!a.supersededAt) {
          a.supersededAt = at;
          a.supersededByVersion = version;
        }
      }
      requiresReapproval = hadApproval;
    }
    q.published = { version, publishedAt: at, scopeHash: hash, content: structuredClone(content) };
    q.publishHistory.push({ version, publishedAt: at, scopeHash: hash });
    log(
      q,
      "published",
      `Published version ${version}` + (requiresReapproval ? " — pricing/scope changed, previous approval superseded; new approval required" : "")
    );
  });
  return { quote, changed, requiresReapproval };
}

export async function duplicateQuote(id: string): Promise<Quote> {
  const source = await getQuote(id);
  if (!source) throw new QuoteError("Quote not found.", 404);
  const content = structuredClone(source.draft);
  content.projectName = content.projectName ? `${content.projectName} (Copy)` : "(Copy)";
  content.quoteDate = todayInBusinessTz();
  const copy = await createQuote(content);
  return mutate(copy.id, (q) => log(q, "duplicated", `Duplicated from ${source.number}`));
}

export async function setArchived(id: string, archived: boolean): Promise<Quote> {
  return mutate(id, (q) => {
    q.archived = archived;
    log(q, archived ? "archived" : "unarchived", archived ? "Archived — customer link disabled" : "Unarchived");
  });
}

export async function revokeLink(id: string): Promise<Quote> {
  return mutate(id, (q) => {
    q.linkRevoked = true;
    log(q, "link_revoked", "Customer link revoked");
  });
}

/** Issues a brand-new private link. The old link stays dead forever. */
export async function issueNewLink(id: string): Promise<Quote> {
  return mutate(id, (q) => {
    q.token = newToken();
    q.linkRevoked = false;
    log(q, "link_reissued", "New private customer link issued (previous link no longer works)");
  });
}

export async function resolveChangeRequest(id: string, requestId: string, resolved: boolean): Promise<Quote> {
  return mutate(id, (q) => {
    const cr = q.changeRequests.find((c) => c.id === requestId);
    if (!cr) throw new QuoteError("Change request not found.", 404);
    cr.resolvedAt = resolved ? nowIso() : null;
  });
}

// ---------------------------------------------------- manual payment record

export type PaymentInput = { date: string; amountCents: number; note: string };

function validatePayment(input: PaymentInput): PaymentInput {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date)) throw new QuoteError("Enter the payment date.");
  if (!Number.isSafeInteger(input.amountCents) || input.amountCents <= 0) throw new QuoteError("Enter a payment amount greater than $0.");
  return { date: input.date, amountCents: input.amountCents, note: String(input.note ?? "").slice(0, 500) };
}

export async function addPayment(id: string, input: PaymentInput): Promise<Quote> {
  const p = validatePayment(input);
  return mutate(id, (q) => {
    const at = nowIso();
    const payment: Payment = { id: newId(), ...p, recordedAt: at, updatedAt: at };
    q.payments.push(payment);
    log(q, "payment_recorded", `Payment recorded: $${(p.amountCents / 100).toFixed(2)} on ${p.date}${p.note ? ` — ${p.note}` : ""}`);
  });
}

export async function updatePayment(id: string, paymentId: string, input: PaymentInput): Promise<Quote> {
  const p = validatePayment(input);
  return mutate(id, (q) => {
    const existing = q.payments.find((x) => x.id === paymentId);
    if (!existing) throw new QuoteError("Payment not found.", 404);
    log(
      q,
      "payment_corrected",
      `Payment corrected: $${(existing.amountCents / 100).toFixed(2)} on ${existing.date} → $${(p.amountCents / 100).toFixed(2)} on ${p.date}`
    );
    Object.assign(existing, p, { updatedAt: nowIso() });
  });
}

export async function deletePayment(id: string, paymentId: string): Promise<Quote> {
  return mutate(id, (q) => {
    const existing = q.payments.find((x) => x.id === paymentId);
    if (!existing) throw new QuoteError("Payment not found.", 404);
    q.payments = q.payments.filter((x) => x.id !== paymentId);
    log(q, "payment_removed", `Payment removed: $${(existing.amountCents / 100).toFixed(2)} on ${existing.date}${existing.note ? ` (${existing.note})` : ""}`);
  });
}

// --------------------------------------------------------- customer actions

export async function recordApproval(
  token: string,
  input: { name: string; version: number; scopeHash: string; ipAddress: string; userAgent: string }
): Promise<{ quote: Quote; approval: Approval; alreadyApproved: boolean }> {
  const found = await getPublishedByToken(token);
  if (!found) throw new QuoteError("This quote is no longer available.", 404);
  const name = input.name.trim().slice(0, 120);
  if (name.length < 2) throw new QuoteError("Please type your full name to approve.");

  let approval: Approval | null = null;
  let alreadyApproved = false;
  const quote = await mutate(found.id, (q) => {
    if (!q.published || q.archived || q.linkRevoked) throw new QuoteError("This quote is no longer available.", 404);
    const pub = q.published;
    if (pub.version !== input.version || pub.scopeHash !== input.scopeHash) {
      throw new QuoteError("This quote was just updated. Please reload the page to review the latest version before approving.", 409);
    }
    const existing = currentApproval(q);
    if (existing) {
      approval = existing;
      alreadyApproved = true;
      return;
    }
    if (isExpired(pub.content)) throw new QuoteError("This quote has expired. Please contact BT Home Designs for an updated quote.");
    const totals = computeTotals(pub.content, sumPayments(q));
    approval = {
      id: newId(),
      version: pub.version,
      scopeHash: pub.scopeHash,
      name,
      at: nowIso(),
      approvalStatement: pub.content.approvalStatement,
      terms: structuredClone(pub.content.terms),
      lineItems: pub.content.lineItems.map((i) => ({ id: i.id, room: i.room, description: i.description, quantity: i.quantity, unitPriceCents: i.unitPriceCents, taxable: i.taxable })),
      taxRatePercent: pub.content.taxRatePercent,
      totals: {
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
        depositCents: totals.depositCents,
      },
      ipAddress: input.ipAddress.slice(0, 100),
      userAgent: input.userAgent.slice(0, 300),
      supersededAt: null,
      supersededByVersion: null,
      emailStatus: "pending",
    };
    q.approvals.push(approval);
    log(q, "approved", `Approved by ${name} (version ${pub.version})`);
  });
  return { quote, approval: approval!, alreadyApproved };
}

export async function recordChangeRequest(
  token: string,
  input: { name: string; message: string }
): Promise<{ quote: Quote; request: ChangeRequest }> {
  const found = await getPublishedByToken(token);
  if (!found) throw new QuoteError("This quote is no longer available.", 404);
  const name = input.name.trim().slice(0, 120);
  const message = input.message.trim().slice(0, 5000);
  if (name.length < 2) throw new QuoteError("Please enter your name.");
  if (message.length < 3) throw new QuoteError("Please describe the changes you'd like.");
  let request: ChangeRequest | null = null;
  const quote = await mutate(found.id, (q) => {
    if (!q.published || q.archived || q.linkRevoked) throw new QuoteError("This quote is no longer available.", 404);
    request = { id: newId(), version: q.published.version, name, message, at: nowIso(), resolvedAt: null, emailStatus: "pending" };
    q.changeRequests.push(request);
    log(q, "change_requested", `Change request from ${name}`);
  });
  return { quote, request: request! };
}

export async function setEmailStatus(id: string, kind: "approval" | "change", recordId: string, status: EmailStatus) {
  try {
    await mutate(id, (q) => {
      const list = kind === "approval" ? q.approvals : q.changeRequests;
      const rec = list.find((r) => r.id === recordId);
      if (rec) rec.emailStatus = status;
    });
  } catch (err) {
    console.error("[quotes] could not record email status", err);
  }
}
