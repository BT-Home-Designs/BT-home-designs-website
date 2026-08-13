import { Check } from "lucide-react";

export function Checklist({ items, columns = 1 }: { items: string[]; columns?: 1 | 2 }) {
  return (
    <ul className={`grid grid-cols-1 gap-x-8 gap-y-3 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-oak-dark" strokeWidth={2} aria-hidden="true" />
          <span className="text-[14px] leading-relaxed text-charcoal-soft">{item}</span>
        </li>
      ))}
    </ul>
  );
}
