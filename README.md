# BT Home Designs Website

A production-ready marketing and lead-generation website for BT Home Designs, a luxury custom window treatment company serving the Dallas–Fort Worth metroplex.

## Overview

- 36 statically generated pages: homepage, about, contact, gallery, quote, a services index + 7 individual service pages, and a service-area index + 15 individual city pages
- A multi-step quote request form and a contact form, both posting to a single API route
- SEO baked in: per-page metadata, Open Graph/Twitter cards, JSON-LD (LocalBusiness, Service, Breadcrumb), a dynamic `sitemap.xml`, and `robots.txt`
- All editable business details (phone, address, hours, social links, policies) centralized in one file: `lib/data/business.ts`
- No photography yet — every image slot uses a designed CSS placeholder (`components/ImagePlaceholder.tsx`) so the site is fully navigable and looks finished before real photos are supplied

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 18, TypeScript
- **Styling:** Tailwind CSS v4
- **Motion:** Framer Motion
- **Icons:** lucide-react (plus two hand-drawn SVGs for Instagram/Facebook — see `components/icons.tsx`, since lucide-react v1 dropped brand icons)
- **Fonts:** system font stacks only — no external font requests (see "Typography" below)

## Requirements

- Node.js 18.18 or newer (Node 20+ recommended)
- npm (the project ships a `package-lock.json`; other package managers will work but aren't the tested path)

## Installation

```bash
npm install
```

## Local Development

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Type Checking

```bash
npm run typecheck
```

Runs `tsc --noEmit`. No `@ts-ignore`, `any`, or unsafe casts are used anywhere in the codebase.

## Linting

```bash
npm run lint
```

Runs `eslint` with Next.js's recommended config, including the React Hooks rules (`react-hooks/set-state-in-effect` etc.).

## Production Build

```bash
npm run build
```

Generates the static/SSG output described above. Run `npm run start` afterward to serve the production build locally.

## Project Structure

```
app/
  layout.tsx              Root layout: metadata, schema, Navbar/Footer/FloatingCTA
  page.tsx                 Homepage
  globals.css               Design tokens (colors, fonts), base styles
  icon.png                  Favicon / app icon
  sitemap.ts                 Dynamic sitemap.xml generator
  robots.ts                   robots.txt generator
  about/page.tsx
  contact/page.tsx
  gallery/page.tsx
  quote/page.tsx
  services/page.tsx           Services index
  services/[slug]/page.tsx    Single template rendering all 7 services
  service-area/page.tsx       Service-area index
  service-area/[slug]/page.tsx  Single template rendering all 15 cities
  api/quote/route.ts          Form submission endpoint (see "Quote and Contact Forms")
  api/auth/[...nextauth]/route.ts  Internal-app login endpoint (next-auth)
  internal/login/page.tsx      Staff sign-in (public route, no session required)
  internal/(dashboard)/        Authenticated internal app shell + dashboard placeholder
middleware.ts                Blocks unauthenticated requests to /internal (see "Internal Application")
components/                 All reusable UI (Navbar, Footer, forms, gallery, etc.)
  internal/                   Internal-app-only UI (nav, login form, sign-out button)
  SiteChrome.tsx               Hides the public navbar/footer/analytics under /internal
lib/
  data/business.ts          Single source of truth for business info
  data/services.ts           Content for all 7 service pages
  data/cities.ts               Content for all 15 city pages
  data/testimonials.ts         Placeholder testimonial content (see file header)
  data/gallery.ts               Gallery item metadata
  utils.ts                    cn() className helper
  auth/options.ts              next-auth configuration (Credentials provider, JWT sessions)
  db/prisma.ts                  Prisma client singleton
prisma/
  schema.prisma                Database schema (currently: InternalUser only)
  migrations/                    Applied schema history
scripts/
  create-internal-user.ts       CLI to add/update staff accounts (see "Internal Application")
public/
  images/                    Image folders by section (see "Replacing Images")
  fonts/                       Empty, reserved for future local font files
```

## Editing Business Information

**`lib/data/business.ts` is the single source of truth** for every editable business detail: name, phone, email, address, hours, social links, map URLs, and policy text (deposit, financing, consultation wording). Every component that displays this information — Navbar, Footer, Contact page, Quote form, homepage, the financing section, and the LocalBusiness JSON-LD — imports and reads from this file. Nothing is hardcoded elsewhere.

To update the business's real information, edit the values in `lib/data/business.ts` directly. Fields still holding placeholder values are commented `// PLACEHOLDER`. Two fields, `contact.isVerified` and `address.isVerified`, gate whether the phone/email/address are included in structured data (JSON-LD) — flip them to `true` once you've confirmed the real values, so search engines don't index placeholder contact info as fact.

## Replacing Images

No real photography is included. Every image slot currently renders `components/ImagePlaceholder.tsx`, a styled CSS placeholder in the site's palette (oak / charcoal / cream gradients) with a label — this keeps every page fully designed and navigable without real assets.

Folders are pre-created under `public/images/` by section: `hero/`, `gallery/`, `services/`, `about/`, `instagram/`, `testimonials/`. To swap in real photos:

1. Add optimized `.jpg`/`.webp` files (recommended: hero images 2400x1600px, gallery/grid images 1200x1200px minimum) to the relevant folder.
2. Replace the `<ImagePlaceholder ... />` usage with `next/image`, e.g.:
   ```tsx
   <Image src="/images/services/plantation-shutters.jpg" alt="Hardwood plantation shutters in a Dallas living room" fill className="object-cover" />
   ```
   Parent elements already have sized/relative containers in most places (they were built around `ImagePlaceholder`, which fills its container), so `fill` will generally work as a drop-in replacement.
3. Always write specific, descriptive `alt` text — not the room/category label alone.

The Open Graph image (`public/images/hero/og-image.png`) and favicon (`app/icon.png`) are real generated brand assets, not placeholders — replace them with final brand art whenever you have it, keeping the same file names and the OG image's 1200x630 dimensions.

### Typography

The brief calls for a luxury serif heading face (Fraunces) and a clean sans body face (Manrope), but no local font files are bundled yet, and the build deliberately avoids `next/font/google` (or any external font fetch) so it never depends on network access at build time. `app/globals.css` defines two CSS variables read by every component:

```css
--font-display-stack: Georgia, "Times New Roman", Times, serif;
--font-sans-stack: Inter, Arial, Helvetica, sans-serif;
```

To use the real faces:

1. Add `.woff2` files to `public/fonts/`.
2. Load them in `app/layout.tsx` with `next/font/local`.
3. Point `--font-display` / `--font-sans` in `globals.css` at the resulting font variables.

No component code needs to change — everything reads `var(--font-display)` / `var(--font-sans)`, never a hardcoded font name.

## Adding a Service

Every service page (`/services/[slug]`) is rendered by a single template (`app/services/[slug]/page.tsx`) from one data file: `lib/data/services.ts`. To add an 8th service:

1. Add a new object to the `services` array in `lib/data/services.ts` with a unique `slug`, plus `name`, `tagline`, `heroCopy`, `description`, `benefits` (4 items), `faqs` (4 items), and `galleryTag`.
2. That's it — `generateStaticParams()` in the page template automatically picks it up, the page statically generates at build time, and it appears in the Navbar dropdown, Footer, homepage grid, `/services` index, and `sitemap.xml` automatically (all of those read from the same array).

## Adding a Service-Area City

Same pattern as services: `lib/data/cities.ts` is the single data source, rendered by `app/service-area/[slug]/page.tsx`.

1. Add a new object to the `cities` array with a unique `slug`, `name`, `county`, `blurb` (unique local copy — don't just template-fill it), `neighborhoods`, `popularServices` (must match names in `lib/data/services.ts`), and `driveTime`.
2. The city page, Footer link, `/service-area` index, and `sitemap.xml` all update automatically.

## Quote and Contact Forms

**What happens today, exactly:**

- Both forms POST JSON to `app/api/quote/route.ts`.
- The route validates required fields (name, email, phone), email format, a real-world-shaped phone number, string length limits, and a honeypot field (silently drops likely-bot submissions).
- Both forms require the visitor to check a consent checkbox before submitting ("I agree to be contacted...").
- The Quote form captures `sourcePage` (the referring page, e.g. a specific service or city page) so leads can be attributed to whatever page generated them.
- **Delivery is implemented via [Resend](https://resend.com), gated entirely behind environment variables.** If `RESEND_API_KEY` and `LEAD_NOTIFICATION_EMAIL` are both set, a valid submission sends a real email from a verified sender (`leads@mail.bthomedesigns.com`, on the verified `mail.bthomedesigns.com` sending domain) to that inbox, with all submitted details (name, contact info, city, ZIP code, requested service, message, source page, available UTM parameters, timestamp, consent). Reply-To is set to the customer's submitted email so replying goes straight to them. **If `RESEND_API_KEY` or `LEAD_NOTIFICATION_EMAIL` is unset, the route returns an honest `503` and the form displays that failure to the visitor — it never claims success when nothing was actually delivered.** See `.env.example` for the exact variable names.
- **Photos are not uploaded.** The Quote form's photo step only sends selected file *names* as JSON metadata — no image bytes are transmitted anywhere. The UI tells the user this explicitly ("a team member will follow up separately to collect the actual images"). Client-side validation restricts selections to JPG/PNG/WEBP, 8MB per file, 10 files max, before they're even added to form state.

## Connecting Production Storage

Resend (email) is wired up and ready — see `.env.example` and the section above. If you'd rather use a database or CRM instead of (or in addition to) email, a few options, roughly simplest-to-most-capable:

- **Supabase** — create a `submissions` table matching the request shape, insert via `@supabase/supabase-js` using a server-side service-role key (never exposed to the client).
- **Airtable** — insert a record via the Airtable REST API using a personal access token; good fit if the business already manages leads in an Airtable base.
- **HubSpot** — create/update a contact and a deal via the HubSpot CRM API; a good fit if the business already uses HubSpot for sales pipeline.
- **JobNimbus** — post a lead via JobNimbus's API; purpose-built for home-services businesses like this one.

Whichever you choose, keep the existing validation (required fields, length limits, honeypot, phone/email format) in front of it — don't remove that when adding the integration.

To accept real photo uploads later: use Next's native `Request.formData()` (no extra dependency required) to parse `multipart/form-data`, then upload each file to object storage (S3, Cloudflare R2, or Supabase Storage) and store the resulting URLs alongside the submission record.

## Environment Variables

See `.env.example` for the full list with descriptions. Summary:

```bash
RESEND_API_KEY=                 # required for lead delivery to work at all
LEAD_NOTIFICATION_EMAIL=        # required — the inbox that receives leads
RESEND_FROM_EMAIL=              # optional, defaults to the verified leads@mail.bthomedesigns.com sender
NEXT_PUBLIC_GA_MEASUREMENT_ID=  # optional — Google Analytics 4, "G-XXXXXXXXXX"
NEXT_PUBLIC_GSC_VERIFICATION=   # optional — Google Search Console ownership token
DATABASE_URL=                   # required only for /internal — see "Internal Application" below
NEXTAUTH_SECRET=                # required only for /internal — see "Internal Application" below
NEXTAUTH_URL=                   # required only for /internal — see "Internal Application" below
```

None of these are set anywhere in this repository or its deployment config — no account has been created and no value has been invented. Every one of them is safe to leave unset for the **public site**: it builds and runs normally, lead delivery just honestly reports itself unavailable until `RESEND_API_KEY`/`LEAD_NOTIFICATION_EMAIL` are set, and analytics simply doesn't load until its variable is set. The three internal-app variables are different: leaving them unset means `/internal` is unusable (no database connection, no session signing), but this has **no effect on the public marketing site**, which doesn't read them. Never commit real secrets — `.env.example` is intentionally tracked (values blank) so the required names are documented, while `.env`, `.env.local`, and any other real `.env*` file stay out of version control.

## Deploying to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket.
2. In Vercel, "Add New Project" -> import the repository.
3. Framework preset: Next.js (auto-detected). No build command changes needed — Vercel runs `next build` automatically.
4. Add the environment variables from the section above under Project Settings -> Environment Variables. At minimum, set `RESEND_API_KEY` and `LEAD_NOTIFICATION_EMAIL` before launch so the forms actually deliver leads.
5. Deploy. Vercel's default output handling (static pages served from the edge, the one dynamic API route served as a serverless/edge function) requires no extra configuration for this project.
6. Under Project Settings -> Domains, add the production domain and update `siteUrl` references — currently `https://www.bthomedesigns.com` in `lib/data/business.ts` (`urls.website`) and used throughout `app/layout.tsx` and `app/sitemap.ts` — to match.

## Internal Application (Staff Quoting System — Foundations)

`/internal` is a separate, authenticated area of this same Next.js project for BT Home Designs staff — not visible or linked anywhere on the public site. It's being built in phases; this is the foundations phase (auth, database, protected routing) only. There is no quote editor, pricing, or customer data yet.

**Setup:**

1. Create a Postgres database (see "Choosing a database provider" below) and set `DATABASE_URL` in `.env` (local) or your deployment's environment variables.
2. Generate a session secret: `openssl rand -base64 32`, and set it as `NEXTAUTH_SECRET`.
3. Set `NEXTAUTH_URL` to the app's own URL (`http://localhost:3000` locally; the real deployed URL in production).
4. Apply the database schema: `npm run db:migrate`.
5. Create your staff account: `npm run db:create-user -- --email=you@example.com --password="a strong password" --name="Your Name" --role=ADMIN`.
6. Sign in at `/internal/login`.

There is no self-serve "create account" page by design — staff accounts are provisioned via `db:create-user` (re-run it with an existing email to update that person's name/password/role). A management UI is a candidate for a later phase, once there's more than one or two staff members.

**Choosing a database provider (free tier during development):**

Any standard PostgreSQL connection string works — this project doesn't lock you into one vendor. Recommended for a small business on a budget:

| Service | Purpose | Free tier | Expected cost | Alternative |
|---|---|---|---|---|
| [Neon](https://neon.tech) | Managed Postgres for `/internal` (quotes, customers, pricing data — added in later phases) | Yes — 1 project, ~0.5 GB storage, generous compute hours/month, sufficient for a single small business's internal tool | $0 while on the free tier. Neon's paid plans start if storage/compute usage grows well beyond a small internal tool's needs (many quotes/years of history) — the free tier has no time limit, it doesn't expire | [Supabase](https://supabase.com) (also has a free Postgres tier + built-in file storage, useful later for swatch/product images) or [Vercel Postgres](https://vercel.com/storage/postgres) (same Neon infrastructure, managed through the Vercel dashboard) |

None of the code in this repository requires Neon specifically — set `DATABASE_URL` to any Postgres connection string and it works. No database account has been created on your behalf; you'll need to sign up and paste the connection string in yourself.

**What's implemented:**

- `middleware.ts` — blocks unauthenticated requests to everything under `/internal` (except the login page itself) at the edge, before any page or data loads.
- `app/internal/(dashboard)/layout.tsx` — re-checks the session server-side as defense-in-depth, independent of middleware.
- `lib/auth/options.ts` — email/password login (next-auth Credentials provider, bcrypt-hashed passwords, JWT sessions — no OAuth/SSO, deliberately simple for a small internal team).
- `prisma/schema.prisma` — the `InternalUser` model (staff accounts). Quote/customer/pricing models are added in later phases as those features are built.
- The public marketing site (`app/layout.tsx` and everything under it) is unchanged for every route except that it now hides its navbar/footer/analytics under `/internal` via `components/SiteChrome.tsx` — a client-side pathname check. **Known limitation:** because of how React Server Components serialize a tree, the marketing footer's *inert* data (link text, city/service names) can still be present in the internal login page's initial JavaScript payload even though it's never rendered into the visible page — it is not indexable, not visible to a user, and (today) contains no business/customer/pricing data, since none exists yet. A later phase should switch `/internal` to its own root layout (a Next.js "multiple root layouts" route-group split) to remove this entirely once the internal UI is actively being designed.

## SEO

- Per-page `title`/`description` via Next's Metadata API on every route, unique per service and per city (not templated boilerplate — city pages in particular have distinct local copy, not find-and-replace text)
- Canonical URLs set via `alternates.canonical` on every page
- Open Graph + Twitter Card metadata, with a real generated 1200x630 OG image
- JSON-LD: `LocalBusiness` (site-wide, in `app/layout.tsx`), `Service` (per service page), `BreadcrumbList` (every page with breadcrumbs) — all built from `lib/data/business.ts` and omitting unverified fields (see "Editing Business Information")
- Dynamic `sitemap.xml` (`app/sitemap.ts`) includes every static and dynamic page; `robots.txt` (`app/robots.ts`) disallows `/api/` and points at the sitemap
- No fake `aggregateRating`/`reviewCount` is emitted — `lib/data/business.ts` `reviews` fields are `null` until real, verified numbers are supplied

## Accessibility

- Semantic HTML throughout: real `<button>`/`<a>` elements, logical heading levels (h1 per page, h2 for major sections, h3 for FAQ questions inside the accordion)
- Icon-only controls have `aria-label`; purely decorative icons are `aria-hidden`
- Navbar: mobile menu toggle and services dropdown both expose `aria-expanded`/`aria-controls`/`aria-haspopup`; Escape closes either and returns focus to its trigger
- FAQ accordion: proper `aria-expanded`/`aria-controls` linking button to panel, wrapped in `<h3>` for correct heading structure
- Gallery lightbox: `role="dialog"` + `aria-modal="true"`, Escape and arrow-key navigation, focus returns to the thumbnail that opened it
- Forms: every field has an associated `<label>` (visually hidden where the design uses placeholder-only inputs), error messages use `role="alert"`/`aria-live`, success states use `role="status"`/`aria-live="polite"`, and the honeypot field's wrapper (not the field itself) is `aria-hidden` so a screen-reader user who tabs into it isn't confused
- Review carousel: star ratings have a text alternative (`aria-label`, not color/shape alone), indicator dots use `role="tab"`/`aria-selected`
- `prefers-reduced-motion` is respected globally (`app/globals.css` forces near-zero animation duration) and specifically in the hero's signature shutter-reveal animation, which fully skips itself under reduced motion via `useSyncExternalStore`
- No hydration-unsafe patterns: no `Date.now()`/`Math.random()` in render output, and every `window`/`document`/`matchMedia` access lives inside a client component's event handler, effect, or `useSyncExternalStore` snapshot function

## Phase 2 Architecture

The brief calls out six future features. None are built yet; notes below are for whoever picks them up.

- **AI Room Visualizer** — likely a client-side upload + server-side image generation/compositing call (e.g., an image model via API) that overlays a chosen product onto the customer's uploaded room photo. Slot it in as a new route (`/visualizer`) with its own API route; reuse the honeypot/validation patterns from `app/api/quote/route.ts`.
- **Instant Price Estimator** — a rules-based calculator (product x window count x size tier x options) that can ship as a pure client-side component initially (no API needed) using a pricing table as structured data, similar to `lib/data/services.ts`.
- **Product Configurator** — an interactive step-through (fabric/material, color, mount type, control type) per service; could extend `QuoteForm`'s multi-step pattern or become its own flow feeding into the quote request.
- **Appointment Scheduler** — needs a real calendar/availability backend (Calendly-style embed is the fastest path; a custom booking system needs a database for availability and holds).
- **Customer Portal** — requires authentication (NextAuth.js or Clerk are common Next.js choices) plus a real database for order/project status; out of scope until a backend is chosen.
- **Financing Application** — typically integrates a third-party financing partner (e.g., Synchrony, Wisetack, Enhancify) via their embedded application widget or API rather than building underwriting logic in-house.

## Known Placeholders

Everything below needs real information or a real account/credential before launch. Business-data fields live in `lib/data/business.ts` unless noted.

| Field | Current value | Location |
|---|---|---|
| Lead delivery | **Not configured** — forms honestly report unavailable until set | `RESEND_API_KEY` / `LEAD_NOTIFICATION_EMAIL` env vars, see `.env.example` |
| Phone | `(972) 555-0123`, hidden from the live site (`phoneVerified: false`) | `business.ts` -> `contact.phone` / `phoneDisplay` |
| Email | `hello@bthomedesigns.com`, hidden from the live site (`emailVerified: false`) | `business.ts` -> `contact.email` |
| Street address | `"Update in lib/data/business.ts"`, hidden from the live site (`address.isVerified: false`) | `business.ts` -> `address.street` |
| Business hours | Empty, hidden from the live site (`hoursVerified: false`) | `business.ts` -> `hours` |
| Postal code | Empty (omitted from schema) | `business.ts` -> `address.postalCode` |
| Instagram URL | Empty (link hidden until set) | `business.ts` -> `social.instagram` |
| Facebook URL | Empty (link hidden until set) | `business.ts` -> `social.facebook` |
| Google Maps directions URL | Generic city-level query, not a real pinned address | `business.ts` -> `urls.mapsDirections` |
| Deposit policy wording | Generic placeholder sentence | `business.ts` -> `policies.deposit` |
| Financing terms | Generic placeholder sentence, no specific rate/term claims | `business.ts` -> `policies.financing` |
| Review count / average rating | `null` (not displayed or emitted in schema) | `business.ts` -> `reviews` |
| Warranty language | `null` (not displayed anywhere) | `business.ts` -> `warranty` |
| Legal entity name | `"BT Home Designs LLC"` (unconfirmed) | `business.ts` -> `legalName` |
| Testimonials | Empty — `Testimonials` component renders nothing until real, permissioned reviews are added | `lib/data/reviews.ts` (file header documents this) |
| Homepage hero / About photos | Real licensed Unsplash stock photography (approved), not BT Home Designs project photos | `lib/data/media.ts` |
| Service page hero photos | 7 AI-generated design images (approved), clearly documented as not real installations | `lib/data/media.ts` -> `serviceHeroImages` |
| Gallery page | Style/inspiration guide by design — no photos claimed as BT Home Designs' own work | `app/gallery/page.tsx` |
| Legal pages | Published as general policies; **not attorney-reviewed** | `app/privacy-policy`, `app/terms-of-use`, `app/accessibility-statement` |
| Google Analytics / Search Console | Not connected — see `.env.example` | `NEXT_PUBLIC_GA_MEASUREMENT_ID` / `NEXT_PUBLIC_GSC_VERIFICATION` |
| Fraunces/Manrope font files | Not bundled; system font fallback in use | see "Typography" |
| Internal app database | **Not configured** — no Postgres provider has been chosen/created; `/internal` cannot be used until `DATABASE_URL`/`NEXTAUTH_SECRET`/`NEXTAUTH_URL` are set | `.env.example`, see "Internal Application" |
| Internal staff accounts | None exist until `npm run db:create-user` is run | see "Internal Application" |
