"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-3 py-2 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark";
const labelClass = "mb-1 block text-[12px] font-medium text-charcoal-soft";

const STATUS_OPTIONS = [
  "DRAFT",
  "SENT",
  "ACCEPTED",
  "DEPOSIT_PAID",
  "ORDERED",
  "IN_PRODUCTION",
  "READY_FOR_INSTALLATION",
  "INSTALLED",
  "PAID_IN_FULL",
  "CANCELLED",
] as const;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-matte-black px-5 py-2.5 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : "Save Quote Details"}
    </button>
  );
}

export interface QuoteHeaderDefaults {
  quoteNumber: string;
  quoteDate: string; // yyyy-mm-dd
  status: string;
  notes: string | null;
  discountType: string | null;
  discountValue: string; // display units (percent or dollars), already divided by 100
  taxRatePercent: string;
  depositType: string | null;
  depositValue: string;
  depositPaid: string;
  customerName: string;
  customerId: string;
}

export function QuoteHeaderForm({
  action,
  defaults,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults: QuoteHeaderDefaults;
}) {
  return (
    <form action={action} className="space-y-6 rounded-sm border border-charcoal/10 bg-cream/30 p-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <label className="block">
          <span className={labelClass}>
            Quote Number <span className="text-oak-dark">*</span>
          </span>
          <input name="quoteNumber" defaultValue={defaults.quoteNumber} required className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Quote Date</span>
          <input name="quoteDate" type="date" defaultValue={defaults.quoteDate} className={inputClass} />
        </label>
        <label className="block">
          <span className={labelClass}>Status</span>
          <select name="status" defaultValue={defaults.status} className={inputClass}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <span className={labelClass}>Customer</span>
        <p className="text-[14px] text-charcoal">
          {defaults.customerName}{" "}
          <Link href={`/internal/customers/${defaults.customerId}`} className="text-[12px] font-medium text-oak-dark hover:underline">
            (edit customer)
          </Link>
        </p>
      </div>

      <label className="block">
        <span className={labelClass}>Notes</span>
        <textarea name="notes" defaultValue={defaults.notes ?? ""} rows={3} className={inputClass} />
      </label>

      <div className="border-t border-charcoal/10 pt-5">
        <p className="mb-1 text-[13px] font-semibold text-charcoal">Commercial Terms</p>
        <p className="mb-4 text-[12px] text-charcoal-soft">
          These are quote-level terms only. A customer grand total is <strong>not</strong> calculated here — customer
          selling price is not yet configured (see each line item&apos;s &quot;Selling Price: NOT CONFIGURED&quot;).
        </p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className={labelClass}>Discount Type</span>
            <select name="discountType" defaultValue={defaults.discountType ?? ""} className={inputClass}>
              <option value="">None</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Discount Value</span>
            <input name="discountValue" type="number" step="0.01" defaultValue={defaults.discountValue} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Tax Rate (%)</span>
            <input name="taxRatePercent" type="number" step="0.01" defaultValue={defaults.taxRatePercent} className={inputClass} />
          </label>
          <div />
          <label className="block">
            <span className={labelClass}>Deposit Type</span>
            <select name="depositType" defaultValue={defaults.depositType ?? ""} className={inputClass}>
              <option value="">None</option>
              <option value="PERCENTAGE">Percentage</option>
              <option value="FIXED_AMOUNT">Fixed Amount</option>
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>Deposit Value</span>
            <input name="depositValue" type="number" step="0.01" defaultValue={defaults.depositValue} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>Deposit Paid ($)</span>
            <input name="depositPaid" type="number" step="0.01" defaultValue={defaults.depositPaid} className={inputClass} />
          </label>
        </div>
      </div>

      <SubmitButton />
    </form>
  );
}
