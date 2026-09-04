"use client";

import { usePathname } from "next/navigation";

/**
 * Hides the public marketing chrome (navbar, footer, floating CTA,
 * analytics, schema) on routes under /internal, which has its own
 * dedicated nav (components/internal/InternalNav.tsx) and no marketing
 * content. The public site's markup/behavior is unchanged on every other
 * route — this only ever returns null, never alters props or rendering
 * order for non-internal pages.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isInternal = pathname?.startsWith("/internal") ?? false;

  if (isInternal) return null;

  return <>{children}</>;
}
