import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

// Describes accessibility work actually completed during development,
// without claiming full/certified compliance (which would require a
// professional audit we haven't had done).
export const metadata: Metadata = {
  title: "Accessibility Statement",
  description: "BT Home Designs' commitment to an accessible website.",
  alternates: { canonical: "/accessibility-statement" },
};

const LAST_UPDATED = "August 2026";

export default function AccessibilityStatementPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Accessibility Statement" }]} />

        <h1 className="mt-10 text-4xl leading-[1.1] text-charcoal md:text-5xl">Accessibility Statement</h1>
        <p className="mt-4 text-[13px] text-charcoal-soft">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-charcoal-soft">
          <section>
            <h2 className="font-display text-xl text-charcoal">Our Approach</h2>
            <p className="mt-3">
              BT Home Designs is committed to making this website usable by as many visitors as possible,
              including people using screen readers, keyboard navigation, or other assistive technology.
              This site was built with WCAG 2.2 AA as a practical guideline, including semantic HTML,
              labeled form fields, keyboard-accessible navigation and menus, visible focus states, descriptive
              link and button text, and support for reduced-motion preferences.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Known Limitations</h2>
            <p className="mt-3">
              We haven&apos;t yet completed a full third-party accessibility audit. If you encounter any part
              of this site that&apos;s difficult to use with assistive technology, please let us know using
              the contact information below so we can address it.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Feedback</h2>
            <p className="mt-3">
              Questions or feedback about the accessibility of this site can be directed to us through the{" "}
              <a href="/contact" className="text-oak-dark underline underline-offset-2">contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
