/**
 * SINGLE SOURCE OF TRUTH for all editable BT Home Designs business details.
 *
 * Every phone number, address, hours listing, social link, and policy
 * statement shown anywhere on the site should be read from this file —
 * never hardcoded in a component. To update the business's real-world
 * information, edit the values below; every page that references them
 * (Navbar, Footer, Contact, Quote, homepage, schema, Open Graph, etc.)
 * updates automatically.
 *
 * Values below marked "PLACEHOLDER" are illustrative only — they were not
 * supplied by the business and must be replaced with verified information
 * before launch. Nothing marked PLACEHOLDER is emitted into structured
 * data (JSON-LD) — see components/LocalBusinessSchema.tsx, which omits
 * unverified fields rather than presenting placeholders to search engines
 * as fact.
 */

export const business = {
  name: "BT Home Designs",
  legalName: "BT Home Designs LLC", // PLACEHOLDER — confirm registered legal entity name
  tagline: "Custom Window Treatments",
  description:
    "Custom plantation shutters, roller shades, motorized shades, and drapery for Dallas–Fort Worth homes.",
  founded: null as number | null, // PLACEHOLDER — e.g. 2010, if the business wants a founding year displayed

  contact: {
    phone: "+19725550123", // PLACEHOLDER — E.164 format, used for tel: links and schema
    phoneDisplay: "(972) 555-0123", // PLACEHOLDER — update in lib/data/business.ts
    email: "hello@bthomedesigns.com", // PLACEHOLDER — update in lib/data/business.ts
    isVerified: false, // set true once the above are confirmed real
  },

  address: {
    street: "Update in lib/data/business.ts",
    suite: "",
    city: "Rockwall",
    state: "TX",
    postalCode: "", // PLACEHOLDER — omitted from schema until supplied
    isVerified: false, // set true once the address is confirmed real
  },

  serviceAreaSummary: "Serving the Dallas–Fort Worth metroplex",

  hours: [
    { days: "Monday – Friday", time: "8:00 AM – 6:00 PM" },
    { days: "Saturday", time: "9:00 AM – 3:00 PM" },
    { days: "Sunday", time: "By appointment" },
  ],

  social: {
    instagram: "", // PLACEHOLDER — e.g. "https://instagram.com/bthomedesigns"
    facebook: "", // PLACEHOLDER — e.g. "https://facebook.com/bthomedesigns"
  },

  urls: {
    website: "https://www.bthomedesigns.com",
    // Embeddable map iframe src. Uses a keyless Google Maps query embed
    // pointed at the city center until a verified street address + Maps
    // Embed API key are available.
    mapsEmbed: "https://maps.google.com/maps?q=Rockwall%2C%20TX&t=&z=11&ie=UTF8&iwloc=&output=embed",
    mapsDirections: "https://maps.google.com/?q=Rockwall,TX", // PLACEHOLDER — update once address is verified
  },

  policies: {
    deposit: "A deposit is required to begin production; exact terms are confirmed at consultation.", // PLACEHOLDER — confirm real deposit policy
    financing: "Flexible financing options may be available for qualifying projects.", // PLACEHOLDER — confirm real financing terms/partner
    consultation: "Free, no-pressure in-home consultation — a specialist brings samples to your actual windows and light.",
    // Only populate with a real, contracted financing partner name. The
    // homepage financing banner only shows a "Financing powered by ..."
    // credit line when this is set, so no partner is implied until one
    // is actually confirmed.
    financingProvider: null as string | null,
  },

  // Only populate once a real, verifiable count/rating exists. Leaving
  // these null prevents the site (and its schema) from showing or
  // implying review data that hasn't been confirmed.
  reviews: {
    count: null as number | null,
    averageRating: null as number | null,
  },

  // Homepage "stats" row (homes completed, years of experience, etc.).
  // Every value defaults to null and is only rendered once set to a
  // real, confirmed number — never estimated or invented.
  stats: {
    homesCompleted: null as number | null,
    yearsExperience: null as number | null,
  },

  // Only populate with real, confirmed warranty language. Do not infer or
  // invent coverage terms.
  warranty: null as string | null,
} as const;

export type Business = typeof business;
