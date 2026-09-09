import type { Metadata } from "next";
import Link from "next/link";
import { MessageSquare, Search, ShieldCheck } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { WarrantyServiceForm } from "@/components/WarrantyServiceForm";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Warranty & Service",
  description:
    "Having an issue with your plantation shutters, shades, or drapery? Submit a warranty or service request and BT Home Designs will help determine the next step.",
  alternates: { canonical: "/warranty" },
};

// Anchor for the request form below. Keep this stable — it's referenced
// from printed materials (e.g. a warranty guide QR code pointing to
// /warranty#service-request) as well as the "Request Warranty or Service
// Help" button near the top of this page.
const FORM_ANCHOR = "service-request";

const steps = [
  {
    icon: MessageSquare,
    title: "Tell Us What's Happening",
    copy: "Describe the issue and include a few clear photos — it helps us understand the problem before we even call you.",
  },
  {
    icon: Search,
    title: "We Review Your Request",
    copy: "Our team looks at the product, the reported issue, and the applicable manufacturer warranty for what was installed.",
  },
  {
    icon: ShieldCheck,
    title: "We Follow Up With Next Steps",
    copy: "We'll reach out to confirm the path forward — whether that's a manufacturer warranty claim, a service visit, or more information we need from you.",
  },
];

export default function WarrantyPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Warranty & Service" }]} />
        <SectionHeading
          eyebrow="Warranty & Service"
          title="Warranty & Service Support"
          copy="If a shutter, shade, or drapery installed by BT Home Designs isn't working the way it should, contact us first. Coverage for the product itself comes from the manufacturer's warranty — terms vary by product line and are provided with your paperwork at installation. Submit the details below and BT Home Designs will review your request and help determine the appropriate next step."
          className="mt-8 max-w-3xl"
        />
        <Button href={`#${FORM_ANCHOR}`} className="mt-8">
          Request Warranty or Service Help
        </Button>
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

      <div className="container-lux mt-24 scroll-mt-28" id={FORM_ANCHOR}>
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
