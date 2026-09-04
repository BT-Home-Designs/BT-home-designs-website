"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-3 py-2 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-matte-black px-5 py-2.5 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Creating…" : "Create Quote"}
    </button>
  );
}

export interface CustomerOption {
  id: string;
  name: string;
  city: string | null;
  state: string | null;
}

export function NewQuoteForm({ action, customers }: { action: (formData: FormData) => void; customers: CustomerOption[] }) {
  const [mode, setMode] = useState<"existing" | "new">(customers.length > 0 ? "existing" : "new");

  return (
    <form action={action} className="max-w-2xl space-y-6">
      <fieldset className="flex gap-6">
        <legend className="mb-2 text-[12px] font-medium text-charcoal-soft">Customer</legend>
        <label className="flex items-center gap-2 text-[13px] text-charcoal">
          <input
            type="radio"
            name="customerMode"
            value="existing"
            checked={mode === "existing"}
            onChange={() => setMode("existing")}
            disabled={customers.length === 0}
          />
          Existing customer
        </label>
        <label className="flex items-center gap-2 text-[13px] text-charcoal">
          <input type="radio" name="customerMode" value="new" checked={mode === "new"} onChange={() => setMode("new")} />
          New customer
        </label>
      </fieldset>

      {mode === "existing" ? (
        <label className="block">
          <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">
            Select customer <span className="text-oak-dark">*</span>
          </span>
          <select name="existingCustomerId" required className={inputClass}>
            <option value="">Select a customer…</option>
            {customers.map((c) => {
              const location = [c.city, c.state].filter(Boolean).join(", ");
              return (
                <option key={c.id} value={c.id}>
                  {c.name}
                  {location ? ` — ${location}` : ""}
                </option>
              );
            })}
          </select>
        </label>
      ) : (
        <div className="space-y-5 rounded-sm border border-charcoal/10 bg-cream/30 p-4">
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">
              Name <span className="text-oak-dark">*</span>
            </span>
            <input name="name" required className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">Address</span>
            <input name="address" className={inputClass} />
          </label>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">City</span>
              <input name="city" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">State</span>
              <input name="state" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">ZIP</span>
              <input name="zip" className={inputClass} />
            </label>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">Phone</span>
              <input name="phone" type="tel" className={inputClass} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">Email</span>
              <input name="email" type="email" className={inputClass} />
            </label>
          </div>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
