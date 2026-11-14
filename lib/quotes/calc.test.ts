import { test } from "node:test";
import assert from "node:assert/strict";
import { computeTotals, scopeHash } from "./calc";
import { isValidSquareUrl } from "./links";
import { formatCents, lineTotalCents, parseDollarsToCents, percentOfCents } from "./money";
import { sanitizeContent } from "./sanitize";

const base = (over: Record<string, unknown> = {}) =>
  sanitizeContent({
    lineItems: [
      { description: "Motorized opening", quantity: 1, unitPriceCents: 313017, taxable: true },
      { description: "Living room", quantity: 1, unitPriceCents: 178705, taxable: true },
      { description: "Installation", quantity: 1, unitPriceCents: 65126, taxable: true },
    ],
    taxRatePercent: 8.25,
    deposit: { mode: "percent", percent: 50, amountCents: 0 },
    ...over,
  });

test("matches the Little Elm PDF totals to the cent", () => {
  const t = computeTotals(base(), 0);
  assert.equal(t.subtotalCents, 556848);
  assert.equal(t.taxCents, 45940); // 45939.96 rounds up
  assert.equal(t.totalCents, 602788);
  assert.equal(formatCents(t.totalCents), "$6,027.88");
});

test("deposit percent rounds half-up and remaining balance uses recorded payments", () => {
  const t = computeTotals(base(), 0);
  assert.equal(t.depositCents, 301394);
  const paid = computeTotals(base(), 301394);
  assert.equal(paid.depositDueCents, 0);
  assert.equal(paid.remainingCents, 602788 - 301394);
});

test("deposit dollar amount is capped at the total", () => {
  const t = computeTotals(base({ deposit: { mode: "amount", percent: 0, amountCents: 99999999 } }), 0);
  assert.equal(t.depositCents, t.totalCents);
});

test("non-taxable lines excluded from tax; fractional quantities round correctly", () => {
  assert.equal(lineTotalCents(2.5, 333), 833); // 832.5 → 833
  assert.equal(percentOfCents(1000, 8.25), 83); // 82.5 → 83
  const c = sanitizeContent({
    lineItems: [
      { description: "a", quantity: 1, unitPriceCents: 10000, taxable: true },
      { description: "b", quantity: 1, unitPriceCents: 5000, taxable: false },
    ],
    taxRatePercent: 10,
  });
  const t = computeTotals(c, 0);
  assert.equal(t.taxCents, 1000);
  assert.equal(t.totalCents, 16000);
});

test("parses dollar input strictly", () => {
  assert.equal(parseDollarsToCents("$1,234.5"), 123450);
  assert.equal(parseDollarsToCents("0.07"), 7);
  assert.equal(parseDollarsToCents("1.234"), null);
  assert.equal(parseDollarsToCents("-5"), null);
  assert.equal(parseDollarsToCents("abc"), null);
});

test("scope hash ignores internal cost but tracks price", () => {
  const a = base();
  const b = structuredClone(a);
  b.lineItems[0].internalCostCents = 12345;
  b.internalNotes = "margin notes";
  assert.equal(scopeHash(a), scopeHash(b));
  b.lineItems[0].unitPriceCents += 1;
  assert.notEqual(scopeHash(a), scopeHash(b));
});

test("only https Square URLs are accepted", () => {
  assert.ok(isValidSquareUrl("https://square.link/u/AbC123"));
  assert.ok(isValidSquareUrl("https://app.squareup.com/pay-invoice/xyz"));
  assert.ok(isValidSquareUrl("https://bt-home.square.site/checkout"));
  assert.ok(!isValidSquareUrl("http://square.link/u/AbC123"));
  assert.ok(!isValidSquareUrl("https://square.link.evil.com/u/x"));
  assert.ok(!isValidSquareUrl("https://evilsquareup.com/x"));
  assert.ok(!isValidSquareUrl("javascript:alert(1)"));
  assert.ok(!isValidSquareUrl(""));
});
