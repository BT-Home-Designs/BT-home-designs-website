import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { MasonryGallery } from "@/components/MasonryGallery";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse finished plantation shutter, roller shade, motorized shade, and drapery installations across Dallas–Fort Worth homes.",
  alternates: { canonical: "/gallery" },
};

export default function GalleryPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Gallery" }]} />
        <SectionHeading
          eyebrow="Portfolio"
          title="Real DFW homes, real installations"
          copy="Filter by room to see how each treatment lives in a real space. Every project shown was designed, measured, and installed by our team."
          className="mt-8"
        />
      </div>

      <div className="container-lux mt-16">
        <MasonryGallery />
      </div>

      <div className="container-lux mt-20 text-center">
        <p className="font-display text-2xl text-charcoal">Want your home to look like this?</p>
        <div className="mt-6">
          <Button href="/quote" size="lg">Get Free Consultation</Button>
        </div>
      </div>
    </div>
  );
}
