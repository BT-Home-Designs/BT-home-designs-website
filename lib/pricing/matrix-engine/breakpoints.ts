/**
 * LOCKED — verified source data. Do not alter, reorder, add, or remove
 * breakpoints without an updated, re-verified source specification.
 *
 * Both arrays must stay sorted ascending — the lookup rule (see engine.ts)
 * depends on it: "the smallest listed breakpoint >= actual measurement".
 */

export const WIDTH_BREAKPOINTS = [30, 36, 42, 48, 60, 72, 84, 96, 120, 140] as const;

export const HEIGHT_BREAKPOINTS = [40, 50, 60, 74, 84, 96, 120, 140, 160, 190] as const;

export type WidthBreakpoint = (typeof WIDTH_BREAKPOINTS)[number];
export type HeightBreakpoint = (typeof HEIGHT_BREAKPOINTS)[number];

export const MAX_WIDTH = WIDTH_BREAKPOINTS[WIDTH_BREAKPOINTS.length - 1];
export const MAX_HEIGHT = HEIGHT_BREAKPOINTS[HEIGHT_BREAKPOINTS.length - 1];

/**
 * The smallest listed breakpoint >= value, per the locked lookup rule.
 * Never interpolates, rounds down, clamps, or picks the nearest breakpoint.
 * Returns undefined when value exceeds every breakpoint (OUT_OF_MATRIX_RANGE).
 */
export function selectBreakpoint<T extends number>(breakpoints: readonly T[], value: number): T | undefined {
  return breakpoints.find((breakpoint) => breakpoint >= value);
}
