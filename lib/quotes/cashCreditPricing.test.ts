import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem, type LineItemFieldsInput } from "./lineItems";

describe("general cash/credit-card customer pricing formula (docs/business-rules.md)", () => {
  let customerId: string;
  let quoteId: string;
  let rollerShadeProductId: string;
  let shutterProductId: string;
  let vx3000FabricId: string;

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Cash/Credit Pricing" });
    customerId = customer.id;
    const quote = await createQuote({ customerId });
    quoteId = quote.id;

    rollerShadeProductId = (await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } })).id;
    shutterProductId = (await prisma.product.findFirstOrThrow({ where: { productType: "PLANTATION_SHUTTER" } })).id;
    vx3000FabricId = (await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "VX 3000-3%" } })).id;
  });

  after(async () => {
    await prisma.quote.delete({ where: { id: quoteId } });
    await prisma.customer.delete({ where: { id: customerId } });
  });

  function baseInput(overrides: Partial<LineItemFieldsInput> = {}): LineItemFieldsInput {
    return {
      room: null,
      windowIdentifier: null,
      productId: rollerShadeProductId,
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

  test("Cost of Goods only (no labor requested): Cash Price = dealer cost x 1.75, Labor is 0 (known), not NOT_CONFIGURED", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));

    const snapshot = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({
      where: { id: (await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } })).currentCashCreditSnapshotId! },
    });

    assert.equal(snapshot.status, "SUCCESS");
    assert.equal(snapshot.costOfGoodsCents, 8640);
    assert.equal(snapshot.laborCents, 0);
    assert.equal(snapshot.totalInternalCostCents, 8640);
    assert.equal(snapshot.markupAmountCents, 6480); // 8640 x 0.75
    assert.equal(snapshot.cashPriceCents, 15120); // 8640 x 1.75
    assert.equal(snapshot.creditCardFeeCents, 907); // round(15120 x 0.06) = round(907.2)
    assert.equal(snapshot.creditCardPriceCents, 16027);

    assert.equal(lineItem.sellingPriceStatus, "SET");
    assert.equal(lineItem.sellingPriceCents, 15120);
    assert.equal(lineItem.sellingPriceMethod, "CASH_CREDIT_FORMULA");
  });

  test("Cost of Goods (dealer cost + motorization accessory) + Labor (base + motorized install add-on) combine correctly", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(
      created.id,
      baseInput({
        fabricId: vx3000FabricId,
        width: 30,
        height: 40,
        motorization: "Acmeda Rechargeable Motorization", // $175.00 -> Cost of Goods
        installation: "Installation", // triggers Base Installation ($75) + Motorized Add-On ($45) -> Labor
      })
    );

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    const snapshot = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: persisted.currentCashCreditSnapshotId! } });

    assert.equal(snapshot.costOfGoodsCents, 8640 + 17500); // dealer cost + motorization
    assert.equal(snapshot.laborCents, 7500 + 4500); // base + motorized add-on
    assert.equal(snapshot.totalInternalCostCents, 8640 + 17500 + 7500 + 4500);
    assert.equal(snapshot.cashPriceCents, Math.round(snapshot.totalInternalCostCents! * 1.75));
    assert.equal(lineItem.sellingPriceCents, snapshot.cashPriceCents);
  });

  test("cordless installation add-on is included in Labor when controlType mentions cordless", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(
      created.id,
      baseInput({ fabricId: vx3000FabricId, width: 30, height: 40, installation: "Installation", controlType: "Cordless" })
    );

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    const snapshot = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: persisted.currentCashCreditSnapshotId! } });
    assert.equal(snapshot.laborCents, 7500 + 2500); // base + cordless add-on
  });

  test("an unpriced (PENDING_VERIFICATION / unknown) requested accessory makes the whole cost basis NOT_CONFIGURED, never partially summed", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));

    // Bypass the UI's dropdown constraint to simulate a requested add-on
    // that isn't ACTIVE-priced (e.g. the PENDING_VERIFICATION cordless
    // roller-shade upgrade, or any unrecognized name).
    await prisma.quoteLineItem.update({ where: { id: created.id }, data: { motorization: "Cordless Upgrade (Roller Shade)" } });
    const { lineItem } = await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40, motorization: "Cordless Upgrade (Roller Shade)" }));

    assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    assert.equal(lineItem.sellingPriceCents, null);
    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    const snapshot = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: persisted.currentCashCreditSnapshotId! } });
    assert.equal(snapshot.status, "NOT_CONFIGURED");
    assert.equal(snapshot.costOfGoodsCents, null);
    assert.notEqual(snapshot.costOfGoodsCents, 0);
  });

  test("no ACTIVE CashCreditPricingConfig -> NOT_CONFIGURED, never an invented rate", async () => {
    const config = await prisma.cashCreditPricingConfig.findFirstOrThrow();
    await prisma.cashCreditPricingConfig.update({ where: { id: config.id }, data: { status: "INACTIVE" } });

    try {
      const created = await addLineItem(quoteId);
      const { lineItem } = await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));
      assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    } finally {
      await prisma.cashCreditPricingConfig.update({ where: { id: config.id }, data: { status: "ACTIVE" } });
    }
  });

  test("Plantation Shutter COGS (square-foot engine) flows through the SAME cash/credit formula as Roller/Neolux dealer cost", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(
      created.id,
      baseInput({ productId: shutterProductId, fabricId: null, width: 36, height: 60 })
    );

    // COGS 25875 (36x60 shutter, no arch/cutout), Labor 0 (no installation
    // field on the shutter UI) -> Cash Price = round(25875 x 1.75) = 45281.
    assert.equal(lineItem.sellingPriceMethod, "CASH_CREDIT_FORMULA");
    assert.equal(lineItem.sellingPriceCents, 45281);
    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.notEqual(persisted.currentCashCreditSnapshotId, null);
    const snapshot = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: persisted.currentCashCreditSnapshotId! } });
    assert.equal(snapshot.costOfGoodsCents, 25875);
    assert.equal(snapshot.laborCents, 0);
  });

  test("a manual selling price is never overwritten by the cash/credit formula on a later reprice", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));
    const user = await prisma.internalUser.findFirstOrThrow();
    await prisma.quoteLineItem.update({
      where: { id: created.id },
      data: {
        sellingPriceStatus: "SET",
        sellingPriceCents: 99900,
        sellingPriceMethod: "MANUAL",
        sellingPriceSetById: user.id,
        sellingPriceSetAt: new Date(),
        sellingPriceReason: "Test manual override.",
      },
    });

    const { lineItem } = await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 36, height: 40 }));
    assert.equal(lineItem.sellingPriceMethod, "MANUAL");
    assert.equal(lineItem.sellingPriceCents, 99900);
  });

  test("historical snapshot is unchanged after the approved markup/card-fee rate is edited", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));
    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    const historicalSnapshotId = persisted.currentCashCreditSnapshotId!;
    const historicalCashPrice = (await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: historicalSnapshotId } })).cashPriceCents;
    assert.equal(historicalCashPrice, 15120);

    const config = await prisma.cashCreditPricingConfig.findFirstOrThrow();
    await prisma.cashCreditPricingConfig.update({ where: { id: config.id }, data: { markupBps: 10000 } }); // simulate a future rate change

    try {
      const stillHistorical = await prisma.cashCreditPriceSnapshot.findUniqueOrThrow({ where: { id: historicalSnapshotId } });
      assert.equal(stillHistorical.cashPriceCents, 15120);
      assert.equal(stillHistorical.appliedMarkupBps, 7500);

      const secondItem = await addLineItem(quoteId);
      const { lineItem: secondLineItem } = await updateLineItem(secondItem.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40 }));
      assert.notEqual(secondLineItem.sellingPriceCents, 15120); // picks up the new rate
    } finally {
      await prisma.cashCreditPricingConfig.update({ where: { id: config.id }, data: { markupBps: 7500 } });
    }
  });
});
