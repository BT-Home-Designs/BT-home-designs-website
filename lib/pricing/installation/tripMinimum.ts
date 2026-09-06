/**
 * Installer minimum trip fee ($125 for a job under 5 shades — see
 * InstallationTripMinimumRule in prisma/schema.prisma).
 *
 * CONFIRMED business rule (supersedes the earlier "floor/minimum" design):
 * this is ADDITIVE, on top of the job's normal itemized installation
 * labor — never a floor/max, never a replacement.
 *
 *   Total Labor = normal itemized installation labor + $125
 *
 * for a qualifying job (total shade count < qualifiesUnderShadeCount).
 * Fail-closed on rule status: unless the caller passes a rule whose
 * status is ACTIVE, this never applies the minimum.
 */

export type TripMinimumRuleStatus = "ACTIVE" | "INACTIVE" | "PENDING_VERIFICATION";

export interface TripMinimumRule {
  minimumChargeCents: number;
  qualifiesUnderShadeCount: number;
  status: TripMinimumRuleStatus;
}

export interface TripMinimumInput {
  /**
   * The job's normal itemized installation labor total (e.g. summed Base
   * Installation + Motorized/Cordless Installation Add-On across every
   * line item), already resolved against the FixedPriceOption catalog.
   * Null means that total is itself unknown (some line item's labor is
   * NOT_CONFIGURED) — never treated as $0.
   */
  normalLaborCents: number | null;
  /** Number of shades/windows in the job, compared against qualifiesUnderShadeCount. */
  shadeCount: number;
  rule: TripMinimumRule | null;
}

export type TripMinimumReason = "RULE_MISSING" | "RULE_NOT_ACTIVE" | "DOES_NOT_QUALIFY" | "UNKNOWN_NORMAL_LABOR" | "MINIMUM_ADDED";

export interface TripMinimumResult {
  applied: boolean;
  reason: TripMinimumReason;
  normalLaborCents: number | null;
  /** normalLaborCents + minimumChargeCents when applied; otherwise mirrors normalLaborCents. */
  totalLaborCents: number | null;
}

export function calculateInstallationTripMinimum(input: TripMinimumInput): TripMinimumResult {
  const notApplied = (reason: TripMinimumReason): TripMinimumResult => ({
    applied: false,
    reason,
    normalLaborCents: input.normalLaborCents,
    totalLaborCents: input.normalLaborCents,
  });

  if (!input.rule) return notApplied("RULE_MISSING");
  if (input.rule.status !== "ACTIVE") return notApplied("RULE_NOT_ACTIVE");
  if (input.shadeCount >= input.rule.qualifiesUnderShadeCount) return notApplied("DOES_NOT_QUALIFY");
  if (input.normalLaborCents === null) return notApplied("UNKNOWN_NORMAL_LABOR");

  return {
    applied: true,
    reason: "MINIMUM_ADDED",
    normalLaborCents: input.normalLaborCents,
    totalLaborCents: input.normalLaborCents + input.rule.minimumChargeCents,
  };
}
