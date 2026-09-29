import { CalendarClock, HandCoins, ShieldQuestion } from "lucide-react";
import { Button } from "./Button";
import { SectionHeading } from "./SectionHeading";
import { business } from "@/lib/data/business";

// Copy here intentionally stays general — it mirrors business.policies in
// lib/data/business.ts rather than inventing specific promotional terms
// (interest rates, approval windows, term lengths) that haven't been
// confirmed. Once real financing terms are set, update both the policy
// text in business.ts and the three points below to match.

const points = [
  { icon: HandCoins, title: "Flexible Payment Options", copy: business.policies.financing },
  { icon: CalendarClock, title: "Plan Around Your Project", copy: "Discuss timing and payment structure with your consultant before any work begins." },
  { icon: ShieldQuestion, title: "Ask About Deposit Terms", copy: business.policies.deposit },
];

export function FinancingSection() {
  return (
    <section className="bg-cream py-20 lg:py-28">
      <div className="container-lux grid items-center gap-14 lg:grid-cols-2">
        <div>
          <SectionHeading
            eyebrow="Financing"
            title="Beautiful windows, on your schedule"
            copy="Custom shutters and shades are an investment in your home. Ask your consultant about available payment options during your free consultation."
          />
          <div className="mt-8">
            <Button href="/quote" variant="primary">
              Get Free Consultation
            </Button>
          </div>
        </div>
        <div className="grid gap-6 sm:grid-cols-3 lg:grid-cols-1">
          {points.map(({ icon: Icon, title, copy }) => (
            <div key={title} className="flex gap-4 rounded-sm bg-warm-white p-6">
              <Icon className="h-5 w-5 shrink-0 text-oak-dark" strokeWidth={1.5} aria-hidden="true" />
              <div>
                <p className="font-display text-lg text-charcoal">{title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-charcoal-soft">{copy}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
