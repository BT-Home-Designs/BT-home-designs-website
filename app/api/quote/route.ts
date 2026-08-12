import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * DEVELOPMENT STORAGE ONLY.
 *
 * This route validates incoming submissions and logs them server-side; it
 * does NOT write to any persistent database, send any email, or store any
 * uploaded photo. Serverless hosts (Vercel, etc.) do not persist the
 * filesystem between invocations, so nothing logged here survives past the
 * request/response cycle. Before launch, wire the marked section below to
 * a real destination:
 *
 *   - Email:   Resend, SendGrid, or Postmark for an instant lead notification
 *   - CRM:     HubSpot, JobNimbus, or a similar home-services CRM webhook
 *   - Storage: a Postgres table (Supabase/Neon), Airtable base, or Google Sheet
 *
 * Photos: the client (QuoteForm) currently sends only selected file NAMES
 * as JSON metadata — no image bytes are uploaded or transmitted to this
 * route. This is intentional (Option A from the project brief: metadata
 * only, files not yet uploaded) to avoid adding a fragile multipart/
 * object-storage dependency before a real storage backend is chosen. The
 * UI tells the user this explicitly. To accept real files, add multipart
 * parsing (Next's Request.formData() handles this natively — no extra
 * dependency needed) and upload each file to object storage (S3, R2,
 * Supabase Storage) before persisting the submission record.
 *
 * See README.md → "Connecting Production Storage" for wiring examples.
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
};

const MAX_PHOTOS = 10;
const MAX_FILENAME_LENGTH = 200;

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Accepts common U.S. formats: 2145550123, 214-555-0123, (214) 555-0123,
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
    // exists, but skip all processing and logging.
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

    const submission = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      ...data,
      website: undefined, // strip the honeypot field before it goes anywhere
    };

    // -----------------------------------------------------------------
    // DEV STORAGE: replace this block with a real integration before
    // launch (see file header). In production we log a redacted summary
    // rather than full contact details, since server logs are not an
    // appropriate place to retain customer PII long-term.
    if (process.env.NODE_ENV === "production") {
      console.log("New lead submission received:", { id: submission.id, receivedAt: submission.receivedAt });
    } else {
      console.log("New lead submission (dev storage only, not persisted):", submission);
    }
    // -----------------------------------------------------------------

    return NextResponse.json({ success: true, id: submission.id }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error handling submission:", err);
    return NextResponse.json({ error: "Something went wrong processing your request. Please try again or call us directly." }, { status: 500 });
  }
}
