import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import {
  MAX_WORKSHEET_ROWS,
  MEASUREMENT_PHOTOS,
  WORKSHEET_FIELDS,
  WORKSHEET_FIELD_LIMITS,
  WORKSHEET_LABELS,
  isRowFilled,
  worksheetToText,
  type WorksheetField,
} from "@/lib/measuring";

/**
 * MEASUREMENT SUBMISSIONS from the /how-to-measure page.
 *
 * Receives the customer's full worksheet (every window, as JSON) plus real
 * photo files, and emails them to BT Home Designs through the same Resend
 * setup as app/api/quote and app/api/warranty (RESEND_API_KEY +
 * LEAD_NOTIFICATION_EMAIL; optional RESEND_FROM_EMAIL). The email contains:
 *   - contact details and message
 *   - an HTML table and a plain-text copy of every worksheet row
 *   - a CSV of the worksheet as an attachment
 *   - each photo as a real attachment, named after the window it belongs to
 *
 * Like the other routes, it never reports success unless Resend accepted the
 * email: missing configuration returns 503 and a failed send returns 502.
 *
 * Size limits (lib/measuring.ts): photos are downscaled in the browser first;
 * the server still enforces per-photo and combined caps because the default
 * Vercel serverless request body limit is ~4.5MB (see the warranty route).
 *
 * Spam protection: honeypot + best-effort in-memory per-IP rate limit, same
 * as app/api/warranty/route.ts.
 */

const DEFAULT_FROM_EMAIL = "BT Home Designs Website <leads@mail.bthomedesigns.com>";

const REQUIRED_FIELDS = ["name", "email", "phone"] as const;

const MAX_LENGTHS: Record<string, number> = {
  name: 120,
  email: 254,
  phone: 30,
  location: 240,
  contactMethod: 20,
  message: 2000,
  sourcePage: 500,
};

const CONTACT_METHODS = ["Text", "Phone", "Email"];

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const rateLimitHits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (rateLimitHits.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  rateLimitHits.set(ip, recent);
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

function isValidPhone(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const digits = value.replace(/[^\d]/g, "");
  return digits.length >= 7 && digits.length <= 15 && /^[\d\s().+-]+$/.test(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

const EXTENSIONS: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };

// Quote every cell, and neutralize values a spreadsheet would run as a formula.
function csvCell(value: string): string {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

type Row = Record<WorksheetField, string>;

function parseWorksheet(raw: unknown): { rows: Row[] } | { error: string } {
  if (typeof raw !== "string" || raw.trim() === "") return { error: "Please add at least one window to your worksheet." };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { error: "The worksheet couldn't be read. Please try again." };
  }
  if (!Array.isArray(parsed)) return { error: "The worksheet couldn't be read. Please try again." };
  if (parsed.length > MAX_WORKSHEET_ROWS) return { error: `A maximum of ${MAX_WORKSHEET_ROWS} windows can be sent at once.` };

  const rows: Row[] = [];
  for (const item of parsed) {
    if (!item || typeof item !== "object") return { error: "The worksheet couldn't be read. Please try again." };
    const source = item as Record<string, unknown>;
    const row = {} as Row;
    for (const field of WORKSHEET_FIELDS) {
      const value = source[field] ?? "";
      if (typeof value !== "string") return { error: "The worksheet couldn't be read. Please try again." };
      if (value.length > WORKSHEET_FIELD_LIMITS[field]) {
        return { error: `"${WORKSHEET_LABELS[field]}" is limited to ${WORKSHEET_FIELD_LIMITS[field]} characters per window.` };
      }
      row[field] = value.trim();
    }
    if (isRowFilled(row)) rows.push(row);
  }
  if (rows.length === 0) return { error: "Please add at least one window to your worksheet." };
  return { rows };
}

type PhotoInfo = { attachmentName: string; originalName: string; label: string; bytes: number };

function buildEmailHtml(submission: Record<string, unknown>, rows: Row[], photos: PhotoInfo[]): string {
  const cell = "padding:6px 8px;border:1px solid #d9cfc1;vertical-align:top;white-space:pre-wrap;";
  const details: [string, unknown][] = [
    ["Customer name", submission.name],
    ["Email", submission.email],
    ["Phone", submission.phone],
    ["Address / city / ZIP", submission.location],
    ["Preferred contact method", submission.contactMethod],
    ["Message", submission.message],
    ["Consent to contact", "Yes"],
    ["Windows in worksheet", String(rows.length)],
    ["Photos attached", photos.length ? String(photos.length) : "None"],
    ["Source page", submission.sourcePage],
    ["Submission ID", submission.id],
    ["Received", submission.receivedAt],
  ];
  const detailsHtml = details
    .filter(([, v]) => typeof v === "string" && v !== "")
    .map(
      ([label, v]) =>
        `<tr><td style="padding:4px 12px 4px 0;color:#7d5a3a;font-weight:600;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:4px 0;white-space:pre-wrap;">${escapeHtml(String(v))}</td></tr>`
    )
    .join("");

  const head = ["#", ...WORKSHEET_FIELDS.map((f) => WORKSHEET_LABELS[f])]
    .map((h) => `<th style="${cell}background:#f1e9dd;text-align:left;">${escapeHtml(h)}</th>`)
    .join("");
  const body = rows
    .map(
      (r, i) =>
        `<tr><td style="${cell}">${i + 1}</td>${WORKSHEET_FIELDS.map((f) => `<td style="${cell}">${escapeHtml(r[f])}</td>`).join("")}</tr>`
    )
    .join("");

  const photosHtml = photos.length
    ? `<h3 style="font-weight:600;margin-top:24px;">Photos</h3><ul>${photos
        .map(
          (p) =>
            `<li>${escapeHtml(p.attachmentName)} — ${escapeHtml(p.label || "No window selected")} (uploaded as ${escapeHtml(p.originalName)}, ${escapeHtml(formatBytes(p.bytes))})</li>`
        )
        .join("")}</ul>`
    : "";

  return `<div style="font-family:sans-serif;font-size:14px;color:#2a2622;">
<h2 style="font-weight:600;">New Measurement Submission</h2>
<p style="color:#454039;">Customer-taken preliminary measurements from the How to Measure page. Confirm final measurements before ordering.</p>
<table>${detailsHtml}</table>
<h3 style="font-weight:600;margin-top:24px;">Worksheet</h3>
<table style="border-collapse:collapse;font-size:13px;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
${photosHtml}
<p style="color:#454039;font-size:12px;margin-top:16px;">The worksheet is also attached as a CSV file.</p>
</div>`;
}

export async function POST(request: Request) {
  const ip = getClientIp(request);

  try {
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { success: false, error: "Too many requests. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json({ error: "Request body must be valid form data." }, { status: 400 });
    }

    // Honeypot — see app/api/warranty/route.ts.
    const website = formData.get("website");
    if (typeof website === "string" && website.trim() !== "") {
      return NextResponse.json({ success: true, id: randomUUID() }, { status: 201 });
    }

    const data: Record<string, unknown> = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      location: formData.get("location"),
      contactMethod: formData.get("contactMethod"),
      message: formData.get("message"),
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
    if (typeof data.contactMethod === "string" && data.contactMethod !== "" && !CONTACT_METHODS.includes(data.contactMethod)) {
      return NextResponse.json({ error: "Please select a valid preferred contact method." }, { status: 400 });
    }
    if (formData.get("consent") !== "yes") {
      return NextResponse.json({ error: "Please confirm you agree to be contacted about this request." }, { status: 400 });
    }
    for (const [field, max] of Object.entries(MAX_LENGTHS)) {
      const value = data[field];
      if (typeof value === "string" && value.length > max) {
        return NextResponse.json({ error: `Field "${field}" exceeds the maximum length of ${max} characters.` }, { status: 400 });
      }
    }

    const worksheet = parseWorksheet(formData.get("worksheet"));
    if ("error" in worksheet) {
      return NextResponse.json({ error: worksheet.error }, { status: 400 });
    }
    const { rows } = worksheet;

    // --- Photos ---
    const photoFiles = formData.getAll("photos").filter((v): v is File => v instanceof File && v.size > 0);
    const photoLabels = formData.getAll("photoLabels").map((v) => (typeof v === "string" ? v.trim() : ""));
    const { maxPhotos, maxPhotoBytes, maxTotalBytes, acceptedTypes, maxLabelLength } = MEASUREMENT_PHOTOS;

    if (photoFiles.length > maxPhotos) {
      return NextResponse.json({ error: `A maximum of ${maxPhotos} photos can be attached.` }, { status: 400 });
    }
    for (const file of photoFiles) {
      if (!acceptedTypes.includes(file.type)) {
        return NextResponse.json({ error: `"${file.name}" isn't a supported image type. Use JPG, PNG, or WEBP.` }, { status: 400 });
      }
      if (file.size > maxPhotoBytes) {
        return NextResponse.json({ error: `"${file.name}" is over the ${formatBytes(maxPhotoBytes)} limit per photo.` }, { status: 400 });
      }
    }
    if (photoLabels.some((l) => l.length > maxLabelLength)) {
      return NextResponse.json({ error: "A photo label is too long." }, { status: 400 });
    }
    const totalBytes = photoFiles.reduce((sum, f) => sum + f.size, 0);
    if (totalBytes > maxTotalBytes) {
      return NextResponse.json(
        { error: `Photos must total ${formatBytes(maxTotalBytes)} or less. Please remove one and try again.` },
        { status: 400 }
      );
    }

    const submission: Record<string, unknown> = { id: randomUUID(), receivedAt: new Date().toISOString(), ...data };

    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const LEAD_NOTIFICATION_EMAIL = process.env.LEAD_NOTIFICATION_EMAIL;
    const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || DEFAULT_FROM_EMAIL;

    if (!RESEND_API_KEY || !LEAD_NOTIFICATION_EMAIL) {
      console.error(
        "Measurement submission delivery is not configured (missing RESEND_API_KEY and/or LEAD_NOTIFICATION_EMAIL). Submission was NOT delivered:",
        { id: submission.id, receivedAt: submission.receivedAt }
      );
      return NextResponse.json(
        {
          success: false,
          delivered: false,
          error: "We're not able to accept measurements online just yet.",
        },
        { status: 503 }
      );
    }

    try {
      const photoInfo: PhotoInfo[] = photoFiles.map((file, i) => {
        const label = photoLabels[i] ?? "";
        const name = `photo-${String(i + 1).padStart(2, "0")}${label ? `-${slug(label)}` : ""}.${EXTENSIONS[file.type]}`;
        return { attachmentName: name, originalName: file.name.slice(0, 200), label, bytes: file.size };
      });
      const photoAttachments = await Promise.all(
        photoFiles.map(async (file, i) => ({
          filename: photoInfo[i].attachmentName,
          content: Buffer.from(await file.arrayBuffer()).toString("base64"),
        }))
      );

      const csv = [
        ["#", ...WORKSHEET_FIELDS.map((f) => WORKSHEET_LABELS[f])].map(csvCell).join(","),
        ...rows.map((r, i) => [String(i + 1), ...WORKSHEET_FIELDS.map((f) => r[f])].map(csvCell).join(",")),
      ].join("\r\n");

      const leadName = typeof submission.name === "string" ? submission.name : "Website Visitor";
      const text = [
        "New Measurement Submission (customer-taken, preliminary)",
        "",
        `Name: ${submission.name}`,
        `Email: ${submission.email}`,
        `Phone: ${submission.phone}`,
        submission.location ? `Address / city / ZIP: ${submission.location}` : "",
        submission.contactMethod ? `Preferred contact: ${submission.contactMethod}` : "",
        submission.message ? `Message: ${submission.message}` : "",
        "",
        "Worksheet:",
        worksheetToText(rows),
        "",
        photoInfo.length
          ? `Photos:\n${photoInfo.map((p) => `  ${p.attachmentName} — ${p.label || "No window selected"}`).join("\n")}`
          : "Photos: none",
        "",
        `Submission ID: ${submission.id}`,
      ]
        .filter((line, i, all) => line !== "" || all[i - 1] !== "")
        .join("\n");

      const emailRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: RESEND_FROM_EMAIL,
          to: LEAD_NOTIFICATION_EMAIL,
          reply_to: typeof submission.email === "string" ? submission.email : undefined,
          subject: `Measurements: ${rows.length} window${rows.length === 1 ? "" : "s"}${photoInfo.length ? `, ${photoInfo.length} photo${photoInfo.length === 1 ? "" : "s"}` : ""} — ${leadName}`,
          html: buildEmailHtml(submission, rows, photoInfo),
          text,
          attachments: [
            { filename: `measurements-${String(submission.id).slice(0, 8)}.csv`, content: Buffer.from("\uFEFF" + csv, "utf8").toString("base64") }, // BOM so Excel reads UTF-8
            ...photoAttachments,
          ],
        }),
      });

      if (!emailRes.ok) {
        console.error("Measurement email delivery failed with status", emailRes.status, "for submission", submission.id);
        return NextResponse.json(
          { success: false, delivered: false, error: "We couldn't send your measurements right now. Please try again in a moment." },
          { status: 502 }
        );
      }
    } catch (err) {
      console.error("Measurement email delivery threw an error for submission", submission.id, err);
      return NextResponse.json(
        { success: false, delivered: false, error: "We couldn't send your measurements right now. Please try again in a moment." },
        { status: 502 }
      );
    }

    console.log("Measurement submission delivered:", { id: submission.id, windows: rows.length, photos: photoFiles.length });
    return NextResponse.json(
      { success: true, delivered: true, id: submission.id, windows: rows.length, photos: photoFiles.length },
      { status: 201 }
    );
  } catch (err) {
    console.error("Unexpected error handling measurement submission:", err);
    return NextResponse.json({ error: "Something went wrong processing your measurements. Please try again." }, { status: 500 });
  }
}
