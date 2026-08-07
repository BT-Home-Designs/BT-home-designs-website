import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { FadeIn } from "@/components/FadeIn";
import { cities } from "@/lib/data/cities";

export const metadata: Metadata = {
  title: "Service Area | Dallas–Fort Worth",
  description:
    "BT Home Designs installs custom window treatments across the Dallas–Fort Worth metroplex, including Rockwall, Frisco, Plano, McKinney, Dallas, and more.",
  alternates: { canonical: "/service-area" },
};

export default function ServiceAreaIndexPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Service Area" }]} />
        <SectionHeading
          eyebrow="Where We Work"
          title="Serving homes across the DFW metroplex"
          copy="From Rockwall to Fort Worth's eastern suburbs, our consultants, measure techs, and install crews cover the full metroplex. Select a city for local project examples."
          className="mt-8 max-w-2xl"
        />

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cities.map((c, i) => (
            <FadeIn key={c.slug} delay={(i % 6) * 0.05}>
              <Link
                href={`/service-area/${c.slug}`}
                className="group flex items-start justify-between gap-4 rounded-sm border border-charcoal/10 p-6 transition-colors hover:border-oak-dark"
              >
                <div>
                  <h2 className="font-display text-xl text-charcoal group-hover:text-oak-dark">{c.name}, TX</h2>
                  <p className="mt-1 text-[12px] text-charcoal-soft">{c.county}</p>
                </div>
                <MapPin className="h-4 w-4 shrink-0 text-oak-dark" strokeWidth={1.5} />
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
