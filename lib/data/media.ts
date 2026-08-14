/**
 * SINGLE SOURCE OF TRUTH for image slots across the site.
 *
 * BT Home Designs does not yet have original project photography. Until
 * that exists, select slots below use licensed stock photography (Unsplash
 * License — free for commercial use, no attribution required) instead of
 * an empty box or an illustrated stand-in. Every stock entry is marked:
 *
 *   TEMPORARY STOCK — REPLACE WITH BT HOME DESIGNS PROJECT PHOTO
 *
 * Stock images here are never presented as BT Home Designs' own completed
 * projects, recent installs, or customer homes — see how each is used in
 * app/page.tsx (general "what a well-dressed window/room can look like"
 * framing, not "our work"). The Gallery page does not use any images from
 * this file.
 *
 * To replace a stock photo with real BT Home Designs photography:
 *   1. Drop the image file into public/images/home/ (folder already exists)
 *   2. Set that slot's `src` below to the local path (e.g.
 *      "/images/home/hero.jpg") and update `alt` to describe the real photo
 *   3. Delete the `stockSource`/`license` fields (or leave them — they're
 *      ignored once `src` points to a local file)
 *   4. Nothing else changes — SceneImage (components/SceneImage.tsx) and
 *      every page that reads from this file automatically picks up the
 *      new image with no redesign needed
 *
 * Slots with `src: undefined` intentionally render nothing (no box, no
 * illustration) rather than an unverified/mismatched stock photo — see
 * each slot's comment for why.
 */

export type MediaSlot = {
  src?: string;
  alt: string;
  /** Present only for temporary stock photos; omit once replaced with a real photo. */
  stockSource?: string;
  license?: string;
};

export const homeMedia = {
  // TEMPORARY STOCK — REPLACE WITH BT HOME DESIGNS PROJECT PHOTO
  // Cozy, minimalist living room with custom pleated linen drapery as the
  // clear visual focal point — approved for the hero, verified free to
  // use under the Unsplash License.
  hero: {
    src: "https://images.unsplash.com/photo-1754613389158-3b13a051a81a?auto=format&fit=crop&w=1600&q=80",
    alt: "Bright, minimalist living room with custom pleated linen drapery framing a large window",
    stockSource: "https://unsplash.com/photos/cozy-living-room-with-neutral-tones-and-natural-light-srzKmNLovaQ",
    license: "Unsplash License — free for commercial use, no attribution required",
  } as MediaSlot,

  // Dedicated photo supplied directly by the site owner for the About
  // section — a corner living room with two sets of plantation shutters,
  // bright and neutral, full room context. Distinct from the Shop By
  // Style Plantation Shutters card image (previously this section reused
  // that same file; that duplication is now resolved).
  about: {
    src: "/images/home/about.jpg",
    alt: "Bright corner living room with two sets of white plantation shutters, neutral sofa, and a potted fiddle-leaf fig",
  } as MediaSlot,
};

/**
 * Homepage "Shop by Style" product-card images.
 *
 * Reuses the same 7 approved AI-generated images as the service-page
 * heroes (see serviceHeroImages below) for visual consistency between
 * the homepage grid and each service's own page — same source file,
 * cropped differently per placement via CSS, not a separate asset.
 *
 * "roman-shades" uses a real photo (public/images/services/roman-shades.jpg)
 * supplied directly by the site owner — a woven-texture Roman shade with
 * clearly visible horizontal fabric folds, installed in a real window
 * with room context. Not stock; approved specifically for this card. No
 * stockSource/license fields since it isn't a licensed stock photo.
 */
export const shopByStyleImages: Record<string, MediaSlot> = {
  "plantation-shutters": {
    src: "/images/services/plantation-shutters.jpg",
    alt: "Plantation shutters with visible louvers in a bright living room",
  },
  "roller-shades": {
    src: "/images/services/roller-shades.jpg",
    alt: "Light-filtering roller shades over a row of dining room windows",
  },
  "motorized-shades": {
    src: "/images/services/motorized-shades.jpg",
    alt: "Motorized roller shades lowered over floor-to-ceiling glass in a modern living room",
  },
  "roman-shades": {
    src: "/images/services/roman-shades.jpg",
    alt: "Woven-texture Roman shade with visible horizontal fabric folds in a living room window",
  },
  "zebra-shades": {
    src: "/images/services/zebra-shades.jpg",
    alt: "Zebra shades showing alternating sheer and opaque bands in a home office",
  },
  "woven-woods": {
    src: "/images/services/woven-woods.jpg",
    alt: "Natural woven wood shades over a bay window in a breakfast nook",
  },
  "custom-drapery": {
    src: "/images/services/custom-drapery.jpg",
    alt: "Full-length linen drapery framing a tall window beside a stone fireplace",
  },
  "exterior-shades": {
    src: "/images/services/exterior-shades.jpg",
    alt: "Dark exterior solar shades on a covered patio beside a pool",
  },
};

/**
 * Service-page hero images.
 *
 * These 7 images are AI-generated design imagery (created for BT Home
 * Designs and reviewed/approved for site use) — NOT photographs of real
 * BT Home Designs installations, customer homes, or completed projects.
 * They illustrate what each product category looks like in a room, in the
 * site's neutral/warm-oak palette, until real project photography exists.
 * Do not caption or describe these as "our work," "recent installs," or
 * any variation implying they depict an actual BT Home Designs job.
 *
 * To replace one with a real installation photo later: drop the file into
 * public/images/services/, point `src` at it, and update `alt` — no other
 * code changes needed.
 */
export const serviceHeroImages: Record<string, MediaSlot> = {
  "plantation-shutters": {
    src: "/images/services/plantation-shutters.jpg",
    alt: "Wide living room with white plantation shutters across two large windows, beamed ceiling, and neutral seating",
  },
  "roller-shades": {
    src: "/images/services/roller-shades.jpg",
    alt: "Wide dining room with four light-filtering roller shades over floor-to-ceiling windows",
  },
  "motorized-shades": {
    src: "/images/services/motorized-shades.jpg",
    alt: "Wide modern living room with three large roller shades lowered over floor-to-ceiling glass",
  },
  "zebra-shades": {
    src: "/images/services/zebra-shades.jpg",
    alt: "Wide home office with two banded zebra shades filtering light over a desk and built-in shelving",
  },
  "woven-woods": {
    src: "/images/services/woven-woods.jpg",
    alt: "Wide breakfast nook with three woven wood roman shades over a bay window and round dining table",
  },
  "custom-drapery": {
    src: "/images/services/custom-drapery.jpg",
    alt: "Wide living room with full-length linen drapery framing a tall window beside a stone fireplace",
  },
  "exterior-shades": {
    src: "/images/services/exterior-shades.jpg",
    alt: "Wide covered patio with dark exterior solar shades lowered beside a pool",
  },
};
