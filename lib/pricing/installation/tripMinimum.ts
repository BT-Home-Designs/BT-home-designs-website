/**
 * Installer minimum trip fee ($125 when a job has fewer than 5 shades — see
 * InstallationTripMinimumRule in prisma/schema.prisma). This is a FLOOR on
 * a job's total itemized installation labor, not an add-on: if the
 * itemized installation total already meets or exceeds the minimum, the
 * minimum has no effect; only when itemized labor falls short does the
 * minimum replace it. This never double-charges — the itemized total and
 * the minimum are never both charged.
 *
 * Confirmed business decision (Phase 6): "floor/minimum" — the higher of
 * (itemized installation labor across the job) or (the flat minimum),
 * never both.
 *
 * The rule row is seeded PENDING_VERIFICATION and this function is fail-
 * closed on that: unless the caller passes a rule whose status is ACTIVE,
 * it never applies the minimum, regardless of how the numbers compare —
 * so this function is safe to call from real code today and will simply
 * no-op against every live quote until a staff member activates the rule.
 */

export type TripMinimumRuleStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";

export interface TripMinimumRule {
  minimumChargeCents: number;
  qualifiesUnderShadeCount: number;
  status: TripMinimumRuleStatus;
}

export interface TripMinimumInput {
  /**
   * Each qualifying line item's own itemized installation cost for this
   * job (e.g. Base Installation + Motorized/Cordless Installation Add-On,
   * per line item, already resolved against the FixedPriceOption catalog).
   * A null entry means that line item's installation cost is itself
   * NOT_CONFIGURED — the itemized total is then unknown, not partially
   * summed, matching calculateCompositeCost's fail-closed rule.
   */
  lineItemInstallationCostsCents: readonly (number | null)[];
  /** Number of shades/windows in the job, compared against qualifiesUnderShadeCount. */
  shadeCount: number;
  rule: TripMinimumRule | null;
}

export type TripMinimumReason =
  | "RULE_MISSING"
  | "RULE_NOT_ACTIVE"
  | "DOES_NOT_QUALIFY"
  | "UNKNOWN_ITEMIZED_TOTAL"
  | "LABOR_ALREADY_MEETS_MINIMUM"
  | "MINIMUM_APPLIED";

export interface TripMinimumResult {
  applied: boolean;
  reason: TripMinimumReason;
  /** Null when any line item's installation cost is NOT_CONFIGURED. */
  itemizedInstallationTotalCents: number | null;
  /** The itemized total, or the flat minimum when the floor applies. Mirrors itemizedInstallationTotalCents's null-ness when the minimum wasn't applied. */
  effectiveInstallationTotalCents: number | null;
}

export function calculateInstallationTripMinimum(input: TripMinimumInput): TripMinimumResult {
  const hasUnconfiguredLine = input.lineItemInstallationCostsCents.some((cents) => cents === null);
  const itemizedInstallationTotalCents = hasUnconfiguredLine
    ? null
    : (input.lineItemInstallationCostsCents as number[]).reduce((sum, cents) => sum + cents, 0);

  const notApplied = (reason: TripMinimumReason): TripMinimumResult => ({
    applied: false,
    reason,
    itemizedInstallationTotalCents,
    effectiveInstallationTotalCents: itemizedInstallationTotalCents,
  });

  if (!input.rule) return notApplied("RULE_MISSING");
  if (input.rule.status !== "ACTIVE") return notApplied("RULE_NOT_ACTIVE");
  if (input.shadeCount >= input.rule.qualifiesUnderShadeCount) return notApplied("DOES_NOT_QUALIFY");
  if (itemizedInstallationTotalCents === null) return notApplied("UNKNOWN_ITEMIZED_TOTAL");
  if (itemizedInstallationTotalCents >= input.rule.minimumChargeCents) return notApplied("LABOR_ALREADY_MEETS_MINIMUM");

  return {
    applied: true,
    reason: "MINIMUM_APPLIED",
    itemizedInstallationTotalCents,
    effectiveInstallationTotalCents: input.rule.minimumChargeCents,
  };
}
