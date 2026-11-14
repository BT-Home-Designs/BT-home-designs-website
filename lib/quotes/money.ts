/**
 * Currency helpers. All amounts are integer cents; rounding is
 * round-half-up to the nearest cent, applied once per computed amount.
 */

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}

/** Round a non-negative rational a/b to the nearest integer, halves up. */
function roundDiv(numerator: number, denominator: number): number {
  if (numerator < 0) return -roundDiv(-numerator, denominator);
  return Math.floor((numerator * 2 + denominator) / (denominator * 2));
}

/** Convert a decimal number to an integer count of 1/scale units without float drift. */
export function toScaled(value: number, scale: number): number {
  return Math.round(Number((value * scale).toFixed(6)));
}

/** quantity (up to 2 decimals) × unit price → cents. */
export function lineTotalCents(quantity: number, unitPriceCents: number): number {
  return roundDiv(toScaled(quantity, 100) * unitPriceCents, 100);
}

/** amount × percent (up to 4 decimals, e.g. 8.25) → cents. */
export function percentOfCents(amountCents: number, percent: number): number {
  return roundDiv(amountCents * toScaled(percent, 10_000), 1_000_000);
}

/**
 * Parse a user-entered dollar string ("$1,234.5", "1234.56") into cents.
 * Returns null for anything that isn't a plain non-negative amount with at
 * most 2 decimal places.
 */
export function parseDollarsToCents(input: string): number | null {
  const cleaned = input.replace(/[$,\s]/g, "");
  if (cleaned === "") return null;
  if (!/^\d+(\.\d{0,2})?$/.test(cleaned)) return null;
  const [whole, frac = ""] = cleaned.split(".");
  const cents = Number(whole) * 100 + Number((frac + "00").slice(0, 2));
  return Number.isSafeInteger(cents) ? cents : null;
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}
