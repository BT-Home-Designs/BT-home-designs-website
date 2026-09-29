import Script from "next/script";

/**
 * Google Analytics 4 loader — only renders/loads anything when
 * NEXT_PUBLIC_GA_MEASUREMENT_ID is set in the environment. No ID is
 * invented or hardcoded here; with the variable unset (the current
 * state), this component renders nothing and no script is loaded.
 *
 * To activate: set NEXT_PUBLIC_GA_MEASUREMENT_ID (format "G-XXXXXXXXXX")
 * in your deployment environment variables and redeploy. No code changes
 * needed. See lib/analytics.ts for the corresponding `trackLead()` helper
 * used to fire a conversion event when a form is successfully submitted.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!gaId) return null;

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
