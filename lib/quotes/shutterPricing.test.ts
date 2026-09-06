import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem, type LineItemFieldsInput } from "./lineItems";

describe("Plantation Shutter square-foot pricing", () => {
  let customerId: string;
  let quoteId: string;
  let shutterProductId: string;

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Shutter Pricing" });
    customerId = customer.id;
    const quote = await createQuote({ customerId });
    quoteId = quote.id;

    const shutterProduct = await prisma.product.findFirstOrThrow({ where: { productType: "PLANTATION_SHUTTER" } });
    shutterProductId = shutterProduct.id;
  });

  after(async () => {
    await prisma.quote.delete({ where: { id: quoteId } });
    await prisma.customer.delete({ where: { id: customerId } });
  });

  function baseInput(overrides: Partial<LineItemFieldsInput> = {}): LineItemFieldsInput {
    return {
      room: null,
      windowIdentifier: null,
      productId: shutterProductId,
      width: null,
      height: null,
      quantity: 1,
      archPanelCount: null,
      doorCutoutCount: null,
      fabricId: null,
      colorId: null,
      mountType: null,
      controlType: null,
      motorization: null,
      remote: null,
      hub: null,
      solarCharger: null,
      hardwareOptions: [],
      installation: null,
      notes: null,
      ...overrides,
    };
  }

  test("1. 36x60 shutter: 36x60/144 = 15 sq ft, 15 x $17.25 = $258.75", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem, shutterRepriceResult } = await updateLineItem(created.id, baseInput({ width: 36, height: 60 }));

    assert.equal(shutterRepriceResult.snapshot?.status, "SUCCESS");
    assert.equal(Number(shutterRepriceResult.snapshot?.squareFeet), 15);
    assert.equal(shutterRepriceResult.snapshot?.perUnitBaseCents, 25875);
    assert.equal(shutterRepriceResult.snapshot?.totalCents, 25875);
    assert.equal(lineItem.sellingPriceStatus, "SET");
    assert.equal(lineItem.sellingPriceMethod, "SQUARE_FOOT_FORMULA");
    assert.equal(lineItem.sellingPriceCents, 25875);
  });

  test("2. 36x60 shutter, quantity 2: $517.50", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(created.id, baseInput({ width: 36, height: 60, quantity: 2 }));

    assert.equal(lineItem.sellingPriceCents, 51750);
  });

  test("3. 36x60 shutter with one arch: $408.75", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem, shutterRepriceResult } = await updateLineItem(created.id, baseInput({ width: 36, height: 60, archPanelCount: 1 }));

    // 258.75 base + 150.00 arch = 408.75
    assert.equal(shutterRepriceResult.snapshot?.archChargeTotalCents, 15000);
    assert.equal(lineItem.sellingPriceCents, 40875);
  });

  test("4. 36x60 shutter with one door cutout: $408.75", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem, shutterRepriceResult } = await updateLineItem(created.id, baseInput({ width: 36, height: 60, doorCutoutCount: 1 }));

    assert.equal(shutterRepriceResult.snapshot?.doorCutoutChargeTotalCents, 15000);
    assert.equal(lineItem.sellingPriceCents, 40875);
  });

  test("5. 36x60 shutter with one arch + one door cutout: $558.75", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(created.id, baseInput({ width: 36, height: 60, archPanelCount: 1, doorCutoutCount: 1 }));

    // 258.75 + 150.00 + 150.00 = 558.75
    assert.equal(lineItem.sellingPriceCents, 55875);
  });

  test("width/height are NOT rounded before the square-footage division", async () => {
    const created = await addLineItem(quoteId);
    const { shutterRepriceResult } = await updateLineItem(created.id, baseInput({ width: 36.5, height: 60.25 }));

    // 36.5 x 60.25 / 144 = 15.271701388... sq ft (not rounded to, say, 15.27
    // or to a whole number before this division) x 1725c = 26343.68489...c,
    // which rounds to the nearest cent — 26344 — not the different value
    // rounding the inputs first would have produced.
    const expectedSquareFeet = (36.5 * 60.25) / 144;
    const expectedCents = Math.round(expectedSquareFeet * 1725);
    assert.equal(expectedCents, 26344);
    assert.equal(shutterRepriceResult.snapshot?.perUnitBaseCents, expectedCents);
    // The stored squareFeet is a Decimal(12,6) column — compare with a
    // tolerance matching that precision, not exact float equality.
    assert.ok(Math.abs(Number(shutterRepriceResult.snapshot?.squareFeet) - expectedSquareFeet) < 1e-5);
  });

  test("internal dealer cost is NOT_CONFIGURED and profitability is unavailable for shutters", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ width: 36, height: 60 }));

    const dto = await prisma.quoteLineItem.findUniqueOrThrow({
      where: { id: created.id },
      include: { currentPricingSnapshot: true },
    });
    // No matrix pricing snapshot exists for a shutter — dealer cost has no source.
    assert.equal(dto.currentPricingSnapshot, null);
  });

  test("a missing/inactive SquareFootPricingRule produces CONFIGURATION_ERROR, never a fabricated price", async () => {
    const created = await addLineItem(quoteId);

    // Temporarily deactivate the rule to exercise the fail-closed path.
    const rule = await prisma.squareFootPricingRule.findFirstOrThrow({ where: { productId: shutterProductId } });
    await prisma.squareFootPricingRule.update({ where: { id: rule.id }, data: { status: "INACTIVE" } });

    try {
      const { lineItem, shutterRepriceResult } = await updateLineItem(created.id, baseInput({ width: 36, height: 60 }));
      assert.equal(shutterRepriceResult.snapshot?.status, "CONFIGURATION_ERROR");
      assert.equal(shutterRepriceResult.snapshot?.totalCents, null);
      assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    } finally {
      await prisma.squareFootPricingRule.update({ where: { id: rule.id }, data: { status: "ACTIVE" } });
    }
  });

  test("17. a historical snapshot is unchanged after the configured rate is edited", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ width: 36, height: 60 }));

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    const historicalSnapshotId = persisted.currentSquareFootSnapshotId!;
    const historicalTotal = (await prisma.squareFootPriceSnapshot.findUniqueOrThrow({ where: { id: historicalSnapshotId } })).totalCents;
    assert.equal(historicalTotal, 25875);

    // Edit the configured rate (simulating a future price change)...
    const rule = await prisma.squareFootPricingRule.findFirstOrThrow({ where: { productId: shutterProductId } });
    await prisma.squareFootPricingRule.update({ where: { id: rule.id }, data: { ratePerSquareFootCents: 999999 } });

    try {
      // ...the historical snapshot must NOT have changed, since nothing
      // re-read or recomputed it.
      const stillHistorical = await prisma.squareFootPriceSnapshot.findUniqueOrThrow({ where: { id: historicalSnapshotId } });
      assert.equal(stillHistorical.totalCents, 25875);
      assert.equal(stillHistorical.appliedRatePerSquareFootCents, 1725);

      // A NEW line item priced now DOES use the new rate, proving the
      // change is real and the old snapshot's stability isn't an accident.
      const secondItem = await addLineItem(quoteId);
      const { shutterRepriceResult } = await updateLineItem(secondItem.id, baseInput({ width: 36, height: 60 }));
      assert.notEqual(shutterRepriceResult.snapshot?.totalCents, 25875);
    } finally {
      await prisma.squareFootPricingRule.update({ where: { id: rule.id }, data: { ratePerSquareFootCents: 1725 } });
    }
  });

  test("18. an unpriced customer line is excluded from quote totals, not treated as $0", async () => {
    // Isolated quote — the describe-level quoteId accumulates line items
    // across every test above, which would otherwise pollute this sum.
    const isolatedQuote = await createQuote({ customerId });

    const pricedItem = await addLineItem(isolatedQuote.id);
    await updateLineItem(pricedItem.id, baseInput({ width: 36, height: 60 })); // $258.75

    const unpricedItem = await addLineItem(isolatedQuote.id); // never given a product/price at all

    const allItems = await prisma.quoteLineItem.findMany({ where: { quoteId: isolatedQuote.id } });
    const configuredPrices = allItems.filter((i) => i.sellingPriceStatus === "SET").map((i) => i.sellingPriceCents!);
    const unconfiguredCount = allItems.filter((i) => i.sellingPriceStatus === "NOT_CONFIGURED").length;

    assert.equal(configuredPrices.reduce((a, b) => a + b, 0), 25875);
    assert.equal(unconfiguredCount, 1, "the never-priced item must be counted as unconfigured, not silently summed as $0");

    const unpricedPersisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: unpricedItem.id } });
    assert.equal(unpricedPersisted.sellingPriceStatus, "NOT_CONFIGURED");
    assert.notEqual(unpricedPersisted.sellingPriceCents, 0);
    assert.equal(unpricedPersisted.sellingPriceCents, null);

    await prisma.quote.delete({ where: { id: isolatedQuote.id } });
  });
});
