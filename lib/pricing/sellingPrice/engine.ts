import type { SellingPriceRuleConfig, SellingPriceCalculation } from "./types";

const BASIS_POINTS_DENOMINATOR = 10000;

function ok(sellingPriceCents: number): SellingPriceCalculation {
  return { status: "OK", sellingPriceCents, message: null };
}

function configurationError(message: string): SellingPriceCalculation {
  return { status: "CONFIGURATION_ERROR", sellingPriceCents: null, message };
}

/**
 * Applies one automatic SellingPriceRule to an internal cost, producing a
 * customer selling price in integer cents.
 *
 * Rounding is explicit and consistent: every result is rounded to the
 * nearest cent with `Math.round` (half-up) applied to a single
 * cents-denominated value — never chained float operations that could
 * accumulate binary floating-point error. All rule math here is
 * cost x (numeratorBps / 10000), computed as (cost * numeratorBps) / 10000
 * in one division so there's exactly one rounding point per calculation.
 *
 * Dealer cost never becomes the selling price by default: every branch
 * requires an explicit, present rule value — a rule with a missing field
 * for its own type, or MANUAL routed here by mistake, is a configuration
 * error, never a silent fallback to cost.
 */
export function applySellingPriceRule(rule: SellingPriceRuleConfig, costCents: number | null): SellingPriceCalculation {
  switch (rule.ruleType) {
    case "MULTIPLIER": {
      if (rule.multiplierBps === null || rule.multiplierBps === undefined) {
        return configurationError("MULTIPLIER rule is missing multiplierBps.");
      }
      if (costCents === null) {
        return configurationError("MULTIPLIER rule requires a known internal cost.");
      }
      return ok(Math.round((costCents * rule.multiplierBps) / BASIS_POINTS_DENOMINATOR));
    }

    case "MARKUP_PERCENT": {
      if (rule.markupPercentBps === null || rule.markupPercentBps === undefined) {
        return configurationError("MARKUP_PERCENT rule is missing markupPercentBps.");
      }
      if (costCents === null) {
        return configurationError("MARKUP_PERCENT rule requires a known internal cost.");
      }
      return ok(Math.round((costCents * (BASIS_POINTS_DENOMINATOR + rule.markupPercentBps)) / BASIS_POINTS_DENOMINATOR));
    }

    case "TARGET_MARGIN": {
      if (rule.targetMarginBps === null || rule.targetMarginBps === undefined) {
        return configurationError("TARGET_MARGIN rule is missing targetMarginBps.");
      }
      if (costCents === null) {
        return configurationError("TARGET_MARGIN rule requires a known internal cost.");
      }
      if (rule.targetMarginBps >= BASIS_POINTS_DENOMINATOR) {
        return configurationError(`TARGET_MARGIN of ${rule.targetMarginBps} basis points is >= 100% — not a valid margin.`);
      }
      return ok(Math.round((costCents * BASIS_POINTS_DENOMINATOR) / (BASIS_POINTS_DENOMINATOR - rule.targetMarginBps)));
    }

    case "FIXED_AMOUNT": {
      if (rule.fixedAmountCents === null || rule.fixedAmountCents === undefined) {
        return configurationError("FIXED_AMOUNT rule is missing fixedAmountCents.");
      }
      return ok(rule.fixedAmountCents);
    }

    case "MANUAL":
      return configurationError("MANUAL is not an automatic rule — set a manual selling price directly instead of applying a rule.");

    case "SQUARE_FOOT_FORMULA":
      return configurationError("SQUARE_FOOT_FORMULA is computed by the shutter pricing engine, not by applySellingPriceRule.");

    case "CASH_CREDIT_FORMULA":
      return configurationError("CASH_CREDIT_FORMULA is computed by lib/quotes/cashCreditPricing.ts, not by applySellingPriceRule.");

    default: {
      const exhaustiveCheck: never = rule.ruleType;
      return configurationError(`Unknown selling price rule type: ${String(exhaustiveCheck)}`);
    }
  }
}
