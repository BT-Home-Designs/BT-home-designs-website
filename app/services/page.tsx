import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { WindowArt } from "@/components/WindowArt";
import { FadeIn } from "@/components/FadeIn";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Custom Window Treatment Services",
  description:
    "Explore BT Home Designs' full lineup of custom window treatments — plantation shutters, roller shades, motorized shades, zebra shades, woven woods, custom drapery, and exterior shades.",
  alternates: { canonical: "/services" },
};

export default function ServicesIndexPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Services" }]} />
        <SectionHeading
          eyebrow="Our Services"
          title="Seven ways to shape light, privacy, and comfort"
          copy="Every project starts the same way: a free in-home consultation where we bring real samples to your actual windows. Explore each treatment below, or let us walk you through the options in person."
          className="mt-8"
        />

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s, i) => (
            <FadeIn key={s.slug} delay={(i % 3) * 0.08}>
              <Link href={`/services/${s.slug}`} className="group flex h-full flex-col rounded-sm border border-charcoal/10 p-7 transition-colors hover:border-oak-dark">
                <WindowArt variant={s.visual} tone="light" className="aspect-[4/3] w-full transition-transform duration-500 group-hover:scale-[1.02]" />
                <h2 className="mt-6 font-display text-2xl text-charcoal group-hover:text-oak-dark">{s.name}</h2>
                <p className="mt-2 flex-1 text-[14px] leading-relaxed text-charcoal-soft">{s.tagline}</p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-oak-dark">
                  Learn More <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
