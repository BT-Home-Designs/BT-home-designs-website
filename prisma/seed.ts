/**
 * Seeds the verified 68-fabric Roller Shade / Neolux catalog (and the
 * minimal Vendor/Product rows it hangs off) into the database.
 *
 * Idempotent: safe to run repeatedly. Re-running:
 *   - never creates duplicate Vendor/Product/Fabric rows (matched by
 *     Vendor.name, (Vendor, ProductType), and Fabric.normalizedName)
 *   - re-syncs sourceName/priceGroup/productId from the locked catalog
 *     (lib/pricing/matrix-engine/fabricCatalog.ts) in case it changes
 *   - never resets `active` on an existing row — a staff member may have
 *     deliberately deactivated a fabric/product, and reseeding must not
 *     silently reactivate it
 */
import { PrismaClient, ProductType, PricingStrategyType } from "@prisma/client";
import { FABRIC_CATALOG, normalizeFabricName } from "../lib/pricing/matrix-engine/fabricCatalog";

const prisma = new PrismaClient();

// Placeholder — no real vendor name has been confirmed yet. Rename this
// row (and update this constant) once BT Home Designs confirms the actual
// vendor for this fabric catalog; nothing else references this string.
const VENDOR_NAME = "Vendor TBD — confirm real vendor name";

const PRODUCT_DEFS: ReadonlyArray<{ name: string; productType: ProductType }> = [
  { name: "Roller Shades", productType: ProductType.ROLLER_SHADE },
  { name: "Neolux", productType: ProductType.NEOLUX },
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
          defaultPricingStrategyType: PricingStrategyType.MATRIX_PRICE,
          active: true,
        },
      });
      console.log(`Created product: "${created.name}" (${created.productType})`);
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

async function main() {
  const vendor = await seedVendor();
  const productIdByType = await seedProducts(vendor.id);
  const { created, synced } = await seedFabrics(productIdByType);

  const totalFabrics = await prisma.fabric.count();
  const rollerShadeCount = await prisma.fabric.count({
    where: { product: { productType: ProductType.ROLLER_SHADE } },
  });
  const neoluxCount = await prisma.fabric.count({
    where: { product: { productType: ProductType.NEOLUX } },
  });

  console.log(`Fabrics: ${created} created, ${synced} already existed (re-synced).`);
  console.log(`Fabric totals in database: ${totalFabrics} (Roller Shade: ${rollerShadeCount}, Neolux: ${neoluxCount})`);
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
