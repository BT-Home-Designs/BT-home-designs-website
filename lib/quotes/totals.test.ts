import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { calculateQuoteTotals } from "./totals";

const NO_DISCOUNT_NO_TAX_NO_DEPOSIT = {
  discountType: null,
  discountValue: null,
  taxRateBps: 0,
  depositType: null,
  depositValue: null,
  depositPaidCents: 0,
} as const;

describe("quote totals — customer-facing only, never derived from dealer cost", () => {
  test("subtotal is the sum of configured line-item selling prices", () => {
    const result = calculateQuoteTotals({ lineItemSellingPricesCents: [10800, 26400, 5000], ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT });
    assert.equal(result.subtotalCents, 42200);
  });

  test("12. fixed discount subtracts a flat cents amount", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [50000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      discountType: "FIXED_AMOUNT",
      discountValue: 5000,
    });
    assert.equal(result.subtotalCents, 50000);
    assert.equal(result.discountCents, 5000);
    assert.equal(result.taxableSubtotalCents, 45000);
  });

  test("13. percentage discount is basis points of the subtotal", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [50000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      discountType: "PERCENTAGE",
      discountValue: 1000, // 10%
    });
    assert.equal(result.discountCents, 5000);
    assert.equal(result.taxableSubtotalCents, 45000);
  });

  test("a discount never exceeds the subtotal (taxable subtotal floors at zero)", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [1000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      discountType: "FIXED_AMOUNT",
      discountValue: 5000, // larger than the subtotal
    });
    assert.equal(result.discountCents, 1000);
    assert.equal(result.taxableSubtotalCents, 0);
  });

  test("14. tax rate is configurable per quote and applied to the taxable subtotal", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [45000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      taxRateBps: 825, // 8.25%
    });
    // 45000 * 825 / 10000 = 3712.5 -> rounds to 3713 (half-up)
    assert.equal(result.taxCents, 3713);
    assert.equal(result.grandTotalCents, 48713);
  });

  test("15. percentage deposit is basis points of the grand total", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [100000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      depositType: "PERCENTAGE",
      depositValue: 5000, // 50%
    });
    assert.equal(result.grandTotalCents, 100000);
    assert.equal(result.depositRequiredCents, 50000);
  });

  test("16. fixed deposit is a flat cents amount regardless of the grand total", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [100000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      depositType: "FIXED_AMOUNT",
      depositValue: 25000,
    });
    assert.equal(result.depositRequiredCents, 25000);
  });

  test("17. remaining balance is the grand total minus what's already been paid", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [100000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      depositPaidCents: 30000,
    });
    assert.equal(result.grandTotalCents, 100000);
    assert.equal(result.remainingBalanceCents, 70000);
  });

  test("remaining balance can go negative when overpaid (never clamped/hidden)", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [100000],
      ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT,
      depositPaidCents: 150000,
    });
    assert.equal(result.remainingBalanceCents, -50000);
  });

  test("full pipeline: discount, tax, and deposit compose correctly end to end", () => {
    const result = calculateQuoteTotals({
      lineItemSellingPricesCents: [80000, 20000], // subtotal 100000
      discountType: "PERCENTAGE",
      discountValue: 1000, // 10% -> 10000 discount
      taxRateBps: 800, // 8%
      depositType: "PERCENTAGE",
      depositValue: 5000, // 50%
      depositPaidCents: 20000,
    });
    assert.equal(result.subtotalCents, 100000);
    assert.equal(result.discountCents, 10000);
    assert.equal(result.taxableSubtotalCents, 90000);
    assert.equal(result.taxCents, 7200); // 90000 * 800 / 10000
    assert.equal(result.grandTotalCents, 97200);
    assert.equal(result.depositRequiredCents, 48600); // 97200 * 5000 / 10000
    assert.equal(result.remainingBalanceCents, 77200); // 97200 - 20000
  });

  test("an empty line-item list produces all-zero totals, not an error", () => {
    const result = calculateQuoteTotals({ lineItemSellingPricesCents: [], ...NO_DISCOUNT_NO_TAX_NO_DEPOSIT });
    assert.equal(result.subtotalCents, 0);
    assert.equal(result.grandTotalCents, 0);
    assert.equal(result.remainingBalanceCents, 0);
  });
});
