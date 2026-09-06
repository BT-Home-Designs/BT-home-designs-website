import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/db/prisma";
import { calculateInstallationTripMinimum } from "./tripMinimum";

describe("installer trip-minimum fee — additive model (confirmed business decision)", () => {
  const activeRule = { minimumChargeCents: 12500, qualifiesUnderShadeCount: 5, status: "ACTIVE" as const };

  test("qualifying job (under 5 shades): $125 is ADDED on top of normal labor, never a floor/max", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: 7500, shadeCount: 2, rule: activeRule });
    assert.equal(result.applied, true);
    assert.equal(result.reason, "MINIMUM_ADDED");
    assert.equal(result.totalLaborCents, 7500 + 12500);
    // Never max(normalLabor, minimum) — always the sum, even when normal
    // labor already exceeds $125.
    assert.notEqual(result.totalLaborCents, Math.max(7500, 12500));
  });

  test("normal labor already above $125 still gets the $125 added, not replaced", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: 15000, shadeCount: 1, rule: activeRule });
    assert.equal(result.applied, true);
    assert.equal(result.totalLaborCents, 15000 + 12500);
  });

  test("normal labor of 0 (no installation requested) still gets the $125 added for a qualifying job", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: 0, shadeCount: 1, rule: activeRule });
    assert.equal(result.applied, true);
    assert.equal(result.totalLaborCents, 12500);
  });

  test("a job with 5 or more shades never qualifies — no addition, regardless of labor", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: 7500, shadeCount: 5, rule: activeRule });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "DOES_NOT_QUALIFY");
    assert.equal(result.totalLaborCents, 7500);
  });

  test("unknown normal labor (some line item NOT_CONFIGURED) keeps the total unknown, never treated as $0", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: null, shadeCount: 2, rule: activeRule });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "UNKNOWN_NORMAL_LABOR");
    assert.equal(result.totalLaborCents, null);
  });

  test("no rule at all: never applied", () => {
    const result = calculateInstallationTripMinimum({ normalLaborCents: 7500, shadeCount: 1, rule: null });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "RULE_MISSING");
  });

  test("rule present but not ACTIVE: never applied", () => {
    const result = calculateInstallationTripMinimum({
      normalLaborCents: 7500,
      shadeCount: 1,
      rule: { ...activeRule, status: "PENDING_VERIFICATION" },
    });
    assert.equal(result.applied, false);
    assert.equal(result.reason, "RULE_NOT_ACTIVE");
  });

  test("the real seeded InstallationTripMinimumRule now holds the confirmed additive numbers and is ACTIVE", async () => {
    const seededRule = await prisma.installationTripMinimumRule.findFirstOrThrow();
    assert.equal(seededRule.minimumChargeCents, 12500);
    assert.equal(seededRule.qualifiesUnderShadeCount, 5);
    assert.equal(seededRule.status, "ACTIVE");
  });
});
