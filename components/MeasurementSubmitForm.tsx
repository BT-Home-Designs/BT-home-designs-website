"use client";

import { useId, useState } from "react";
import { Check, Loader2, Upload, X } from "lucide-react";
import { Button } from "./Button";
import { trackLead } from "@/lib/analytics";
import { MEASUREMENT_PHOTOS, WORKSHEET_FIELDS, type WorksheetRow } from "@/lib/measuring";

/**
 * Sends the How to Measure worksheet and window photos to BT Home Designs
 * (app/api/measurements/route.ts). Photos are real file uploads: each one is
 * downscaled in the browser first so ordinary phone photos fit the request
 * size limit. The success message is only shown after the server confirms
 * delivery, and it reports the counts the server actually received.
 */

const { maxPhotos, maxPhotoBytes, maxTotalBytes, acceptedTypes } = MEASUREMENT_PHOTOS;
// Phones may hand over HEIC; we try to convert it to JPEG in the browser.
const PICKER_TYPES = [...acceptedTypes, "image/heic", "image/heif"];
const MAX_DIMENSION = 1600;
const JPEG_QUALITY = 0.82;
const CONTACT_METHODS = ["Text", "Phone", "Email"];

type Photo = { key: string; file: File; label: string };

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0KB";
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))}KB` : `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/** Downscale to MAX_DIMENSION and re-encode as JPEG. Returns null if the browser can't decode the image. */
async function prepareImage(file: File): Promise<File | null> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("no canvas");
    ctx.fillStyle = "#ffffff"; // transparent PNGs become white, not black
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY));
    if (!blob) throw new Error("encode failed");
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    // Keep the original if it was already smaller and in a type the server accepts.
    if (blob.size >= file.size && acceptedTypes.includes(file.type)) return file;
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return acceptedTypes.includes(file.type) ? file : null;
  }
}

export function MeasurementSubmitForm({ rows }: { rows: WorksheetRow[] }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", location: "", contactMethod: "", message: "", website: "" });
  const [consent, setConsent] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [processing, setProcessing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ windows: number; photos: number } | null>(null);
  const [sourcePage] = useState(() => (typeof document !== "undefined" ? document.referrer || "direct" : "direct"));
  const id = useId();

  const update = (key: keyof typeof form, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const windowNames = rows.map((r, i) => r.room.trim() || `Window ${i + 1}`);
  const totalBytes = photos.reduce((sum, p) => sum + p.file.size, 0);

  const addPhotos = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setProcessing(true);
    const rejected: string[] = [];
    const accepted: Photo[] = [];
    let count = photos.length;
    let running = totalBytes;
    for (const original of Array.from(fileList)) {
      if (count >= maxPhotos) {
        rejected.push(`${original.name} (max ${maxPhotos} photos)`);
        continue;
      }
      if (!original.type.startsWith("image/")) {
        rejected.push(`${original.name} (not an image)`);
        continue;
      }
      const file = await prepareImage(original);
      if (!file) {
        rejected.push(`${original.name} (this browser can't read that format — please use a JPG or PNG)`);
        continue;
      }
      if (file.size > maxPhotoBytes) {
        rejected.push(`${original.name} (over ${formatBytes(maxPhotoBytes)})`);
        continue;
      }
      if (running + file.size > maxTotalBytes) {
        rejected.push(`${original.name} (would go over the ${formatBytes(maxTotalBytes)} total)`);
        continue;
      }
      running += file.size;
      count += 1;
      accepted.push({ key: `${Date.now()}-${count}-${original.name}`, file, label: "" });
    }
    setPhotos((p) => [...p, ...accepted]);
    setFileError(rejected.length ? `Some photos weren't added: ${rejected.join("; ")}.` : null);
    setProcessing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || processing) return;
    if (rows.length === 0) {
      setError("Add at least one window to the worksheet above before sending.");
      return;
    }
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
      setError("Please fill in your name, email, and phone.");
      return;
    }
    if (!consent) {
      setError("Please check the box to confirm we can contact you about your measurements.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = new FormData();
      for (const [k, v] of Object.entries(form)) body.append(k, v);
      body.append("consent", "yes");
      body.append("sourcePage", sourcePage);
      body.append(
        "worksheet",
        JSON.stringify(rows.map((r) => Object.fromEntries(WORKSHEET_FIELDS.map((f) => [f, r[f]]))))
      );
      for (const p of photos) {
        body.append("photos", p.file);
        body.append("photoLabels", p.label);
      }
      const res = await fetch("/api/measurements", { method: "POST", body });
      const json: { error?: string; delivered?: boolean; windows?: number; photos?: number } | null = await res
        .json()
        .catch(() => null);
      if (!res.ok || !json?.delivered) {
        throw new Error(json?.error ?? "Submission failed");
      }
      setResult({ windows: json.windows ?? rows.length, photos: json.photos ?? photos.length });
      trackLead("measurements");
    } catch (err) {
      const apiMessage = err instanceof Error && err.message !== "Submission failed" ? err.message : null;
      setError(
        `${apiMessage ?? "Something went wrong sending your measurements."} Nothing was sent. Your worksheet is still saved on this device, so you can try again, or use Copy as text above and share it through our contact page.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    return (
      <div id="send-measurements" className="scroll-mt-28 rounded-sm border border-charcoal/10 bg-warm-white p-8 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-oak/15">
          <Check className="h-5 w-5 text-oak-dark" aria-hidden="true" />
        </div>
        <p className="mt-4 font-display text-2xl text-charcoal">Measurements received</p>
        <p className="mx-auto mt-2 max-w-md text-[14px] leading-relaxed text-charcoal-soft">
          BT Home Designs received {result.windows} window{result.windows === 1 ? "" : "s"}
          {result.photos ? ` and ${result.photos} photo${result.photos === 1 ? "" : "s"}` : " (no photos)"}. We&apos;ll review
          them and contact you about your preliminary estimate. Final measurements are always confirmed in person before
          anything is ordered.
        </p>
      </div>
    );
  }

  return (
    <form id="send-measurements" onSubmit={handleSubmit} noValidate className="scroll-mt-28 rounded-sm border border-oak/40 bg-warm-white p-5 md:p-8">
      <h3 className="font-display text-2xl text-charcoal">Send your measurements and photos</h3>
      <p className="mt-2 text-[14px] leading-relaxed text-charcoal-soft">
        This sends every filled-in window on the worksheet above, plus any photos you add, straight to BT Home Designs.
      </p>

      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Leave this field empty</label>
        <input id={`${id}-website`} tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => update("website", e.target.value)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" required htmlFor={`${id}-name`}>
          <input id={`${id}-name`} autoComplete="name" maxLength={120} value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Phone" required htmlFor={`${id}-phone`}>
          <input id={`${id}-phone`} type="tel" autoComplete="tel" maxLength={30} value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Email" required htmlFor={`${id}-email`}>
          <input id={`${id}-email`} type="email" autoComplete="email" maxLength={254} value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Address, city, or ZIP" htmlFor={`${id}-location`}>
          <input id={`${id}-location`} autoComplete="street-address" maxLength={240} value={form.location} onChange={(e) => update("location", e.target.value)} className={inputClass} />
        </Field>
        <Field label="Preferred contact method" htmlFor={`${id}-contact`}>
          <select id={`${id}-contact`} value={form.contactMethod} onChange={(e) => update("contactMethod", e.target.value)} className={inputClass}>
            <option value="">No preference</option>
            {CONTACT_METHODS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </Field>
        <Field label="Anything else we should know?" htmlFor={`${id}-message`}>
          <input id={`${id}-message`} maxLength={2000} value={form.message} onChange={(e) => update("message", e.target.value)} className={inputClass} placeholder="Optional" />
        </Field>
      </div>

      <div className="mt-6">
        <p className="text-[12px] font-medium text-charcoal-soft">Photos (optional, up to {maxPhotos})</p>
        <p className="mt-1 text-[12.5px] leading-relaxed text-charcoal-soft">
          Straight-on photos of each window, plus close-ups of any rod or track. Photos are resized on your device before
          sending.
        </p>
        <label className="mt-3 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-charcoal/20 px-6 py-7 text-center transition-colors hover:border-oak-dark">
          {processing ? (
            <Loader2 className="h-5 w-5 animate-spin text-oak-dark" aria-hidden="true" />
          ) : (
            <Upload className="h-5 w-5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
          )}
          <span className="text-[13px] text-charcoal-soft">{processing ? "Preparing photos…" : "Click or tap to add photos"}</span>
          <span className="text-[11px] text-charcoal-soft/70">
            {photos.length} of {maxPhotos} added · {formatBytes(totalBytes)} of {formatBytes(maxTotalBytes)} used
          </span>
          <input
            type="file"
            multiple
            accept={PICKER_TYPES.join(",")}
            className="sr-only"
            aria-label="Add window photos"
            disabled={processing || photos.length >= maxPhotos}
            onChange={(e) => {
              void addPhotos(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {fileError && (
          <p role="alert" className="mt-2 text-[12px] text-red-700">
            {fileError}
          </p>
        )}
        {photos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {photos.map((p, i) => (
              <li key={p.key} className="flex flex-col gap-2 rounded-sm bg-cream px-4 py-3 text-[12px] text-charcoal-soft sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 truncate">
                  {p.file.name} ({formatBytes(p.file.size)})
                </span>
                <label className="sr-only" htmlFor={`${id}-photo-${i}`}>
                  Which window is {p.file.name}?
                </label>
                <select
                  id={`${id}-photo-${i}`}
                  value={p.label}
                  onChange={(e) => setPhotos((ps) => ps.map((x) => (x.key === p.key ? { ...x, label: e.target.value } : x)))}
                  className="rounded-sm border border-charcoal/15 bg-warm-white px-2 py-2 text-[14px] text-charcoal"
                >
                  <option value="">Which window?</option>
                  {windowNames.map((n, wi) => (
                    <option key={`${wi}-${n}`} value={n.slice(0, MEASUREMENT_PHOTOS.maxLabelLength)}>
                      {n}
                    </option>
                  ))}
                  <option value="General / whole room">General / whole room</option>
                </select>
                <button
                  type="button"
                  onClick={() => setPhotos((ps) => ps.filter((x) => x.key !== p.key))}
                  aria-label={`Remove ${p.file.name}`}
                  className="flex items-center gap-1 self-end text-charcoal-soft hover:text-oak-dark sm:self-auto"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <label htmlFor={`${id}-consent`} className="mt-6 flex items-start gap-3 text-[13px] text-charcoal-soft">
        <input
          id={`${id}-consent`}
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-oak-dark"
        />
        <span>
          I agree to be contacted by BT Home Designs by phone, text, or email about this request. We won&apos;t share your
          information with third parties for marketing purposes.
        </span>
      </label>

      <p className="mt-5 text-[13px] text-charcoal">
        Ready to send: <strong>{rows.length}</strong> window{rows.length === 1 ? "" : "s"} and <strong>{photos.length}</strong>{" "}
        photo{photos.length === 1 ? "" : "s"}.
      </p>

      {error && (
        <p role="alert" aria-live="assertive" className="mt-3 text-[13px] leading-relaxed text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting || processing} className="mt-5 w-full justify-center sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending
          </>
        ) : (
          "Send Measurements"
        )}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/15 bg-warm-white px-3.5 py-3 text-[16px] text-charcoal placeholder:text-charcoal-soft/50 focus:border-oak-dark focus:outline-none";

function Field({ label, required, htmlFor, children }: { label: string; required?: boolean; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">
        {label}
        {required && <span className="text-oak-dark"> *</span>}
      </label>
      {children}
    </div>
  );
}
