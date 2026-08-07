import type { Metadata } from "next";
import { Heart, Ruler, Sparkles, Users } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import { FadeIn } from "@/components/FadeIn";
import { Button } from "@/components/Button";
import { ReviewCarousel } from "@/components/ReviewCarousel";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "BT Home Designs is a family-owned window treatment company serving Dallas–Fort Worth with personal service, careful measuring, and a luxury installation experience.",
  alternates: { canonical: "/about" },
};

const values = [
  { icon: Users, title: "Family-Owned", copy: "Founded and still run by the same family, with a name and a reputation on every job we complete." },
  { icon: Heart, title: "Personal Service", copy: "You work with the same consultant from your first appointment through final installation — no call center handoffs." },
  { icon: Ruler, title: "Attention to Detail", copy: "Every opening is measured twice. Reveals, returns, and mounting depth are checked before a single order is placed." },
  { icon: Sparkles, title: "A Luxury Experience", copy: "From the first phone call to the final walkthrough, the process should feel as considered as the finished room." },
];

export default function AboutPage() {
  return (
    <div>
      <section className="pb-20 pt-32 md:pt-36">
        <div className="container-lux">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "About" }]} />
          <SectionHeading
            eyebrow="Our Story"
            title="A family business, built one Texas home at a time"
            copy="BT Home Designs started with a simple idea: window treatments are one of the few home upgrades you see and use every single day, so they deserve the same care as any other piece of fine furniture in the house."
            className="mt-8 max-w-3xl"
          />
        </div>
      </section>

      <section className="pb-20 lg:pb-28">
        <div className="container-lux grid gap-14 lg:grid-cols-2 lg:items-center">
          <FadeIn>
            <ImagePlaceholder variant="oak" label="The BT Home Designs Team" className="aspect-[4/5] w-full" />
          </FadeIn>
          <FadeIn delay={0.15}>
            <p className="eyebrow mb-4">How We Work</p>
            <h2 className="text-3xl leading-[1.15] text-charcoal md:text-4xl">
              Every project starts in your home, not a showroom
            </h2>
            <p className="mt-6 text-[15px] leading-relaxed text-charcoal-soft">
              We built our process around the fact that light, color, and proportion only tell the truth inside the room they belong to. A consultant visits your home with real hardwood, fabric, and shade samples, walks every window with you, and leaves you with a written estimate — not a sales pitch.
            </p>
            <p className="mt-4 text-[15px] leading-relaxed text-charcoal-soft">
              From there, our own in-house measure technicians confirm every opening before an order is placed, and our trained install crews — not subcontractors — complete the finished work, typically in a single visit.
            </p>
            <div className="mt-8">
              <Button href="/quote">Schedule Your Consultation</Button>
            </div>
          </FadeIn>
        </div>
      </section>

      <section className="bg-cream py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="What We Believe" title="The values behind every install" align="center" className="mx-auto" />
          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, copy }, i) => (
              <FadeIn key={title} delay={i * 0.08}>
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warm-white">
                    <Icon className="h-5 w-5 text-oak-dark" strokeWidth={1.5} />
                  </div>
                  <h3 className="mt-5 font-display text-lg text-charcoal">{title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-charcoal-soft">{copy}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-lux">
          <SectionHeading eyebrow="From Our Clients" title="What it's like to work with us" align="center" className="mx-auto" />
          <div className="mt-14">
            <ReviewCarousel />
          </div>
        </div>
      </section>

      <section className="bg-matte-black py-24 text-center">
        <div className="container-lux">
          <h2 className="mx-auto max-w-xl text-3xl text-warm-white md:text-4xl">Let&apos;s meet in your home</h2>
          <div className="mt-8">
            <Button href="/quote" size="lg">Schedule Free Consultation</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
