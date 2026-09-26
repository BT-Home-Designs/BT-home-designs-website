"use client";

import { useEffect, useId, useState, useSyncExternalStore } from "react";
import { Check, Copy, Plus, Printer, Trash2 } from "lucide-react";
import { Button } from "./Button";
import { MeasurementSubmitForm } from "./MeasurementSubmitForm";
import {
  FLOOR_OPTIONS,
  FLOOR_TREATMENTS,
  MAX_WORKSHEET_ROWS,
  MOUNT_OPTIONS,
  WORKSHEET_FIELDS,
  WORKSHEET_FIELD_LIMITS,
  WORKSHEET_LABELS,
  WORKSHEET_TREATMENTS,
  emptyRow,
  isRowFilled,
  worksheetToText,
  type WorksheetField,
  type WorksheetRow as Row,
} from "@/lib/measuring";

/**
 * Customer measurement worksheet for the How to Measure page.
 *
 * On screen it's a stack of cards (one per window) so it works on a phone.
 * Entries are kept in this browser's localStorage until the customer sends
 * them with the form below the worksheet (MeasurementSubmitForm →
 * app/api/measurements). "Print worksheet" prints a table of the filled-in
 * rows plus blank rows, so it also works as a paper form.
 */

const STORAGE_KEY = "bthd-measure-worksheet-v1";
const PRINT_CLASS = "print-worksheet";
const BLANK_PRINT_ROWS = 6;

let counter = 0;
// The first row gets a fixed id so server and client render identical markup.
const newRow = (id = `row-${Date.now()}-${++counter}`): Row => emptyRow(id);

// Accepts rows saved by earlier versions (which had no "floor" field).
function toRow(v: unknown): Row | null {
  if (!v || typeof v !== "object") return null;
  const r = v as Record<string, unknown>;
  if (typeof r.id !== "string") return null;
  const row = emptyRow(r.id);
  for (const k of WORKSHEET_FIELDS) {
    const value = r[k] ?? "";
    if (typeof value !== "string") return null;
    row[k] = value.slice(0, WORKSHEET_FIELD_LIMITS[k]);
  }
  return row;
}

function loadRows(): Row[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    const rows = parsed.slice(0, MAX_WORKSHEET_ROWS).map(toRow);
    return rows.every((r): r is Row => r !== null) ? rows : null;
  } catch {
    // Storage unavailable (private mode, blocked site data) — start empty.
    return null;
  }
}

const noopSubscribe = () => () => {};

export function MeasurementWorksheet() {
  // false during server render and hydration, true afterwards — the body is
  // remounted once on the client so it can start from any saved entries.
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return (
    <WorksheetBody
      key={hydrated ? "client" : "server"}
      initialRows={(hydrated && loadRows()) || [newRow("row-initial")]}
      persist={hydrated}
    />
  );
}

function WorksheetBody({ initialRows, persist }: { initialRows: Row[]; persist: boolean }) {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [copied, setCopied] = useState(false);
  const baseId = useId();

  useEffect(() => {
    if (!persist) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    } catch {
      // Non-fatal: the worksheet still works for this visit.
    }
  }, [rows, persist]);

  useEffect(() => {
    const cleanup = () => document.documentElement.classList.remove(PRINT_CLASS);
    window.addEventListener("afterprint", cleanup);
    return () => window.removeEventListener("afterprint", cleanup);
  }, []);

  const update = (id: string, key: WorksheetField, value: string) =>
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: value } : r)));

  const remove = (id: string) => setRows((rs) => (rs.length === 1 ? [newRow()] : rs.filter((r) => r.id !== id)));

  const clearAll = () => {
    if (window.confirm("Clear every window on this worksheet?")) setRows([newRow()]);
  };

  const print = () => {
    document.documentElement.classList.add(PRINT_CLASS);
    window.print();
  };

  const filled = rows.filter(isRowFilled);

  const copy = async () => {
    const text = [
      "BT Home Designs — window measurements (preliminary, inches, width × height)",
      "",
      worksheetToText(filled.length ? filled : rows),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt("Copy your measurements:", text);
    }
  };

  const printRows: (Row | null)[] = [...filled, ...Array.from({ length: BLANK_PRINT_ROWS }, () => null)];

  return (
    <div>
      <div className="space-y-5 print:hidden">
        {rows.map((r, i) => {
          const fid = (k: string) => `${baseId}-${r.id}-${k}`;
          return (
            <fieldset key={r.id} className="rounded-sm border border-charcoal/10 bg-warm-white p-5 md:p-6">
              <legend className="sr-only">Window {i + 1}</legend>
              <div className="flex items-center justify-between gap-4">
                <p className="font-display text-lg text-charcoal" aria-hidden="true">
                  Window {i + 1}
                  {r.room && <span className="text-charcoal-soft"> · {r.room}</span>}
                </p>
                <button
                  type="button"
                  onClick={() => remove(r.id)}
                  className="flex items-center gap-1.5 text-[12px] text-charcoal-soft hover:text-oak-dark"
                  aria-label={`Remove window ${i + 1}`}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Field id={fid("room")} label="Room / window name">
                  <input id={fid("room")} value={r.room} maxLength={WORKSHEET_FIELD_LIMITS.room} onChange={(e) => update(r.id, "room", e.target.value)} className={inputClass} placeholder="e.g. Primary bedroom – left" />
                </Field>
                <Field id={fid("treatment")} label="Treatment">
                  <select id={fid("treatment")} value={r.treatment} onChange={(e) => update(r.id, "treatment", e.target.value)} className={inputClass}>
                    <option value="">Choose…</option>
                    {WORKSHEET_TREATMENTS.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </Field>
                <Field id={fid("mount")} label="Mount type">
                  <select id={fid("mount")} value={r.mount} onChange={(e) => update(r.id, "mount", e.target.value)} className={inputClass}>
                    <option value="">Choose…</option>
                    {MOUNT_OPTIONS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </Field>
                <Field id={fid("width")} label="Width (inches, to the nearest ⅛)" hint="Inside mount: top, middle, and bottom readings">
                  <input id={fid("width")} value={r.width} maxLength={WORKSHEET_FIELD_LIMITS.width} onChange={(e) => update(r.id, "width", e.target.value)} className={inputClass} placeholder="e.g. 35 ⅜ / 35 ½ / 35 ⅜" />
                </Field>
                <Field id={fid("height")} label="Height (inches, to the nearest ⅛)" hint="Inside mount: left, center, and right readings">
                  <input id={fid("height")} value={r.height} maxLength={WORKSHEET_FIELD_LIMITS.height} onChange={(e) => update(r.id, "height", e.target.value)} className={inputClass} placeholder="e.g. 60 ¼ / 60 ¼ / 60 ⅛" />
                </Field>
                {(FLOOR_TREATMENTS.includes(r.treatment) || r.floor) && (
                  <Field id={fid("floor")} label="Floor under the window" hint="Drapery only">
                    <select id={fid("floor")} value={r.floor} onChange={(e) => update(r.id, "floor", e.target.value)} className={inputClass}>
                      <option value="">Choose…</option>
                      {FLOOR_OPTIONS.map((f) => (
                        <option key={f}>{f}</option>
                      ))}
                    </select>
                  </Field>
                )}
                <Field id={fid("extra")} label="Additional measurements" hint="Depth, ceiling to floor, rod width, etc.">
                  <input id={fid("extra")} value={r.extra} maxLength={WORKSHEET_FIELD_LIMITS.extra} onChange={(e) => update(r.id, "extra", e.target.value)} className={inputClass} placeholder="e.g. Depth 3 ¼; C = 96" />
                </Field>
              </div>
              <div className="mt-4">
                <Field id={fid("notes")} label="Notes">
                  <textarea id={fid("notes")} value={r.notes} maxLength={WORKSHEET_FIELD_LIMITS.notes} onChange={(e) => update(r.id, "notes", e.target.value)} rows={2} className={inputClass} placeholder="Crank handle, door nearby, photo taken, looks out of square…" />
                </Field>
              </div>
            </fieldset>
          );
        })}

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button
            onClick={() => setRows((rs) => [...rs, newRow()])}
            disabled={rows.length >= MAX_WORKSHEET_ROWS}
            variant="secondary"
            icon={false}
            className="w-full sm:w-auto"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Add another window
          </Button>
          <Button onClick={print} variant="secondary" icon={false} className="w-full sm:w-auto">
            <Printer className="h-4 w-4" aria-hidden="true" /> Print worksheet
          </Button>
          <Button onClick={copy} variant="secondary" icon={false} className="w-full sm:w-auto">
            {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
            {copied ? "Copied" : "Copy as text"}
          </Button>
          <button type="button" onClick={clearAll} className="py-3 text-[13px] text-charcoal-soft underline-offset-4 hover:text-oak-dark hover:underline sm:ml-auto">
            Clear worksheet
          </button>
        </div>
        <p aria-live="polite" className="sr-only">
          {copied ? "Measurements copied to clipboard." : ""}
        </p>
        <p className="text-[12px] leading-relaxed text-charcoal-soft/80">
          Your entries are saved in this browser on this device. Nothing is sent to BT Home Designs until you use the
          form below.
        </p>

        <MeasurementSubmitForm rows={filled} />
      </div>

      {/* Print-only version: filled rows followed by blank rows to write in. */}
      <div id="worksheet-print" className="hidden print:block">
        <p style={{ fontSize: "16pt", fontWeight: 700 }}>BT Home Designs — Window Measurement Worksheet</p>
        <p style={{ fontSize: "9pt", marginTop: "4pt" }}>
          Preliminary measurements for an estimate. Inches to the nearest ⅛, written width × height. Record all three
          width and height readings for inside mounts. BT Home Designs confirms final measurements before anything is
          ordered.
        </p>
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "10pt", fontSize: "9pt" }}>
          <thead>
            <tr>
              {WORKSHEET_FIELDS.map((f) => WORKSHEET_LABELS[f]).map((h) => (
                <th key={h} style={{ border: "1px solid #999", padding: "5pt", textAlign: "left" }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {printRows.map((r, i) => (
              <tr key={r?.id ?? `blank-${i}`} style={{ height: "34pt" }}>
                {WORKSHEET_FIELDS.map((f) => (r ? r[f] : "")).map((v, j) => (
                  <td key={j} style={{ border: "1px solid #999", padding: "5pt", verticalAlign: "top" }}>
                    {v}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputClass =
  "w-full rounded-sm border border-charcoal/15 bg-warm-white px-3.5 py-3 text-[16px] text-charcoal placeholder:text-charcoal-soft/50 focus:border-oak-dark focus:outline-none";

function Field({ id, label, hint, children }: { id: string; label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[12px] font-medium text-charcoal-soft">
        {label}
        {hint && <span className="block font-normal text-charcoal-soft/75">{hint}</span>}
      </label>
      {children}
    </div>
  );
}
