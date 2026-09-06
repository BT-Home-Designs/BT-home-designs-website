import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateCashCreditPrice } from "./engine";

const RATES = { markupBps: 7500, cardFeeBps: 600 };

describe("cash/credit-card pricing formula", () => {
  test("Cost of Goods $100 + Labor $75 -> Cash Price $306.25, Credit Card Price $324.625 -> rounds to $324.63", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 10000, laborCents: 7500, ...RATES });
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.totalInternalCostCents, 17500);
    assert.equal(r.markupAmountCents, 13125); // 17500 x 0.75
    assert.equal(r.cashPriceCents, 30625); // 17500 x 1.75
    assert.equal(r.creditCardFeeCents, 1838); // round(30625 x 0.06) = round(1837.5) = 1838
    assert.equal(r.creditCardPriceCents, 32463);
  });

  test("markup is exactly 75% (7500 bps): cashPrice = cost x 1.75", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 40000, laborCents: 0, ...RATES });
    assert.equal(r.cashPriceCents, 70000); // 40000 x 1.75
  });

  test("card fee is exactly 6% (600 bps) of Cash Price, not of cost", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 40000, laborCents: 0, ...RATES });
    assert.equal(r.creditCardFeeCents, 4200); // 70000 x 0.06
    assert.equal(r.creditCardPriceCents, 74200);
  });

  test("costOfGoods + labor + markupAmount === cashPrice exactly (no rounding drift)", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 8640, laborCents: 7500, ...RATES });
    assert.equal(r.costOfGoodsCents! + r.laborCents! + r.markupAmountCents!, r.cashPriceCents);
  });

  test("Labor = 0 is a known value, not NOT_CONFIGURED", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 10000, laborCents: 0, ...RATES });
    assert.equal(r.status, "SUCCESS");
    assert.equal(r.totalInternalCostCents, 10000);
  });

  test("null Cost of Goods -> NOT_CONFIGURED, never a $0 substitute", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: null, laborCents: 7500, ...RATES });
    assert.equal(r.status, "NOT_CONFIGURED");
    assert.equal(r.cashPriceCents, null);
    assert.equal(r.creditCardPriceCents, null);
    assert.equal(r.totalInternalCostCents, null);
  });

  test("null Labor -> NOT_CONFIGURED, never a $0 substitute", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 10000, laborCents: null, ...RATES });
    assert.equal(r.status, "NOT_CONFIGURED");
    assert.equal(r.cashPriceCents, null);
  });

  test("both null -> NOT_CONFIGURED", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: null, laborCents: null, ...RATES });
    assert.equal(r.status, "NOT_CONFIGURED");
  });

  test("negative markup/card-fee bps is rejected as NOT_CONFIGURED, never applied", () => {
    const r = calculateCashCreditPrice({ costOfGoodsCents: 10000, laborCents: 0, markupBps: -1, cardFeeBps: 600 });
    assert.equal(r.status, "NOT_CONFIGURED");
  });
});
