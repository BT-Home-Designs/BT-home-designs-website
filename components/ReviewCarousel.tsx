"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { testimonials } from "@/lib/data/testimonials";

export function ReviewCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + testimonials.length) % testimonials.length);
  };

  const t = testimonials[index];

  return (
    <div className="relative mx-auto max-w-2xl text-center">
      <div
        className="relative min-h-[220px] md:min-h-[190px]"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -direction * 30 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <div className="flex justify-center gap-1" role="img" aria-label={`Rated ${t.rating} out of 5 stars`}>
              {Array.from({ length: t.rating }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-oak text-oak" aria-hidden="true" />
              ))}
            </div>
            <p className="mt-6 font-display text-xl leading-relaxed text-charcoal md:text-2xl">
              &ldquo;{t.quote}&rdquo;
            </p>
            <p className="mt-6 text-[13px] font-medium text-charcoal">
              {t.name} <span className="text-charcoal-soft font-normal">— {t.location}</span>
            </p>
            <p className="eyebrow mt-1">{t.service}</p>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous review"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 transition-colors hover:border-oak-dark hover:text-oak-dark"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <div className="flex gap-1.5" role="tablist" aria-label="Select a review">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-current={i === index ? "true" : undefined}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              aria-label={`Go to review ${i + 1} of ${testimonials.length}`}
              className={`h-1.5 w-1.5 rounded-full transition-all ${i === index ? "w-5 bg-oak-dark" : "bg-charcoal/20"}`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next review"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-charcoal/15 transition-colors hover:border-oak-dark hover:text-oak-dark"
        >
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
