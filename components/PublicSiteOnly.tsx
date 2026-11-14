"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Renders the public-site chrome (nav, footer, floating CTA, analytics,
 * UTM capture) everywhere EXCEPT private customer quote pages (/q/...)
 * and the owner dashboard (/admin). Keeps analytics from ever recording
 * a private quote URL, and gives quotes a clean full-screen presentation.
 */
export function isPrivatePath(pathname: string | null): boolean {
  return Boolean(pathname && (pathname.startsWith("/q/") || pathname === "/admin" || pathname.startsWith("/admin/")));
}

export function PublicSiteOnly({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (isPrivatePath(pathname)) return null;
  return <>{children}</>;
}
