/**
 * SINGLE SOURCE OF TRUTH for homepage image slots.
 *
 * BT Home Designs does not yet have original project photography. Rather
 * than use stock photos (which would need a paid license to publish on a
 * commercial site) or leave empty/labeled placeholder boxes, every image
 * slot below falls back to an original illustrated scene (see
 * components/SceneImage.tsx) until a real photo is supplied.
 *
 * To add real photography later:
 *   1. Drop the image file into public/images/home/ (folder already exists)
 *   2. Set the matching `src` below to that path
 *   3. Nothing else changes — SceneImage automatically switches from the
 *      illustration to a real next/image using the same alt text and
 *      layout slot.
 */

export type MediaSlot = {
  src?: string;
  alt: string;
};

export const homeMedia = {
  hero: {
    src: undefined,
    alt: "Bright, neutral living room with professionally installed custom drapery and a statement chandelier",
  } as MediaSlot,
  about: {
    src: undefined,
    alt: "Dining room with plantation shutters and a round dining table",
  } as MediaSlot,
};
