/**
 * Fires a GA4 lead-conversion event, but only if Google Analytics is
 * actually loaded (i.e. NEXT_PUBLIC_GA_MEASUREMENT_ID was set — see
 * components/Analytics.tsx). Safe to call unconditionally from a form's
 * submit handler; it's a no-op when analytics isn't configured.
 */
export function trackLead(formName: "quote" | "contact") {
  if (typeof window === "undefined") return;
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
  if (typeof gtag !== "function") return;

  gtag("event", "generate_lead", {
    form_name: formName,
  });
}
