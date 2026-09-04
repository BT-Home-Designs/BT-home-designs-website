"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import type { LineItemDTO } from "@/lib/quotes/dto";
import { isMatrixSupportedProductType } from "@/lib/quotes/matrixSupportedProductTypes";
import { PricingPanel } from "./PricingPanel";
import { CustomerPricePanel } from "./CustomerPricePanel";
import {
  updateLineItemAction,
  duplicateLineItemAction,
  deleteLineItemAction,
  reorderLineItemAction,
} from "@/app/internal/(dashboard)/quotes/[id]/actions";

export interface ProductOption {
  id: string;
  name: string;
  productType: string;
}

export interface FabricOption {
  id: string;
  sourceName: string;
  productId: string;
}

export interface ColorOption {
  id: string;
  name: string;
  fabricId: string | null;
}

const inputClass =
  "w-full rounded-sm border border-charcoal/20 bg-warm-white px-2.5 py-1.5 text-[13px] text-charcoal outline-none transition-colors focus:border-oak-dark";
const labelClass = "mb-1 block text-[11px] font-medium text-charcoal-soft";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

export function LineItemCard({
  item,
  quoteId,
  index,
  isFirst,
  isLast,
  products,
  fabrics,
  colors,
  onSaved,
  onDeleted,
  onDuplicated,
  onReordered,
}: {
  item: LineItemDTO;
  quoteId: string;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  products: ProductOption[];
  fabrics: FabricOption[];
  colors: ColorOption[];
  onSaved: (updated: LineItemDTO) => void;
  onDeleted: (id: string) => void;
  onDuplicated: (all: LineItemDTO[]) => void;
  onReordered: (all: LineItemDTO[]) => void;
}) {
  const [productId, setProductId] = useState(item.productId ?? "");
  const [fabricId, setFabricId] = useState(item.fabricId ?? "");
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const selectedProduct = products.find((p) => p.id === productId) ?? null;
  const fabricsForProduct = useMemo(() => fabrics.filter((f) => f.productId === productId), [fabrics, productId]);
  const colorsForFabric = useMemo(() => colors.filter((c) => c.fabricId === fabricId), [colors, fabricId]);

  function handleProductChange(newProductId: string) {
    setProductId(newProductId);
    // The previously selected fabric almost certainly doesn't belong to
    // the new product — clear it rather than silently keeping a mismatched
    // fabric/product pair.
    setFabricId("");
  }

  async function handleSave() {
    if (!formRef.current) return;
    setError(null);
    const formData = new FormData(formRef.current);
    startTransition(async () => {
      try {
        const updated = await updateLineItemAction(item.id, quoteId, formData);
        onSaved(updated);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1500);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save line item.");
      }
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      try {
        const all = await duplicateLineItemAction(item.id, quoteId);
        onDuplicated(all);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to duplicate line item.");
      }
    });
  }

  function handleDelete() {
    if (!window.confirm("Remove this line item? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteLineItemAction(item.id, quoteId);
        onDeleted(item.id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete line item.");
      }
    });
  }

  function handleReorder(direction: "up" | "down") {
    startTransition(async () => {
      try {
        const all = await reorderLineItemAction(item.id, quoteId, direction);
        onReordered(all);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to reorder line items.");
      }
    });
  }

  const isMatrixProduct = isMatrixSupportedProductType(selectedProduct?.productType);

  return (
    <div className="rounded-sm border border-charcoal/15 bg-warm-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal/10 text-[11px] font-medium text-charcoal-soft">
            {index + 1}
          </span>
          <span className="text-[12px] text-charcoal-soft">
            {item.room || "Untitled room"}
            {item.windowIdentifier ? ` — ${item.windowIdentifier}` : ""}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleReorder("up")}
            disabled={isFirst || isPending}
            className="rounded-sm border border-charcoal/20 px-2 py-1 text-[11px] text-charcoal-soft disabled:opacity-30"
            aria-label="Move up"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => handleReorder("down")}
            disabled={isLast || isPending}
            className="rounded-sm border border-charcoal/20 px-2 py-1 text-[11px] text-charcoal-soft disabled:opacity-30"
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            type="button"
            onClick={handleDuplicate}
            disabled={isPending}
            className="rounded-sm border border-charcoal/20 px-2.5 py-1 text-[11px] font-medium text-charcoal-soft hover:border-charcoal"
          >
            Duplicate
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-sm border border-red-300 px-2.5 py-1 text-[11px] font-medium text-red-700 hover:border-red-500"
          >
            Delete
          </button>
        </div>
      </div>

      <form ref={formRef} className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <Field label="Room / Location">
          <input name="room" defaultValue={item.room ?? ""} className={inputClass} />
        </Field>
        <Field label="Window ID">
          <input name="windowIdentifier" defaultValue={item.windowIdentifier ?? ""} className={inputClass} />
        </Field>
        <Field label="Product">
          <select
            name="productId"
            value={productId}
            onChange={(e) => handleProductChange(e.target.value)}
            className={inputClass}
          >
            <option value="">Select product…</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Fabric">
          <select
            name="fabricId"
            value={fabricId}
            onChange={(e) => setFabricId(e.target.value)}
            disabled={!productId}
            className={inputClass}
          >
            <option value="">{productId ? "Select fabric…" : "Select a product first"}</option>
            {fabricsForProduct.map((f) => (
              <option key={f.id} value={f.id}>
                {f.sourceName}
              </option>
            ))}
          </select>
        </Field>
        <Field label={`Width (in)${isMatrixProduct ? " *" : ""}`}>
          <input name="width" type="number" step="0.001" defaultValue={item.width ?? ""} className={inputClass} />
        </Field>
        <Field label={`Height (in)${isMatrixProduct ? " *" : ""}`}>
          <input name="height" type="number" step="0.001" defaultValue={item.height ?? ""} className={inputClass} />
        </Field>
        <Field label="Quantity">
          <input name="quantity" type="number" min={1} step={1} defaultValue={item.quantity} className={inputClass} />
        </Field>
        <Field label="Color">
          <select name="colorId" defaultValue={item.colorId ?? ""} disabled={colorsForFabric.length === 0} className={inputClass}>
            <option value="">{colorsForFabric.length === 0 ? "No colors available yet" : "Select color…"}</option>
            {colorsForFabric.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>

        {expanded && (
          <>
            <Field label="Mount Type">
              <input name="mountType" defaultValue={item.mountType ?? ""} className={inputClass} />
            </Field>
            <Field label="Control Type">
              <input name="controlType" defaultValue={item.controlType ?? ""} className={inputClass} />
            </Field>
            <Field label="Motorization">
              <input name="motorization" defaultValue={item.motorization ?? ""} className={inputClass} />
            </Field>
            <Field label="Remote">
              <input name="remote" defaultValue={item.remote ?? ""} className={inputClass} />
            </Field>
            <Field label="Hub">
              <input name="hub" defaultValue={item.hub ?? ""} className={inputClass} />
            </Field>
            <Field label="Solar Charger">
              <input name="solarCharger" defaultValue={item.solarCharger ?? ""} className={inputClass} />
            </Field>
            <Field label="Installation">
              <input name="installation" defaultValue={item.installation ?? ""} className={inputClass} />
            </Field>
            <div className="col-span-2 sm:col-span-3">
              <Field label="Hardware / Options (comma-separated)">
                <input name="hardwareOptions" defaultValue={item.hardwareOptions.join(", ")} className={inputClass} />
              </Field>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <Field label="Notes">
                <textarea name="notes" defaultValue={item.notes ?? ""} rows={2} className={inputClass} />
              </Field>
            </div>
          </>
        )}
      </form>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-[11px] font-medium text-oak-dark hover:underline"
      >
        {expanded ? "Hide options" : "More options (mount, control, motorization, remote, hub, solar charger, installation, notes)"}
      </button>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 sm:items-start">
        <PricingPanel productType={selectedProduct?.productType ?? null} snapshot={item.currentSnapshot} costBreakdown={item.costBreakdown} />
        <CustomerPricePanel item={item} quoteId={quoteId} onSaved={onSaved} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div className="text-[11px]">
          {error && (
            <p role="alert" className="text-red-700">
              {error}
            </p>
          )}
          {!error && savedFlash && <p className="text-oak-dark">Saved.</p>}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="rounded-sm bg-matte-black px-4 py-1.5 text-[12px] font-medium text-warm-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? "Saving…" : "Save Line Item"}
        </button>
      </div>
    </div>
  );
}
