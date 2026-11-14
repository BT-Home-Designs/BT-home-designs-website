import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QuotePresentation } from "@/components/quote/QuotePresentation";
import { isTokenShaped } from "@/lib/quotes/ids";
import { getPublishedByToken } from "@/lib/quotes/service";
import { buildCustomerView } from "@/lib/quotes/view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Quote",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  referrer: "no-referrer",
  alternates: { canonical: null },
  openGraph: null,
  twitter: null,
};

export default async function CustomerQuotePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = isTokenShaped(token) ? await getPublishedByToken(token) : null;
  // Unknown, draft, archived, and revoked links all get the same 404.
  if (!quote) notFound();
  const view = buildCustomerView(quote, { kind: "customer", token });
  return <QuotePresentation view={view} token={token} />;
}
