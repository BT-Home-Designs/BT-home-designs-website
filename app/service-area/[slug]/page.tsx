import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { FadeIn } from "@/components/FadeIn";
import { TrustBadges } from "@/components/TrustBadges";
import { ReviewCarousel } from "@/components/ReviewCarousel";
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

  return (
    <div>
      <section className="pb-16 pt-32 md:pt-36">
        <div className="container-lux">
          <Breadcrumbs
            items={[{ label: "Home", href: "/" }, { label: "Service Area", href: "/service-area" }, { label: city.name }]}
          />
          <div className="mt-8 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-oak-dark" />
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

      <section className="pb-20 lg:pb-28">
        <div className="container-lux grid gap-10 lg:grid-cols-3">
          <FadeIn>
            <ImagePlaceholder variant="oak" label={`${city.name}, TX`} className="aspect-[4/3] w-full lg:col-span-2" />
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="h-full rounded-sm bg-cream p-8">
              <p className="eyebrow mb-4">At a Glance</p>
              <dl className="space-y-5 text-[13px]">
                <div>
                  <dt className="font-semibold text-charcoal">Popular Neighborhoods</dt>
                  <dd className="mt-1 text-charcoal-soft">{city.neighborhoods.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-charcoal">Most Requested Here</dt>
                  <dd className="mt-1 text-charcoal-soft">{city.popularServices.join(", ")}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-charcoal">From Our Showroom</dt>
                  <dd className="mt-1 text-charcoal-soft">{city.driveTime}</dd>
                </div>
              </dl>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow={`Available in ${city.name}`} title={`Treatments ${city.name} homeowners choose most`} />
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services
              .filter((s) => city.popularServices.includes(s.name))
              .concat(services.filter((s) => !city.popularServices.includes(s.name)))
              .slice(0, 3)
              .map((s) => (
                <a key={s.slug} href={`/services/${s.slug}`} className="group block rounded-sm bg-warm-white p-6">
                  <ImagePlaceholder variant="charcoal" className="aspect-[4/3] w-full" />
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

      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Client Stories" title={`What ${city.name} homeowners say`} align="center" className="mx-auto" />
          <div className="mt-14">
            <ReviewCarousel />
          </div>
        </div>
      </section>

      <section className="bg-matte-black py-24 text-center">
        <div className="container-lux">
          <h2 className="mx-auto max-w-xl text-3xl text-warm-white md:text-4xl">
            Schedule your free consultation in {city.name}
          </h2>
          <div className="mt-8">
            <Button href="/quote" size="lg">Get Free Consultation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
