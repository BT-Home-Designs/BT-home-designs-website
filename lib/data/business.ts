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
 * VERIFICATION FLAGS: phone, email, address, and hours each have their
 * own `isVerified` flag. Components check these flags and render NOTHING
 * for that field when false — no placeholder number, no fake hours — so
 * an unconfirmed value can sit in this file (for a developer to fill in
 * later) without ever being shown to a site visitor or emitted into
 * structured data. Flip a flag to `true` only once that value has been
 * confirmed as real by the business.
 */

export const business = {
  name: "BT Home Designs",
  legalName: "BT Home Designs LLC", // PLACEHOLDER — confirm registered legal entity name
  tagline: "Custom Window Treatments",
  description:
    "Custom plantation shutters, roller shades, motorized shades, and drapery for Dallas–Fort Worth homes.",
  founded: null as number | null, // PLACEHOLDER — e.g. 2010, if the business wants a founding year displayed

  contact: {
    // Not yet confirmed real — phoneVerified is false, so no component
    // renders this number anywhere (site or schema) until it's set true.
    phone: "", // PLACEHOLDER — set to a real E.164 number (e.g. "+19725551234") once confirmed
    phoneDisplay: "", // PLACEHOLDER — set to the matching display format (e.g. "(972) 555-1234")
    phoneVerified: false,

    email: "hello@bthomedesigns.com", // PLACEHOLDER — confirm this is the real, monitored inbox
    emailVerified: false,
  },

  address: {
    street: "", // PLACEHOLDER
    suite: "",
    city: "Rockwall", // approximate service-area anchor, not asserted as a verified mailing address
    state: "TX",
    postalCode: "",
    isVerified: false,
  },

  serviceAreaSummary: "Serving the Dallas–Fort Worth metroplex",

  // Not yet confirmed real business hours — hoursVerified is false, so
  // no component displays this schedule until it's set true.
  hours: [
    { days: "Monday – Friday", time: "" },
    { days: "Saturday", time: "" },
    { days: "Sunday", time: "" },
  ],
  hoursVerified: false,

  social: {
    instagram: "", // PLACEHOLDER — e.g. "https://instagram.com/bthomedesigns"
    facebook: "", // PLACEHOLDER — e.g. "https://facebook.com/bthomedesigns"
  },

  urls: {
    website: "https://www.bthomedesigns.com",
    // Embeddable map iframe src / directions link. Only rendered once
    // address.isVerified is true.
    mapsEmbed: "https://maps.google.com/maps?q=Rockwall%2C%20TX&t=&z=11&ie=UTF8&iwloc=&output=embed",
    mapsDirections: "https://maps.google.com/?q=Rockwall,TX",
  },

  policies: {
    deposit: "A deposit is required to begin production; exact terms are confirmed at consultation.", // PLACEHOLDER — confirm real deposit policy
    financing: "Flexible financing options may be available for qualifying projects.",
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
