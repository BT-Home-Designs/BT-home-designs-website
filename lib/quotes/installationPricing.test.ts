import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem, type LineItemFieldsInput } from "./lineItems";
import { calculateQuoteInstallerMinimum } from "./installationPricing";

describe("quote-level installer minimum trip fee — additive (docs/business-rules.md)", () => {
  let customerId: string;
  let rollerShadeProductId: string;
  let vx3000FabricId: string;

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Installer Minimum" });
    customerId = customer.id;
    rollerShadeProductId = (await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } })).id;
    vx3000FabricId = (await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "VX 3000-3%" } })).id;
  });

  after(async () => {
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

  test("job with 2 shades (under 5): the fee applies, $125 -> Cash Price $218.75 via the standard formula", async () => {
    const quote = await createQuote({ customerId });
    try {
      const item1 = await addLineItem(quote.id);
      await updateLineItem(item1.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40, quantity: 2 }));

      const result = await calculateQuoteInstallerMinimum(quote.id);
      assert.equal(result.shadeCount, 2);
      assert.equal(result.applies, true);
      assert.equal(result.minimumChargeCents, 12500);
      assert.equal(result.cashPriceCents, 21875); // 12500 x 1.75
      assert.equal(result.creditCardPriceCents, Math.round(21875 * 1.06));
    } finally {
      await prisma.quote.delete({ where: { id: quote.id } });
    }
  });

  test("job with 5+ shades: does not qualify, no fee", async () => {
    const quote = await createQuote({ customerId });
    try {
      const item1 = await addLineItem(quote.id);
      await updateLineItem(item1.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40, quantity: 5 }));

      const result = await calculateQuoteInstallerMinimum(quote.id);
      assert.equal(result.shadeCount, 5);
      assert.equal(result.applies, false);
      assert.equal(result.cashPriceCents, null);
    } finally {
      await prisma.quote.delete({ where: { id: quote.id } });
    }
  });

  test("empty quote (0 shades): the literal rule (0 < 5) still applies", async () => {
    const quote = await createQuote({ customerId });
    try {
      const result = await calculateQuoteInstallerMinimum(quote.id);
      assert.equal(result.shadeCount, 0);
      assert.equal(result.applies, true);
      assert.equal(result.cashPriceCents, 21875);
    } finally {
      await prisma.quote.delete({ where: { id: quote.id } });
    }
  });

  test("rule INACTIVE: never applies, regardless of shade count", async () => {
    const rule = await prisma.installationTripMinimumRule.findFirstOrThrow();
    await prisma.installationTripMinimumRule.update({ where: { id: rule.id }, data: { status: "INACTIVE" } });
    const quote = await createQuote({ customerId });
    try {
      const item1 = await addLineItem(quote.id);
      await updateLineItem(item1.id, baseInput({ fabricId: vx3000FabricId, width: 30, height: 40, quantity: 1 }));

      const result = await calculateQuoteInstallerMinimum(quote.id);
      assert.equal(result.applies, false);
    } finally {
      await prisma.quote.delete({ where: { id: quote.id } });
      await prisma.installationTripMinimumRule.update({ where: { id: rule.id }, data: { status: "ACTIVE" } });
    }
  });
});
