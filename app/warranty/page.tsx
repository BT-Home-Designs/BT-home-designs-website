import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Search, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { WarrantyServiceForm } from "@/components/WarrantyServiceForm";

export const metadata: Metadata = {
  title: "Warranty & Service",
  description:
    "Having an issue with your plantation shutters, shades, or drapery? Submit a warranty or service request and BT Home Designs will help determine the next step.",
  alternates: { canonical: "/warranty" },
};

const steps = [
  {
    icon: MessageSquare,
    title: "Tell Us What's Happening",
    copy: "Describe the issue and, if you can, include a few photos or a short video — it helps us understand the problem before we even call you.",
  },
  {
    icon: Search,
    title: "We Review Your Request",
    copy: "Our team looks at the product, the reported issue, and the applicable warranty coverage for what was installed.",
  },
  {
    icon: ShieldCheck,
    title: "We Follow Up With Next Steps",
    copy: "We'll reach out to confirm the path forward — whether that's a warranty repair, a service visit, or more information we need from you.",
  },
];

export default function WarrantyPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Warranty & Service" }]} />
        <SectionHeading
          eyebrow="Warranty & Service"
          title="We stand behind what we install"
          copy="Manufacturer warranty coverage varies by product line, and exact terms are provided with your paperwork at the time of purchase and installation. If a shutter, shade, or drapery isn't operating the way it should, let us know below — our team will review the details and help determine the right path forward, whether that's a manufacturer warranty claim, a service adjustment, or a repair visit."
          className="mt-8 max-w-3xl"
        />
      </div>

      <div className="container-lux mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
        {steps.map(({ icon: Icon, title, copy }) => (
          <div key={title} className="rounded-sm border border-charcoal/10 bg-cream p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warm-white">
              <Icon className="h-4.5 w-4.5 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
            </div>
            <p className="mt-4 font-display text-lg text-charcoal">{title}</p>
            <p className="mt-2 text-[13px] leading-relaxed text-charcoal-soft">{copy}</p>
          </div>
        ))}
      </div>

      <div className="container-lux mt-24" id="request-form">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-3xl leading-[1.15] text-charcoal md:text-[2.25rem]">
            Request Warranty or Service Help
          </h2>
          <p className="mt-5 text-[15px] leading-relaxed text-charcoal-soft">
            Having an issue with one of your window treatments? Submit the information below and BT Home Designs
            will help determine the appropriate service or warranty path.
          </p>

          <div className="mt-10 rounded-sm bg-cream p-6 md:p-10">
            <WarrantyServiceForm />
          </div>

          <p className="mt-5 text-[12px] leading-relaxed text-charcoal-soft/80">
            Information submitted through this form will be used only to respond to your service or warranty
            request.{" "}
            <Link href="/privacy-policy" className="underline underline-offset-2 hover:text-oak-dark">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
