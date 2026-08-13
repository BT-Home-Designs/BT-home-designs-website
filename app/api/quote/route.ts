import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * LEAD DELIVERY.
 *
 * Sends an email notification via Resend (https://resend.com) when both
 * RESEND_API_KEY and LEAD_NOTIFICATION_EMAIL are set as environment
 * variables. Neither is set in this repository or any deployment config
 * found in it — no account has been created and no key has been invented.
 * Until both are configured, this route does NOT report success: it
 * returns a real 503 with an honest message, so the site never tells a
 * visitor their request went through when it didn't.
 *
 * To activate delivery:
 *   1. Create a Resend account and verify a sending domain (or use their
 *      default onboarding@resend.dev sender for early testing).
 *   2. Set these environment variables in your deployment (e.g. Vercel
 *      Project Settings → Environment Variables):
 *        RESEND_API_KEY          — from the Resend dashboard
 *        LEAD_NOTIFICATION_EMAIL — the inbox that should receive leads
 *        RESEND_FROM_EMAIL       — optional; defaults to a Resend test
 *                                   sender if omitted
 *   3. Redeploy. No code changes are needed — this route picks the
 *      variables up automatically.
 *
 * See README.md → "Connecting Production Storage" for CRM/database
 * alternatives to email-only delivery.
 *
 * Photos: the client (QuoteForm) sends only selected file NAMES as JSON
 * metadata — no image bytes are uploaded or transmitted to this route.
 * The UI tells the user this explicitly.
 */

const REQUIRED_FIELDS = ["name", "email", "phone"] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120,
  email: 254,
  phone: 30,
  address: 240,
  windowQuantity: 60,
  approxSizes: 240,
  timeline: 60,
  budget: 60,
  consultationDate: 20,
  consultationTime: 60,
  message: 4000,
  source: 40,
  sourcePage: 500,
  city: 100,
};

const MAX_PHOTOS = 10;
const MAX_FILENAME_LENGTH = 200;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Accepts common U.S. formats: 2145559012, 214-555-9012, (214) 555-9012,
// 214.555.0123, +1 214 555 0123 — 7 to 15 digits once punctuation is
// stripped, per E.164's practical upper bound.
function isValidPhone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[\d\s().+-]+$/.test(value);
}

function isPlainString(value: unknown): value is string {
  return typeof value === "string";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildLeadEmailHtml(submission: Record<string, unknown>): string {
  const rows: [string, unknown][] = [
    ["Name", submission.name],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["City / Address", submission.city ?? submission.address],
    ["Requested service(s)", Array.isArray(submission.products) ? submission.products.join(", ") : undefined],
    ["Window quantity", submission.windowQuantity],
    ["Approx. sizes", submission.approxSizes],
    ["Timeline", submission.timeline],
    ["Budget", submission.budget],
    ["Preferred consultation", [submission.consultationDate, submission.consultationTime].filter(Boolean).join(" ")],
    ["Message", submission.message],
    ["Photos referenced (names only)", Array.isArray(submission.photos) ? submission.photos.join(", ") : undefined],
    ["Consent given", submission.consent ? "Yes" : "No"],
    ["Source page", submission.sourcePage],
    ["Form", submission.source ?? "quote-page"],
    ["Submission ID", submission.id],
    ["Received", submission.receivedAt],
  ];

  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([label, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#7d5a3a;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;">${escapeHtml(String(v))}</td></tr>`)
    .join("");

  return `<div style="font-family:sans-serif;font-size:14px;color:#2a2622;"><h2 style="font-weight:600;">New BT Home Designs lead</h2><table>${rowsHtml}</table></div>`;
}

export async function POST(request: Request) {
  let data: Record<string, unknown>;

  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return NextResponse.json({ error: "Request body must be a JSON object." }, { status: 400 });
  }

  try {
    // Honeypot: a hidden field ("website") that real visitors never see or
    // fill in. Bots that auto-fill every field will populate it. Respond
    // as if the submission succeeded so the bot doesn't learn the check
    // exists, but skip all processing, validation, and delivery.
    if (isPlainString(data.website) && data.website.trim() !== "") {
      return NextResponse.json({ success: true, id: randomUUID() }, { status: 201 });
    }

    const missing = REQUIRED_FIELDS.filter((field) => {
      const value = data[field];
      return typeof value !== "string" || value.trim().length === 0;
    });

    if (missing.length > 0) {
      return NextResponse.json({ error: `Missing required field(s): ${missing.join(", ")}` }, { status: 400 });
    }

    if (!isValidEmail(data.email)) {
      return NextResponse.json({ error: "Please provide a valid email address." }, { status: 400 });
    }

    if (!isValidPhone(data.phone)) {
      return NextResponse.json({ error: "Please provide a valid phone number." }, { status: 400 });
    }

    for (const [field, max] of Object.entries(MAX_LENGTHS)) {
      const value = data[field];
      if (typeof value === "string" && value.length > max) {
        return NextResponse.json({ error: `Field "${field}" exceeds the maximum length of ${max} characters.` }, { status: 400 });
      }
    }

    if (data.products !== undefined) {
      if (!Array.isArray(data.products) || !data.products.every(isPlainString)) {
        return NextResponse.json({ error: "\"products\" must be an array of strings." }, { status: 400 });
      }
    }

    // Photos arrive as filenames only (see file header comment) — validate
    // as plain metadata, not file contents.
    if (data.photos !== undefined) {
      if (!Array.isArray(data.photos) || !data.photos.every(isPlainString)) {
        return NextResponse.json({ error: "\"photos\" must be an array of file names." }, { status: 400 });
      }
      if (data.photos.length > MAX_PHOTOS) {
        return NextResponse.json({ error: `A maximum of ${MAX_PHOTOS} photos can be referenced per submission.` }, { status: 400 });
      }
      if (data.photos.some((name) => (name as string).length > MAX_FILENAME_LENGTH)) {
        return NextResponse.json({ error: "One or more photo file names are too long." }, { status: 400 });
      }
    }

    const submission: Record<string, unknown> = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      ...data,
      website: undefined, // strip the honeypot field before it goes anywhere
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "BT Home Designs Website <onboarding@resend.dev>";

    if (!RESEND_API_KEY || !LEAD_NOTIFICATION_EMAIL) {
      // Honest failure: no delivery destination is configured. Never
      // report success here — see file header for exact setup steps.
      console.error(
        "Lead delivery is not configured (missing RESEND_API_KEY and/or LEAD_NOTIFICATION_EMAIL). Submission was NOT delivered:",
        { id: submission.id, receivedAt: submission.receivedAt }
      );
      return NextResponse.json(
        { success: false, delivered: false, error: "We're not able to accept online requests just yet. Please try again soon, or reach out another way from our contact page." },
        { status: 503 }
      );
    }

    try {
      const formLabel = submission.source === "contact-page" ? "Contact Form" : "Quote Request";
      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: LEAD_NOTIFICATION_EMAIL,
          reply_to: typeof submission.email === "string" ? submission.email : undefined,
          subject: `New ${formLabel} — ${typeof submission.name === "string" ? submission.name : "Website Visitor"}`,
          html: buildLeadEmailHtml(submission),
        }),
      });

      if (!emailRes.ok) {
        // Do not leak the API key or full response body into logs.
        console.error("Lead email delivery failed with status", emailRes.status, "for submission", submission.id);
        return NextResponse.json(
          { success: false, delivered: false, error: "We couldn't deliver your request right now. Please try again in a moment." },
          { status: 502 }
        );
      }
    } catch (err) {
      console.error("Lead email delivery threw an error for submission", submission.id, err);
      return NextResponse.json(
        { success: false, delivered: false, error: "We couldn't deliver your request right now. Please try again in a moment." },
        { status: 502 }
      );
    }

    // Redacted log — no full PII retained past this request/response cycle.
    console.log("Lead delivered successfully:", { id: submission.id, receivedAt: submission.receivedAt });

    return NextResponse.json({ success: true, delivered: true, id: submission.id }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error handling submission:", err);
    return NextResponse.json({ error: "Something went wrong processing your request. Please try again or call us directly." }, { status: 500 });
  }
}
