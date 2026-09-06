import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { calculateInstallationTripMinimum } from "./tripMinimum";

describe("installer trip-minimum fee — floor/minimum model (confirmed business decision)", () => {
  const activeRule = { minimumChargeCents: 12500, qualifiesUnderShadeCount: 5, status: "ACTIVE" as const };

  test("itemized labor already at/above $125 on a 2-shade job: the floor has no effect", () => {
    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500, 7500], // 2 x $75 Base Installation = $150, already >= $125
      shadeCount: 2,
      rule: activeRule,
    });
    assert.equal(result.itemizedInstallationTotalCents, 15000);
    assert.equal(result.applied, false);
    assert.equal(result.reason, "LABOR_ALREADY_MEETS_MINIMUM");
  });

  test("a single $75 base install on a 1-shade job: itemized $75 is below the $125 floor, so the floor applies", () => {
    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500],
      shadeCount: 1,
      rule: activeRule,
    });
    assert.equal(result.itemizedInstallationTotalCents, 7500);
    assert.equal(result.applied, true);
    assert.equal(result.reason, "MINIMUM_APPLIED");
    assert.equal(result.effectiveInstallationTotalCents, 12500);
  });

  test("itemized labor never double-charged: the minimum REPLACES, it never adds to, the itemized total", () => {
    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500],
      shadeCount: 1,
      rule: activeRule,
    });
    // Effective total is exactly the flat minimum — not 7500 + 12500.
    assert.equal(result.effectiveInstallationTotalCents, 12500);
    assert.notEqual(result.effectiveInstallationTotalCents, 7500 + 12500);
  });

  test("a job with 5 or more shades never qualifies, regardless of itemized labor", () => {
    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500],
      shadeCount: 5,
      rule: activeRule,
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "DOES_NOT_QUALIFY");
    assert.equal(result.effectiveInstallationTotalCents, 7500);
  });

  test("an unconfigured (null) line-item installation cost keeps the itemized total unknown, never partially summed", () => {
    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500, null],
      shadeCount: 2,
      rule: activeRule,
    });
    assert.equal(result.itemizedInstallationTotalCents, null);
    assert.equal(result.applied, false);
    assert.equal(result.reason, "UNKNOWN_ITEMIZED_TOTAL");
  });

  test("no rule at all: never applied", () => {
    const result = calculateInstallationTripMinimum({ lineItemInstallationCostsCents: [7500], shadeCount: 1, rule: null });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "RULE_MISSING");
  });

  test("the real seeded InstallationTripMinimumRule is PENDING_VERIFICATION, so it never applies to any real quote yet", async () => {
    const seededRule = await prisma.installationTripMinimumRule.findFirstOrThrow();
    assert.equal(seededRule.status, "PENDING_VERIFICATION");

    const result = calculateInstallationTripMinimum({
      lineItemInstallationCostsCents: [7500],
      shadeCount: 1,
      rule: { minimumChargeCents: seededRule.minimumChargeCents, qualifiesUnderShadeCount: seededRule.qualifiesUnderShadeCount, status: seededRule.status },
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "RULE_NOT_ACTIVE");
  });
});
