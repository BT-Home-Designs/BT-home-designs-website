/**
 * UTM capture/persistence. A visitor may land on any page (a service or
 * city page from an ad, for example) and only navigate to /quote or
 * /contact via internal links afterward — by then the UTM parameters are
 * gone from the URL. UtmCapture (mounted once in the root layout) saves
 * any utm_* params found on first load to sessionStorage; the forms read
 * them back at submit time, whichever page they were actually captured
 * on. If a visitor never arrived via a tagged link, nothing is stored
 * and nothing is sent — this never invents attribution data.
 */

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const STORAGE_KEY = "bt_utm_params";

export function captureUtmParamsFromUrl(): void {
  if (typeof window === "undefined") return;
  const params = new URLSearchParams(window.location.search);
  const found: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const value = params.get(key);
    if (value) found[key] = value;
  }
  if (Object.keys(found).length === 0) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(found));
  } catch {
    // sessionStorage may be unavailable (private browsing, etc.) — fine to skip.
  }
}

export function getStoredUtmParams(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}
