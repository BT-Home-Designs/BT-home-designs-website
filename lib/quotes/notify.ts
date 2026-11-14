import "server-only";
import { business } from "@/lib/data/business";
import type { EmailStatus } from "./types";

/**
 * Owner notifications via the site's existing Resend setup
 * (RESEND_API_KEY + LEAD_NOTIFICATION_EMAIL — same as the quote/warranty
 * forms). Only ever emails the business inbox, never a customer.
 * Callers must save the record BEFORE calling this; a failure here never
 * loses an approval or change request.
 */
const DEFAULT_FROM_EMAIL = "BT Home Designs Website <leads@mail.bthomedesigns.com>";

export function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export async function notifyOwner(subject: string, rows: [string, string][], adminPath: string): Promise<EmailStatus> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.LEAD_NOTIFICATION_EMAIL;
  if (!apiKey || !to) return "not_configured";
  const link = `${business.urls.website}${adminPath}`;
  const html = `<div style="font-family:Arial,sans-serif;font-size:14px;color:#222">
    <h2 style="font-family:Georgia,serif;color:#23392b">${escapeHtml(subject)}</h2>
    <table cellpadding="6" style="border-collapse:collapse">${rows
      .map(([k, v]) => `<tr><td style="color:#666;vertical-align:top"><b>${escapeHtml(k)}</b></td><td style="white-space:pre-wrap">${escapeHtml(v)}</td></tr>`)
      .join("")}</table>
    <p><a href="${escapeHtml(link)}">Open this quote in the dashboard</a></p></div>`;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL, to: [to], subject, html }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      console.error("[quotes] Resend notification failed", res.status, await res.text().catch(() => ""));
      return "failed";
    }
    return "sent";
  } catch (err) {
    console.error("[quotes] Resend notification error", err);
    return "failed";
  }
}
