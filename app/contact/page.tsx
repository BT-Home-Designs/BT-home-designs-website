import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, type LucideIcon } from "lucide-react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { SectionHeading } from "@/components/SectionHeading";
import { ContactForm } from "@/components/ContactForm";
import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact BT Home Designs to schedule a free in-home consultation. Serving Dallas, Frisco, Plano, Rockwall, McKinney, and the greater DFW metroplex.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Contact" }]} />
        <SectionHeading
          eyebrow="Get In Touch"
          title="We'd love to see your windows"
          copy="Send a message below and a real person from our team will respond within one business day."
          className="mt-8 max-w-2xl"
        />
      </div>

      <div className="container-lux mt-16 grid gap-16 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-8">
          <InfoRow icon={MapPin} label={business.address.isVerified ? "Showroom" : "Area Served"}>
            {business.address.isVerified && (
              <>
                {business.address.street}
                {business.address.suite && <>, {business.address.suite}</>}
                <br />
              </>
            )}
            {business.address.city}, {business.address.state}
            {business.address.isVerified && business.address.postalCode && ` ${business.address.postalCode}`}
          </InfoRow>
          {business.contact.phoneVerified && (
            <InfoRow icon={Phone} label="Phone">
              <a href={`tel:${business.contact.phone}`} className="hover:text-oak-dark">{business.contact.phoneDisplay}</a>
            </InfoRow>
          )}
          {business.contact.emailVerified && (
            <InfoRow icon={Mail} label="Email">
              <a href={`mailto:${business.contact.email}`} className="hover:text-oak-dark">{business.contact.email}</a>
            </InfoRow>
          )}
          {business.hoursVerified && (
            <InfoRow icon={Clock} label="Business Hours">
              {business.hours.map((h, i) => (
                <span key={h.days}>
                  {h.days}: {h.time}
                  {i < business.hours.length - 1 && <br />}
                </span>
              ))}
            </InfoRow>
          )}

          <div>
            <p className="eyebrow mb-3">Service Area</p>
            <p className="text-[13px] leading-relaxed text-charcoal-soft">
              {cities.map((c) => c.name).join(" · ")}
            </p>
          </div>

          {/* Map only renders once a real, verified address is configured
              — see lib/data/business.ts. No placeholder map is shown. */}
          {business.address.isVerified && (
            <div className="overflow-hidden rounded-sm border border-charcoal/10">
              <iframe
                title={`${business.name} showroom location`}
                src={business.urls.mapsEmbed}
                className="h-64 w-full grayscale"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>

        <div className="rounded-sm bg-cream p-8 md:p-10">
          <h2 className="font-display text-2xl text-charcoal">Send a Message</h2>
          <div className="mt-6">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cream">
        <Icon className="h-4 w-4 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft">{label}</p>
        <p className="mt-1 text-[14px] leading-relaxed text-charcoal">{children}</p>
      </div>
    </div>
  );
}
