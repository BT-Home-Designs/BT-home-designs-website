/**
 * Seeds:
 *   - the verified 68-fabric Roller Shade / Neolux catalog (Phase 3)
 *   - the Plantation Shutter and Faux Wood Blind products (Phase 6)
 *   - approved BT Home Designs business-pricing configuration (Phase 6):
 *     the shutter square-foot rate, fixed-price accessories/labor, and
 *     the two records intentionally left non-ACTIVE (the roller-shade
 *     cordless upgrade, and the installation trip-minimum rule)
 *
 * Idempotent: safe to run repeatedly. Re-running:
 *   - never creates duplicate Vendor/Product/Fabric/FixedPriceOption/
 *     SquareFootPricingRule/InstallationTripMinimumRule rows
 *   - re-syncs source data (names, cents amounts, rates) from the
 *     constants below in case an approved number changes
 *   - never resets `active`/`status` on an existing row — a staff member
 *     may have deliberately deactivated something, or promoted a
 *     PENDING_VERIFICATION record to ACTIVE (or the reverse), and
 *     reseeding must never silently overwrite that decision
 */
import { PrismaClient, ProductType, PricingStrategyType, BusinessPricingStatus } from "@prisma/client";
import { FABRIC_CATALOG, normalizeFabricName } from "../lib/pricing/matrix-engine/fabricCatalog";

const prisma = new PrismaClient();

// Placeholder — no real vendor name has been confirmed yet. Rename this
// row (and update this constant) once BT Home Designs confirms the actual
// vendor(s) for this catalog; nothing else references this string. All
// products below share it for now — dealer cost is NOT_CONFIGURED for
// every one of them except Roller Shade / Neolux, so which vendor row is
// attached has no effect on any calculation.
const VENDOR_NAME = "Vendor TBD — confirm real vendor name";

const PRODUCT_DEFS: ReadonlyArray<{ name: string; productType: ProductType; defaultPricingStrategyType: PricingStrategyType }> = [
  { name: "Roller Shades", productType: ProductType.ROLLER_SHADE, defaultPricingStrategyType: PricingStrategyType.MATRIX_PRICE },
  { name: "Neolux", productType: ProductType.NEOLUX, defaultPricingStrategyType: PricingStrategyType.MATRIX_PRICE },
  { name: "Plantation Shutters", productType: ProductType.PLANTATION_SHUTTER, defaultPricingStrategyType: PricingStrategyType.SQUARE_FOOT },
  { name: "Faux Wood Blinds", productType: ProductType.FAUX_WOOD_BLIND, defaultPricingStrategyType: PricingStrategyType.MANUAL_PRICE },
];

/**
 * Approved BT Home Designs fixed-price accessories and labor charges.
 * `status: PENDING_VERIFICATION` on the roller-shade cordless upgrade is
 * deliberate — that number was described only as "approximate" and must
 * never be picked up by an automatic calculation (see
 * lib/quotes/fixedPriceOptions.ts) until it's confirmed and flipped to
 * ACTIVE by a staff member in the app, not by re-running this seed.
 */
const FIXED_PRICE_OPTION_DEFS: ReadonlyArray<{
  name: string;
  category: string;
  costCents: number;
  status: BusinessPricingStatus;
}> = [
  { name: "Acmeda Rechargeable Motorization", category: "MOTORIZATION", costCents: 17500, status: BusinessPricingStatus.ACTIVE },
  { name: "5-Channel Remote", category: "REMOTE", costCents: 7500, status: BusinessPricingStatus.ACTIVE },
  { name: "15-Channel Remote", category: "REMOTE", costCents: 9500, status: BusinessPricingStatus.ACTIVE },
  { name: "Solar Charger", category: "SOLAR_CHARGER", costCents: 11000, status: BusinessPricingStatus.ACTIVE },
  { name: "Hub", category: "HUB", costCents: 20000, status: BusinessPricingStatus.ACTIVE },
  { name: "Base Installation", category: "INSTALLATION_BASE", costCents: 7500, status: BusinessPricingStatus.ACTIVE },
  { name: "Motorized Installation Add-On", category: "INSTALLATION_ADDON", costCents: 4500, status: BusinessPricingStatus.ACTIVE },
  { name: "Cordless Installation Add-On", category: "INSTALLATION_ADDON", costCents: 2500, status: BusinessPricingStatus.ACTIVE },
  // Only ever described as "approximately $60" — see AGENTS.md / project
  // history (Phase 6). Not activated until BT Home Designs confirms it.
  { name: "Cordless Upgrade (Roller Shade)", category: "UPGRADE", costCents: 6000, status: BusinessPricingStatus.PENDING_VERIFICATION },
];

async function seedVendor() {
  const vendor = await prisma.vendor.upsert({
    where: { name: VENDOR_NAME },
    update: {},
    create: { name: VENDOR_NAME, active: true },
  });
  console.log(`Vendor ready: "${vendor.name}" (${vendor.id})`);
  return vendor;
}

async function seedProducts(vendorId: string): Promise<Map<ProductType, string>> {
  const productIdByType = new Map<ProductType, string>();

  for (const def of PRODUCT_DEFS) {
    const existing = await prisma.product.findFirst({
      where: { vendorId, productType: def.productType },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: {
          name: def.name,
          productType: def.productType,
          vendorId,
          defaultPricingStrategyType: def.defaultPricingStrategyType,
          active: true,
        },
      });
      console.log(`Created product: "${created.name}" (${created.productType}, ${created.defaultPricingStrategyType})`);
      productIdByType.set(def.productType, created.id);
      continue;
    }

    if (existing.name !== def.name) {
      await prisma.product.update({ where: { id: existing.id }, data: { name: def.name } });
    }
    console.log(`Product already exists: "${existing.name}" (${existing.productType})`);
    productIdByType.set(def.productType, existing.id);
  }

  return productIdByType;
}

async function seedFabrics(productIdByType: Map<ProductType, string>) {
  let created = 0;
  let synced = 0;

  for (const entry of FABRIC_CATALOG) {
    const productType = entry.productType === "ROLLER_SHADE" ? ProductType.ROLLER_SHADE : ProductType.NEOLUX;
    const productId = productIdByType.get(productType);
    if (!productId) {
      throw new Error(`No seeded product found for productType "${productType}" (fabric "${entry.sourceName}").`);
    }

    const normalizedName = normalizeFabricName(entry.sourceName);
    const existed = (await prisma.fabric.findUnique({ where: { normalizedName } })) !== null;

    await prisma.fabric.upsert({
      where: { normalizedName },
      update: {
        // Keep source data in sync with the locked catalog. `active` is
        // deliberately excluded — never overwrite a staff-set value.
        sourceName: entry.sourceName,
        priceGroup: entry.priceGroup,
        productId,
      },
      create: {
        sourceName: entry.sourceName,
        normalizedName,
        priceGroup: entry.priceGroup,
        productId,
        active: true,
      },
    });

    if (existed) {
      synced++;
    } else {
      created++;
    }
  }

  return { created, synced };
}

/**
 * Approved: Plantation Shutter base customer selling price is $17.25 per
 * square foot, plus $150 per arch panel and $150 per door cutout — see
 * AGENTS.md / project history (Phase 6). `status` is excluded from the
 * update clause so a later status change made in the app survives reseeding.
 */
async function seedShutterPricingRule(productIdByType: Map<ProductType, string>) {
  const productId = productIdByType.get(ProductType.PLANTATION_SHUTTER);
  if (!productId) throw new Error("No seeded Plantation Shutters product to attach a SquareFootPricingRule to.");

  const existed = (await prisma.squareFootPricingRule.findUnique({ where: { productId } })) !== null;

  await prisma.squareFootPricingRule.upsert({
    where: { productId },
    update: {
      ratePerSquareFootCents: 1725,
      archChargeCents: 15000,
      doorCutoutChargeCents: 15000,
    },
    create: {
      productId,
      ratePerSquareFootCents: 1725,
      archChargeCents: 15000,
      doorCutoutChargeCents: 15000,
      status: BusinessPricingStatus.ACTIVE,
    },
  });

  console.log(existed ? "Plantation Shutter pricing rule already existed (re-synced rate/charges)." : "Created Plantation Shutter pricing rule ($17.25/sqft, $150 arch, $150 cutout).");
}

async function seedFixedPriceOptions() {
  let created = 0;
  let synced = 0;

  for (const def of FIXED_PRICE_OPTION_DEFS) {
    const existed = (await prisma.fixedPriceOption.findUnique({ where: { name: def.name } })) !== null;

    await prisma.fixedPriceOption.upsert({
      where: { name: def.name },
      update: {
        category: def.category,
        costCents: def.costCents,
        // `status` intentionally excluded — never overwrite a staff
        // decision to activate/deactivate an option by re-running this seed.
      },
      create: {
        name: def.name,
        category: def.category,
        costCents: def.costCents,
        status: def.status,
      },
    });

    if (existed) {
      synced++;
    } else {
      created++;
      console.log(`Created fixed-price option: "${def.name}" — $${(def.costCents / 100).toFixed(2)} (${def.status})`);
    }
  }

  return { created, synced };
}

/**
 * Approved numbers ($125 / under 5 shades). Originally seeded
 * PENDING_VERIFICATION because how it interacts with per-shade
 * installation labor (replace vs. supplement) was an open business
 * decision — see AGENTS.md / project history (Phase 6). CONFIRMED in
 * Phase 7 (see docs/business-rules.md): ADDITIVE — the $125 is added on
 * top of normal calculated labor for a qualifying job, never a floor/max.
 * A pre-existing PENDING_VERIFICATION row is promoted to ACTIVE exactly
 * once here, since that status existed only to gate this specific
 * decision, now resolved; any OTHER status (INACTIVE, or an ACTIVE row a
 * staff member later deactivated) is left alone.
 */
async function seedInstallationTripMinimumRule() {
  const existing = await prisma.installationTripMinimumRule.findFirst();
  if (existing) {
    if (existing.status === BusinessPricingStatus.PENDING_VERIFICATION) {
      await prisma.installationTripMinimumRule.update({ where: { id: existing.id }, data: { status: BusinessPricingStatus.ACTIVE } });
      console.log("Installation trip-minimum rule: additive formula now confirmed — promoted PENDING_VERIFICATION to ACTIVE.");
    } else {
      console.log(`Installation trip-minimum rule already exists (status: ${existing.status}) — left as-is.`);
    }
    return;
  }

  await prisma.installationTripMinimumRule.create({
    data: {
      minimumChargeCents: 12500,
      qualifiesUnderShadeCount: 5,
      status: BusinessPricingStatus.ACTIVE,
    },
  });
  console.log("Created installation trip-minimum rule: $125 additive minimum for jobs under 5 shades (ACTIVE).");
}

/**
 * Approved general cash/credit-card customer pricing formula (see
 * docs/business-rules.md): 75% markup (7500 bps), 6% card fee (600 bps).
 * Singleton config — `status` is excluded from the update clause so a
 * later staff-made status change survives reseeding, matching every other
 * business-pricing seed function here.
 */
async function seedCashCreditPricingConfig() {
  const existing = await prisma.cashCreditPricingConfig.findFirst();
  if (existing) {
    await prisma.cashCreditPricingConfig.update({
      where: { id: existing.id },
      data: { markupBps: 7500, cardFeeBps: 600 },
    });
    console.log(`Cash/credit pricing config already existed (status: ${existing.status}) — rates re-synced.`);
    return;
  }

  await prisma.cashCreditPricingConfig.create({
    data: { markupBps: 7500, cardFeeBps: 600, status: BusinessPricingStatus.ACTIVE },
  });
  console.log("Created cash/credit pricing config: 75% markup (7500 bps), 6% card fee (600 bps), ACTIVE.");
}

async function main() {
  const vendor = await seedVendor();
  const productIdByType = await seedProducts(vendor.id);
  const { created, synced } = await seedFabrics(productIdByType);
  await seedShutterPricingRule(productIdByType);
  const fixedPriceOptionResult = await seedFixedPriceOptions();
  await seedInstallationTripMinimumRule();
  await seedCashCreditPricingConfig();

  const totalFabrics = await prisma.fabric.count();
  const rollerShadeCount = await prisma.fabric.count({
    where: { product: { productType: ProductType.ROLLER_SHADE } },
  });
  const neoluxCount = await prisma.fabric.count({
    where: { product: { productType: ProductType.NEOLUX } },
  });

  console.log(`Fabrics: ${created} created, ${synced} already existed (re-synced).`);
  console.log(`Fabric totals in database: ${totalFabrics} (Roller Shade: ${rollerShadeCount}, Neolux: ${neoluxCount})`);
  console.log(`Fixed-price options: ${fixedPriceOptionResult.created} created, ${fixedPriceOptionResult.synced} already existed (re-synced).`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
