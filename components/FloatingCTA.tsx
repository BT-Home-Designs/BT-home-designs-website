"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { Ruler } from "lucide-react";

export function FloatingCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 700);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 right-6 z-40 hidden sm:block"
        >
          <Link
            href="/quote"
            className="group flex items-center gap-2.5 rounded-full bg-matte-black px-6 py-4 text-[13px] font-medium text-warm-white shadow-2xl shadow-black/30 transition-colors hover:bg-oak-dark"
          >
            <Ruler className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Request Quote
          </Link>
        </motion.div>
      )}
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-x-4 bottom-4 z-40 sm:hidden"
        >
          <Link
            href="/quote"
            className="flex w-full items-center justify-center gap-2.5 rounded-full bg-matte-black px-6 py-4 text-[13px] font-medium text-warm-white shadow-2xl"
          >
            <Ruler className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            Request Quote
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
