import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Award, Hammer, Heart, Home as HomeIcon, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";
import { WindowArt } from "@/components/WindowArt";
import { Testimonials } from "@/components/Testimonials";
import { services } from "@/lib/data/services";
import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";

export const metadata: Metadata = {
  title: "Custom Window Treatments Dallas–Fort Worth | Shutters, Shades & Drapery",
  description:
    "Custom plantation shutters, roller shades, motorized shades, and drapery for Dallas–Fort Worth homes. Schedule a free in-home consultation with BT Home Designs.",
  alternates: { canonical: "/" },
};

const heroTrustPoints = [
  { icon: HomeIcon, label: "Free In-Home\nConsultation" },
  { icon: ShieldCheck, label: "Professional\nInstallation" },
  { icon: Award, label: "Quality You Can\nCount On" },
  { icon: Users, label: "Locally Owned &\nFamily Operated" },
];

const differenceColumns = [
  { icon: Hammer, title: "Custom, Every Time", copy: "Every window is measured and crafted specifically for your home." },
  { icon: ShieldCheck, title: "Quality You Can See", copy: "We use premium materials and trusted products designed for lasting beauty." },
  { icon: Award, title: "Installed to Perfection", copy: "Professional installation with attention to detail and care." },
  { icon: Heart, title: "Here for You", copy: "Local, responsive service focused on customer satisfaction." },
];

const featuredCities = cities.slice(0, 8);

const processSteps = [
  { step: "01", title: "In-Home Consultation", copy: "A specialist visits your home with real samples and walks every window with you." },
  { step: "02", title: "Measure & Design", copy: "Precise measurements and product selection tailored to each opening." },
  { step: "03", title: "Professional Install", copy: "Trained installers complete the finished work with care and attention to detail." },
];

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-warm-white pt-28 md:pt-32">
        <div className="container-lux grid items-center gap-12 pb-16 lg:grid-cols-2 lg:gap-16 lg:pb-24">
          <div>
            <p className="eyebrow mb-5">Beautiful Windows. Elevated Living.</p>
            <h1 className="text-4xl leading-[1.1] text-charcoal sm:text-5xl md:text-6xl">
              Custom
              <br />
              Window Treatments
              <br />
              Designed for Your Home
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-charcoal-soft">
              Custom shutters, shades, and drapery designed to elevate your home with timeless style, function, and craftsmanship.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/quote" size="lg" variant="accent">Request a Free Consultation</Button>
              <Button href="/services" size="lg" variant="secondary" icon={false}>View Our Services</Button>
            </div>

            <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-8 border-t border-charcoal/10 pt-8 sm:grid-cols-4">
              {heroTrustPoints.map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-start gap-2.5">
                  <Icon className="h-6 w-6 text-oak-dark" strokeWidth={1.25} aria-hidden="true" />
                  <p className="text-[11px] font-semibold uppercase leading-snug tracking-wide text-charcoal">
                    {label.split("\n").map((line, i) => (
                      <span key={i} className="block">{line}</span>
                    ))}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <FadeIn delay={0.1} className="relative overflow-hidden rounded-sm border border-charcoal/10 bg-cream">
            {/* Subtle architectural line detail — evokes louvers/mullions without depicting a room or product photo */}
            <div className="pointer-events-none absolute inset-0 opacity-[0.35]" aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} className="absolute inset-y-0 w-px bg-oak" style={{ left: `${(i + 1) * (100 / 15)}%` }} />
              ))}
            </div>
            <div className="relative flex h-full flex-col justify-between p-8 sm:p-10 lg:p-12">
              <div>
                <p className="eyebrow mb-3">What We Design</p>
                <p className="max-w-xs font-display text-3xl leading-[1.2] text-charcoal sm:text-4xl">
                  Every window, perfectly dressed.
                </p>
              </div>
              <ul className="mt-10 divide-y divide-charcoal/10 border-t border-charcoal/10">
                {services.slice(0, 5).map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/services/${s.slug}`}
                      className="group flex items-center justify-between gap-4 py-3.5 text-[13px] font-medium uppercase tracking-wide text-charcoal-soft transition-colors hover:text-oak-dark"
                    >
                      {s.name}
                      <ArrowUpRight className="h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Services grid */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Shop by Style" title="Custom Solutions for Every Window" align="center" className="mx-auto" />
          <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7">
            {services.map((s, i) => (
              <FadeIn key={s.slug} delay={(i % 7) * 0.05}>
                <Link
                  href={`/services/${s.slug}`}
                  className="group flex h-full flex-col items-center rounded-sm border border-charcoal/10 bg-warm-white p-5 text-center transition-colors hover:border-oak-dark"
                >
                  <WindowArt variant={s.visual} tone="light" className="h-16 w-16 rounded-full" />
                  <p className="mt-4 text-[13px] font-semibold uppercase tracking-wide text-charcoal">{s.name}</p>
                  <p className="mt-2 flex-1 text-[12px] leading-relaxed text-charcoal-soft">{s.shortTagline}</p>
                  <ArrowUpRight className="mt-4 h-4 w-4 text-oak-dark transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* BT Home Designs Difference */}
      <section className="bg-matte-black py-16 text-warm-white lg:py-20">
        <div className="container-lux">
          <p className="eyebrow mb-10 !text-oak-light text-center sm:text-left">The BT Home Designs Difference</p>
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {differenceColumns.map(({ icon: Icon, title, copy }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <div className={i > 0 ? "border-t border-warm-white/10 pt-6 sm:border-t-0 sm:border-l sm:pl-8 sm:pt-0" : ""}>
                  <Icon className="h-6 w-6 text-oak-light" strokeWidth={1.25} aria-hidden="true" />
                  <p className="mt-4 font-display text-lg text-warm-white">{title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-warm-white/60">{copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <div className="rounded-sm border border-charcoal/10 bg-warm-white p-8 sm:p-10">
              <p className="eyebrow mb-8">How It Works</p>
              <div className="space-y-8">
                {processSteps.map((p, i) => (
                  <div key={p.step} className={i > 0 ? "border-t border-charcoal/10 pt-8" : ""}>
                    <div className="flex gap-5">
                      <span className="font-display text-3xl text-oak">{p.step}</span>
                      <div>
                        <p className="font-display text-lg text-charcoal">{p.title}</p>
                        <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-soft">{p.copy}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="eyebrow mb-4">About BT Home Designs</p>
            <h2 className="text-3xl leading-[1.15] text-charcoal md:text-4xl">
              Elevating Homes Across
              <br />
              Dallas–Fort Worth
            </h2>
            <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-charcoal-soft">
              We believe window treatments are more than a finishing touch — they transform the way a home looks, feels, and functions. From consultation to installation, we make the process seamless and enjoyable.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-10 gap-y-6">
              <Button href="/about" variant="secondary">Learn More About Us</Button>
              {(business.stats.homesCompleted || business.stats.yearsExperience || business.reviews.averageRating) && (
                <div className="flex gap-8">
                  {business.stats.homesCompleted && (
                    <div>
                      <p className="font-display text-2xl text-charcoal">{business.stats.homesCompleted}+</p>
                      <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">Homes Enhanced</p>
                    </div>
                  )}
                  {business.reviews.averageRating && (
                    <div>
                      <p className="font-display text-2xl text-charcoal">{business.reviews.averageRating}★</p>
                      <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">Customer Rating</p>
                    </div>
                  )}
                  {business.stats.yearsExperience && (
                    <div>
                      <p className="font-display text-2xl text-charcoal">{business.stats.yearsExperience}+</p>
                      <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">Years of Experience</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Financing */}
      <section className="border-y border-charcoal/10 bg-cream-deep/60 py-8">
        <div className="container-lux flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <p className="font-display text-xl text-charcoal">Flexible Financing Available</p>
            <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-charcoal-soft">{business.policies.financing}</p>
          </div>
          <div className="flex items-center gap-6">
            {business.policies.financingProvider && (
              <p className="text-[11px] uppercase tracking-wide text-charcoal-soft">
                Financing powered by <span className="font-semibold text-charcoal">{business.policies.financingProvider}</span>
              </p>
            )}
            <Button href="/contact" variant="secondary" icon={false}>Learn More</Button>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Service Area */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading eyebrow="Proudly Serving" title="Dallas–Fort Worth & Surrounding Areas" />
            <Button href="/service-area" variant="secondary">View All Cities</Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            {featuredCities.map((c) => (
              <Link
                key={c.slug}
                href={`/service-area/${c.slug}`}
                className="rounded-full border border-charcoal/15 px-5 py-2.5 text-[13px] font-medium text-charcoal-soft transition-colors hover:border-oak-dark hover:text-oak-dark"
              >
                {c.name}, TX
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-matte-black py-24 text-center lg:py-32">
        <div className="container-lux">
          <div className="mx-auto mb-6 h-[2px] w-16 bg-oak" aria-hidden="true" />
          <h2 className="mx-auto max-w-2xl text-3xl text-warm-white md:text-5xl">
            Let&apos;s Create Something Beautiful Together
          </h2>
          <p className="mx-auto mt-5 max-w-md text-[15px] text-warm-white/80">
            Schedule your free in-home consultation today.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <Button href="/quote" size="lg" variant="accent">
              Request My Free Consultation
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
