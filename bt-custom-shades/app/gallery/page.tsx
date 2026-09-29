import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { WindowArt } from "@/components/WindowArt";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/Button";
import { designStyles } from "@/lib/data/styleGuide";

export const metadata: Metadata = {
  title: "Window Treatment Inspiration",
  description:
    "A design guide to plantation shutters, roller shades, drapery, and more — organized by style, from modern to traditional to organic. See what fits your home before your free consultation.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Inspiration" }]} />
        <SectionHeading
          eyebrow="Design Guide"
          title="Window Treatment Inspiration"
          copy="Every home leans toward a style before a single sample is chosen. Browse by look below to see which products fit — then bring the direction you like to your free consultation, where we bring physical samples to your actual windows and light."
          className="mt-8 max-w-2xl"
        />
      </div>

      <div className="container-lux mt-16 space-y-6">
        {designStyles.map((style, i) => (
          <FadeIn key={style.slug} delay={(i % 3) * 0.06}>
            <div className="grid gap-8 rounded-sm border border-charcoal/10 p-8 md:grid-cols-[0.7fr_1.3fr] md:items-center md:p-10">
              <WindowArt variant={style.visual} tone="light" className="aspect-[4/3] w-full" />
              <div>
                <h2 className="font-display text-2xl text-charcoal md:text-3xl">{style.name}</h2>
                <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-charcoal-soft">{style.description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {style.bestFor.map((name) => {
                    const slug = name.toLowerCase().replace(/\s+/g, "-");
                    return (
                      <Link
                        key={name}
                        href={`/services/${slug}`}
                        className="rounded-full border border-charcoal/15 px-4 py-1.5 text-[12px] font-medium text-charcoal-soft transition-colors hover:border-oak-dark hover:text-oak-dark"
                      >
                        {name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>

      <div className="container-lux mt-20 rounded-sm bg-cream p-10 text-center md:p-16">
        <p className="font-display text-2xl text-charcoal md:text-3xl">
          Want to see how these styles would look in your home?
        </p>
        <p className="mx-auto mt-3 max-w-md text-[14px] leading-relaxed text-charcoal-soft">
          Every consultation includes real hardwood, fabric, and shade samples brought directly to your windows — so you can see the actual light, texture, and color before ordering anything.
        </p>
        <div className="mt-7">
          <Button href="/quote" size="lg">Schedule a Free Consultation</Button>
        </div>
      </div>
    </div>
  );
}
