import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { FloatingCTA } from "@/components/FloatingCTA";
import { LocalBusinessSchema } from "@/components/LocalBusinessSchema";
import { Analytics } from "@/components/Analytics";
import { business } from "@/lib/data/business";

// Typography: system font stack, no next/font/google or any external font
// fetch — see globals.css (--font-display / --font-sans) for the current
// values and README.md "Typography" for how to swap in real Fraunces /
// Manrope font files via next/font/local later.

const siteUrl = business.urls.website;
const ogImage = "/images/hero/og-image.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${business.name} | Custom Window Treatments in DFW`,
    template: `%s | ${business.name}`,
  },
  description: `${business.description} Free in-home consultation, expert measuring, and professional installation.`,
  keywords: [
    "custom window treatments Dallas",
    "plantation shutters DFW",
    "motorized shades Texas",
    "custom drapery Dallas Fort Worth",
    "roller shades Rockwall",
  ],
  authors: [{ name: business.name }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: business.name,
    title: `${business.name} | Custom Window Treatments in DFW`,
    description: business.description,
    images: [{ url: ogImage, width: 1200, height: 630, alt: business.name }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${business.name} | Custom Window Treatments in DFW`,
    description: "Plantation shutters, shades, and drapery — designed for Texas homes.",
    images: [ogImage],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  // Google Search Console site verification — only emits the meta tag
  // when NEXT_PUBLIC_GSC_VERIFICATION is set. No token is invented here.
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION
    ? { verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } }
    : {}),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <LocalBusinessSchema />
        <Analytics />
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingCTA />
      </body>
    </html>
  );
}
