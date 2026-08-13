"use client";

import { useEffect } from "react";
import { captureUtmParamsFromUrl } from "@/lib/utm";

/**
 * Invisible, site-wide (mounted in the root layout so it runs on every
 * page, not just /quote or /contact). Saves any utm_* URL parameters to
 * sessionStorage on first load so they survive internal navigation to
 * the forms later in the same visit. Renders nothing.
 */
export function UtmCapture() {
  useEffect(() => {
    captureUtmParamsFromUrl();
  }, []);
  return null;
}
