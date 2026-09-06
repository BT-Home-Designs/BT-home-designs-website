import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem, duplicateLineItem, deleteLineItem, reorderLineItem, listLineItemsForQuote } from "./lineItems";

describe("line items — CRUD, ordering, and pricing integration", () => {
  let customerId: string;
  let quoteId: string;
  let rollerShadeProductId: string;
  let neoluxProductId: string;
  let vx3000FabricId: string;
  let sanctuaryBlackoutFabricId: string;
  let neoluxSundownFabricId: string;

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Line Items" });
    customerId = customer.id;
    const quote = await createQuote({ customerId });
    quoteId = quote.id;

    const rollerShade = await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } });
    rollerShadeProductId = rollerShade.id;
    const neolux = await prisma.product.findFirstOrThrow({ where: { productType: "NEOLUX" } });
    neoluxProductId = neolux.id;

    const vx3000 = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "VX 3000-3%" } });
    vx3000FabricId = vx3000.id;
    const sanctuaryBlackout = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "SANCTUARY BLACKOUT" } });
    sanctuaryBlackoutFabricId = sanctuaryBlackout.id;
    const neoluxSundown = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "NEOLUX SUNDOWN DIM OUT" } });
    neoluxSundownFabricId = neoluxSundown.id;
  });

  after(async () => {
    await prisma.quote.delete({ where: { id: quoteId } }); // cascades line items + their snapshots
    await prisma.customer.delete({ where: { id: customerId } });
  });

  function baseInput(overrides: Partial<Parameters<typeof updateLineItem>[1]> = {}) {
    return {
      room: "Living Room",
      windowIdentifier: "W1",
      productId: null,
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

  test("3. add + save a line item persists its fields", async () => {
    const created = await addLineItem(quoteId);
    assert.equal(created.quoteId, quoteId);

    const { lineItem } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40, room: "Kitchen" })
    );

    assert.equal(lineItem.room, "Kitchen");
    assert.equal(lineItem.productId, rollerShadeProductId);
    assert.equal(lineItem.fabricId, vx3000FabricId);
    assert.equal(lineItem.width?.toString(), "30");
    assert.equal(lineItem.height?.toString(), "40");
  });

  test("9. successful matrix pricing is persisted to PricingSnapshot", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    assert.equal(repriceResult.attempted, true);
    assert.ok(repriceResult.snapshot);
    assert.equal(repriceResult.snapshot?.pricingStatus, "SUCCESS");
    assert.equal(repriceResult.snapshot?.retailCents, 10800);
    assert.equal(repriceResult.snapshot?.dealerCostCents, 8640);
    assert.equal(repriceResult.snapshot?.dealerMultiplierBps, 8000);

    const persisted = await prisma.pricingSnapshot.findMany({ where: { quoteLineItemId: created.id } });
    assert.equal(persisted.length, 1);
  });

  test("10. failed pricing (out of range) never persists a fake $0 price", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 200, height: 40 })
    );

    assert.equal(repriceResult.snapshot?.pricingStatus, "OUT_OF_MATRIX_RANGE");
    assert.equal(repriceResult.snapshot?.retailCents, null);
    assert.equal(repriceResult.snapshot?.dealerCostCents, null);
    assert.notEqual(repriceResult.snapshot?.retailCents, 0);
  });

  test("11. Group E H74/W42 warning reaches the persisted snapshot", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: sanctuaryBlackoutFabricId, width: 42, height: 74 })
    );

    assert.equal(repriceResult.snapshot?.pricingStatus, "SUCCESS");
    assert.equal(repriceResult.snapshot?.retailCents, 26400);
    assert.equal(repriceResult.snapshot?.dealerCostCents, 21120);
    assert.ok(repriceResult.snapshot?.warnings.includes("SOURCE DATA WARNING: H74/W42 VALUE SHOULD BE HUMAN-VERIFIED"));
  });

  test("12. selling price remains NOT_CONFIGURED after creation and after pricing", async () => {
    const created = await addLineItem(quoteId);
    assert.equal(created.sellingPriceStatus, "NOT_CONFIGURED");
    assert.equal(created.sellingPriceCents, null);

    const { lineItem } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    assert.equal(lineItem.sellingPriceCents, null);
  });

  test("Neolux line items price through the same engine as Roller Shade", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: neoluxProductId, fabricId: neoluxSundownFabricId, width: 140, height: 190 })
    );

    assert.equal(repriceResult.snapshot?.pricingStatus, "SUCCESS");
    assert.equal(repriceResult.snapshot?.productType, "NEOLUX");
    assert.equal(repriceResult.snapshot?.retailCents, 105800);
    assert.equal(repriceResult.snapshot?.dealerCostCents, 84640);
  });

  test("re-saving with unchanged pricing inputs does not create a duplicate snapshot", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40, room: "First save" }));
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40, room: "Second save, same pricing inputs" }));

    const snapshots = await prisma.pricingSnapshot.findMany({ where: { quoteLineItemId: created.id } });
    assert.equal(snapshots.length, 1);
  });

  test("changing the fabric creates a new snapshot without deleting the old one", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 }));
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: sanctuaryBlackoutFabricId, width: 30, height: 40 }));

    const snapshots = await prisma.pricingSnapshot.findMany({
      where: { quoteLineItemId: created.id },
      orderBy: { createdAt: "asc" },
    });
    assert.equal(snapshots.length, 2);
    assert.equal(snapshots[0].sourceFabricName, "VX 3000-3%");
    assert.equal(snapshots[1].sourceFabricName, "SANCTUARY BLACKOUT");
  });

  test("4. duplicating a line item copies its fields and prices independently", async () => {
    const original = await addLineItem(quoteId);
    await updateLineItem(
      original.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40, room: "Original Room" })
    );

    const copy = await duplicateLineItem(original.id);
    assert.notEqual(copy.id, original.id);
    assert.equal(copy.room, "Original Room");
    assert.equal(copy.fabricId, vx3000FabricId);
    assert.equal(copy.sortOrder, original.sortOrder + 1);

    const copySnapshots = await prisma.pricingSnapshot.findMany({ where: { quoteLineItemId: copy.id } });
    assert.equal(copySnapshots.length, 1);
    assert.equal(copySnapshots[0].retailCents, 10800);
  });

  test("5. deleting a line item removes it (and its snapshots)", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 }));

    await deleteLineItem(created.id);

    const found = await prisma.quoteLineItem.findUnique({ where: { id: created.id } });
    assert.equal(found, null);
    const orphanSnapshots = await prisma.pricingSnapshot.findMany({ where: { quoteLineItemId: created.id } });
    assert.equal(orphanSnapshots.length, 0);
  });

  test("6. reordering swaps sortOrder with the neighbor and no-ops at the boundary", async () => {
    // Isolated quote so this test's ordering assertions aren't affected by
    // line items created in other tests within this file.
    const orderingQuote = await createQuote({ customerId });
    const first = await addLineItem(orderingQuote.id);
    const second = await addLineItem(orderingQuote.id);
    const third = await addLineItem(orderingQuote.id);

    await reorderLineItem(second.id, "up");
    let ordered = await listLineItemsForQuote(orderingQuote.id);
    assert.deepEqual(ordered.map((i) => i.id), [second.id, first.id, third.id]);

    await reorderLineItem(second.id, "up"); // already at the top — no-op
    ordered = await listLineItemsForQuote(orderingQuote.id);
    assert.deepEqual(ordered.map((i) => i.id), [second.id, first.id, third.id]);

    await reorderLineItem(third.id, "down"); // already at the bottom — no-op
    ordered = await listLineItemsForQuote(orderingQuote.id);
    assert.deepEqual(ordered.map((i) => i.id), [second.id, first.id, third.id]);

    await prisma.quote.delete({ where: { id: orderingQuote.id } });
  });
});
