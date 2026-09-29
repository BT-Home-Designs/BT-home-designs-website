import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Drop-in slot for real project photography once it exists. Pass a `src`
 * (a real file under public/images/...) and it renders a proper
 * next/image. Leave `src` undefined/empty and it renders NOTHING — no
 * placeholder box, no label, no broken layout — so the surrounding layout
 * must not depend on this space being filled (design pages around this
 * component accordingly: it's an enhancement, never a required element).
 */
export function OptionalPhoto({
  src,
  alt,
  className,
  fill = true,
  sizes,
}: {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}) {
  if (!src) return null;

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <Image src={src} alt={alt} fill={fill} sizes={sizes ?? "100vw"} className="object-cover" />
    </div>
  );
}
