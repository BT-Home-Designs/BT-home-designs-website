import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Free Quote",
  description:
    "Get a free custom quote for plantation shutters, roller shades, motorized shades, or drapery. Schedule your in-home consultation with BT Home Designs today.",
  alternates: { canonical: "/quote" },
};

export default function QuotePage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]} />
        <p className="eyebrow mt-8 mb-4">Free Consultation</p>
        <h1 className="text-4xl leading-[1.1] text-charcoal md:text-5xl">Tell us about your windows</h1>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-charcoal-soft">
          Answer a few quick questions and we&apos;ll follow up within one business day to schedule your free,
          no-pressure in-home consultation.
        </p>
      </div>

      <div className="container-lux mt-16">
        <QuoteForm />
      </div>
    </div>
  );
}
