import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { FacebookIcon, InstagramIcon } from "./icons";
import { services } from "@/lib/data/services";
import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";

export function Footer() {
  const year = new Date().getFullYear();
  const featuredCities = cities.slice(0, 8);
  const { social } = business;
  const hasSocial = Boolean(social.instagram || social.facebook);

  return (
    <footer className="bg-matte-black text-warm-white">
      <div className="container-lux grid grid-cols-2 gap-10 py-16 md:grid-cols-4 lg:py-24">
        <div className="col-span-2 pr-6 md:col-span-1">
          <Link href="/" aria-label="BT Home Designs home" className="font-display text-2xl">
            {business.name}
          </Link>
          <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-warm-white/60">
            {business.description}
          </p>
          {hasSocial && (
            <div className="mt-6 flex gap-4">
              {social.instagram && (
                <a href={social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-warm-white/60 transition-colors hover:text-oak-light">
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {social.facebook && (
                <a href={social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-warm-white/60 transition-colors hover:text-oak-light">
                  <FacebookIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow !text-oak-light mb-5">Services</p>
          <ul className="space-y-3">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-[13px] text-warm-white/70 transition-colors hover:text-warm-white">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-oak-light mb-5">Service Area</p>
          <ul className="space-y-3">
            {featuredCities.map((c) => (
              <li key={c.slug}>
                <Link href={`/service-area/${c.slug}`} className="text-[13px] text-warm-white/70 transition-colors hover:text-warm-white">
                  {c.name}, TX
                </Link>
              </li>
            ))}
            <li>
              <Link href="/service-area" className="text-[13px] font-medium text-oak-light">
                View all cities
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow !text-oak-light mb-5">Visit or Call</p>
          <ul className="space-y-4 text-[13px] text-warm-white/70">
            <li className="flex gap-3">
              <MapPin className="h-4 w-4 shrink-0 text-oak-light" strokeWidth={1.5} aria-hidden="true" />
              <span>
                {business.address.isVerified && (
                  <>
                    {business.address.street}
                    {business.address.suite && <>, {business.address.suite}</>}
                    <br />
                  </>
                )}
                {business.address.city}, {business.address.state}
                {business.address.isVerified && business.address.postalCode && ` ${business.address.postalCode}`}
              </span>
            </li>
            <li className="flex gap-3">
              <Phone className="h-4 w-4 shrink-0 text-oak-light" strokeWidth={1.5} aria-hidden="true" />
              <a href={`tel:${business.contact.phone}`} className="hover:text-warm-white">{business.contact.phoneDisplay}</a>
            </li>
            <li className="flex gap-3">
              <Mail className="h-4 w-4 shrink-0 text-oak-light" strokeWidth={1.5} aria-hidden="true" />
              <a href={`mailto:${business.contact.email}`} className="hover:text-warm-white">{business.contact.email}</a>
            </li>
          </ul>
          <p className="mt-6 text-[12px] leading-relaxed text-warm-white/45">
            {business.hours.map((h) => `${h.days}: ${h.time}`).join(" · ")}
          </p>
        </div>
      </div>

      <div className="border-t border-warm-white/10">
        <div className="container-lux flex flex-col items-center justify-between gap-3 py-6 text-[11px] text-warm-white/40 md:flex-row">
          <p>© {year} {business.name}. Family-owned &amp; locally operated in North Texas.</p>
          <div className="flex gap-6">
            <Link href="/" className="hover:text-warm-white/70">Home</Link>
            <Link href="/quote" className="hover:text-warm-white/70">Request a Quote</Link>
            <Link href="/contact" className="hover:text-warm-white/70">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
