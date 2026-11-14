"use client";

import { useState, type ReactNode } from "react";
import { centsToInput, parseDollarsToCents } from "@/lib/quotes/money";
import { cn } from "@/lib/utils";

export const inputCls =
  "min-h-10 w-full rounded-sm border border-charcoal/20 bg-white px-2.5 text-[15px] text-charcoal focus:border-bt-green focus:outline-none focus:ring-1 focus:ring-bt-green/30";

export function Card({ title, subtitle, children, actions, id }: { title: string; subtitle?: string; children: ReactNode; actions?: ReactNode; id?: string }) {
  return (
    <section id={id} className="scroll-mt-28 rounded-md border border-charcoal/10 bg-white p-4 sm:p-5">
      <div className="mb-4 flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl text-bt-green">{title}</h2>
          {subtitle && <p className="mt-0.5 text-[13px] text-charcoal-soft">{subtitle}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-soft">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] leading-snug text-charcoal-soft">{hint}</span>}
    </label>
  );
}

export function TextInput(props: { value: string; onChange: (v: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const { value, onChange, className, ...rest } = props;
  return <input {...rest} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, className)} />;
}

export function TextArea(props: { value: string; onChange: (v: string) => void; rows?: number } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const { value, onChange, className, rows = 3, ...rest } = props;
  return <textarea {...rest} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} className={cn(inputCls, "py-2 leading-snug", className)} />;
}

/** Dollar input that stores integer cents; shows an inline error for bad input. */
export function MoneyInput({ cents, onChange, className, allowEmpty, ariaLabel }: { cents: number | null; onChange: (c: number | null) => void; className?: string; allowEmpty?: boolean; ariaLabel?: string }) {
  const [text, setText] = useState<string | null>(null);
  const shown = text ?? (cents === null ? "" : centsToInput(cents));
  const parsed = text === null ? cents : text.trim() === "" ? null : parseDollarsToCents(text);
  const invalid = text !== null && ((text.trim() === "" && !allowEmpty) || (text.trim() !== "" && parsed === null));
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal-soft">$</span>
      <input
        inputMode="decimal"
        aria-label={ariaLabel}
        aria-invalid={invalid || undefined}
        value={shown}
        onChange={(e) => {
          setText(e.target.value);
          const v = e.target.value.trim() === "" ? null : parseDollarsToCents(e.target.value);
          if (v !== null) onChange(v);
          else if (e.target.value.trim() === "" && allowEmpty) onChange(null);
        }}
        onBlur={() => {
          if (!invalid) setText(null);
        }}
        className={cn(inputCls, "pl-6 text-right tabular-nums", invalid && "border-red-500")}
      />
    </div>
  );
}

export function NumberInput({ value, onChange, step = "any", className, ariaLabel, max }: { value: number; onChange: (n: number) => void; step?: string; className?: string; ariaLabel?: string; max?: number }) {
  const [text, setText] = useState<string | null>(null);
  return (
    <input
      type="number"
      inputMode="decimal"
      min={0}
      max={max}
      step={step}
      aria-label={ariaLabel}
      value={text ?? String(value)}
      onChange={(e) => {
        setText(e.target.value);
        const n = Number(e.target.value);
        if (e.target.value !== "" && Number.isFinite(n) && n >= 0) onChange(max !== undefined ? Math.min(n, max) : n);
      }}
      onBlur={() => setText(null)}
      className={cn(inputCls, "tabular-nums", className)}
    />
  );
}

export function SmallButton({ children, onClick, tone = "default", disabled, title, className }: { children: ReactNode; onClick: () => void; tone?: "default" | "danger" | "primary"; disabled?: boolean; title?: string; className?: string }) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "inline-flex min-h-8 items-center gap-1 rounded-sm px-2.5 text-[12px] font-medium transition disabled:opacity-40",
        tone === "danger" && "text-red-700 hover:bg-red-50",
        tone === "default" && "border border-charcoal/15 text-charcoal hover:bg-charcoal/5",
        tone === "primary" && "bg-bt-green text-bt-cream hover:bg-bt-green-deep",
        className
      )}
    >
      {children}
    </button>
  );
}

export function move<T>(list: T[], index: number, delta: number): T[] {
  const target = index + delta;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

/** Client-side id for list rows (crypto.randomUUID needs https; this doesn't). */
export function uid(): string {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}
