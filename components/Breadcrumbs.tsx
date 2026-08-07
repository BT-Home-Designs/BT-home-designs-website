import Link from "next/link";
import { ChevronRight } from "lucide-react";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, tone = "dark" }: { items: Crumb[]; tone?: "dark" | "light" }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `https://www.bthomedesigns.com${item.href}` } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[12px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className={`h-3 w-3 ${tone === "light" ? "text-warm-white/40" : "text-charcoal/30"}`} />}
          {item.href ? (
            <Link
              href={item.href}
              className={tone === "light" ? "text-warm-white/70 hover:text-warm-white" : "text-charcoal-soft hover:text-oak-dark"}
            >
              {item.label}
            </Link>
          ) : (
            <span className={tone === "light" ? "text-warm-white" : "text-charcoal"}>{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
