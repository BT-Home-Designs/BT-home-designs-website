import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  FABRIC_CATALOG,
  ROLLER_SHADE_FABRIC_COUNT,
  NEOLUX_FABRIC_COUNT,
  normalizeFabricName,
  validateFabricCatalog,
} from "./fabricCatalog";
import { PRICE_MATRICES } from "./matrices";
import { WIDTH_BREAKPOINTS, HEIGHT_BREAKPOINTS } from "./breakpoints";

// "missing matrix produces CONFIGURATION_ERROR" is a *runtime* behavior of
// the engine, exercised against test fixtures in engine.test.ts (never the
// real locked matrices) — see the "configuration error paths" describe
// block there.

describe("fabric catalog — configuration invariants", () => {
  test("exact fabric count = 68", () => {
    assert.equal(FABRIC_CATALOG.length, 68);
  });

  test("Roller Shade count = 37", () => {
    assert.equal(ROLLER_SHADE_FABRIC_COUNT, 37);
  });

  test("Neolux count = 31", () => {
    assert.equal(NEOLUX_FABRIC_COUNT, 31);
  });

  test("37 + 31 accounts for the full catalog", () => {
    assert.equal(ROLLER_SHADE_FABRIC_COUNT + NEOLUX_FABRIC_COUNT, FABRIC_CATALOG.length);
  });

  test("every fabric has a non-empty exact source name", () => {
    for (const fabric of FABRIC_CATALOG) {
      assert.ok(fabric.sourceName.length > 0, `fabric has an empty source name (${JSON.stringify(fabric)})`);
      assert.equal(fabric.sourceName, fabric.sourceName.trim(), `source name should not need trimming: "${fabric.sourceName}"`);
    }
  });

  test("every fabric has a product type", () => {
    for (const fabric of FABRIC_CATALOG) {
      assert.ok(fabric.productType === "ROLLER_SHADE" || fabric.productType === "NEOLUX", `unexpected productType for "${fabric.sourceName}"`);
    }
  });

  test("every fabric references an existing matrix (its price group)", () => {
    for (const fabric of FABRIC_CATALOG) {
      assert.ok(PRICE_MATRICES[fabric.priceGroup], `fabric "${fabric.sourceName}" references missing price group "${fabric.priceGroup}"`);
    }
  });

  test("no normalized-name collisions", () => {
    const byNormalized = new Map<string, string[]>();
    for (const fabric of FABRIC_CATALOG) {
      const key = normalizeFabricName(fabric.sourceName);
      byNormalized.set(key, [...(byNormalized.get(key) ?? []), fabric.sourceName]);
    }
    for (const [key, names] of byNormalized) {
      assert.equal(names.length, 1, `normalized name "${key}" collides: ${names.join(", ")}`);
    }
  });

  test("preserves apparent-typo source names exactly, unmodified", () => {
    const names = FABRIC_CATALOG.map((f) => f.sourceName);
    assert.ok(names.includes("STUCKO BLACKOUT"));
    assert.ok(names.includes("E3SSENCE COLLECTION NEOLUX MADEIRA"));
    assert.ok(names.includes("NEOLUX RUSTIC & RUSTIC DIM OUT"));
    assert.ok(names.includes("ESSENCE COLLECTIONS NEOLUX SPLANDOR"));
  });

  test("validateFabricCatalog() reports valid for the real locked catalog", () => {
    const result = validateFabricCatalog();
    assert.equal(result.valid, true, result.errors.join("\n"));
    assert.deepEqual(result.errors, []);
  });
});

describe("price matrices — shape invariants", () => {
  test("all five groups (A-E) exist", () => {
    for (const group of ["A", "B", "C", "D", "E"] as const) {
      assert.ok(PRICE_MATRICES[group], `missing matrix for group ${group}`);
    }
  });

  test("each matrix has exactly 10 height rows", () => {
    for (const [group, matrix] of Object.entries(PRICE_MATRICES)) {
      assert.equal(Object.keys(matrix).length, 10, `group ${group} has ${Object.keys(matrix).length} rows, expected 10`);
    }
  });

  test("each matrix row has exactly 10 width columns (100 cells per matrix)", () => {
    for (const [group, matrix] of Object.entries(PRICE_MATRICES)) {
      let cellCount = 0;
      for (const heightBreakpoint of HEIGHT_BREAKPOINTS) {
        const row = matrix[heightBreakpoint];
        assert.ok(row, `group ${group} is missing the H${heightBreakpoint} row`);
        assert.equal(row.length, 10, `group ${group} H${heightBreakpoint} row has ${row.length} cells, expected 10`);
        cellCount += row.length;
      }
      assert.equal(cellCount, 100, `group ${group} has ${cellCount} total cells, expected 100`);
    }
  });

  test("every matrix cell is a positive finite number", () => {
    for (const [group, matrix] of Object.entries(PRICE_MATRICES)) {
      for (const heightBreakpoint of HEIGHT_BREAKPOINTS) {
        for (const value of matrix[heightBreakpoint]) {
          assert.ok(Number.isFinite(value) && value > 0, `group ${group} has a non-positive/non-finite cell: ${value}`);
        }
      }
    }
  });

  test("row/column breakpoint counts match the locked breakpoint lists", () => {
    assert.equal(WIDTH_BREAKPOINTS.length, 10);
    assert.equal(HEIGHT_BREAKPOINTS.length, 10);
  });
});
