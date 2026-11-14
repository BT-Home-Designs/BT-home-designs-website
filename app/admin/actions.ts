"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { toAdminQuote, type AdminQuote } from "@/lib/quotes/admin";
import { requireAdmin } from "@/lib/quotes/auth";
import { parseDollarsToCents } from "@/lib/quotes/money";
import { clientIp, rateLimited } from "@/lib/quotes/rateLimit";
import { createSampleQuote } from "@/lib/quotes/sample";
import * as svc from "@/lib/quotes/service";
import { ADMIN_COOKIE, SESSION_DAYS, adminConfigured, createSessionValue, passwordMatches } from "@/lib/quotes/session";

/**
 * Owner-only server actions. Every action re-verifies the signed session
 * cookie (requireAdmin) — middleware protection is not relied on alone.
 */

export type ActionResult = { ok: true; quote: AdminQuote; message?: string } | { ok: false; error: string };

async function run(fn: () => Promise<{ quote: Parameters<typeof toAdminQuote>[0]; message?: string }>): Promise<ActionResult> {
  try {
    await requireAdmin();
    const { quote, message } = await fn();
    return { ok: true, quote: toAdminQuote(quote), message };
  } catch (err) {
    if (err instanceof svc.QuoteError) return { ok: false, error: err.message };
    console.error("[quotes] admin action failed", err);
    return { ok: false, error: "Something went wrong saving that change. Please try again." };
  }
}

// ------------------------------------------------------------------ session

export async function loginAction(_prev: { error: string } | null, form: FormData): Promise<{ error: string } | null> {
  if (!adminConfigured()) return { error: "The dashboard isn't set up yet. See the setup notes below." };
  const ip = clientIp(await headers());
  if (rateLimited(`login:${ip}`, 8, 15 * 60_000)) return { error: "Too many attempts. Please wait 15 minutes and try again." };
  const password = String(form.get("password") ?? "");
  if (!(await passwordMatches(password))) return { error: "That password isn't right." };
  (await cookies()).set(ADMIN_COOKIE, await createSessionValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DAYS * 86_400,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

// ---------------------------------------------------------------- creation

export async function createQuoteAction() {
  await requireAdmin();
  const q = await svc.createQuote();
  redirect(`/admin/quotes/${q.id}`);
}

export async function createSampleQuoteAction() {
  await requireAdmin();
  const q = await createSampleQuote();
  redirect(`/admin/quotes/${q.id}`);
}

export async function duplicateQuoteAction(id: string): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.duplicateQuote(id), message: "Duplicated." }));
}

// ----------------------------------------------------------------- editing

export async function saveDraftAction(id: string, content: unknown): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.saveDraft(id, content), message: "Draft saved." }));
}

export async function publishAction(id: string, content: unknown): Promise<ActionResult> {
  return run(async () => {
    await svc.saveDraft(id, content);
    const res = await svc.publishQuote(id);
    const message = !res.changed
      ? "Already published — no changes since the last publish."
      : res.requiresReapproval
        ? `Published version ${res.quote.published?.version}. Pricing/scope changed, so the customer must approve again (the earlier approval is kept in the history).`
        : `Published version ${res.quote.published?.version}. The customer link now shows this version.`;
    return { quote: res.quote, message };
  });
}

export async function setArchivedAction(id: string, archived: boolean): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.setArchived(id, archived), message: archived ? "Archived. The customer link is disabled." : "Unarchived." }));
}

export async function revokeLinkAction(id: string): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.revokeLink(id), message: "Customer link revoked. It no longer opens the quote." }));
}

export async function newLinkAction(id: string): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.issueNewLink(id), message: "New private link created. The old link no longer works." }));
}

export async function resolveChangeRequestAction(id: string, requestId: string, resolved: boolean): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.resolveChangeRequest(id, requestId, resolved) }));
}

// ---------------------------------------------------------------- payments

function paymentInput(input: { date: string; amount: string; note: string }): svc.PaymentInput {
  const cents = parseDollarsToCents(String(input.amount ?? ""));
  if (cents === null || cents <= 0) throw new svc.QuoteError("Enter a valid amount, like 1500 or 1,500.00.");
  return { date: String(input.date ?? ""), amountCents: cents, note: String(input.note ?? "") };
}

export async function addPaymentAction(id: string, input: { date: string; amount: string; note: string }): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.addPayment(id, paymentInput(input)), message: "Payment recorded." }));
}

export async function updatePaymentAction(id: string, paymentId: string, input: { date: string; amount: string; note: string }): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.updatePayment(id, paymentId, paymentInput(input)), message: "Payment updated." }));
}

export async function deletePaymentAction(id: string, paymentId: string): Promise<ActionResult> {
  return run(async () => ({ quote: await svc.deletePayment(id, paymentId), message: "Payment removed." }));
}
