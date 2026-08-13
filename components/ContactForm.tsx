"use client";

import { useId, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "./Button";
import { business } from "@/lib/data/business";
import { trackLead } from "@/lib/analytics";
import { services } from "@/lib/data/services";
import { getStoredUtmParams } from "@/lib/utm";

export function ContactForm() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", city: "", zip: "", service: "", message: "", consent: false, website: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const errorId = useId();
  // Which page the visitor was on immediately before landing on Contact —
  // never rendered, so there's no hydration-mismatch risk from reading it
  // during the client's initial render.
  const [sourcePage] = useState(() => (typeof document !== "undefined" ? document.referrer || "direct" : "direct"));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !form.consent) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source: "contact-page", sourcePage, utm: getStoredUtmParams() }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Submission failed");
      }
      setSubmitted(true);
      trackLead("contact");
    } catch (err) {
      const apiMessage = err instanceof Error && err.message && err.message !== "Submission failed" ? err.message : null;
      setError(
        apiMessage ??
          (business.contact.phoneVerified
            ? `Something went wrong sending your message. Please call us at ${business.contact.phoneDisplay}.`
            : "Something went wrong sending your message. Please try again in a moment.")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-sm border border-charcoal/10 bg-cream p-10 text-center" role="status" aria-live="polite">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-oak/15">
          <Check className="h-6 w-6 text-oak-dark" aria-hidden="true" />
        </div>
        <p className="mt-5 font-display text-2xl text-charcoal">Message sent</p>
        <p className="mt-2 text-[14px] text-charcoal-soft">We&apos;ll reply within one business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Honeypot — hidden from real visitors, catches basic bots */}
      <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-website">Leave this field empty</label>
        <input
          id="contact-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={form.website}
          onChange={(e) => setForm({ ...form, website: e.target.value })}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="sr-only">Full Name</label>
          <input
            id="contact-name"
            required
            placeholder="Full Name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className="sr-only">Phone</label>
          <input
            id="contact-phone"
            required
            type="tel"
            placeholder="Phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label htmlFor="contact-email" className="sr-only">Email</label>
        <input
          id="contact-email"
          required
          type="email"
          placeholder="Email"
          autoComplete="email"
          aria-describedby={error ? errorId : undefined}
          aria-invalid={error ? true : undefined}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className={inputClass}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
        <div>
          <label htmlFor="contact-city" className="sr-only">City</label>
          <input
            id="contact-city"
            placeholder="City (optional)"
            autoComplete="address-level2"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-zip" className="sr-only">ZIP Code</label>
          <input
            id="contact-zip"
            placeholder="ZIP Code (optional)"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            value={form.zip}
            onChange={(e) => setForm({ ...form, zip: e.target.value })}
            className={inputClass}
          />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-service" className="sr-only">What are you interested in?</label>
          <select
            id="contact-service"
            value={form.service}
            onChange={(e) => setForm({ ...form, service: e.target.value })}
            className={inputClass}
          >
            <option value="">What are you interested in? (optional)</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>{s.name}</option>
            ))}
            <option value="Not sure / General question">Not sure / General question</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="sr-only">Tell us about your project</label>
        <textarea
          id="contact-message"
          required
          placeholder="Tell us about your project"
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className={inputClass}
        />
      </div>
      <label className="flex items-start gap-3 text-[13px] text-charcoal-soft">
        <input
          type="checkbox"
          checked={form.consent}
          onChange={(e) => setForm({ ...form, consent: e.target.checked })}
          className="mt-0.5 h-4 w-4 shrink-0 accent-oak-dark"
          required
        />
        <span>
          I agree to be contacted by BT Home Designs by phone, text, or email about my message. We won&apos;t
          share your information with third parties for marketing purposes.
        </span>
      </label>
      {error && (
        <p id={errorId} role="alert" aria-live="assertive" className="text-[13px] text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" disabled={submitting || !form.consent} className="w-full justify-center sm:w-auto">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Sending
          </>
        ) : (
          "Send Message"
        )}
      </Button>
    </form>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-4 py-3 text-[14px] text-charcoal placeholder:text-charcoal/35 outline-none transition-colors focus:border-oak-dark";
