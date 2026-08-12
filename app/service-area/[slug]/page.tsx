import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { WindowArt } from "@/components/WindowArt";
import { Accordion } from "@/components/Accordion";
import { FadeIn } from "@/components/FadeIn";
import { TrustBadges } from "@/components/TrustBadges";
import { business } from "@/lib/data/business";
import { cities, getCityBySlug } from "@/lib/data/cities";
import { services } from "@/lib/data/services";

export function generateStaticParams() {
  return cities.map((c) => ({ slug: c.slug }));
}

type CityPageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) return {};
  return {
    title: `Custom Window Treatments in ${city.name}, TX`,
    description: `Luxury plantation shutters, roller shades, motorized shades, and drapery for ${city.name}, TX homes. Free in-home consultation from BT Home Designs.`,
    alternates: { canonical: `/service-area/${city.slug}` },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { slug } = await params;
  const city = getCityBySlug(slug);
  if (!city) notFound();

  const featuredServices = services
    .filter((s) => city.popularServices.includes(s.name))
    .concat(services.filter((s) => !city.popularServices.includes(s.name)))
    .slice(0, 3);

  // Generic, locally-flavored FAQs generated from city + business data —
  // not fabricated claims, just standard process questions with the
  // city name substituted in.
  const faqs = [
    {
      q: `Do you serve all of ${city.name}?`,
      a: `Yes — we regularly work throughout ${city.name}, including ${city.neighborhoods.slice(0, 3).join(", ")}, and the surrounding area.`,
    },
    {
      q: `How does the consultation work in ${city.name}?`,
      a: "A specialist visits your home with real hardwood, fabric, and shade samples, walks every window with you, and leaves you with a written estimate — free and no-pressure.",
    },
    {
      q: `How long does installation typically take?`,
      a: "Most homes are measured in one visit and installed in a single day once materials arrive; exact lead times vary by product and are confirmed at your consultation.",
    },
    {
      q: `Can I see samples before committing?`,
      a: `Yes — physical material and fabric samples are part of every ${city.name} consultation, so you can see color and texture in your own light before ordering anything.`,
    },
  ];

  return (
    <div>
      <section className="pb-16 pt-32 md:pt-36">
        <div className="container-lux">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Service Area", href: "/service-area" }, { label: city.name }]}
          />
          <div className="mt-8 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-oak-dark" aria-hidden="true" />
            <p className="eyebrow">{city.county}</p>
          </div>
          <h1 className="mt-4 max-w-2xl text-4xl leading-[1.1] text-charcoal md:text-5xl">
            Custom Window Treatments in {city.name}, TX
          </h1>
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal-soft">{city.blurb}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button href="/quote" size="lg">Get Free Consultation</Button>
          </div>
        </div>
      </section>

      {/* At a glance — typography-led stat row, no photo */}
      <section className="pb-20 lg:pb-28">
        <div className="container-lux grid grid-cols-1 gap-6 sm:grid-cols-3">
          <FadeIn>
            <div className="h-full rounded-sm border border-charcoal/10 p-7">
              <p className="eyebrow mb-3">Popular Neighborhoods</p>
              <p className="text-[14px] leading-relaxed text-charcoal">{city.neighborhoods.join(", ")}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.06}>
            <div className="h-full rounded-sm border border-charcoal/10 p-7">
              <p className="eyebrow mb-3">Most Requested Here</p>
              <p className="text-[14px] leading-relaxed text-charcoal">{city.popularServices.join(", ")}</p>
            </div>
          </FadeIn>
          <FadeIn delay={0.12}>
            <div className="h-full rounded-sm border border-charcoal/10 p-7">
              <p className="eyebrow mb-3">From Our Team</p>
              <p className="text-[14px] leading-relaxed text-charcoal">{city.driveTime}</p>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow={`Available in ${city.name}`} title={`Treatments ${city.name} homeowners choose most`} />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredServices.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`} className="group block rounded-sm bg-warm-white p-6">
                <WindowArt variant={s.visual} tone="light" className="aspect-[4/3] w-full" />
                <h3 className="mt-4 font-display text-lg text-charcoal group-hover:text-oak-dark">{s.name}</h3>
                <p className="mt-1 text-[13px] text-charcoal-soft">{s.tagline}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-charcoal/10 py-14">
        <div className="container-lux">
          <TrustBadges />
        </div>
      </section>

      {/* FAQ — replaces the illustrative testimonial carousel */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="Common Questions" title={`${city.name} FAQ`} />
          <div className="mt-10">
            <Accordion items={faqs} />
          </div>
        </div>
      </section>

      <section className="bg-matte-black py-24 text-center">
        <div className="container-lux">
          <h2 className="mx-auto max-w-xl text-3xl text-warm-white md:text-4xl">
            Schedule your free consultation in {city.name}
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14px] text-warm-white/60">
            Call {business.contact.phoneDisplay} or request a time online.
          </p>
          <div className="mt-8">
            <Button href="/quote" size="lg">Get Free Consultation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
