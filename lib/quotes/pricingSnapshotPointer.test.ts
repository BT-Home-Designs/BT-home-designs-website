import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem } from "./lineItems";

/**
 * Dedicated coverage for QuoteLineItem.currentPricingSnapshotId — the
 * explicit pointer added to replace the derived "latest snapshot" lookup.
 * See lib/quotes/pricing.ts for the state machine this exercises.
 */
describe("currentPricingSnapshotId pointer", () => {
  let customerId: string;
  let quoteId: string;
  let rollerShadeProductId: string;
  let vx3000FabricId: string;
  let sanctuaryBlackoutFabricId: string;

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Snapshot Pointer" });
    customerId = customer.id;
    const quote = await createQuote({ customerId });
    quoteId = quote.id;

    const rollerShade = await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } });
    rollerShadeProductId = rollerShade.id;
    const vx3000 = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "VX 3000-3%" } });
    vx3000FabricId = vx3000.id;
    const sanctuaryBlackout = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "SANCTUARY BLACKOUT" } });
    sanctuaryBlackoutFabricId = sanctuaryBlackout.id;
  });

  after(async () => {
    await prisma.quote.delete({ where: { id: quoteId } });
    await prisma.customer.delete({ where: { id: customerId } });
  });

  function baseInput(overrides: Partial<Parameters<typeof updateLineItem>[1]> = {}) {
    return {
      room: null,
      windowIdentifier: null,
      productId: null,
      width: null,
      height: null,
      quantity: 1,
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

  test("1. currentPricingSnapshotId points to the newest successful price", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.equal(persisted.currentPricingSnapshotId, repriceResult.snapshot?.id);

    const pointedSnapshot = await prisma.pricingSnapshot.findUniqueOrThrow({ where: { id: persisted.currentPricingSnapshotId! } });
    assert.equal(pointedSnapshot.pricingStatus, "SUCCESS");
    assert.equal(pointedSnapshot.retailCents, 10800);
  });

  test("2. a pricing-input change moves the pointer to a new snapshot, not a stale one", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult: first } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );
    const firstSnapshotId = first.snapshot!.id;

    const { repriceResult: second } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: sanctuaryBlackoutFabricId, width: 42, height: 74 })
    );
    const secondSnapshotId = second.snapshot!.id;

    assert.notEqual(secondSnapshotId, firstSnapshotId);

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.equal(persisted.currentPricingSnapshotId, secondSnapshotId);
    assert.notEqual(persisted.currentPricingSnapshotId, firstSnapshotId);
  });

  test("clearing the fabric (pricing not attempted) nulls the pointer rather than leaving it stale", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 }));

    let persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.notEqual(persisted.currentPricingSnapshotId, null);

    // Clear the fabric — pricing can no longer be attempted for this item.
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: null, width: 30, height: 40 }));

    persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.equal(persisted.currentPricingSnapshotId, null);
  });

  test("3. historical snapshots remain intact after the pointer moves", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult: first } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: sanctuaryBlackoutFabricId, width: 42, height: 74 }));

    // The first snapshot must still exist, unmodified, even though the
    // pointer has moved on and it's no longer "current".
    const stillThere = await prisma.pricingSnapshot.findUnique({ where: { id: first.snapshot!.id } });
    assert.ok(stillThere);
    assert.equal(stillThere?.sourceFabricName, "VX 3000-3%");
    assert.equal(stillThere?.retailCents, 10800);

    const allSnapshots = await prisma.pricingSnapshot.findMany({ where: { quoteLineItemId: created.id } });
    assert.equal(allSnapshots.length, 2);
  });

  test("4. failed repricing does not leave the pointer on the old successful snapshot", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult: success } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );
    assert.equal(success.snapshot?.pricingStatus, "SUCCESS");
    const successSnapshotId = success.snapshot!.id;

    // Same fabric, but now push the width out of matrix range.
    const { repriceResult: failed } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 200, height: 40 })
    );
    assert.equal(failed.snapshot?.pricingStatus, "OUT_OF_MATRIX_RANGE");

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.notEqual(persisted.currentPricingSnapshotId, successSnapshotId);
    assert.equal(persisted.currentPricingSnapshotId, failed.snapshot!.id);

    // The old successful snapshot is still there in history, just no
    // longer pointed at as current.
    const oldSuccess = await prisma.pricingSnapshot.findUnique({ where: { id: successSnapshotId } });
    assert.equal(oldSuccess?.pricingStatus, "SUCCESS");
  });
});
