"use client";

import { motion } from "framer-motion";
import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * The site's signature motion moment: a bank of plantation-shutter louvers
 * lies flat across the hero on load, then tilts open — slat by slat, just
 * like a real shutter — to reveal the room beyond. Runs once, respects
 * reduced-motion, and never re-triggers.
 */
export function ShutterReveal({ slats = 9 }: { slats?: number }) {
  const reduceMotion = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (reduceMotion) return null;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-30 flex flex-col"
      style={{ perspective: "1400px" }}
      aria-hidden="true"
    >
      {Array.from({ length: slats }).map((_, i) => (
        <motion.div
          key={i}
          className="flex-1 origin-top bg-matte-black"
          style={{ transformStyle: "preserve-3d" }}
          initial={{ rotateX: 0 }}
          animate={{ rotateX: -115 }}
          transition={{
            duration: 0.9,
            delay: 0.35 + i * 0.07,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}
    </div>
  );
}
