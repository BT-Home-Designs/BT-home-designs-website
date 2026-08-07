import { cn } from "@/lib/utils";
import { Aperture } from "lucide-react";

/**
 * Elegant placeholder used everywhere a real installation photo will
 * eventually live. Drop finished photography into /public/images/... using
 * the same file name referenced in lib/data, and this component becomes
 * unnecessary — swap it for next/image with the same src.
 */
export function ImagePlaceholder({
  label,
  className,
  variant = "oak",
}: {
  label?: string;
  className?: string;
  variant?: "oak" | "charcoal" | "cream";
}) {
  const gradients: Record<string, string> = {
    oak: "from-[#c4a179] via-[#a9805c] to-[#7d5a3a]",
    charcoal: "from-[#454039] via-[#2a2622] to-[#17140f]",
    cream: "from-[#f1e9dd] via-[#e7dac6] to-[#c4a179]",
  };
  const textTone = variant === "cream" ? "text-charcoal/60" : "text-warm-white/70";

  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden bg-gradient-to-br",
        gradients[variant],
        className
      )}
      role="img"
      aria-label={label ?? "Placeholder photograph"}
    >
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0px, transparent 26px, rgba(255,255,255,0.5) 27px, transparent 28px)",
        }}
      />
      <div className={cn("relative flex flex-col items-center gap-2 px-4 text-center", textTone)}>
        <Aperture className="h-6 w-6" strokeWidth={1.25} />
        {label && <span className="text-[11px] font-medium uppercase tracking-[0.16em]">{label}</span>}
      </div>
    </div>
  );
}
