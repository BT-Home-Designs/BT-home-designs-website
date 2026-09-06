import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { getKnownAddOnCostsCents } from "./fixedPriceOptions";
import { resolveSellingPriceRuleForProduct } from "./sellingPrice";

async function getOption(name: string) {
  return prisma.fixedPriceOption.findUniqueOrThrow({ where: { name } });
}

describe("approved BT Home Designs fixed-price accessories and labor", () => {
  test("6. Acmeda rechargeable motorization = $175.00", async () => {
    const option = await getOption("Acmeda Rechargeable Motorization");
    assert.equal(option.costCents, 17500);
    assert.equal(option.status, "ACTIVE");
  });

  test("7. 5-channel remote = $75.00", async () => {
    const option = await getOption("5-Channel Remote");
    assert.equal(option.costCents, 7500);
    assert.equal(option.status, "ACTIVE");
  });

  test("8. 15-channel remote = $95.00", async () => {
    const option = await getOption("15-Channel Remote");
    assert.equal(option.costCents, 9500);
    assert.equal(option.status, "ACTIVE");
  });

  test("9. Solar charger = $110.00", async () => {
    const option = await getOption("Solar Charger");
    assert.equal(option.costCents, 11000);
    assert.equal(option.status, "ACTIVE");
  });

  test("10. Hub = $200.00", async () => {
    const option = await getOption("Hub");
    assert.equal(option.costCents, 20000);
    assert.equal(option.status, "ACTIVE");
  });

  test("11. Base labor = $75.00", async () => {
    const option = await getOption("Base Installation");
    assert.equal(option.costCents, 7500);
    assert.equal(option.status, "ACTIVE");
  });

  test("12. Motorized labor add-on = $45.00", async () => {
    const option = await getOption("Motorized Installation Add-On");
    assert.equal(option.costCents, 4500);
    assert.equal(option.status, "ACTIVE");
  });

  test("13. Cordless labor add-on = $25.00", async () => {
    const option = await getOption("Cordless Installation Add-On");
    assert.equal(option.costCents, 2500);
    assert.equal(option.status, "ACTIVE");
  });

  test("all 8 approved ACTIVE accessory/labor options are usable by an automatic calculation", async () => {
    const known = await getKnownAddOnCostsCents();
    assert.equal(known.get("Acmeda Rechargeable Motorization"), 17500);
    assert.equal(known.get("5-Channel Remote"), 7500);
    assert.equal(known.get("15-Channel Remote"), 9500);
    assert.equal(known.get("Solar Charger"), 11000);
    assert.equal(known.get("Hub"), 20000);
    assert.equal(known.get("Base Installation"), 7500);
    assert.equal(known.get("Motorized Installation Add-On"), 4500);
    assert.equal(known.get("Cordless Installation Add-On"), 2500);
  });
});

describe("records intentionally NOT active yet", () => {
  test("14. the $60 roller-shade cordless upgrade is PENDING_VERIFICATION and never auto-applies", async () => {
    const option = await getOption("Cordless Upgrade (Roller Shade)");
    assert.equal(option.costCents, 6000);
    assert.equal(option.status, "PENDING_VERIFICATION");

    // The mechanism that actually protects a real quote: a
    // PENDING_VERIFICATION option is excluded from the known-costs map
    // used by the composite cost calculation.
    const known = await getKnownAddOnCostsCents();
    assert.equal(known.has("Cordless Upgrade (Roller Shade)"), false);
  });

});

describe("installer trip-minimum — additive formula confirmed and ACTIVE (Phase 7)", () => {
  test("the installation trip-minimum rule holds the approved numbers and is now ACTIVE", async () => {
    const rule = await prisma.installationTripMinimumRule.findFirstOrThrow();
    assert.equal(rule.minimumChargeCents, 12500);
    assert.equal(rule.qualifiesUnderShadeCount, 5);
    assert.equal(rule.status, "ACTIVE");
  });
});

describe("products deliberately kept manual / not configured", () => {
  test("15. Faux Wood Blinds has no pricing rule and stays MANUAL / NOT CONFIGURED", async () => {
    const product = await prisma.product.findFirstOrThrow({ where: { productType: "FAUX_WOOD_BLIND" } });
    assert.equal(product.defaultPricingStrategyType, "MANUAL_PRICE");

    const sellingRule = await resolveSellingPriceRuleForProduct(product.id);
    assert.equal(sellingRule, null);

    const squareFootRule = await prisma.squareFootPricingRule.findUnique({ where: { productId: product.id } });
    assert.equal(squareFootRule, null);
  });

  test("16. Roller Shade / Neolux automatic customer selling price remains NOT_CONFIGURED (no SellingPriceRule seeded)", async () => {
    const rollerShade = await prisma.product.findFirstOrThrow({ where: { productType: "ROLLER_SHADE" } });
    const neolux = await prisma.product.findFirstOrThrow({ where: { productType: "NEOLUX" } });

    assert.equal(await resolveSellingPriceRuleForProduct(rollerShade.id), null);
    assert.equal(await resolveSellingPriceRuleForProduct(neolux.id), null);
  });
});
