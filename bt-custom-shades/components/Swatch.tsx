import { cn } from "@/lib/utils";
import type { WindowArtVariant } from "./WindowArt";

const patternStyle: Record<WindowArtVariant, { backgroundImage: string }> = {
  louver: {
    backgroundImage: "repeating-linear-gradient(0deg, currentColor 0px, currentColor 3px, transparent 3px, transparent 7px)",
  },
  roller: {
    backgroundImage: "linear-gradient(180deg, currentColor 0%, transparent 60%)",
  },
  weave: {
    backgroundImage:
      "repeating-linear-gradient(45deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 5px), repeating-linear-gradient(-45deg, currentColor 0px, currentColor 2px, transparent 2px, transparent 5px)",
  },
  drape: {
    backgroundImage: "repeating-linear-gradient(100deg, currentColor 0px, currentColor 4px, transparent 4px, transparent 9px)",
  },
  mesh: {
    backgroundImage:
      "repeating-linear-gradient(0deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 6px), repeating-linear-gradient(90deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 6px)",
  },
};

const toneClass = {
  oak: "bg-oak-light/30 text-oak-dark",
  cream: "bg-cream-deep/60 text-oak",
  charcoal: "bg-charcoal/10 text-charcoal-soft",
} as const;

/** A small CSS-generated texture chip standing in for a material swatch. */
export function Swatch({
  tone = "oak",
  pattern = "louver",
  className,
}: {
  tone?: keyof typeof toneClass;
  pattern?: WindowArtVariant;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      className={cn("inline-block h-9 w-9 shrink-0 rounded-sm opacity-90", toneClass[tone], className)}
      style={patternStyle[pattern]}
    />
  );
}
