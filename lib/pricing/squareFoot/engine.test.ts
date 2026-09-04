import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateSquareFootCost } from "./engine";

describe("square-foot cost engine (generic infrastructure, not attached to any product)", () => {
  test("computes square feet and cost from a rate", () => {
    // 36in x 48in = 1728 sq in / 144 = 12 sq ft
    const result = calculateSquareFootCost({ widthInches: 36, heightInches: 48, ratePerSquareFootCents: 500 });
    assert.equal(result.status, "OK");
    assert.equal(result.squareFeet, 12);
    assert.equal(result.costCents, 6000);
  });

  test("rejects invalid dimensions the same way the matrix engine does", () => {
    const result = calculateSquareFootCost({ widthInches: 0, heightInches: 48, ratePerSquareFootCents: 500 });
    assert.equal(result.status, "INVALID_DIMENSIONS");
    assert.equal(result.costCents, null);
  });

  test("rejects a negative rate rather than producing a negative cost", () => {
    const result = calculateSquareFootCost({ widthInches: 36, heightInches: 48, ratePerSquareFootCents: -1 });
    assert.equal(result.status, "INVALID_RATE");
  });

  test("rounds a fractional cost to the nearest cent", () => {
    // 10in x 10in = 100 sq in / 144 = 0.6944... sq ft, x 100c = 69.44c -> rounds to 69
    const result = calculateSquareFootCost({ widthInches: 10, heightInches: 10, ratePerSquareFootCents: 100 });
    assert.equal(result.status, "OK");
    assert.equal(result.costCents, 69);
  });
});
