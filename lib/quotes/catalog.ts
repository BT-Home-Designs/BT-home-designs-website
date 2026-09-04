import { prisma } from "@/lib/db/prisma";

export async function listActiveProducts() {
  return prisma.product.findMany({ where: { active: true }, orderBy: { name: "asc" } });
}

/** Fabric list is scoped to the selected product — see prisma/schema.prisma Fabric.productId. */
export async function listActiveFabricsForProduct(productId: string) {
  return prisma.fabric.findMany({ where: { productId, active: true }, orderBy: { sourceName: "asc" } });
}

export async function listActiveColorsForFabric(fabricId: string) {
  return prisma.color.findMany({ where: { fabricId, active: true }, orderBy: { name: "asc" } });
}
