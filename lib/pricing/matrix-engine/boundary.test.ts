import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { priceMatrixItem } from "./engine";
import { WIDTH_BREAKPOINTS, HEIGHT_BREAKPOINTS } from "./breakpoints";

/**
 * Exhaustive boundary coverage: every width and height breakpoint, at the
 * exact value and at +0.001 over it. "Exact breakpoint stays exact. Any
 * amount above a breakpoint moves to the next tier." The maximum
 * breakpoint's +0.001 case must fail closed (OUT_OF_MATRIX_RANGE), never
 * clamp to the maximum tier.
 */

const FIXED_FABRIC = "VX 3000-3%"; // Group A — present at every tier.
const FIXED_HEIGHT = 40; // First height breakpoint — always in range.
const FIXED_WIDTH = 30; // First width breakpoint — always in range.

describe("matrix engine — width breakpoint boundaries", () => {
  WIDTH_BREAKPOINTS.forEach((breakpoint, index) => {
    test(`width=${breakpoint} (exact) selects tier ${breakpoint}`, () => {
      const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: breakpoint, height: FIXED_HEIGHT });
      assert.equal(r.status, "SUCCESS");
      assert.equal(r.selectedWidthTier, breakpoint);
    });

    const nextBreakpoint = WIDTH_BREAKPOINTS[index + 1];
    if (nextBreakpoint !== undefined) {
      test(`width=${breakpoint}.001 (over) selects next tier ${nextBreakpoint}`, () => {
        const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: breakpoint + 0.001, height: FIXED_HEIGHT });
        assert.equal(r.status, "SUCCESS");
        assert.equal(r.selectedWidthTier, nextBreakpoint);
      });
    } else {
      test(`width=${breakpoint}.001 (over the maximum) fails closed with OUT_OF_MATRIX_RANGE`, () => {
        const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: breakpoint + 0.001, height: FIXED_HEIGHT });
        assert.equal(r.status, "OUT_OF_MATRIX_RANGE");
        assert.equal(r.selectedWidthTier, null);
      });
    }
  });
});

describe("matrix engine — height breakpoint boundaries", () => {
  HEIGHT_BREAKPOINTS.forEach((breakpoint, index) => {
    test(`height=${breakpoint} (exact) selects tier ${breakpoint}`, () => {
      const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: FIXED_WIDTH, height: breakpoint });
      assert.equal(r.status, "SUCCESS");
      assert.equal(r.selectedHeightTier, breakpoint);
    });

    const nextBreakpoint = HEIGHT_BREAKPOINTS[index + 1];
    if (nextBreakpoint !== undefined) {
      test(`height=${breakpoint}.001 (over) selects next tier ${nextBreakpoint}`, () => {
        const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: FIXED_WIDTH, height: breakpoint + 0.001 });
        assert.equal(r.status, "SUCCESS");
        assert.equal(r.selectedHeightTier, nextBreakpoint);
      });
    } else {
      test(`height=${breakpoint}.001 (over the maximum) fails closed with OUT_OF_MATRIX_RANGE`, () => {
        const r = priceMatrixItem({ fabricSourceName: FIXED_FABRIC, width: FIXED_WIDTH, height: breakpoint + 0.001 });
        assert.equal(r.status, "OUT_OF_MATRIX_RANGE");
        assert.equal(r.selectedHeightTier, null);
      });
    }
  });
});
