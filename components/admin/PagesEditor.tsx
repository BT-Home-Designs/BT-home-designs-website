"use client";

/* eslint-disable @next/next/no-img-element -- private, auth-checked photo URLs */

import { ArrowDown, ArrowUp, Copy, ImagePlus, Star, Trash2, Plus } from "lucide-react";
import { useRef, useState } from "react";

type PagesUpdater = (fn: (prev: DesignPage[]) => DesignPage[]) => void;
import { TREATMENT_TYPES, type DesignPage, type QuotePhoto } from "@/lib/quotes/types";
import { cn } from "@/lib/utils";
import { Card, Field, SmallButton, TextArea, TextInput, inputCls, move, uid } from "./fields";

/** Starter selection labels per treatment — labels only, no values or pricing invented. */
const TEMPLATES: Record<string, { title: string; labels: string[] }> = {
  "Custom Drapery": { title: "Drapery Design Direction", labels: ["Fabric", "Color", "Lining", "Pleat style", "Fullness", "Length", "Operation"] },
  "Roller Shades": { title: "Roller Shade Selections", labels: ["Fabric", "Color", "Opacity", "Mount", "Control", "Valance / cassette"] },
  "Motorized Shades": { title: "Motorized Shade Selections", labels: ["Fabric", "Color", "Opacity", "Mount", "Motor / power", "Remote / app"] },
  "Roman Shades": { title: "Roman Shade Selections", labels: ["Fabric", "Fold style", "Lining", "Mount", "Control"] },
  "Woven Wood Shades": { title: "Woven Wood Selections", labels: ["Material", "Color", "Liner", "Mount", "Control"] },
  "Zebra Shades": { title: "Zebra Shade Selections", labels: ["Fabric", "Color", "Mount", "Control", "Cassette"] },
  "Plantation Shutters": { title: "Shutter Selections", labels: ["Material", "Louver size", "Color", "Frame", "Tilt rod", "Mount", "Panel configuration"] },
  "Exterior Shades": { title: "Exterior Shade Selections", labels: ["Fabric", "Openness", "Color", "Housing", "Motor / control"] },
  Hardware: { title: "Hardware Direction", labels: ["System", "Finish", "Brackets", "End caps / finials", "Operation"] },
  Other: { title: "", labels: [] },
};

export function newPage(treatment: string): DesignPage {
  const t = TEMPLATES[treatment] ?? TEMPLATES.Other;
  return {
    id: uid(),
    title: t.title,
    room: "",
    treatment: treatment === "Other" ? "" : treatment,
    description: "",
    selections: t.labels.map((label) => ({ id: uid(), label, value: "" })),
    photos: [],
  };
}

async function toJpegBlob(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const max = 2000;
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.85));
}

export async function uploadPhoto(quoteId: string, file: File): Promise<string> {
  let blob: Blob;
  try {
    blob = await toJpegBlob(file);
  } catch {
    throw new Error(`Couldn't read “${file.name}”. Please use a JPG or PNG photo.`);
  }
  const form = new FormData();
  form.append("quoteId", quoteId);
  form.append("file", blob, "photo.jpg");
  const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
  const data = (await res.json().catch(() => ({}))) as { id?: string; error?: string };
  if (!res.ok || !data.id) throw new Error(data.error || "Upload failed.");
  return data.id;
}

export function PagesEditor({ quoteId, pages, onChange, updatePages }: { quoteId: string; pages: DesignPage[]; onChange: (p: DesignPage[]) => void; updatePages: PagesUpdater }) {
  const [adding, setAdding] = useState<string>("Custom Drapery");
  const update = (i: number, patch: Partial<DesignPage>) => onChange(pages.map((p, j) => (j === i ? { ...p, ...patch } : p)));

  return (
    <Card
      id="pages"
      title="Design pages"
      subtitle="Each page becomes one screen of the customer presentation — a room, a design direction, hardware, etc. Pricing, terms, and Approve & Pay pages are added automatically."
    >
      <div className="space-y-5">
        {pages.length === 0 && <p className="rounded-sm bg-bt-cream px-3 py-3 text-sm text-charcoal-soft">No design pages yet. Add one below.</p>}
        {pages.map((page, i) => (
          <div key={page.id} className="rounded-md border border-bt-gold/40 bg-bt-cream/50 p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center gap-1.5">
              <span className="mr-auto text-[12px] font-bold uppercase tracking-[0.12em] text-bt-gold">Page {i + 1}</span>
              <SmallButton title="Move page up" onClick={() => onChange(move(pages, i, -1))} disabled={i === 0}>
                <ArrowUp className="h-3.5 w-3.5" />
              </SmallButton>
              <SmallButton title="Move page down" onClick={() => onChange(move(pages, i, 1))} disabled={i === pages.length - 1}>
                <ArrowDown className="h-3.5 w-3.5" />
              </SmallButton>
              <SmallButton
                title="Duplicate page"
                onClick={() => {
                  const copy = { ...structuredClone(page), id: uid(), selections: page.selections.map((s) => ({ ...s, id: uid() })) };
                  onChange([...pages.slice(0, i + 1), copy, ...pages.slice(i + 1)]);
                }}
              >
                <Copy className="h-3.5 w-3.5" />
              </SmallButton>
              <SmallButton tone="danger" title="Remove page" onClick={() => confirm("Remove this page?") && onChange(pages.filter((_, j) => j !== i))}>
                <Trash2 className="h-3.5 w-3.5" />
              </SmallButton>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Page title">
                <TextInput value={page.title} onChange={(v) => update(i, { title: v })} placeholder="e.g. Drapery Design Direction" />
              </Field>
              <Field label="Room(s)">
                <TextInput value={page.room} onChange={(v) => update(i, { room: v })} placeholder="e.g. Living Room" />
              </Field>
              <Field label="Treatment type">
                <TextInput value={page.treatment} onChange={(v) => update(i, { treatment: v })} list="treatment-types" placeholder="Choose or type" />
              </Field>
            </div>
            <Field label="Description" className="mt-3">
              <TextArea value={page.description} onChange={(v) => update(i, { description: v })} rows={2} />
            </Field>

            <div className="mt-4">
              <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-soft">Selections (fabric, color, hardware, finish…)</p>
              <div className="space-y-2">
                {page.selections.map((s, k) => (
                  <div key={s.id} className="grid grid-cols-[minmax(0,2fr)_minmax(0,5fr)_auto] items-start gap-2">
                    <TextInput aria-label="Selection label" value={s.label} onChange={(v) => update(i, { selections: page.selections.map((x, j) => (j === k ? { ...x, label: v } : x)) })} placeholder="Label" />
                    <TextArea aria-label="Selection value" rows={1} value={s.value} onChange={(v) => update(i, { selections: page.selections.map((x, j) => (j === k ? { ...x, value: v } : x)) })} placeholder="Selection" className="min-h-10" />
                    <div className="flex">
                      <SmallButton title="Move up" onClick={() => update(i, { selections: move(page.selections, k, -1) })} disabled={k === 0} className="border-0 px-1.5">
                        <ArrowUp className="h-3.5 w-3.5" />
                      </SmallButton>
                      <SmallButton tone="danger" title="Remove selection" onClick={() => update(i, { selections: page.selections.filter((_, j) => j !== k) })} className="px-1.5">
                        <Trash2 className="h-3.5 w-3.5" />
                      </SmallButton>
                    </div>
                  </div>
                ))}
              </div>
              <SmallButton className="mt-2" onClick={() => update(i, { selections: [...page.selections, { id: uid(), label: "", value: "" }] })}>
                <Plus className="h-3.5 w-3.5" /> Add selection
              </SmallButton>
            </div>

            <PhotosEditor
              quoteId={quoteId}
              photos={page.photos}
              onChange={(photos) => update(i, { photos })}
              onAdd={(photo) => updatePages((prev) => prev.map((p) => (p.id === page.id ? { ...p, photos: [...p.photos, photo] } : p)))}
            />
          </div>
        ))}

        <div className="flex flex-wrap items-end gap-2 rounded-md border border-dashed border-bt-gold/60 p-3">
          <Field label="Add a page for" className="min-w-[200px] flex-1">
            <select value={adding} onChange={(e) => setAdding(e.target.value)} className={inputCls}>
              {TREATMENT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t === "Other" ? "Blank page" : t}
                </option>
              ))}
            </select>
          </Field>
          <SmallButton tone="primary" className="min-h-10 px-4" onClick={() => onChange([...pages, newPage(adding)])}>
            <Plus className="h-4 w-4" /> Add page
          </SmallButton>
        </div>
      </div>
      <datalist id="treatment-types">
        {TREATMENT_TYPES.filter((t) => t !== "Other").map((t) => (
          <option key={t} value={t} />
        ))}
      </datalist>
    </Card>
  );
}

function PhotosEditor({ quoteId, photos, onChange, onAdd }: { quoteId: string; photos: QuotePhoto[]; onChange: (p: QuotePhoto[]) => void; onAdd: (p: QuotePhoto) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setError("");
    const list = Array.from(files).slice(0, 12);
    setBusy(list.length);
    for (const file of list) {
      try {
        const id = await uploadPhoto(quoteId, file);
        onAdd({ id, caption: "", selected: false });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed.");
      }
      setBusy((b) => b - 1);
    }
    if (input.current) input.current.value = "";
  };

  const update = (k: number, patch: Partial<QuotePhoto>) => onChange(photos.map((p, j) => (j === k ? { ...p, ...patch } : p)));

  return (
    <div className="mt-4">
      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-charcoal-soft">Photos (first photo shows largest)</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p, k) => (
          <div key={p.id + k} className={cn("rounded-sm border bg-white p-1.5", p.selected ? "border-bt-gold ring-1 ring-bt-gold" : "border-charcoal/15")}>
            <img src={`/api/quote-files/${p.id}`} alt="" className="aspect-[4/3] w-full rounded-sm object-cover" />
            <input aria-label="Photo caption" value={p.caption} onChange={(e) => update(k, { caption: e.target.value })} placeholder="Caption" className={cn(inputCls, "mt-1.5 min-h-8 text-[13px]")} />
            <div className="mt-1 flex items-center gap-0.5">
              <SmallButton title={p.selected ? "Unmark selected" : "Mark as selected"} onClick={() => update(k, { selected: !p.selected })} className={cn("border-0 px-1.5", p.selected && "text-[#8a6a1d]")}>
                <Star className={cn("h-3.5 w-3.5", p.selected && "fill-current")} /> {p.selected ? "Selected" : "Select"}
              </SmallButton>
              <span className="flex-1" />
              <SmallButton title="Move left" onClick={() => onChange(move(photos, k, -1))} disabled={k === 0} className="border-0 px-1">
                <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
              </SmallButton>
              <SmallButton title="Move right" onClick={() => onChange(move(photos, k, 1))} disabled={k === photos.length - 1} className="border-0 px-1">
                <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
              </SmallButton>
              <SmallButton tone="danger" title="Remove photo" onClick={() => onChange(photos.filter((_, j) => j !== k))} className="px-1">
                <Trash2 className="h-3.5 w-3.5" />
              </SmallButton>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex aspect-[4/3] flex-col items-center justify-center gap-1 rounded-sm border border-dashed border-charcoal/30 text-[13px] text-charcoal-soft hover:border-bt-green hover:text-bt-green"
        >
          <ImagePlus className="h-6 w-6" />
          {busy > 0 ? `Uploading ${busy}…` : "Add photos"}
        </button>
      </div>
      <input ref={input} type="file" accept="image/*" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} />
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
