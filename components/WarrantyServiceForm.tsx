"use client";

import { useId, useState } from "react";
import { Check, Loader2, Upload, Video, X } from "lucide-react";
import { Button } from "./Button";
import { business } from "@/lib/data/business";
import { trackLead } from "@/lib/analytics";
import { cn } from "@/lib/utils";

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
const ACCEPTED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"];

const MAX_PHOTOS = 4;
const MAX_PHOTO_BYTES = 3 * 1024 * 1024;
const MAX_VIDEO_BYTES = 4 * 1024 * 1024;
// Combined cap across every attached file. Kept conservative because these
// are delivered as real email attachments through a serverless function
// with a limited request-body size — see app/api/warranty/route.ts for the
// full explanation.
const MAX_TOTAL_BYTES = 4 * 1024 * 1024;

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  installDate: string;
  productType: string;
  issueType: string;
  description: string;
  contactMethod: string;
  /** Honeypot — must stay empty. Hidden from real visitors via CSS. */
  website: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  phone: "",
  address: "",
  installDate: "",
  productType: "",
  issueType: "",
  description: "",
  contactMethod: "",
  website: "",
};

export function WarrantyServiceForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [photos, setPhotos] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  const [sourcePage] = useState(() => (typeof document !== "undefined" ? document.referrer || "direct" : "direct"));

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const totalBytes = photos.reduce((sum, f) => sum + f.size, 0) + (video?.size ?? 0);
  const remainingBytes = Math.max(0, MAX_TOTAL_BYTES - totalBytes);

  const handlePhotoSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: string[] = [];
    let runningTotal = totalBytes;

    for (const file of incoming) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (use JPG, PNG, or WEBP)`);
        continue;
      }
      if (file.size > MAX_PHOTO_BYTES) {
        rejected.push(`${file.name} (over ${formatBytes(MAX_PHOTO_BYTES)})`);
        continue;
      }
      if (photos.length + accepted.length >= MAX_PHOTOS) {
        rejected.push(`${file.name} (max ${MAX_PHOTOS} photos)`);
        continue;
      }
      if (runningTotal + file.size > MAX_TOTAL_BYTES) {
        rejected.push(`${file.name} (would exceed the ${formatBytes(MAX_TOTAL_BYTES)} total attachment limit)`);
        continue;
      }
      runningTotal += file.size;
      accepted.push(file);
    }

    if (accepted.length > 0) setPhotos((p) => [...p, ...accepted]);
    setFileError(rejected.length > 0 ? `Some files weren't added: ${rejected.join(", ")}.` : null);
  };

  const handleVideoSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (!ACCEPTED_VIDEO_TYPES.includes(file.type)) {
      setFileError(`${file.name}: use MP4, MOV, or WEBM for video.`);
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setFileError(`${file.name} is over the ${formatBytes(MAX_VIDEO_BYTES)} video limit.`);
      return;
    }
    const totalWithoutCurrentVideo = photos.reduce((sum, f) => sum + f.size, 0);
    if (totalWithoutCurrentVideo + file.size > MAX_TOTAL_BYTES) {
      setFileError(`Adding this video would exceed the ${formatBytes(MAX_TOTAL_BYTES)} total attachment limit. Remove a photo first, or attach a smaller clip.`);
      return;
    }
    setFileError(null);
    setVideo(file);
  };

  const canSubmit = Boolean(
    form.name.trim() &&
      form.email.trim() &&
      form.phone.trim() &&
      form.address.trim() &&
      form.productType &&
      form.issueType &&
      form.description.trim()
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    if (!canSubmit) {
      setError("Please fill in every required field before submitting.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("email", form.email);
      body.append("phone", form.phone);
      body.append("address", form.address);
      body.append("installDate", form.installDate);
      body.append("productType", form.productType);
      body.append("issueType", form.issueType);
      body.append("description", form.description);
      body.append("contactMethod", form.contactMethod);
      body.append("website", form.website);
      body.append("sourcePage", sourcePage);
      for (const photo of photos) body.append("photos", photo);
      if (video) body.append("video", video);

      const res = await fetch("/api/warranty", { method: "POST", body });
      if (!res.ok) {
        const responseBody = await res.json().catch(() => null);
        throw new Error(responseBody?.error ?? "Submission failed");
      }
      setSubmitted(true);
      trackLead("warranty");
    } catch (err) {
      const apiMessage = err instanceof Error && err.message && err.message !== "Submission failed" ? err.message : null;
      setError(
        apiMessage ??
          (business.contact.phoneVerified
            ? `Something went wrong sending your request. Please call us at ${business.contact.phoneDisplay}.`
            : "Something went wrong sending your request. Please try again, or reach us through the contact page.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-warm-white p-10 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-oak/15">
          <Check className="h-6 w-6 text-oak-dark" aria-hidden="true" />
        </div>
        <p className="mt-5 font-display text-2xl text-charcoal">Thank you.</p>
        <p className="mt-2 text-[14px] leading-relaxed text-charcoal-soft">
          Your request has been received. BT Home Designs will review the information and contact you regarding the next step.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Honeypot — hidden from real visitors, catches basic bots */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="warranty-website">Leave this field empty</label>
        <input
          id="warranty-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Customer Name" required htmlFor="warranty-name">
          <input
            id="warranty-name"
            required
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email Address" required htmlFor="warranty-email">
          <input
            id="warranty-email"
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Phone Number" required htmlFor="warranty-phone">
          <input
            id="warranty-phone"
            required
            type="tel"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Approximate Installation Date" htmlFor="warranty-install-date">
          <input
            id="warranty-install-date"
            type="date"
            value={form.installDate}
            onChange={(e) => update("installDate", e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <Field label="Installation Address" required htmlFor="warranty-address">
        <input
          id="warranty-address"
          required
          autoComplete="street-address"
          placeholder="123 Lakeview Drive, Rockwall, TX"
          value={form.address}
          onChange={(e) => update("address", e.target.value)}
          className={inputClass}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Product Type" required htmlFor="warranty-product">
          <select
            id="warranty-product"
            required
            value={form.productType}
            onChange={(e) => update("productType", e.target.value)}
            className={inputClass}
          >
            <option value="">Select a product</option>
            {PRODUCT_TYPES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </Field>
        <Field label="What Do You Need Help With?" required htmlFor="warranty-issue">
          <select
            id="warranty-issue"
            required
            value={form.issueType}
            onChange={(e) => update("issueType", e.target.value)}
            className={inputClass}
          >
            <option value="">Select an issue type</option>
            {ISSUE_TYPES.map((i) => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="Description of Issue" required htmlFor="warranty-description">
        <textarea
          id="warranty-description"
          required
          rows={5}
          placeholder="Tell us what's happening — when it started, which window(s) are affected, and anything else that would help us understand the issue."
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
          className={inputClass}
        />
      </Field>

      <Field label="Preferred Contact Method" htmlFor="warranty-contact-method">
        <select
          id="warranty-contact-method"
          value={form.contactMethod}
          onChange={(e) => update("contactMethod", e.target.value)}
          className={inputClass}
        >
          <option value="">No preference</option>
          {CONTACT_METHODS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </Field>

      <div>
        <p className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">Photos (optional, up to {MAX_PHOTOS})</p>
        <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-charcoal/20 px-6 py-8 text-center transition-colors hover:border-oak-dark">
          <Upload className="h-5 w-5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
          <span className="text-[13px] text-charcoal-soft">Click to upload photos, or drag files here</span>
          <span className="text-[11px] text-charcoal-soft/70">
            JPG, PNG, or WEBP · up to {formatBytes(MAX_PHOTO_BYTES)} each · {formatBytes(remainingBytes)} remaining of a {formatBytes(MAX_TOTAL_BYTES)} total (photos + video)
          </span>
          <input
            type="file"
            multiple
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            className="hidden"
            aria-label="Upload photos"
            onChange={(e) => {
              handlePhotoSelect(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
        {photos.length > 0 && (
          <ul className="mt-3 space-y-2">
            {photos.map((f, i) => (
              <li key={i} className="flex items-center justify-between rounded-sm bg-cream px-4 py-2 text-[12px] text-charcoal-soft">
                <span className="truncate pr-2">{f.name} ({formatBytes(f.size)})</span>
                <button
                  type="button"
                  onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                  aria-label={`Remove ${f.name}`}
                  className="shrink-0"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <p className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">Video (optional)</p>
        {video ? (
          <div className="flex items-center justify-between rounded-sm bg-cream px-4 py-3 text-[12px] text-charcoal-soft">
            <span className="flex items-center gap-2 truncate pr-2">
              <Video className="h-4 w-4 shrink-0 text-oak-dark" aria-hidden="true" />
              {video.name} ({formatBytes(video.size)})
            </span>
            <button type="button" onClick={() => setVideo(null)} aria-label={`Remove ${video.name}`} className="shrink-0">
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-charcoal/20 px-6 py-8 text-center transition-colors hover:border-oak-dark">
            <Video className="h-5 w-5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
            <span className="text-[13px] text-charcoal-soft">Click to upload a short video</span>
            <span className="text-[11px] text-charcoal-soft/70">MP4, MOV, or WEBM · up to {formatBytes(MAX_VIDEO_BYTES)}</span>
            <input
              type="file"
              accept={ACCEPTED_VIDEO_TYPES.join(",")}
              className="hidden"
              aria-label="Upload video"
              onChange={(e) => {
                handleVideoSelect(e.target.files);
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>

      {fileError && (
        <p role="alert" className="text-[12px] text-red-700">
          {fileError}
        </p>
      )}

      <p className="rounded-sm bg-cream px-4 py-3.5 text-[12.5px] leading-relaxed text-charcoal-soft">
        Submitting this request does not automatically confirm warranty coverage. Warranty eligibility depends on
        the applicable product warranty, cause of the issue, and product condition. BT Home Designs will review the
        request and help determine the appropriate next step.
      </p>

      {error && (
        <p id={errorId} role="alert" aria-live="assertive" className="text-[13px] text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" disabled={submitting} className="w-full justify-center sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Submitting
          </>
        ) : (
          "Submit Service Request"
        )}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-4 py-3 text-[14px] text-charcoal placeholder:text-charcoal/35 outline-none transition-colors focus:border-oak-dark";

function Field({
  label,
  required,
  htmlFor,
  children,
}: {
  label: string;
  required?: boolean;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className={cn("mb-1.5 block text-[12px] font-medium text-charcoal-soft")}>
        {label}
        {required && <span className="text-oak-dark"> *</span>}
      </span>
      {children}
    </label>
  );
}
