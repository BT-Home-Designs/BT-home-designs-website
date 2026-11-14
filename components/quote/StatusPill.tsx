import { cn } from "@/lib/utils";

const tone: Record<string, string> = {
  draft: "bg-charcoal/10 text-charcoal",
  archived: "bg-charcoal/10 text-charcoal-soft",
  revoked: "bg-red-100 text-red-800",
  expired: "bg-red-50 text-red-800",
  changes_requested: "bg-amber-100 text-amber-900",
  awaiting_approval: "bg-bt-gold/15 text-[#7a5d17]",
  approved_awaiting_deposit: "bg-bt-green/10 text-bt-green",
  approved: "bg-bt-green/10 text-bt-green",
  deposit_received: "bg-bt-green text-bt-cream",
  paid_in_full: "bg-bt-green text-bt-cream",
};

export function StatusPill({ status, label, className }: { status: string; label: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]",
        tone[status] ?? "bg-charcoal/10 text-charcoal",
        className
      )}
    >
      {label}
    </span>
  );
}
