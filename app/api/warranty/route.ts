import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

/**
 * WARRANTY & SERVICE REQUEST DELIVERY.
 *
 * Standalone route for the /warranty page's service/warranty request form.
 * Kept separate from app/api/quote/route.ts (rather than merged in) since
 * this form accepts real file uploads (photos as attachments) while the
 * quote/contact forms only ever send photo file *names*.
 *
 * Reuses the exact same delivery mechanism already wired up for leads:
 * Resend (https://resend.com), gated behind RESEND_API_KEY and
 * LEAD_NOTIFICATION_EMAIL. No new service, account, or subscription is
 * introduced. Until both env vars are set, this route does not report
 * success — see app/api/quote/route.ts for the same honest-failure
 * rationale.
 *
 * File attachments: photos are sent as real Resend email attachments
 * (base64-encoded), not just file names. Resend accepts up to ~40MB per
 * email, but the practical ceiling here is set much lower —
 * MAX_TOTAL_ATTACHMENTS_BYTES below — because the default Node.js
 * Serverless Function payload limit on Vercel (this project's documented
 * deploy target, see README.md) is ~4.5MB per request, and this request
 * body is raw multipart (no base64 inflation) plus a handful of text
 * fields. If the site is later hosted somewhere without that ceiling (a
 * self-hosted Node server, a Vercel plan with a higher limit, etc.), this
 * constant can be raised — attachments over that size will otherwise
 * simply never reach this route.
 *
 * Video upload was deliberately left out: a normal smartphone video can't
 * reliably fit under the ~4.5MB ceiling above, and supporting it properly
 * would mean adding a paid storage/upload service this project intentionally
 * avoids. The form only requests photos; if a video turns out to be needed
 * for a specific request, BT Home Designs asks the customer for it directly
 * (e.g. by reply email or text) rather than the website collecting it.
 *
 * Spam protection: a honeypot field (same pattern as app/api/quote), plus
 * a best-effort in-memory rate limit per IP. That limiter resets whenever
 * the serverless instance recycles — it's not a durable store — but adds
 * a real layer without requiring an external service (e.g. Upstash Redis)
 * that this project deliberately avoids introducing.
 */

const DEFAULT_FROM_EMAIL = "BT Home Designs Website <leads@mail.bthomedesigns.com>";

const REQUIRED_FIELDS = ["name", "email", "phone", "address", "productType", "issueType", "description"] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120,
  email: 254,
  phone: 30,
  address: 240,
  installDate: 20,
  productType: 60,
  issueType: 60,
  description: 4000,
  contactMethod: 20,
  sourcePage: 500,
};

const PRODUCT_TYPES = [
  "Plantation Shutters",
  "Roller Shades",
  "Motorized Shades",
  "Drapery",
  "Exterior Shades",
  "Woven Woods",
  "Zebra / Vision Shades",
  "Faux Wood Blinds",
  "Other",
];

const ISSUE_TYPES = [
  "Product not operating correctly",
  "Motorization / remote issue",
  "Broken or damaged component",
  "Installation concern",
  "Fabric / material concern",
  "General warranty question",
  "Other",
];

const CONTACT_METHODS = ["Text", "Phone", "Email"];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const MAX_PHOTOS = 5;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024; // 3MB per photo
// Combined cap across every attached photo — see file header for why.
const MAX_TOTAL_ATTACHMENTS_BYTES = 4 * 1024 * 1024;
const MAX_FILENAME_LENGTH = 200;

// Best-effort, in-memory, per-instance rate limit. See file header.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitHits.set(ip, recent);
  // Opportunistic cleanup so the map doesn't grow without bound.
  if (rateLimitHits.size > 5000) {
    for (const [key, hits] of rateLimitHits) {
      if (hits.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) rateLimitHits.delete(key);
    }
  }
  return recent.length > RATE_LIMIT_MAX_REQUESTS;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isValidEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// Same practical U.S.-phone acceptance as app/api/quote/route.ts.
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

function sanitizeFilename(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "file";
  const cleaned = base.replace(/[\x00-\x1f]/g, "").trim();
  return (cleaned || "file").slice(0, MAX_FILENAME_LENGTH);
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function buildEmailHtml(submission: Record<string, unknown>, attachmentSummary: string): string {
  const rows: [string, unknown][] = [
    ["Customer name", submission.name],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["Installation address", submission.address],
    ["Approx. installation date", submission.installDate],
    ["Product type", submission.productType],
    ["What they need help with", submission.issueType],
    ["Description of issue", submission.description],
    ["Preferred contact method", submission.contactMethod],
    ["Attachments", attachmentSummary || "None"],
    ["Submission ID", submission.id],
    ["Received", submission.receivedAt],
  ];

  const rowsHtml = rows
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([label, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#7d5a3a;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");

  return `<div style="font-family:sans-serif;font-size:14px;color:#2a2622;"><h2 style="font-weight:600;">New Warranty / Service Request</h2><table>${rowsHtml}</table></div>`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a few minutes and try again, or reach out through our contact page." },
        { status: 429 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Request body must be valid form data." }, { status: 400 });
    }

    // Honeypot — real visitors never see or fill this field. Respond as if
    // the submission succeeded so bots don't learn the check exists, but
    // skip all processing and delivery.
    const website = formData.get("website");
    if (isPlainString(website) && website.trim() !== "") {
      return NextResponse.json({ success: true, id: randomUUID() }, { status: 201 });
    }

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      installDate: formData.get("installDate"),
      productType: formData.get("productType"),
      issueType: formData.get("issueType"),
      description: formData.get("description"),
      contactMethod: formData.get("contactMethod"),
      sourcePage: formData.get("sourcePage"),
    };

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
    if (!PRODUCT_TYPES.includes(data.productType as string)) {
      return NextResponse.json({ error: "Please select a valid product type." }, { status: 400 });
    }
    if (!ISSUE_TYPES.includes(data.issueType as string)) {
      return NextResponse.json({ error: "Please select what you need help with." }, { status: 400 });
    }
    if (isPlainString(data.contactMethod) && data.contactMethod !== "" && !CONTACT_METHODS.includes(data.contactMethod)) {
      return NextResponse.json({ error: "Please select a valid preferred contact method." }, { status: 400 });
    }

    for (const [field, max] of Object.entries(MAX_LENGTHS)) {
      const value = data[field];
      if (typeof value === "string" && value.length > max) {
        return NextResponse.json({ error: `Field "${field}" exceeds the maximum length of ${max} characters.` }, { status: 400 });
      }
    }

    // --- Attachments ---
    const photoFiles = formData.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);

    if (photoFiles.length > MAX_PHOTOS) {
      return NextResponse.json({ error: `A maximum of ${MAX_PHOTOS} photos can be attached.` }, { status: 400 });
    }
    for (const file of photoFiles) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: `"${file.name}" isn't a supported image type. Use JPG, PNG, or WEBP.` }, { status: 400 });
      }
      if (file.size > MAX_PHOTO_BYTES) {
        return NextResponse.json({ error: `"${file.name}" is over the ${formatBytes(MAX_PHOTO_BYTES)} limit per photo.` }, { status: 400 });
      }
    }

    const totalBytes = photoFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > MAX_TOTAL_ATTACHMENTS_BYTES) {
      return NextResponse.json(
        { error: `Photos must total ${formatBytes(MAX_TOTAL_ATTACHMENTS_BYTES)} or less. Please remove one and try again.` },
        { status: 400 }
      );
    }

    const submission: Record<string, unknown> = {
      id: randomUUID(),
      receivedAt: new Date().toISOString(),
      ...data,
    };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    if (!RESEND_API_KEY || !LEAD_NOTIFICATION_EMAIL) {
      console.error(
        "Warranty/service request delivery is not configured (missing RESEND_API_KEY and/or LEAD_NOTIFICATION_EMAIL). Submission was NOT delivered:",
        { id: submission.id, receivedAt: submission.receivedAt }
      );
      return NextResponse.json(
        { success: false, delivered: false, error: "We're not able to accept online requests just yet. Please try again soon, or reach out another way from our contact page." },
        { status: 503 }
      );
    }

    try {
      const attachments = await Promise.all(
        photoFiles.map(async (file) => {
          const buffer = Buffer.from(await file.arrayBuffer());
          return { filename: sanitizeFilename(file.name), content: buffer.toString("base64") };
        })
      );

      const attachmentSummary = photoFiles.length > 0 ? `${photoFiles.length} photo(s) attached` : "None";

      const leadName = typeof submission.name === "string" ? submission.name : "Website Visitor";
      const productLabel = typeof submission.productType === "string" ? submission.productType : "Warranty/Service";

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
          subject: `Warranty/Service Request: ${productLabel} — ${leadName}`,
          html: buildEmailHtml(submission, attachmentSummary),
          attachments: attachments.length > 0 ? attachments : undefined,
        }),
      });

      if (!emailRes.ok) {
        console.error("Warranty/service email delivery failed with status", emailRes.status, "for submission", submission.id);
        return NextResponse.json(
          { success: false, delivered: false, error: "We couldn't deliver your request right now. Please try again in a moment." },
          { status: 502 }
        );
      }
    } catch (err) {
      console.error("Warranty/service email delivery threw an error for submission", submission.id, err);
      return NextResponse.json(
        { success: false, delivered: false, error: "We couldn't deliver your request right now. Please try again in a moment." },
        { status: 502 }
      );
    }

    console.log("Warranty/service request delivered successfully:", { id: submission.id, receivedAt: submission.receivedAt });

    return NextResponse.json({ success: true, delivered: true, id: submission.id }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error handling warranty/service submission:", err);
    return NextResponse.json({ error: "Something went wrong processing your request. Please try again or call us directly." }, { status: 500 });
  }
}
