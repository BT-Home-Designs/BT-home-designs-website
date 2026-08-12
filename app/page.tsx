import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarCheck, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";
import { WindowArt } from "@/components/WindowArt";
import { TrustBadges } from "@/components/TrustBadges";
import { TrustSection } from "@/components/TrustSection";
import { FinancingSection } from "@/components/FinancingSection";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Luxury Custom Window Treatments in Dallas–Fort Worth",
  description:
    "BT Home Designs creates luxury plantation shutters, roller shades, motorized shades, and custom drapery for homes across DFW. Schedule your free in-home consultation.",
  alternates: { canonical: "/" },
};

const products = ["Plantation Shutters", "Roller Shades", "Motorized Shades", "Custom Drapery", "Woven Woods"];

const whyUs = [
  { icon: CalendarCheck, title: "Free In-Home Consultation", copy: "A design consultant brings real samples to your actual windows and light — no showroom guesswork." },
  { icon: Ruler, title: "Professional Measuring", copy: "Precision measurements for a true, gap-free fit on every opening, including arches and angles." },
  { icon: ShieldCheck, title: "Expert Installation", copy: "Our own trained install crews, not subcontractors — finished in a single visit for most homes." },
  { icon: Sparkles, title: "Premium Products", copy: "Hardwood, composite, and designer textiles built to perform through Texas heat and sun." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero — split editorial layout, no photography */}
      <section className="relative overflow-hidden bg-cream pt-32 md:pt-36">
        <div className="container-lux grid items-center gap-16 pb-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:pb-28">
          <div>
            <p className="eyebrow mb-5">Dallas–Fort Worth Metroplex</p>
            <h1 className="max-w-xl text-4xl leading-[1.08] text-charcoal sm:text-5xl md:text-6xl">
              Luxury Custom Window Treatments Designed for Texas Homes
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal-soft">
              Plantation shutters, roller shades, motorized systems, and custom drapery — designed, measured, and installed by one local team, from your first consultation to the final walkthrough.
            </p>
            <div className="mt-7 flex flex-wrap gap-x-2.5 gap-y-2">
              {products.map((p) => (
                <span key={p} className="rounded-full border border-charcoal/15 px-4 py-1.5 text-[12px] font-medium text-charcoal-soft">
                  {p}
                </span>
              ))}
            </div>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button href="/quote" size="lg">Get Free Consultation</Button>
              <Button href="/gallery" size="lg" variant="secondary" icon={false}>Explore Styles</Button>
            </div>
          </div>

          <FadeIn delay={0.1} className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:max-w-none">
            <WindowArt variant="louver" tone="light" className="h-full w-full shadow-xl shadow-charcoal/10" />
          </FadeIn>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Why BT Home Designs" title="An experience built like the finished product" align="center" className="mx-auto" />
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {whyUs.map(({ icon: Icon, title, copy }, i) => (
              <FadeIn key={title} delay={i * 0.1}>
                <div className="border-t border-charcoal/15 pt-6">
                  <Icon className="h-6 w-6 text-oak-dark" strokeWidth={1.25} aria-hidden="true" />
                  <h3 className="mt-5 font-display text-xl text-charcoal">{title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-charcoal-soft">{copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Find Your Perfect Window Treatment — replaces both the old photo
          grid and the old "gallery preview" section */}
      <section className="bg-charcoal py-20 text-warm-white lg:py-28">
        <div className="container-lux">
          <SectionHeading
            eyebrow="Find Your Perfect Window Treatment"
            title="Seven ways to shape the light in your home"
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <FadeIn key={s.slug} delay={(i % 3) * 0.08}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col justify-between rounded-sm border border-warm-white/10 bg-warm-white/[0.03] p-7 transition-colors hover:border-oak-light/40 hover:bg-warm-white/[0.06]"
                >
                  <div>
                    <WindowArt variant={s.visual} tone="dark" className="h-16 w-16 rounded-full" />
                    <p className="mt-6 font-display text-xl text-warm-white">{s.name}</p>
                    <p className="mt-2 text-[13px] leading-relaxed text-warm-white/60">{s.tagline}</p>
                    <p className="mt-4 text-[12px] font-medium text-oak-light">{s.benefits[0].title}</p>
                  </div>
                  <span className="mt-6 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-warm-white/80 group-hover:text-oak-light">
                    Learn More <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </FadeIn>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/services" variant="light">Explore All Services</Button>
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-charcoal/10 bg-cream py-14">
        <div className="container-lux">
          <TrustBadges />
        </div>
      </section>

      {/* Trust section — replaces illustrative testimonials with factual claims only */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <TrustSection />
        </div>
      </section>

      <FinancingSection />

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-matte-black py-24 text-center lg:py-32">
        <div className="container-lux relative z-10">
          <p className="eyebrow mb-5 !text-oak-light">Ready When You Are</p>
          <h2 className="mx-auto max-w-2xl text-3xl text-warm-white md:text-5xl">
            Let&apos;s design the light in every room
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-warm-white/60">
            Schedule a free, no-pressure in-home consultation with a BT Home Designs specialist.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button href="/quote" size="lg">Schedule Free Consultation</Button>
            <Button href="/contact" size="lg" variant="secondary" icon={false} className="!border-warm-white/25 !text-warm-white hover:!bg-warm-white hover:!text-charcoal">
              Request Quote
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
