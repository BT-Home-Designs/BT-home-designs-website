import { CalendarCheck, Home, Ruler, ShieldCheck, Sparkles, Users } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

// Deliberately factual, service-level claims only — no customer quotes,
// star ratings, review counts, or awards. See lib/data/testimonials.ts
// (removed) and README "Known Placeholders" for why: illustrative
// testimonials were removed from every public page rather than presented
// as real customer reviews.
const points = [
  { icon: CalendarCheck, title: "Free In-Home Consultation", copy: "A specialist brings real samples to your actual windows and light — no showroom guesswork." },
  { icon: Ruler, title: "Custom Measured", copy: "Every opening is measured by hand for a true, gap-free fit — including arches, angles, and bays." },
  { icon: ShieldCheck, title: "Professional Installation", copy: "Installed by our own trained crews, finished in a single visit for most homes." },
  { icon: Home, title: "Locally Owned", copy: "Family-owned and operated, based in North Texas." },
  { icon: Sparkles, title: "Personalized Design Guidance", copy: "One consultant walks with you from first visit through final walkthrough." },
  { icon: Users, title: "No-Pressure Process", copy: "A written estimate at your consultation — no obligation, no hard sell." },
] as const;

export function TrustSection({
  title = "What to expect when you work with us",
  eyebrow = "Why Homeowners Choose Us",
  align = "center",
}: {
  title?: string;
  eyebrow?: string;
  align?: "left" | "center";
}) {
  return (
    <div>
      <SectionHeading eyebrow={eyebrow} title={title} align={align} className={align === "center" ? "mx-auto" : undefined} />
      <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {points.map(({ icon: Icon, title: t, copy }) => (
          <div key={t} className="flex gap-4 text-left">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15">
              <Icon className="h-4.5 w-4.5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <div>
              <p className="font-display text-lg text-charcoal">{t}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-charcoal-soft">{copy}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
