"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Upload, X } from "lucide-react";
import { services } from "@/lib/data/services";
import { business } from "@/lib/data/business";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

type FormState = {
  name: string;
  phone: string;
  email: string;
  address: string;
  products: string[];
  windowQuantity: string;
  approxSizes: string;
  timeline: string;
  budget: string;
  consultationDate: string;
  consultationTime: string;
  photos: File[];
  /** Honeypot — must stay empty. Hidden from real visitors via CSS. */
  website: string;
};

const initialState: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  products: [],
  windowQuantity: "",
  approxSizes: "",
  timeline: "",
  budget: "",
  consultationDate: "",
  consultationTime: "",
  photos: [],
  website: "",
};

const steps = ["Contact Info", "Project Details", "Timeline & Budget", "Photos & Schedule", "Review"];

const timelineOptions = ["As soon as possible", "Within 1 month", "1–3 months", "3–6 months", "Just researching"];
const budgetOptions = ["Under $2,500", "$2,500–$5,000", "$5,000–$10,000", "$10,000–$25,000", "$25,000+"];

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE_MB = 8;
const MAX_PHOTOS = 10;

export function QuoteForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const toggleProduct = (name: string) =>
    setForm((f) => ({
      ...f,
      products: f.products.includes(name) ? f.products.filter((p) => p !== name) : [...f.products, name],
    }));

  const canProceed = () => {
    if (step === 0) return form.name.trim() && form.phone.trim() && form.email.trim() && form.address.trim();
    if (step === 1) return form.products.length > 0 && form.windowQuantity.trim();
    if (step === 2) return form.timeline && form.budget;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleFileSelect = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const incoming = Array.from(fileList);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of incoming) {
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (unsupported file type — use JPG, PNG, or WEBP)`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        rejected.push(`${file.name} (over ${MAX_FILE_SIZE_MB}MB)`);
        continue;
      }
      accepted.push(file);
    }

    const combined = [...form.photos, ...accepted].slice(0, MAX_PHOTOS);
    const overflow = form.photos.length + accepted.length - combined.length;

    update("photos", combined);

    if (rejected.length > 0) {
      setPhotoError(`Some files weren't added: ${rejected.join(", ")}.`);
    } else if (overflow > 0) {
      setPhotoError(`Only the first ${MAX_PHOTOS} photos can be attached.`);
    } else {
      setPhotoError(null);
    }
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          photos: form.photos.map((f) => f.name),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Submission failed");
      }
      setSubmitted(true);
    } catch {
      setError(
        business.contact.phoneVerified
          ? `Something went wrong sending your request. Please call us at ${business.contact.phoneDisplay} and we'll get you scheduled directly.`
          : "Something went wrong sending your request. Please try again, or reach us through the contact page."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-oak/15">
          <Check className="h-7 w-7 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
        </div>
        <h2 className="mt-6 font-display text-3xl text-charcoal">Request received</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-charcoal-soft">
          Thank you, {form.name.split(" ")[0] || "there"}. A {business.name} consultant will reach out within one
          business day to confirm your free in-home consultation.
        </p>
        <Button href="/" variant="secondary" className="mt-8">
          Back to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* Honeypot — real visitors never see or fill this in; bots that
          auto-fill every field will, and the API silently drops those. */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="website">Leave this field empty</label>
        <input
          id="website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => update("website", e.target.value)}
        />
      </div>

      {/* Progress */}
      <div className="mb-10 flex items-center gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 flex-col gap-2">
            <div
              className={cn(
                "h-1 rounded-full transition-colors",
                i <= step ? "bg-oak-dark" : "bg-charcoal/10"
              )}
            />
            <span className={cn("hidden text-[10px] uppercase tracking-wide sm:block", i === step ? "text-charcoal font-medium" : "text-charcoal-soft/60")}>
              {label}
            </span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
        >
          {step === 0 && (
            <div className="space-y-5">
              <h2 className="font-display text-2xl text-charcoal">Let&apos;s start with you</h2>
              <Field label="Full Name">
                <input value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} placeholder="Jane Whitfield" />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Phone">
                  <input value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} placeholder="(214) 555-0192" type="tel" />
                </Field>
                <Field label="Email">
                  <input value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} placeholder="jane@email.com" type="email" />
                </Field>
              </div>
              <Field label="Home Address">
                <input value={form.address} onChange={(e) => update("address", e.target.value)} className={inputClass} placeholder="123 Lakeview Drive, Rockwall, TX" />
              </Field>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-charcoal">What are you interested in?</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {services.map((s) => (
                  <button
                    key={s.slug}
                    type="button"
                    onClick={() => toggleProduct(s.name)}
                    aria-pressed={form.products.includes(s.name)}
                    className={cn(
                      "rounded-sm border px-4 py-3 text-left text-[13px] font-medium transition-colors",
                      form.products.includes(s.name)
                        ? "border-matte-black bg-matte-black text-warm-white"
                        : "border-charcoal/15 text-charcoal-soft hover:border-charcoal"
                    )}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Approximate Window Quantity">
                  <input value={form.windowQuantity} onChange={(e) => update("windowQuantity", e.target.value)} className={inputClass} placeholder="e.g. 8 windows" />
                </Field>
                <Field label="Approximate Sizes (optional)">
                  <input value={form.approxSizes} onChange={(e) => update("approxSizes", e.target.value)} className={inputClass} placeholder="e.g. mostly 36in x 60in" />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl text-charcoal">Timeline</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {timelineOptions.map((opt) => (
                    <Pill key={opt} active={form.timeline === opt} onClick={() => update("timeline", opt)} label={opt} />
                  ))}
                </div>
              </div>
              <div>
                <h2 className="font-display text-2xl text-charcoal">Estimated Budget</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {budgetOptions.map((opt) => (
                    <Pill key={opt} active={form.budget === opt} onClick={() => update("budget", opt)} label={opt} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-2xl text-charcoal">Upload photos (optional)</h2>
                <p className="mt-1 text-[13px] text-charcoal-soft">
                  Photos of your windows help us prepare an accurate estimate. JPG, PNG, or WEBP, up to {MAX_FILE_SIZE_MB}MB each, {MAX_PHOTOS} max. File names are included with your request today — a team member will follow up separately to collect the actual images.
                </p>
                <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border-2 border-dashed border-charcoal/20 px-6 py-10 text-center transition-colors hover:border-oak-dark">
                  <Upload className="h-5 w-5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
                  <span className="text-[13px] text-charcoal-soft">Click to upload, or drag files here</span>
                  <input
                    type="file"
                    multiple
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    className="hidden"
                    onChange={(e) => {
                      handleFileSelect(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>
                {photoError && (
                  <p role="alert" className="mt-2 text-[12px] text-red-700">
                    {photoError}
                  </p>
                )}
                {form.photos.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {form.photos.map((f, i) => (
                      <li key={i} className="flex items-center justify-between rounded-sm bg-cream px-4 py-2 text-[12px] text-charcoal-soft">
                        {f.name}
                        <button
                          type="button"
                          onClick={() => update("photos", form.photos.filter((_, idx) => idx !== i))}
                          aria-label={`Remove ${f.name}`}
                        >
                          <X className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h2 className="font-display text-2xl text-charcoal">Preferred consultation time</h2>
                <div className="mt-4 grid gap-5 sm:grid-cols-2">
                  <Field label="Preferred Date">
                    <input type="date" value={form.consultationDate} onChange={(e) => update("consultationDate", e.target.value)} className={inputClass} />
                  </Field>
                  <Field label="Preferred Time">
                    <select value={form.consultationTime} onChange={(e) => update("consultationTime", e.target.value)} className={inputClass}>
                      <option value="">Select a window</option>
                      <option>Morning (8am–11am)</option>
                      <option>Midday (11am–2pm)</option>
                      <option>Afternoon (2pm–5pm)</option>
                      <option>Evening (5pm–7pm)</option>
                    </select>
                  </Field>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl text-charcoal">Review your request</h2>
              <dl className="divide-y divide-charcoal/10 rounded-sm border border-charcoal/10">
                {[
                  ["Name", form.name],
                  ["Phone", form.phone],
                  ["Email", form.email],
                  ["Address", form.address],
                  ["Products", form.products.join(", ") || "—"],
                  ["Window Quantity", form.windowQuantity || "—"],
                  ["Approx. Sizes", form.approxSizes || "—"],
                  ["Timeline", form.timeline || "—"],
                  ["Budget", form.budget || "—"],
                  ["Preferred Consultation", [form.consultationDate, form.consultationTime].filter(Boolean).join(" · ") || "—"],
                  ["Photos", form.photos.length ? `${form.photos.length} file name(s) included` : "None"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 px-5 py-3 text-[13px]">
                    <dt className="text-charcoal-soft">{label}</dt>
                    <dd className="text-right font-medium text-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
              {error && <p role="alert" aria-live="assertive" className="text-[13px] text-red-700">{error}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={back}
          className={cn("text-[13px] font-medium text-charcoal-soft hover:text-charcoal", step === 0 && "invisible")}
        >
          Back
        </button>
        {step < steps.length - 1 ? (
          <Button onClick={next} disabled={!canProceed()}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-4 py-3 text-[14px] text-charcoal placeholder:text-charcoal/35 outline-none transition-colors focus:border-oak-dark";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">{label}</span>
      {children}
    </label>
  );
}

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-sm border px-4 py-3 text-left text-[13px] font-medium transition-colors",
        active ? "border-matte-black bg-matte-black text-warm-white" : "border-charcoal/15 text-charcoal-soft hover:border-charcoal"
      )}
    >
      {label}
    </button>
  );
}
