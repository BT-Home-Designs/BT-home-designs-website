import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { listActiveFabricsForProduct } from "./catalog";

describe("catalog — fabric list is scoped to the selected product", () => {
  test("7. Roller Shade product's fabric list only shows Roller Shade fabrics", async () => {
    const rollerShade = await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } });
    const fabrics = await listActiveFabricsForProduct(rollerShade.id);

    assert.equal(fabrics.length, 37);
    for (const fabric of fabrics) {
      assert.equal(fabric.productId, rollerShade.id);
    }
    assert.ok(fabrics.some((f) => f.sourceName === "VX 3000-3%"));
    assert.ok(!fabrics.some((f) => f.sourceName.includes("NEOLUX")));
  });

  test("8. Neolux product's fabric list only shows Neolux fabrics", async () => {
    const neolux = await prisma.product.findFirstOrThrow({ where: { productType: "NEOLUX" } });
    const fabrics = await listActiveFabricsForProduct(neolux.id);

    assert.equal(fabrics.length, 31);
    for (const fabric of fabrics) {
      assert.equal(fabric.productId, neolux.id);
    }
    assert.ok(fabrics.some((f) => f.sourceName === "NEOLUX SUNDOWN DIM OUT"));
    assert.ok(!fabrics.some((f) => f.sourceName === "VX 3000-3%"));
  });
});
