import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateCompositeCost } from "./costBreakdown";

describe("composite cost breakdown", () => {
  test("21. totals correctly when base cost and all add-ons are known", () => {
    const result = calculateCompositeCost({
      baseDealerCostCents: 8640,
      requestedAddOnNames: ["Remote", "Hub"],
      knownCosts: new Map([
        ["Remote", 1500],
        ["Hub", 4000],
      ]),
    });

    assert.equal(result.baseDealerCostCents, 8640);
    assert.equal(result.addOns.length, 2);
    assert.equal(result.addOns[0].costCents, 1500);
    assert.equal(result.addOns[1].costCents, 4000);
    assert.equal(result.totalInternalCostCents, 8640 + 1500 + 4000);
  });

  test("with no add-ons requested, total is just the base cost", () => {
    const result = calculateCompositeCost({ baseDealerCostCents: 8640, requestedAddOnNames: [], knownCosts: new Map() });
    assert.equal(result.addOns.length, 0);
    assert.equal(result.totalInternalCostCents, 8640);
  });

  test("an unconfigured add-on (today's default — no FixedPriceOption catalog yet) makes the total null, not a partial sum", () => {
    const result = calculateCompositeCost({
      baseDealerCostCents: 8640,
      requestedAddOnNames: ["Motorization"],
      knownCosts: new Map(), // empty catalog — nothing configured
    });

    assert.equal(result.addOns[0].name, "Motorization");
    assert.equal(result.addOns[0].costCents, null);
    assert.equal(result.totalInternalCostCents, null);
  });

  test("an unknown base cost also makes the total null even if all add-ons are configured", () => {
    const result = calculateCompositeCost({
      baseDealerCostCents: null,
      requestedAddOnNames: ["Remote"],
      knownCosts: new Map([["Remote", 1500]]),
    });
    assert.equal(result.totalInternalCostCents, null);
  });

  test("one unconfigured add-on among several configured ones still nulls the total (no silent partial sum)", () => {
    const result = calculateCompositeCost({
      baseDealerCostCents: 8640,
      requestedAddOnNames: ["Remote", "Motorization"],
      knownCosts: new Map([["Remote", 1500]]), // Motorization not in catalog
    });
    assert.equal(result.addOns[0].costCents, 1500);
    assert.equal(result.addOns[1].costCents, null);
    assert.equal(result.totalInternalCostCents, null);
  });
});
