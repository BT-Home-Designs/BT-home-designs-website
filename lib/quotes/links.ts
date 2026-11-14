/**
 * Square payment-link validation. Customers are only ever sent to the
 * exact URL the owner pasted, and only if it is an https URL on a Square
 * domain. Anything else is treated as "no link" and the button is hidden.
 */
const SQUARE_HOSTS = ["square.link", "squareup.com", "square.site", "squareupsandbox.com"];

export function isValidSquareUrl(raw: string): boolean {
  if (!raw || raw.length > 2000) return false;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return false;
  }
  if (url.protocol !== "https:" || url.username || url.password) return false;
  const host = url.hostname.toLowerCase();
  return SQUARE_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
}
