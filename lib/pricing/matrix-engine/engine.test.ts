import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { priceMatrixItem, priceMatrixItemWithDependencies } from "./engine";
import { findFabricInCatalog } from "./fabricCatalog";

function price(fabricSourceName: string, width: number, height: number) {
  return priceMatrixItem({ fabricSourceName, width, height });
}

function assertAllPricingFieldsNull(result: ReturnType<typeof price>) {
  assert.equal(result.priceGroup, null);
  assert.equal(result.selectedWidthTier, null);
  assert.equal(result.selectedHeightTier, null);
  assert.equal(result.retailCents, null);
  assert.equal(result.retailDollars, null);
  assert.equal(result.dealerMultiplierBps, null);
  assert.equal(result.dealerCostCents, null);
  assert.equal(result.dealerCostDollars, null);
}

describe("matrix engine — locked regression tests (1-15)", () => {
  test("1. VX 3000-3% 30x40 -> Group A, retail 108, dealer 86.40", () => {
    const r = price("VX 3000-3%", 30, 40);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "A");
    assert.equal(r.retailDollars, 108);
    assert.equal(r.dealerCostDollars, 86.4);
  });

  test("2. VX SCREEN NATURE -3% 30.01x40 -> Group B, W36/H40, retail 140, dealer 112.00", () => {
    const r = price("VX SCREEN NATURE -3%", 30.01, 40);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "B");
    assert.equal(r.selectedWidthTier, 36);
    assert.equal(r.selectedHeightTier, 40);
    assert.equal(r.retailDollars, 140);
    assert.equal(r.dealerCostDollars, 112.0);
  });

  test("3. SANCTUARY LIGHT FILTERING 36.125x50.125 -> Group C, W42/H60, retail 220, dealer 176.00", () => {
    const r = price("SANCTUARY LIGHT FILTERING", 36.125, 50.125);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "C");
    assert.equal(r.selectedWidthTier, 42);
    assert.equal(r.selectedHeightTier, 60);
    assert.equal(r.retailDollars, 220);
    assert.equal(r.dealerCostDollars, 176.0);
  });

  test("4. BALMORAL BLACKOUT 48.01x74.01 -> Group D, W60/H84, retail 345, dealer 276.00", () => {
    const r = price("BALMORAL BLACKOUT", 48.01, 74.01);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "D");
    assert.equal(r.selectedWidthTier, 60);
    assert.equal(r.selectedHeightTier, 84);
    assert.equal(r.retailDollars, 345);
    assert.equal(r.dealerCostDollars, 276.0);
  });

  test("5. SANCTUARY BLACKOUT 59.875x83.5 -> Group E, W60/H84, retail 448, dealer 358.40", () => {
    const r = price("SANCTUARY BLACKOUT", 59.875, 83.5);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "E");
    assert.equal(r.selectedWidthTier, 60);
    assert.equal(r.selectedHeightTier, 84);
    assert.equal(r.retailDollars, 448);
    assert.equal(r.dealerCostDollars, 358.4);
  });

  test("6. NIGHTFALL BIMINI BLACKOUT 72x96 -> Group B, retail 326, dealer 260.80", () => {
    const r = price("NIGHTFALL BIMINI BLACKOUT", 72, 96);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "B");
    assert.equal(r.retailDollars, 326);
    assert.equal(r.dealerCostDollars, 260.8);
  });

  test("7. NIGHTFALL VELVET BLACKOUT 72.125x96.125 -> Group C, W84/H120, retail 484, dealer 387.20", () => {
    const r = price("NIGHTFALL VELVET BLACKOUT", 72.125, 96.125);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "C");
    assert.equal(r.selectedWidthTier, 84);
    assert.equal(r.selectedHeightTier, 120);
    assert.equal(r.retailDollars, 484);
    assert.equal(r.dealerCostDollars, 387.2);
  });

  test("8. INTIMATE DAKAR BLACKOUT 95.75x119.5 -> Group D, W96/H120, retail 593, dealer 474.40", () => {
    const r = price("INTIMATE DAKAR BLACKOUT", 95.75, 119.5);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "D");
    assert.equal(r.selectedWidthTier, 96);
    assert.equal(r.selectedHeightTier, 120);
    assert.equal(r.retailDollars, 593);
    assert.equal(r.dealerCostDollars, 474.4);
  });

  test("9. INTIMATE DAKU BLACKOUT 119.99x139.99 -> Group E, W120/H140, retail 1371, dealer 1096.80", () => {
    const r = price("INTIMATE DAKU BLACKOUT", 119.99, 139.99);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "E");
    assert.equal(r.selectedWidthTier, 120);
    assert.equal(r.selectedHeightTier, 140);
    assert.equal(r.retailDollars, 1371);
    assert.equal(r.dealerCostDollars, 1096.8);
  });

  test("10. ESSENCE NEOLUX BAHIA DIM OUT 120.01x140.01 -> Group A, W140/H160, retail 930, dealer 744.00", () => {
    const r = price("ESSENCE NEOLUX BAHIA DIM OUT", 120.01, 140.01);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "A");
    assert.equal(r.selectedWidthTier, 140);
    assert.equal(r.selectedHeightTier, 160);
    assert.equal(r.retailDollars, 930);
    assert.equal(r.dealerCostDollars, 744.0);
  });

  test("11. NEOLUX SUNDOWN DIM OUT 140x190 -> Group B, retail 1058, dealer 846.40", () => {
    const r = price("NEOLUX SUNDOWN DIM OUT", 140, 190);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "B");
    assert.equal(r.selectedWidthTier, 140);
    assert.equal(r.selectedHeightTier, 190);
    assert.equal(r.retailDollars, 1058);
    assert.equal(r.dealerCostDollars, 846.4);
  });

  test("12. NEOLUX SOLITUDE DIM OUT 140.001x190 -> OUT_OF_MATRIX_RANGE, all pricing fields null", () => {
    const r = price("NEOLUX SOLITUDE DIM OUT", 140.001, 190);
    assert.equal(r.status, "OUT_OF_MATRIX_RANGE");
    assertAllPricingFieldsNull(r);
  });

  test("13. NEOLUX CLASSIC DIM OUT 140x190.001 -> OUT_OF_MATRIX_RANGE, all pricing fields null", () => {
    const r = price("NEOLUX CLASSIC DIM OUT", 140, 190.001);
    assert.equal(r.status, "OUT_OF_MATRIX_RANGE");
    assertAllPricingFieldsNull(r);
  });

  test("14. SANCTUARY BLACKOUT 42x74 -> Group E, retail 264, dealer 211.20, warning present", () => {
    const r = price("SANCTUARY BLACKOUT", 42, 74);
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.priceGroup, "E");
    assert.equal(r.retailDollars, 264);
    assert.equal(r.dealerCostDollars, 211.2);
    assert.ok(r.warnings.includes("SOURCE DATA WARNING: H74/W42 VALUE SHOULD BE HUMAN-VERIFIED"));
  });

  test("15. FAKE FABRIC THAT DOES NOT EXIST 36x50 -> UNKNOWN_FABRIC, all pricing fields null", () => {
    const r = price("FAKE FABRIC THAT DOES NOT EXIST", 36, 50);
    assert.equal(r.status, "UNKNOWN_FABRIC");
    assertAllPricingFieldsNull(r);
  });
});

describe("matrix engine — cross-group isolation at exactly 60x84", () => {
  const cases: Array<[string, "A" | "B" | "C" | "D" | "E", number, number]> = [
    ["VX 3000-3%", "A", 242, 193.6],
    ["VX SCREEN NATURE -3%", "B", 261, 208.8],
    ["SANCTUARY LIGHT FILTERING", "C", 300, 240.0],
    ["BALMORAL BLACKOUT", "D", 345, 276.0],
    ["SANCTUARY BLACKOUT", "E", 448, 358.4],
  ];

  for (const [fabricName, group, retail, dealer] of cases) {
    test(`${group}: retail ${retail}, dealer ${dealer}`, () => {
      const r = price(fabricName, 60, 84);
      assert.equal(r.status, "SUCCESS");
      assert.equal(r.priceGroup, group);
      assert.equal(r.retailDollars, retail);
      assert.equal(r.dealerCostDollars, dealer);
    });
  }

  test("all five retail values are distinct", () => {
    const retails = cases.map(([fabricName]) => price(fabricName, 60, 84).retailDollars);
    assert.equal(new Set(retails).size, 5);
  });
});

describe("matrix engine — invalid dimensions", () => {
  const invalidValues = [0, -1, -0.001, NaN, Infinity, -Infinity];

  for (const value of invalidValues) {
    test(`width=${value} -> INVALID_DIMENSIONS`, () => {
      const r = price("VX 3000-3%", value, 40);
      assert.equal(r.status, "INVALID_DIMENSIONS");
      assertAllPricingFieldsNull(r);
    });

    test(`height=${value} -> INVALID_DIMENSIONS`, () => {
      const r = price("VX 3000-3%", 30, value);
      assert.equal(r.status, "INVALID_DIMENSIONS");
      assertAllPricingFieldsNull(r);
    });
  }

  test("preserves the entered fabric name and dimensions on failure", () => {
    const r = price("VX 3000-3%", -5, 40);
    assert.equal(r.sourceFabricName, "VX 3000-3%");
    assert.equal(r.actualWidth, -5);
    assert.equal(r.actualHeight, 40);
  });
});

describe("matrix engine — unknown fabric never substitutes", () => {
  test("does not fall back to Group A or any other group", () => {
    const r = price("Definitely Not A Real Fabric", 30, 40);
    assert.equal(r.status, "UNKNOWN_FABRIC");
    assert.notEqual(r.priceGroup, "A");
    assertAllPricingFieldsNull(r);
  });

  test("fabric lookup is case/whitespace-insensitive but never fuzzy-matches a different name", () => {
    assert.ok(findFabricInCatalog("  vx 3000-3%  "));
    assert.equal(findFabricInCatalog("VX 3000-30%"), undefined);
  });
});

describe("matrix engine — configuration error paths (test fixtures only, never the real locked data)", () => {
  test("missing matrix for a price group produces CONFIGURATION_ERROR", () => {
    const r = priceMatrixItemWithDependencies(
      { fabricSourceName: "VX 3000-3%", width: 30, height: 40 },
      {
        matrices: {}, // deliberately empty fixture — Group A missing
        findFabric: findFabricInCatalog,
      }
    );
    assert.equal(r.status, "CONFIGURATION_ERROR");
    assertAllPricingFieldsNull(r);
  });

  test("missing cell within an otherwise-present matrix produces CONFIGURATION_ERROR", () => {
    const r = priceMatrixItemWithDependencies(
      { fabricSourceName: "VX 3000-3%", width: 30, height: 40 },
      {
        matrices: { A: {} as never }, // deliberately incomplete fixture
        findFabric: findFabricInCatalog,
      }
    );
    assert.equal(r.status, "CONFIGURATION_ERROR");
    assertAllPricingFieldsNull(r);
  });
});
