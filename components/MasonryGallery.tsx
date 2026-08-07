"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { galleryCategories, galleryItems, type GalleryItem } from "@/lib/data/gallery";
import { ImagePlaceholder } from "./ImagePlaceholder";
import { cn } from "@/lib/utils";

const aspectClass: Record<GalleryItem["aspect"], string> = {
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[4/3]",
};

export function MasonryGallery() {
  const [active, setActive] = useState<GalleryItem["category"] | "All">("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const lastTriggerRef = useRef<HTMLButtonElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? galleryItems : galleryItems.filter((g) => g.category === active)),
    [active]
  );

  const openLightbox = (id: string, trigger: HTMLButtonElement) => {
    lastTriggerRef.current = trigger;
    setLightboxIndex(filtered.findIndex((g) => g.id === id));
  };

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null);
    lastTriggerRef.current?.focus();
  }, []);

  const step = useCallback(
    (dir: number) => {
      setLightboxIndex((current) => (current === null ? current : (current + dir + filtered.length) % filtered.length));
    },
    [filtered.length]
  );

  const current = lightboxIndex !== null ? filtered[lightboxIndex] : null;

  // Escape closes the lightbox; arrow keys navigate. Focus the close
  // button when the dialog opens so keyboard users land somewhere useful.
  useEffect(() => {
    if (!current) return;
    closeButtonRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [current, closeLightbox, step]);

  return (
    <div>
      <div className="mb-10 flex flex-wrap gap-2" role="group" aria-label="Filter gallery by room">
        {["All", ...galleryCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActive(cat as GalleryItem["category"] | "All")}
            aria-pressed={active === cat}
            className={cn(
              "rounded-full border px-4 py-2 text-[12px] font-medium tracking-wide transition-colors",
              active === cat
                ? "border-matte-black bg-matte-black text-warm-white"
                : "border-charcoal/20 text-charcoal-soft hover:border-charcoal"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="columns-2 gap-3 md:columns-3 md:gap-4 [column-fill:_balance]">
        {filtered.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={(e) => openLightbox(item.id, e.currentTarget)}
            aria-label={`View larger image: ${item.title}, ${item.category}`}
            className={cn("group relative mb-3 block w-full overflow-hidden md:mb-4", aspectClass[item.aspect])}
          >
            <ImagePlaceholder
              label={item.category}
              variant={item.id.endsWith("1") || item.id.endsWith("4") ? "oak" : "charcoal"}
              className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/70 to-transparent p-4 text-left opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <p className="text-[12px] font-medium text-warm-white">{item.title}</p>
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-matte-black/95 p-4"
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={`${current.title}, ${current.category}`}
          >
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeLightbox}
              aria-label="Close image viewer"
              className="absolute right-5 top-5 text-warm-white/70 hover:text-warm-white"
            >
              <X className="h-7 w-7" strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              aria-label="Previous image"
              className="absolute left-3 text-warm-white/70 hover:text-warm-white md:left-8"
            >
              <ChevronLeft className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
            </button>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl"
            >
              <ImagePlaceholder label={current.category} variant="oak" className="aspect-[4/3] w-full" />
              <div className="mt-4 text-center text-warm-white">
                <p className="font-display text-xl">{current.title}</p>
                <p className="mt-1 text-[13px] text-warm-white/60">{current.location}</p>
              </div>
            </motion.div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                step(1);
              }}
              aria-label="Next image"
              className="absolute right-3 text-warm-white/70 hover:text-warm-white md:right-8"
            >
              <ChevronRight className="h-8 w-8" strokeWidth={1.25} aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
