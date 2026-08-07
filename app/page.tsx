import type { Metadata } from "next";
import Link from "next/link";
import { CalendarCheck, Ruler, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";
import { ShutterReveal } from "@/components/ShutterReveal";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { TrustBadges } from "@/components/TrustBadges";
import { ReviewCarousel } from "@/components/ReviewCarousel";
import { FinancingSection } from "@/components/FinancingSection";
import { InstagramGallery } from "@/components/InstagramGallery";
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
      {/* Hero */}
      <section className="relative flex h-[92vh] min-h-[640px] items-end overflow-hidden bg-charcoal">
        <ImagePlaceholder variant="charcoal" className="absolute inset-0 h-full w-full" label="Dallas Living Room, Hardwood Shutters" />
        <div className="absolute inset-0 bg-gradient-to-t from-matte-black/80 via-matte-black/20 to-matte-black/10" />
        <ShutterReveal />
        <div className="container-lux relative z-20 pb-20 pt-32 md:pb-28">
          <p className="eyebrow mb-5 !text-oak-light">Dallas–Fort Worth Metroplex</p>
          <h1 className="max-w-3xl text-4xl leading-[1.08] text-warm-white sm:text-5xl md:text-6xl lg:text-[4.2rem]">
            Luxury Custom Window Treatments Designed for Texas Homes
          </h1>
          <div className="mt-7 flex flex-wrap gap-x-3 gap-y-2">
            {products.map((p) => (
              <span key={p} className="rounded-full border border-warm-white/25 px-4 py-1.5 text-[12px] font-medium text-warm-white/85">
                {p}
              </span>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button href="/quote" size="lg">Get Free Consultation</Button>
            <Button href="/gallery" size="lg" variant="light" icon={false}>View Gallery</Button>
          </div>
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
                  <Icon className="h-6 w-6 text-oak-dark" strokeWidth={1.25} />
                  <h3 className="mt-5 font-display text-xl text-charcoal">{title}</h3>
                  <p className="mt-2.5 text-[14px] leading-relaxed text-charcoal-soft">{copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-charcoal py-20 text-warm-white lg:py-28">
        <div className="container-lux">
          <SectionHeading
            eyebrow="What We Install"
            title="Seven ways to shape the light in your home"
            tone="light"
          />
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-sm bg-warm-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {services.map((s, i) => (
              <FadeIn key={s.slug} delay={(i % 4) * 0.06}>
                <Link href={`/services/${s.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-charcoal">
                  <ImagePlaceholder variant="oak" className="h-full w-full transition-transform duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-matte-black/85 via-matte-black/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <p className="font-display text-xl text-warm-white">{s.name}</p>
                    <p className="mt-1 text-[12px] text-warm-white/60">{s.tagline}</p>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button href="/services" variant="light">Explore All Services</Button>
          </div>
        </div>
      </section>

      {/* Gallery preview */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Recent Work" title="A look inside DFW homes we've completed" />
            <Button href="/gallery" variant="secondary">View Full Gallery</Button>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
            {["Living Room", "Kitchen", "Bedroom", "Patio"].map((label, i) => (
              <FadeIn key={label} delay={i * 0.08} className={i === 0 || i === 3 ? "md:row-span-2 md:aspect-[3/5]" : "aspect-square"}>
                <ImagePlaceholder label={label} variant={i % 2 === 0 ? "oak" : "charcoal"} className="h-full w-full" />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-charcoal/10 bg-cream py-14">
        <div className="container-lux">
          <TrustBadges />
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Client Stories" title="North Texas homeowners on working with us" align="center" className="mx-auto" />
          <div className="mt-14">
            <ReviewCarousel />
          </div>
        </div>
      </section>

      <FinancingSection />

      {/* Instagram */}
      <section className="py-20 lg:py-24">
        <div className="container-lux">
          <InstagramGallery />
        </div>
      </section>

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
