/**
 * COMPOSITE_PRICE cost totaling: combines a line item's base product cost
 * (from the matrix engine's PricingSnapshot) with any requested fixed-cost
 * add-ons (motorization, remote, hub, solar charger, installation, other
 * hardware/options — see FixedPriceOption in prisma/schema.prisma).
 *
 * No FixedPriceOption rows are seeded yet — nobody has supplied verified
 * add-on costs — so every add-on here resolves to NOT_CONFIGURED until
 * that catalog is populated. This module never invents a dollar amount:
 * an unconfigured add-on makes the total unknown (null), not a partial
 * sum that silently excludes it.
 */

export interface AddOnCostLine {
  name: string;
  /** Null = NOT_CONFIGURED (no matching FixedPriceOption exists yet). */
  costCents: number | null;
}

export interface CompositeCostInput {
  /** From the line item's current PricingSnapshot; null unless pricingStatus is SUCCESS. */
  baseDealerCostCents: number | null;
  /** Add-on names actually requested on the line item (e.g. ["Motorization", "Remote"]). */
  requestedAddOnNames: readonly string[];
  /** Known costs by add-on name, from the FixedPriceOption catalog. Empty until real data exists. */
  knownCosts: ReadonlyMap<string, number>;
}

export interface CompositeCostResult {
  baseDealerCostCents: number | null;
  addOns: AddOnCostLine[];
  /**
   * Null whenever the base cost or ANY requested add-on's cost is
   * unknown — a composite total is only ever a complete, verified sum,
   * never a guess with unpriced components silently dropped.
   */
  totalInternalCostCents: number | null;
}

export function calculateCompositeCost(input: CompositeCostInput): CompositeCostResult {
  const addOns: AddOnCostLine[] = input.requestedAddOnNames.map((name) => ({
    name,
    costCents: input.knownCosts.get(name) ?? null,
  }));

  const hasUnconfiguredAddOn = addOns.some((addOn) => addOn.costCents === null);
  const totalInternalCostCents =
    input.baseDealerCostCents === null || hasUnconfiguredAddOn
      ? null
      : input.baseDealerCostCents + addOns.reduce((sum, addOn) => sum + (addOn.costCents ?? 0), 0);

  return {
    baseDealerCostCents: input.baseDealerCostCents,
    addOns,
    totalInternalCostCents,
  };
}
