import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { business } from "@/lib/data/business";

// General website privacy policy. Describes the site's actual, current
// data practices only — no invented third-party services, no claims of
// attorney review or guaranteed legal compliance. Update this page any
// time a new tool (analytics, advertising, CRM, email service) is
// connected to the site so it stays accurate.
export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How BT Home Designs handles information submitted through this website.",
  alternates: { canonical: "/privacy-policy" },
};

const LAST_UPDATED = "August 2026";

export default function PrivacyPolicyPage() {
  return (
    <div className="pb-24 pt-32 md:pt-36">
      <div className="container-lux max-w-3xl">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Privacy Policy" }]} />

        <h1 className="mt-10 text-4xl leading-[1.1] text-charcoal md:text-5xl">Privacy Policy</h1>
        <p className="mt-4 text-[13px] text-charcoal-soft">Last updated: {LAST_UPDATED}</p>

        <div className="mt-10 space-y-8 text-[15px] leading-relaxed text-charcoal-soft">
          <section>
            <h2 className="font-display text-xl text-charcoal">Information We Collect</h2>
            <p className="mt-3">
              When you submit the quote request form or the contact form on this website, we collect the
              information you provide — which may include your name, phone number, email address, city or
              address, project details, and any photo file names you attach. We may also use website
              analytics tools to understand aggregate traffic and site usage; where used, these tools are
              configured to avoid collecting information that directly identifies you.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">How We Use Information</h2>
            <p className="mt-3">
              Information submitted through our forms is used to respond to your inquiry, prepare an
              estimate, and schedule or complete a consultation or project. We do not sell your information
              to third parties, and we only use it to communicate with you about your request or project.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">How Information Is Stored</h2>
            <p className="mt-3">
              Form submissions are delivered to BT Home Designs by email and handled the same way we handle
              any other customer inquiry. We keep information only as long as reasonably needed to respond to
              your request or complete a project, and we take reasonable steps to protect it from
              unauthorized access.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Cookies &amp; Analytics</h2>
            <p className="mt-3">
              This site may use website analytics (such as Google Analytics) to understand overall traffic
              and improve the site. Analytics data is generally aggregated and not used to identify you
              personally. This site does not use advertising or retargeting pixels unless a future update to
              this policy says otherwise.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Your Choices</h2>
            <p className="mt-3">
              You can contact us at any time to ask what information we have on file for you, or to request
              that it be deleted, using the contact details below.
            </p>
          </section>
          <section>
            <h2 className="font-display text-xl text-charcoal">Contact</h2>
            <p className="mt-3">
              Questions about this policy can be directed to us through the{" "}
              <a href="/contact" className="text-oak-dark underline underline-offset-2">contact page</a>.
              {business.contact.emailVerified && <> You can also reach us at {business.contact.email}.</>}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
