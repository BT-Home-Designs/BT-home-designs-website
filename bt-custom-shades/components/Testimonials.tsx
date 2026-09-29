import { Star } from "lucide-react";
import { reviews } from "@/lib/data/reviews";
import { SectionHeading } from "./SectionHeading";
import { FadeIn } from "./FadeIn";

/**
 * Renders nothing at all when there are no verified reviews yet — no
 * fabricated quotes, no "coming soon" filler. Once real, permissioned
 * reviews are added to lib/data/reviews.ts, this section appears
 * automatically.
 */
export function Testimonials() {
  if (reviews.length === 0) return null;

  return (
    <section className="py-20 lg:py-28">
      <div className="container-lux">
        <SectionHeading eyebrow="Kind Words From Our Clients" title="Trusted by Homeowners Like You" align="center" className="mx-auto" />
        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map((r, i) => (
            <FadeIn key={r.name} delay={i * 0.08}>
              <div className="h-full rounded-sm border border-charcoal/10 bg-warm-white p-7">
                <div className="flex gap-1" role="img" aria-label={`Rated ${r.rating} out of 5 stars`}>
                  {Array.from({ length: r.rating }).map((_, idx) => (
                    <Star key={idx} className="h-3.5 w-3.5 fill-oak text-oak" aria-hidden="true" />
                  ))}
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-charcoal-soft">&ldquo;{r.quote}&rdquo;</p>
                <p className="mt-4 text-[13px] font-medium text-charcoal">
                  {r.name} <span className="font-normal text-charcoal-soft">— {r.location}</span>
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
