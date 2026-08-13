import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { services } from "@/lib/data/services";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist. Explore BT Home Designs' custom window treatment services for Dallas–Fort Worth homes.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] items-center pt-24">
      <div className="container-lux py-20 text-center">
        <p className="eyebrow mb-4">404</p>
        <h1 className="text-4xl leading-[1.1] text-charcoal md:text-5xl">We couldn&apos;t find that page</h1>
        <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-charcoal-soft">
          The page you&apos;re looking for may have moved or no longer exists. Here are a few places to start instead.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Button href="/" size="lg">Back to Home</Button>
          <Button href="/quote" size="lg" variant="secondary" icon={false}>Request a Consultation</Button>
        </div>
        <div className="mx-auto mt-16 max-w-2xl">
          <p className="eyebrow mb-5">Browse Services</p>
          <div className="flex flex-wrap justify-center gap-2">
            {services.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                className="rounded-full border border-charcoal/15 px-4 py-2 text-[13px] font-medium text-charcoal-soft transition-colors hover:border-oak-dark hover:text-oak-dark"
              >
                {s.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
