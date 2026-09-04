/** Formats integer cents as US currency, e.g. 21120 -> "$211.20". */
export function formatCentsAsCurrency(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

/** Formats a Decimal-derived measurement (inches) for display, e.g. 36.125 -> "36.125"". */
export function formatInches(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return `${n}"`;
}
