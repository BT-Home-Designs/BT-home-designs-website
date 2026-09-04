import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateLineItemProfitability } from "./profitability";

describe("profitability — gross profit / gross margin", () => {
  test("18. gross profit = selling price - total internal cost", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: 15000, totalInternalCostCents: 10000 });
    assert.equal(result.grossProfitCents, 5000);
  });

  test("19. gross margin % = gross profit / selling price", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: 15000, totalInternalCostCents: 10000 });
    // profit 5000 / selling 15000 = 33.33...% -> 3333 bps (rounded)
    assert.equal(result.grossMarginBps, 3333);
  });

  test("20. margin (and profit) are omitted entirely when selling price is unavailable", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: null, totalInternalCostCents: 10000 });
    assert.equal(result.grossProfitCents, null);
    assert.equal(result.grossMarginBps, null);
  });

  test("margin is omitted when internal cost is unavailable, even with a known selling price", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: 15000, totalInternalCostCents: null });
    assert.equal(result.grossProfitCents, null);
    assert.equal(result.grossMarginBps, null);
  });

  test("a zero selling price never causes a division-by-zero crash", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: 0, totalInternalCostCents: 500 });
    assert.equal(result.grossProfitCents, -500);
    assert.equal(result.grossMarginBps, null);
  });

  test("a loss (cost exceeds selling price) is a negative profit, not clamped to zero", () => {
    const result = calculateLineItemProfitability({ sellingPriceCents: 8000, totalInternalCostCents: 10000 });
    assert.equal(result.grossProfitCents, -2000);
    assert.equal(result.grossMarginBps, -2500);
  });
});
