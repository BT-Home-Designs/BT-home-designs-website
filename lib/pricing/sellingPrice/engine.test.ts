import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { applySellingPriceRule } from "./engine";

describe("selling price engine — automatic rule arithmetic", () => {
  test("7. multiplier: cost 10000c x 1.5 -> 15000c", () => {
    const result = applySellingPriceRule({ ruleType: "MULTIPLIER", multiplierBps: 15000 }, 10000);
    assert.equal(result.status, "OK");
    assert.equal(result.sellingPriceCents, 15000);
  });

  test("8. markup percent: cost 10000c + 25% -> 12500c", () => {
    const result = applySellingPriceRule({ ruleType: "MARKUP_PERCENT", markupPercentBps: 2500 }, 10000);
    assert.equal(result.status, "OK");
    assert.equal(result.sellingPriceCents, 12500);
  });

  test("9. target margin: cost 8000c at 20% margin -> 10000c (verify (10000-8000)/10000=20%)", () => {
    const result = applySellingPriceRule({ ruleType: "TARGET_MARGIN", targetMarginBps: 2000 }, 8000);
    assert.equal(result.status, "OK");
    assert.equal(result.sellingPriceCents, 10000);
    const margin = (result.sellingPriceCents! - 8000) / result.sellingPriceCents!;
    assert.equal(margin, 0.2);
  });

  test("target margin >= 100% is a configuration error, not a computed price", () => {
    const result = applySellingPriceRule({ ruleType: "TARGET_MARGIN", targetMarginBps: 10000 }, 8000);
    assert.equal(result.status, "CONFIGURATION_ERROR");
    assert.equal(result.sellingPriceCents, null);
  });

  test("10. fixed selling-price rule ignores cost entirely", () => {
    const result = applySellingPriceRule({ ruleType: "FIXED_AMOUNT", fixedAmountCents: 9999 }, 500000);
    assert.equal(result.status, "OK");
    assert.equal(result.sellingPriceCents, 9999);
  });

  test("fixed selling-price rule works even with a null cost", () => {
    const result = applySellingPriceRule({ ruleType: "FIXED_AMOUNT", fixedAmountCents: 4200 }, null);
    assert.equal(result.status, "OK");
    assert.equal(result.sellingPriceCents, 4200);
  });

  test("11. safe integer-cent rounding: 333c x 1.0033 -> 334c (half-up on a single division)", () => {
    const result = applySellingPriceRule({ ruleType: "MULTIPLIER", multiplierBps: 10033 }, 333);
    assert.equal(result.status, "OK");
    // 333 * 10033 / 10000 = 334.0989 -> rounds to 334
    assert.equal(result.sellingPriceCents, 334);
  });

  test("rounding is deterministic at an exact .5 cent boundary (round-half-up)", () => {
    // 100 * 10050 / 10000 = 100.5 -> rounds up to 101 (Math.round half-up for positive numbers)
    const result = applySellingPriceRule({ ruleType: "MULTIPLIER", multiplierBps: 10050 }, 100);
    assert.equal(result.sellingPriceCents, 101);
  });

  test("22. a missing cost never silently becomes the selling price for cost-based rules", () => {
    const multiplier = applySellingPriceRule({ ruleType: "MULTIPLIER", multiplierBps: 15000 }, null);
    assert.equal(multiplier.status, "CONFIGURATION_ERROR");
    assert.equal(multiplier.sellingPriceCents, null);

    const markup = applySellingPriceRule({ ruleType: "MARKUP_PERCENT", markupPercentBps: 2500 }, null);
    assert.equal(markup.status, "CONFIGURATION_ERROR");

    const margin = applySellingPriceRule({ ruleType: "TARGET_MARGIN", targetMarginBps: 2000 }, null);
    assert.equal(margin.status, "CONFIGURATION_ERROR");
  });

  test("MANUAL is never computed by the rule engine", () => {
    const result = applySellingPriceRule({ ruleType: "MANUAL" }, 10000);
    assert.equal(result.status, "CONFIGURATION_ERROR");
    assert.equal(result.sellingPriceCents, null);
  });

  test("a rule missing its own required field is a configuration error, not a guess", () => {
    assert.equal(applySellingPriceRule({ ruleType: "MULTIPLIER" }, 10000).status, "CONFIGURATION_ERROR");
    assert.equal(applySellingPriceRule({ ruleType: "MARKUP_PERCENT" }, 10000).status, "CONFIGURATION_ERROR");
    assert.equal(applySellingPriceRule({ ruleType: "TARGET_MARGIN" }, 10000).status, "CONFIGURATION_ERROR");
    assert.equal(applySellingPriceRule({ ruleType: "FIXED_AMOUNT" }, 10000).status, "CONFIGURATION_ERROR");
  });
});
