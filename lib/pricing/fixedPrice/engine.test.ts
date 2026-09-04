import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateFixedPriceCost } from "./engine";

describe("fixed-price cost engine (generic infrastructure)", () => {
  test("multiplies unit cost by quantity", () => {
    const result = calculateFixedPriceCost({ unitCostCents: 1500, quantity: 3 });
    assert.equal(result.status, "OK");
    assert.equal(result.totalCents, 4500);
  });

  test("rejects a non-integer or zero quantity", () => {
    assert.equal(calculateFixedPriceCost({ unitCostCents: 1500, quantity: 0 }).status, "INVALID_QUANTITY");
    assert.equal(calculateFixedPriceCost({ unitCostCents: 1500, quantity: 1.5 }).status, "INVALID_QUANTITY");
  });

  test("rejects a negative unit cost", () => {
    assert.equal(calculateFixedPriceCost({ unitCostCents: -100, quantity: 1 }).status, "INVALID_UNIT_COST");
  });
});
