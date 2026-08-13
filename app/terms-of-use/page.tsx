import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

// General website terms of use. Standard, generic boilerplate language —
// not a services contract, not a claim of attorney review or guaranteed
// legal compliance.
export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms governing use of the BT Home Designs website.",
  alternates: { canonical: "/terms-of-use" },
};

const LAST_UPDATED = "August 2026";

export default function TermsOfUsePage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Terms of Use" }]} />

        <h1 className="mt-10 text-4xl leading-[1.1] text-charcoal md:text-5xl">Terms of Use</h1>
        <p className="mt-4 text-[13px] text-charcoal-soft">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-charcoal-soft">
          <section>
            <h2 className="font-display text-xl text-charcoal">Use of This Website</h2>
            <p className="mt-3">
              This website is provided to share information about BT Home Designs&apos; custom window
              treatment services and to let visitors request a consultation or quote. Content on this site is
              for general informational purposes and does not constitute a binding quote, contract, or offer
              until confirmed in writing following an in-home consultation.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Product Information</h2>
            <p className="mt-3">
              Product and material descriptions on this site are general educational information about
              window treatment categories. Specific availability, materials, sizes, and pricing are
              confirmed individually with your designer and depend on current manufacturer offerings — see
              individual service pages for more detail.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Intellectual Property</h2>
            <p className="mt-3">
              The content, design, and images on this site belong to BT Home Designs or are used under
              license, and may not be copied or reused without permission.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">No Warranty</h2>
            <p className="mt-3">
              This website and its content are provided &quot;as is,&quot; without warranties of any kind
              beyond those we expressly state to you in a signed project agreement. We aim to keep the
              information on this site accurate and current, but we don&apos;t guarantee it&apos;s error-free.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Changes to These Terms</h2>
            <p className="mt-3">
              We may update these terms from time to time; the &quot;Last updated&quot; date above reflects the most
              recent revision.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Contact</h2>
            <p className="mt-3">
              Questions about these terms can be directed to us through the{" "}
              <a href="/contact" className="text-oak-dark underline underline-offset-2">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
