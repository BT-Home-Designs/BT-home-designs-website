"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type WindowArtVariant = "louver" | "roller" | "weave" | "drape" | "mesh";

/**
 * Abstract, architectural artwork representing each product line, built
 * entirely from SVG/CSS — no photography. Used in hero sections and
 * anywhere a "gallery" would otherwise show a photo. Each variant is a
 * loose visual metaphor for the product (angled louvers, a rolled shade,
 * a woven texture, draped fabric folds, a mesh screen) rendered in the
 * site's oak/charcoal/cream palette.
 */
export function WindowArt({
  variant,
  className,
  tone = "light",
}: {
  variant: WindowArtVariant;
  className?: string;
  tone?: "light" | "dark";
}) {
  const reduceMotion = useReducedMotion();
  const frame = tone === "light" ? "#e7dac6" : "#454039";
  const oak = "#a9805c";
  const oakLight = "#c4a179";
  const oakDark = "#7d5a3a";
  const bg = tone === "light" ? "#f1e9dd" : "#2a2622";

  return (
    <div className={cn("relative overflow-hidden rounded-sm", className)} aria-hidden="true">
      <svg viewBox="0 0 400 500" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <rect x="0" y="0" width="400" height="500" fill={bg} />
        {/* Window frame */}
        <rect x="30" y="30" width="340" height="440" fill="none" stroke={frame} strokeWidth="6" />

        {variant === "louver" &&
          Array.from({ length: 11 }).map((_, i) => {
            const y = 55 + i * 38;
            return (
              <motion.rect
                key={i}
                x="46"
                width="308"
                height="14"
                rx="7"
                y={y}
                fill={i % 2 === 0 ? oak : oakLight}
                initial={reduceMotion ? false : { rotate: -18 }}
                animate={reduceMotion ? undefined : { rotate: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.045, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: `200px ${y + 7}px` }}
              />
            );
          })}

        {variant === "roller" && (
          <>
            <rect x="30" y="30" width="340" height="26" fill={oakDark} />
            <rect x="46" y="66" width="308" height="340" fill={oakLight} />
            {Array.from({ length: 6 }).map((_, i) => (
              <rect key={i} x="46" y={110 + i * 48} width="308" height="2" fill={bg} opacity={0.3} />
            ))}
          </>
        )}

        {variant === "weave" && (
          <g>
            {Array.from({ length: 14 }).map((_, row) =>
              Array.from({ length: 10 }).map((_, col) => {
                const x = 46 + col * 31;
                const y = 55 + row * 30;
                const alt = (row + col) % 2 === 0;
                return (
                  <rect
                    key={`${row}-${col}`}
                    x={x}
                    y={y}
                    width="27"
                    height="24"
                    rx="3"
                    fill={alt ? oak : oakLight}
                    opacity={alt ? 0.9 : 0.65}
                  />
                );
              })
            )}
          </g>
        )}

        {variant === "drape" && (
          <g>
            {Array.from({ length: 8 }).map((_, i) => {
              const x = 46 + i * 38.5;
              return (
                <path
                  key={i}
                  d={`M ${x} 55 C ${x - 16} 180, ${x + 16} 320, ${x} 470`}
                  stroke={i % 2 === 0 ? oak : oakLight}
                  strokeWidth="18"
                  strokeLinecap="round"
                  fill="none"
                  opacity={0.85}
                />
              );
            })}
          </g>
        )}

        {variant === "mesh" && (
          <g stroke={oak} strokeWidth="2" opacity={0.6}>
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`v${i}`} x1={46 + i * 20} y1="55" x2={46 + i * 20} y2="445" />
            ))}
            {Array.from({ length: 20 }).map((_, i) => (
              <line key={`h${i}`} x1="46" y1={55 + i * 19.5} x2="354" y2={55 + i * 19.5} />
            ))}
            <rect x="30" y="30" width="340" height="440" fill="none" stroke={oakDark} strokeWidth="4" />
          </g>
        )}
      </svg>
    </div>
  );
}
