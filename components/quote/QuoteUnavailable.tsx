/* eslint-disable @next/next/no-img-element */
import { business } from "@/lib/data/business";

/** Shown for unknown, draft, archived, and revoked links — deliberately identical for all. */
export function QuoteUnavailable() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-bt-cream px-6">
      <div className="max-w-md text-center">
        <img src="/images/brand/bt-logo-240.png" alt="BT Home Designs" className="mx-auto h-20 w-20 rounded-full" />
        <h1 className="mt-6 font-display text-3xl text-bt-green">This quote link isn&apos;t available</h1>
        <p className="mt-3 text-charcoal-soft">
          The link may have been replaced with an updated one or is no longer active. Please contact {business.name} and we&apos;ll send you a current link.
        </p>
        <a href="/contact" className="mt-6 inline-block rounded-sm bg-bt-green px-5 py-3 text-sm font-semibold text-bt-cream">
          Contact {business.name}
        </a>
      </div>
    </div>
  );
}
