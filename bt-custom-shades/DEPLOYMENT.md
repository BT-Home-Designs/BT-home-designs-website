# Deploying BTCustomShades.com

This folder (`bt-custom-shades/`) is a complete, self-contained copy of the BT Home Designs website, rebranded for **BT Custom Shades LLC**. It deploys as its **own Vercel project** with its own domain, environment variables, and analytics. The BT Home Designs project (repository root → BTHomeDesigns.com) stays exactly as it is. Nothing redirects between the two sites, and they share no code at runtime.

Primary address: **https://www.btcustomshades.com**. `https://btcustomshades.com` permanently redirects (308) to it. This matches how BTHomeDesigns.com uses `www`.

---

## 1. Create the Vercel project

1. In Vercel: **Add New… → Project** → import the same GitHub repository (`BT-Home-Designs/BT-home-designs-website`).
2. **Project Name:** `bt-custom-shades`
3. **Root Directory:** click *Edit* and choose **`bt-custom-shades`**. (This is what makes it a separate site.)
4. Framework preset: **Next.js** (auto-detected). Leave the build, output, and install commands at their defaults.
5. Add the environment variables from step 2, then click **Deploy**.
6. Once it deploys, open the `bt-custom-shades-….vercel.app` preview URL and click through the site.

**Optional (avoids unnecessary rebuilds):** in each project, go to **Settings → Git → Ignored Build Step** and choose "Custom":
- BT Home Designs project (repo root): `git diff --quiet HEAD^ HEAD -- . ':(exclude)bt-custom-shades'`
- BT Custom Shades project: `git diff --quiet HEAD^ HEAD -- .`

Then a change to one site doesn't redeploy the other.

## 2. Environment variables (BT Custom Shades project only)

| Variable | Value | Notes |
|---|---|---|
| `RESEND_API_KEY` | A **new** API key from the existing Resend account (Resend → API Keys → Create, "Sending access", domain `mail.bthomedesigns.com`) | A separate key lets you revoke either site's key without breaking the other. Don't touch the BT Home Designs key. |
| `LEAD_NOTIFICATION_EMAIL` | The inbox that should receive BT Custom Shades leads | It can be the same inbox as BT Home Designs. Every BT Custom Shades email is marked (see below). |
| `RESEND_FROM_EMAIL` | *leave unset* | Defaults to `BT Custom Shades Website <leads@mail.bthomedesigns.com>`. That domain is already verified, so this works with no new DNS. |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | A **new** GA4 property (or at least a new web data stream) for btcustomshades.com | Keeps each company's traffic and leads reported separately. |
| `NEXT_PUBLIC_GSC_VERIFICATION` | Token from a **new** Google Search Console property for `https://www.btcustomshades.com` | Or verify the domain in Search Console with a DNS TXT record instead. |

**How BT Custom Shades leads are marked:** the subject starts with `[BT Custom Shades]`, the sender name is "BT Custom Shades Website", and the email body starts with the row "Website: BT Custom Shades (BTCustomShades.com)". Reply-To is the customer's email.

**Shared services and isolation:** no database, file storage, or CRM is used by either site. Form data (including warranty photo attachments) is emailed and not stored. Nothing needs to be copied, and no customer records are duplicated. The only shared service is the Resend account, which is used for sending only.

## 3. Add the domains in Vercel

In the **bt-custom-shades** project: **Settings → Domains**

1. Add `www.btcustomshades.com`. This is the primary domain.
2. Add `btcustomshades.com`. When Vercel asks, choose **Redirect to `www.btcustomshades.com`** (308).

Do **not** add these domains to the BT Home Designs project.

## 4. DNS records at GoDaddy

GoDaddy → **My Products → btcustomshades.com → DNS** (Manage DNS).

**Before editing:**
- If **Domain Forwarding** is turned on for this domain (GoDaddy's Forwarding section), remove it. Otherwise it overrides the records below.
- Take a screenshot of the current records so you have a backup.

**Records to set:**

| Type | Name | Value | TTL |
|---|---|---|---|
| A | `@` | `76.76.21.21` | 1 hour (or default) |
| CNAME | `www` | `cname.vercel-dns.com` | 1 hour (or default) |

- **Delete** any other `A` record on `@`. A new GoDaddy domain usually has a "Parked" A record, sometimes shown as `WebsiteBuilder Site`.
- **Edit** the existing `www` CNAME (GoDaddy's default points to `@`) instead of adding a second one. There can only be one `www` record.
- If Vercel's Domains screen shows **different values** for your project (sometimes it shows a project-specific target such as `xxxxxxxx.vercel-dns-0xx.com` or a different IP), use exactly what Vercel shows. The values above are Vercel's standard ones.
- If there are **CAA** records, add one allowing Let's Encrypt: `CAA @ 0 issue "letsencrypt.org"`. If there are no CAA records, do nothing.

**Leave these alone (email and verification records):**
- All `MX` records
- `TXT` records: SPF (`v=spf1 …`), DMARC (`_dmarc`), Google/Microsoft verification, etc.
- DKIM records (`CNAME`/`TXT` named like `selector1._domainkey`, `google._domainkey`, `resend._domainkey`, …)
- Email-related CNAMEs such as `autodiscover`, `email`, `mail`, `_domainconnect`
- `NS` and `SOA` records (keep GoDaddy's nameservers; this plan doesn't change them)

**HTTPS:** after DNS updates (usually minutes, up to ~48 hours), Vercel issues and renews SSL certificates for both names automatically. The Domains screen shows "Valid Configuration" once they're ready.

### Optional later: a BT Custom Shades sending domain

If you want lead notifications sent from `@btcustomshades.com` instead of `@mail.bthomedesigns.com`:
1. Resend → Domains → Add `mail.btcustomshades.com`.
2. Add the records Resend shows (an MX and TXT on `send.mail…`, plus a DKIM TXT on `resend._domainkey.mail…`) at GoDaddy. They're on a subdomain, so they don't conflict with any mailbox email on the main domain.
3. Once verified, set `RESEND_FROM_EMAIL="BT Custom Shades Website <leads@mail.btcustomshades.com>"` in the BT Custom Shades Vercel project and redeploy.

## 5. After go-live checklist

- [ ] `https://btcustomshades.com` → redirects to `https://www.btcustomshades.com`
- [ ] `http://` versions redirect to `https://`
- [ ] Submit the Contact form, a Quote request, and a Warranty request with a photo attached. Confirm three `[BT Custom Shades]` emails arrive.
- [ ] Submit one test on BTHomeDesigns.com too. Confirm it still arrives (unmarked, as before).
- [ ] Search Console: add the `https://www.btcustomshades.com` property and submit `https://www.btcustomshades.com/sitemap.xml`
- [ ] Share `https://www.btcustomshades.com` in a message or on Facebook. The preview card should say "BT Custom Shades".

## 6. Search-indexing considerations (two similar sites)

The two sites currently have nearly identical text (same service guides, city pages, FAQs). Things to know:

- **Google won't penalize this, but it will usually pick one version to rank** for each set of near-identical pages and filter the other out of results. Expect the older BTHomeDesigns.com to win at first, so BTCustomShades.com may rank slowly for the same searches.
- **Don't** point either site's canonical tags at the other site, and don't redirect. That would remove one site from search entirely. Each site currently has correct self-referencing canonicals.
- **Best return on effort, without rewriting everything:** give each site unique text on its highest-value pages first: the homepage, About, and the intros of the 2–3 services each company leads with. Then do the city pages (`lib/data/cities.ts`), which are the most search-sensitive duplicates.
- **Positioning:** if BT Custom Shades will focus on shades/motorization while BT Home Designs leads with shutters/drapery, reflect that in page titles and homepage copy. That both reduces overlap and helps each rank for its specialty.
- **Google Business Profile:** two profiles with the same phone number and address can be flagged or merged by Google. When you create a profile for BT Custom Shades, use its own business details where possible.
- **Same phone number on both sites:** fine for visitors. For local search, each business's name, address, and phone should appear consistently wherever that business is listed (website, Google Business Profile, directories).
- **Separate Search Console and Analytics** for each domain (see step 2) so you can watch each site's indexing on its own.
- If one brand is clearly the priority and duplicate city pages become a problem, a lighter option is to `noindex` the city pages on the secondary site. Hold off on this until Search Console data shows it's needed.
