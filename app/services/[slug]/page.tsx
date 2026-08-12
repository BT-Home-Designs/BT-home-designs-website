import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { WindowArt } from "@/components/WindowArt";
import { DesignOptions } from "@/components/DesignOptions";
import { Accordion } from "@/components/Accordion";
import { FadeIn } from "@/components/FadeIn";
import { TrustBadges } from "@/components/TrustBadges";
import { services, getServiceBySlug } from "@/lib/data/services";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

type ServicePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  return {
    title: `${service.name} | Dallas–Fort Worth`,
    description: service.heroCopy,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.name} | BT Home Designs`, description: service.heroCopy },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: `${service.name} — BT Home Designs`,
    description: service.description,
    provider: { "@type": "HomeAndConstructionBusiness", name: "BT Home Designs" },
    areaServed: "Dallas–Fort Worth, TX",
  };

  const otherServices = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      {/* Hero — editorial split layout, no photography */}
      <section className="relative overflow-hidden bg-charcoal pt-32 text-warm-white md:pt-36">
        <div className="container-lux grid items-center gap-14 pb-16 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <Breadcrumbs
              tone="light"
              items={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.name }]}
            />
            <p className="eyebrow mt-6 mb-4 !text-oak-light">{service.tagline}</p>
            <h1 className="max-w-2xl text-4xl leading-[1.1] text-warm-white md:text-6xl">{service.name}</h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-warm-white/75">{service.heroCopy}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href="/quote" size="lg">Get Free Consultation</Button>
              <Button href="/gallery" size="lg" variant="light" icon={false}>Explore Styles</Button>
            </div>
          </div>
          <FadeIn delay={0.1} className="mx-auto aspect-[4/5] w-full max-w-xs lg:max-w-none">
            <WindowArt variant={service.visual} tone="dark" className="h-full w-full" />
          </FadeIn>
        </div>
      </section>

      {/* Description */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <FadeIn>
            <p className="eyebrow mb-4">Overview</p>
            <h2 className="text-3xl leading-[1.15] text-charcoal md:text-4xl">Made for how North Texas actually lives</h2>
            <p className="mt-6 text-[15px] leading-relaxed text-charcoal-soft">{service.description}</p>
            <div className="mt-8">
              <Button href="/quote" variant="secondary">Request a Free Measure</Button>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Why Choose This" title={`${service.name}, built to last`} align="center" className="mx-auto" />
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {service.benefits.map((b, i) => (
              <FadeIn key={b.title} delay={i * 0.08}>
                <div className="h-full rounded-sm bg-warm-white p-7">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-oak/15">
                    <Check className="h-4 w-4 text-oak-dark" strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-lg text-charcoal">{b.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-charcoal-soft">{b.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Design Options — replaces the photo gallery with structured specs */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Design Options" title={`Ways to configure your ${service.name.toLowerCase()}`} />
          <div className="mt-12">
            <DesignOptions options={service.designOptions} visual={service.visual} />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-charcoal/10 bg-cream py-14">
        <div className="container-lux">
          <TrustBadges />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="Common Questions" title={`${service.name} FAQ`} />
          <div className="mt-10">
            <Accordion items={service.faqs} />
          </div>
        </div>
      </section>

      {/* Explore more */}
      <section className="pb-20 lg:pb-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Explore More" title="Other treatments to consider" />
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {otherServices.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`} className="group block">
                <WindowArt variant={s.visual} tone="light" className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.02]" />
                <h3 className="mt-4 font-display text-xl text-charcoal group-hover:text-oak-dark">{s.name}</h3>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-matte-black py-24 text-center">
        <div className="container-lux">
          <h2 className="mx-auto max-w-xl text-3xl text-warm-white md:text-4xl">
            See {service.name.toLowerCase()} in your own home, free
          </h2>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button href="/quote" size="lg">Schedule Free Consultation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
