import { Swatch } from "./Swatch";
import type { ServiceVisual } from "@/lib/data/services";

export function DesignOptions({
  options,
  visual,
}: {
  options: { label: string; value: string }[];
  visual: ServiceVisual;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {options.map((opt, i) => (
        <div key={opt.label} className="rounded-sm border border-charcoal/10 bg-warm-white p-6">
          <div className="flex items-center gap-3">
            <Swatch tone={i % 3 === 0 ? "oak" : i % 3 === 1 ? "cream" : "charcoal"} pattern={visual} />
            <p className="eyebrow">{opt.label}</p>
          </div>
          <p className="mt-3 text-[14px] leading-relaxed text-charcoal">{opt.value}</p>
        </div>
      ))}
    </div>
  );
}
