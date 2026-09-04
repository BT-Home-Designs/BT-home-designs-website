import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { createCustomer } from "./customers";
import { createQuote } from "./quotes";
import { addLineItem, updateLineItem } from "./lineItems";
import { setManualSellingPrice, resolveSellingPriceRuleForProduct } from "./sellingPrice";

describe("selling price — resolution, manual override, and cost isolation", () => {
  let customerId: string;
  let quoteId: string;
  let rollerShadeProductId: string;
  let vx3000FabricId: string;
  let internalUserId: string;
  let createdRuleIds: string[] = [];

  before(async () => {
    const customer = await createCustomer({ name: "Test Customer — Selling Price" });
    customerId = customer.id;
    const quote = await createQuote({ customerId });
    quoteId = quote.id;

    const rollerShade = await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } });
    rollerShadeProductId = rollerShade.id;
    const vx3000 = await prisma.fabric.findUniqueOrThrow({ where: { normalizedName: "VX 3000-3%" } });
    vx3000FabricId = vx3000.id;

    const user = await prisma.internalUser.findFirstOrThrow();
    internalUserId = user.id;
  });

  after(async () => {
    await prisma.sellingPriceRule.deleteMany({ where: { id: { in: createdRuleIds } } });
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

  test("5. selling price remains NOT_CONFIGURED when no rule exists for the product", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    assert.equal(lineItem.sellingPriceCents, null);
    assert.equal(lineItem.sellingPriceMethod, null);
  });

  test("22. dealer cost never automatically becomes the customer selling price", async () => {
    const created = await addLineItem(quoteId);
    const { lineItem, repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    // Dealer cost WAS computed successfully...
    assert.equal(repriceResult.snapshot?.dealerCostCents, 8640);
    // ...but selling price is still not configured, and specifically is
    // never silently set to that dealer-cost value (or vendor retail).
    assert.equal(lineItem.sellingPriceStatus, "NOT_CONFIGURED");
    assert.equal(lineItem.sellingPriceCents, null);
    assert.notEqual(lineItem.sellingPriceCents, repriceResult.snapshot?.dealerCostCents);
    assert.notEqual(lineItem.sellingPriceCents, repriceResult.snapshot?.retailCents);
  });

  test("6. a manual selling price persists separately from dealer cost, with who/when/why recorded", async () => {
    const created = await addLineItem(quoteId);
    const { repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );
    const dealerCostBefore = repriceResult.snapshot?.dealerCostCents;

    const updated = await setManualSellingPrice({
      lineItemId: created.id,
      sellingPriceCents: 20000,
      setByUserId: internalUserId,
      reason: "Customer negotiated a package discount at consultation.",
    });

    assert.equal(updated.sellingPriceStatus, "SET");
    assert.equal(updated.sellingPriceCents, 20000);
    assert.equal(updated.sellingPriceMethod, "MANUAL");
    assert.equal(updated.sellingPriceSetById, internalUserId);
    assert.ok(updated.sellingPriceSetAt);
    assert.equal(updated.sellingPriceReason, "Customer negotiated a package discount at consultation.");

    // The underlying pricing snapshot / dealer cost is completely untouched.
    const snapshotAfter = await prisma.pricingSnapshot.findUnique({ where: { id: repriceResult.snapshot!.id } });
    assert.equal(snapshotAfter?.dealerCostCents, dealerCostBefore);
  });

  test("a manual selling price is required to have a non-empty reason", async () => {
    const created = await addLineItem(quoteId);
    await assert.rejects(() =>
      setManualSellingPrice({ lineItemId: created.id, sellingPriceCents: 20000, setByUserId: internalUserId, reason: "   " })
    );
  });

  test("a manual price is never silently overwritten by a later automatic reprice", async () => {
    const created = await addLineItem(quoteId);
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 }));
    await setManualSellingPrice({ lineItemId: created.id, sellingPriceCents: 20000, setByUserId: internalUserId, reason: "Manual override for test." });

    // Re-save with a different (still valid) size — triggers a reprice and
    // an automatic-selling-price re-evaluation pass.
    await updateLineItem(created.id, baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 36, height: 40 }));

    const persisted = await prisma.quoteLineItem.findUniqueOrThrow({ where: { id: created.id } });
    assert.equal(persisted.sellingPriceMethod, "MANUAL");
    assert.equal(persisted.sellingPriceCents, 20000);
  });

  test("rule resolution: a product-scoped rule is picked up and applied automatically", async () => {
    const rule = await prisma.sellingPriceRule.create({
      data: { productId: rollerShadeProductId, ruleType: "MULTIPLIER", multiplierBps: 20000 }, // test-only value, not a real business rule
    });
    createdRuleIds.push(rule.id);

    const resolved = await resolveSellingPriceRuleForProduct(rollerShadeProductId);
    assert.equal(resolved?.id, rule.id);

    const created = await addLineItem(quoteId);
    const { lineItem, repriceResult } = await updateLineItem(
      created.id,
      baseInput({ productId: rollerShadeProductId, fabricId: vx3000FabricId, width: 30, height: 40 })
    );

    assert.equal(lineItem.sellingPriceStatus, "SET");
    assert.equal(lineItem.sellingPriceMethod, "MULTIPLIER");
    // dealer cost 8640 x 2.0 = 17280
    assert.equal(lineItem.sellingPriceCents, (repriceResult.snapshot!.dealerCostCents ?? 0) * 2);

    await prisma.sellingPriceRule.delete({ where: { id: rule.id } });
    createdRuleIds = createdRuleIds.filter((id) => id !== rule.id);
  });
});
