import Image from "next/image";
import type { MediaSlot } from "@/lib/data/media";

/**
 * Centralized photo slot so real BT Home Designs photography can be
 * dropped in later without touching any layout code — see
 * lib/data/media.ts. When `media.src` is set, renders a real photo via
 * next/image. When it isn't, renders nothing at all: no illustrated
 * scene, no gray box, no "photo coming soon" label. The section that
 * uses this component is responsible for looking complete on its own
 * (typography, spacing, line details) whether or not a photo is present.
 */
export function SceneImage({
  media,
  className,
  priority,
}: {
  media: MediaSlot;
  className?: string;
  priority?: boolean;
}) {
  if (!media.src) return null;

  return (
    <div className={className} style={{ position: "relative" }}>
      <Image src={media.src} alt={media.alt} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" priority={priority} />
    </div>
  );
}
