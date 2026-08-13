import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Button } from "@/components/Button";
import { SectionHeading } from "@/components/SectionHeading";
import { WindowArt } from "@/components/WindowArt";
import { DesignOptions } from "@/components/DesignOptions";
import { OptionGroupCards } from "@/components/OptionGroupCards";
import { ComparisonTable } from "@/components/ComparisonTable";
import { Checklist } from "@/components/Checklist";
import { Accordion } from "@/components/Accordion";
import { FadeIn } from "@/components/FadeIn";
import { TrustBadges } from "@/components/TrustBadges";
import { services, getServiceBySlug } from "@/lib/data/services";
import { serviceHeroImages } from "@/lib/data/media";
import { serviceGuides, consultationSteps } from "@/lib/data/serviceGuides";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

type ServicePageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: ServicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const guide = serviceGuides[slug];
  if (!service || !guide) return {};
  const description = guide.intro[0];
  return {
    title: `${service.name}: A Homeowner's Guide | Dallas–Fort Worth`,
    description,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: `${service.name} | BT Home Designs`, description },
  };
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  const guide = serviceGuides[slug];
  if (!service || !guide) notFound();

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: service.name,
    name: `${service.name} — BT Home Designs`,
    description: service.description,
    provider: { "@type": "HomeAndConstructionBusiness", name: "BT Home Designs" },
    areaServed: "Dallas–Fort Worth, TX",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: guide.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  const otherServices = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const heroImage = serviceHeroImages[service.slug];

  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal pt-32 text-warm-white md:pt-36">
        <div className="container-lux pb-14">
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
        <FadeIn delay={0.1} className="container-lux pb-16 lg:pb-20">
          {heroImage ? (
            <div className="relative aspect-[3/2] w-full overflow-hidden rounded-sm">
              <Image
                src={heroImage.src as string}
                alt={heroImage.alt}
                fill
                sizes="(min-width: 1024px) 1200px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <WindowArt variant={service.visual} tone="dark" className="mx-auto aspect-[4/5] w-full max-w-xs lg:max-w-md" />
          )}
        </FadeIn>
      </section>

      {/* Product overview / intro */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <FadeIn>
            <p className="eyebrow mb-4">Overview</p>
            <h2 className="text-3xl leading-[1.15] text-charcoal md:text-4xl">{`Understanding ${service.name.toLowerCase()}`}</h2>
            {guide.intro.map((p, i) => (
              <p key={i} className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">{p}</p>
            ))}
            <div className="mt-8 flex flex-wrap gap-4">
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

      {/* Quick spec summary */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="At a Glance" title={`Ways to configure your ${service.name.toLowerCase()}`} />
          <div className="mt-12">
            <DesignOptions options={service.designOptions} visual={service.visual} />
          </div>
        </div>
      </section>

      {/* Light control & privacy */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="Light & Privacy" title="How light control and privacy work" />
          <div className="mt-8 space-y-4">
            {guide.lightControlPrivacy.map((p, i) => (
              <p key={i} className="text-[15px] leading-relaxed text-charcoal-soft">{p}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Options & configurations */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Available Options" title="Styles, configurations, and features" copy="General product education — your designer will confirm exactly what's available for your project and current manufacturer collection." />
          <div className="mt-14 space-y-14">
            {guide.optionGroups.map((group, i) => (
              <FadeIn key={group.title} delay={(i % 3) * 0.06}>
                <OptionGroupCards group={group} />
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Materials & colors */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Materials & Colors" title={guide.materials.title} copy={guide.materials.intro} />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {guide.materials.items.map((item) => (
              <div key={item.name} className="rounded-sm border border-charcoal/10 bg-warm-white p-5">
                <p className="font-display text-base text-charcoal">{item.name}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-soft">{item.description}</p>
              </div>
            ))}
          </div>
          {guide.comparisonTable && (
            <div className="mt-10">
              <ComparisonTable table={guide.comparisonTable} />
            </div>
          )}
        </div>
      </section>

      {/* How to choose */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="How to Choose" title="Questions worth asking before you decide" />
          <div className="mt-10">
            <Checklist items={guide.howToChoose} />
          </div>
        </div>
      </section>

      {/* Room suitability */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Best Rooms & Applications" title="Where this treatment tends to work well" />
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guide.roomSuitability.map((r) => (
              <div key={r.room} className="rounded-sm border border-charcoal/10 bg-warm-white p-5">
                <p className="font-display text-base text-charcoal">{r.room}</p>
                <p className="mt-1.5 text-[13px] leading-relaxed text-charcoal-soft">{r.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Care & maintenance */}
      <section className="py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="Care & Maintenance" title="Keeping it looking its best" />
          <div className="mt-10">
            <Checklist items={guide.care} columns={2} />
          </div>
        </div>
      </section>

      {/* Trust badges */}
      <section className="border-y border-charcoal/10 bg-cream py-14">
        <div className="container-lux">
          <TrustBadges />
        </div>
      </section>

      {/* Consultation process */}
      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="What to Expect" title="From consultation to installation" align="center" className="mx-auto" />
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {consultationSteps.map((p, i) => (
              <FadeIn key={p.step} delay={i * 0.06}>
                <div className="border-t border-charcoal/10 pt-6">
                  <span className="font-display text-3xl text-oak">{p.step}</span>
                  <p className="mt-3 font-display text-lg text-charcoal">{p.title}</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-charcoal-soft">{p.copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux max-w-3xl">
          <SectionHeading eyebrow="Common Questions" title={`${service.name} FAQ`} />
          <div className="mt-10">
            <Accordion items={guide.faqs} />
          </div>
        </div>
      </section>

      {/* Explore more */}
      <section className="py-20 lg:pb-28">
        <div className="container-lux">
          <SectionHeading eyebrow="Explore More" title="Other treatments to consider" />
          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {otherServices.map((s) => (
              <Link key={s.slug} href={`/services/${s.slug}`} className="group block">
                <WindowArt variant={s.visual} tone="light" className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.02]" />
                <h3 className="mt-4 font-display text-xl text-charcoal group-hover:text-oak-dark">{s.name}</h3>
              </Link>
            ))}
          </div>
          <div className="mt-10 rounded-sm border border-charcoal/10 bg-cream p-6 text-[13px] text-charcoal-soft">
            Considering a room with multiple windows, or pairing treatments? See our{" "}
            <Link href="/service-area" className="font-medium text-oak-dark hover:underline">service area</Link> to confirm we cover your neighborhood, or head to the{" "}
            <Link href="/gallery" className="font-medium text-oak-dark hover:underline">inspiration guide</Link> for style direction before your consultation.
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
            <Button href="/quote" size="lg" variant="accent">Schedule Free Consultation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
