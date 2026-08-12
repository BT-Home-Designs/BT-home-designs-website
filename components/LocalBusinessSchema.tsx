import { cities } from "@/lib/data/cities";
import { business } from "@/lib/data/business";

/**
 * Emits LocalBusiness JSON-LD built from lib/data/business.ts. Every field
 * below is gated on its own verification flag and omitted entirely when
 * unverified — an unconfirmed phone number, address, or set of hours in
 * structured data is worse than no data at all, since search engines and
 * aggregators treat schema as an authoritative claim.
 */
export function LocalBusinessSchema() {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${business.urls.website}/#business`,
    name: business.name,
    description: business.description,
    url: business.urls.website,
    areaServed: cities.map((c) => ({ "@type": "City", name: `${c.name}, TX` })),
  };

  if (business.contact.phoneVerified) {
    schema.telephone = business.contact.phone;
  }

  if (business.contact.emailVerified) {
    schema.email = business.contact.email;
  }

  if (business.address.isVerified) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.postalCode,
      addressCountry: "US",
    };
  }

  if (business.hoursVerified) {
    schema.openingHoursSpecification = business.hours.map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: h.days,
      description: h.time,
    }));
  }

  const sameAs = [business.social.instagram, business.social.facebook].filter(Boolean);
  if (sameAs.length > 0) schema.sameAs = sameAs;

  if (business.reviews.count && business.reviews.averageRating) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: business.reviews.averageRating,
      reviewCount: business.reviews.count,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
