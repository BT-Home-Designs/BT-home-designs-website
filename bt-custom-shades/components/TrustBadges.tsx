import { Award, Home, Ruler, ShieldCheck } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Professional Installation" },
  { icon: Ruler, label: "Custom Made to Your Windows" },
  { icon: Home, label: "Locally Owned & Operated" },
  { icon: Award, label: "Free In-Home Consultation" },
];

export function TrustBadges({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-4 md:gap-10">
      {badges.map(({ icon: Icon, label }) => (
        <div key={label} className="flex flex-col items-center gap-3 text-center md:flex-row md:text-left">
          <div
            className={
              tone === "dark"
                ? "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-charcoal/15"
                : "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-warm-white/25"
            }
          >
            <Icon className={tone === "dark" ? "h-4.5 w-4.5 text-oak-dark" : "h-4.5 w-4.5 text-oak-light"} strokeWidth={1.5} />
          </div>
          <p className={tone === "dark" ? "text-[13px] font-medium text-charcoal" : "text-[13px] font-medium text-warm-white"}>
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}
