import { prisma } from "@/lib/db/prisma";
import type { SellingPriceRule } from "@prisma/client";
import { applySellingPriceRule } from "@/lib/pricing/sellingPrice/engine";
import { attemptCashCreditFormula } from "./cashCreditPricing";

/**
 * Most-specific-wins lookup: a rule scoped to this exact product, else a
 * rule scoped to the product's type, else a rule scoped to its vendor,
 * else null (NOT_CONFIGURED). No rules are seeded — every product
 * resolves to null until BT Home Designs supplies a real one.
 */
export async function resolveSellingPriceRuleForProduct(productId: string | null): Promise<SellingPriceRule | null> {
  if (!productId) return null;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return null;

  const productRule = await prisma.sellingPriceRule.findFirst({ where: { productId: product.id, active: true } });
  if (productRule) return productRule;

  const productTypeRule = await prisma.sellingPriceRule.findFirst({ where: { productType: product.productType, active: true } });
  if (productTypeRule) return productTypeRule;

  const vendorRule = await prisma.sellingPriceRule.findFirst({ where: { vendorId: product.vendorId, active: true } });
  if (vendorRule) return vendorRule;

  return null;
}

export const NOT_CONFIGURED_UPDATE = {
  sellingPriceStatus: "NOT_CONFIGURED" as const,
  sellingPriceCents: null,
  sellingPriceMethod: null,
  sellingPriceRuleId: null,
  sellingPriceSetById: null,
  sellingPriceSetAt: null,
  sellingPriceReason: null,
};

/**
 * Applies an automatic SellingPriceRule to a line item's selling price if
 * (and only if) one resolves for its product — using the line item's
 * current dealer cost (from its currentPricingSnapshot, only when that
 * snapshot is a SUCCESS) as the cost basis.
 *
 * Skipped entirely (line item left untouched) when sellingPriceMethod is
 * already MANUAL (a staff override — see setManualSellingPrice below).
 *
 * If a per-product/type/vendor SellingPriceRule resolves, it wins (as
 * before). Otherwise, falls back to the general approved cash/credit-card
 * formula (see docs/business-rules.md, lib/quotes/cashCreditPricing.ts) —
 * this is now also how Plantation Shutter items get their customer price:
 * lib/quotes/shutterPricing.ts only computes the shutter's internal Cost
 * of Goods (square-foot rate + arch/cutout charges — no longer a customer
 * price itself), and this function's cash/credit fallback turns that COGS
 * into the actual Cash/Credit Card price, the same as it does with the
 * matrix engine's dealer cost for Roller Shade / Neolux. An incomplete
 * cost basis or a resolved-but-uncomputable rule both leave the line item
 * explicitly NOT_CONFIGURED rather than showing a stale price.
 */
export async function applyAutomaticSellingPrice(lineItemId: string): Promise<void> {
  const lineItem = await prisma.quoteLineItem.findUniqueOrThrow({
    where: { id: lineItemId },
    include: { currentPricingSnapshot: true },
  });

  if (lineItem.sellingPriceMethod === "MANUAL") return;

  const rule = await resolveSellingPriceRuleForProduct(lineItem.productId);
  if (!rule) {
    const { snapshot } = await attemptCashCreditFormula(lineItemId);
    if (snapshot.status === "SUCCESS") {
      await prisma.quoteLineItem.update({
        where: { id: lineItemId },
        data: {
          sellingPriceStatus: "SET",
          sellingPriceCents: snapshot.cashPriceCents,
          sellingPriceMethod: "CASH_CREDIT_FORMULA",
          sellingPriceRuleId: null,
          sellingPriceSetById: null,
          sellingPriceSetAt: new Date(),
          sellingPriceReason: null,
        },
      });
    } else if (lineItem.sellingPriceStatus !== "NOT_CONFIGURED") {
      await prisma.quoteLineItem.update({ where: { id: lineItemId }, data: NOT_CONFIGURED_UPDATE });
    }
    return;
  }

  const costCents = lineItem.currentPricingSnapshot?.pricingStatus === "SUCCESS" ? lineItem.currentPricingSnapshot.dealerCostCents : null;
  const calculation = applySellingPriceRule(rule, costCents);

  if (calculation.status !== "OK") {
    await prisma.quoteLineItem.update({ where: { id: lineItemId }, data: NOT_CONFIGURED_UPDATE });
    return;
  }

  await prisma.quoteLineItem.update({
    where: { id: lineItemId },
    data: {
      sellingPriceStatus: "SET",
      sellingPriceCents: calculation.sellingPriceCents,
      sellingPriceMethod: rule.ruleType,
      sellingPriceRuleId: rule.id,
      sellingPriceSetById: null,
      sellingPriceSetAt: new Date(),
      sellingPriceReason: null,
    },
  });
}

export interface SetManualSellingPriceInput {
  lineItemId: string;
  sellingPriceCents: number;
  setByUserId: string;
  reason: string;
}

/**
 * Sets an explicit manual selling price: records who set it, when, and
 * why, and marks sellingPriceMethod = MANUAL so applyAutomaticSellingPrice
 * never silently replaces it later. Never touches the line item's
 * PricingSnapshot or currentPricingSnapshotId — dealer cost stays exactly
 * as the matrix engine last calculated it.
 */
export async function setManualSellingPrice(input: SetManualSellingPriceInput) {
  const reason = input.reason.trim();
  if (!reason) {
    throw new Error("A reason is required when manually setting a selling price.");
  }
  if (!Number.isInteger(input.sellingPriceCents) || input.sellingPriceCents < 0) {
    throw new Error("Selling price must be a non-negative whole number of cents.");
  }

  return prisma.quoteLineItem.update({
    where: { id: input.lineItemId },
    data: {
      sellingPriceStatus: "SET",
      sellingPriceCents: input.sellingPriceCents,
      sellingPriceMethod: "MANUAL",
      sellingPriceRuleId: null,
      sellingPriceSetById: input.setByUserId,
      sellingPriceSetAt: new Date(),
      sellingPriceReason: reason,
    },
  });
}

/** Reverts a line item to NOT_CONFIGURED, clearing any manual or rule-derived price. */
export async function clearSellingPrice(lineItemId: string) {
  return prisma.quoteLineItem.update({ where: { id: lineItemId }, data: NOT_CONFIGURED_UPDATE });
}
