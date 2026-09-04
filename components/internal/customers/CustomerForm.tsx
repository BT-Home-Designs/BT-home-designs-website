"use client";

import { useFormStatus } from "react-dom";

export interface CustomerFormValues {
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-sm bg-matte-black px-5 py-2.5 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
    >
      {pending ? "Saving…" : label}
    </button>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-3 py-2 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark";

function Field({
  label,
  name,
  defaultValue,
  required,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">
        {label}
        {required && <span className="text-oak-dark"> *</span>}
      </span>
      <input name={name} type={type} defaultValue={defaultValue ?? ""} required={required} className={inputClass} />
    </label>
  );
}

export function CustomerForm({
  action,
  defaultValues,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaultValues?: CustomerFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="max-w-2xl space-y-5">
      <Field label="Name" name="name" defaultValue={defaultValues?.name} required />
      <Field label="Address" name="address" defaultValue={defaultValues?.address} />
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <Field label="City" name="city" defaultValue={defaultValues?.city} />
        <Field label="State" name="state" defaultValue={defaultValues?.state} />
        <Field label="ZIP" name="zip" defaultValue={defaultValues?.zip} />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Phone" name="phone" defaultValue={defaultValues?.phone} type="tel" />
        <Field label="Email" name="email" defaultValue={defaultValues?.email} type="email" />
      </div>
      <label className="block">
        <span className="mb-1 block text-[12px] font-medium text-charcoal-soft">Notes</span>
        <textarea name="notes" defaultValue={defaultValues?.notes ?? ""} rows={4} className={inputClass} />
      </label>
      <SubmitButton label={submitLabel} />
    </form>
  );
}
