import { prisma } from "@/lib/db/prisma";

export interface CustomerInput {
  name: string;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

function cleanOptional(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function createCustomer(input: CustomerInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Customer name is required.");
  }

  return prisma.customer.create({
    data: {
      name,
      address: cleanOptional(input.address),
      city: cleanOptional(input.city),
      state: cleanOptional(input.state),
      zip: cleanOptional(input.zip),
      phone: cleanOptional(input.phone),
      email: cleanOptional(input.email),
      notes: cleanOptional(input.notes),
    },
  });
}

export async function updateCustomer(id: string, input: CustomerInput) {
  const name = input.name.trim();
  if (!name) {
    throw new Error("Customer name is required.");
  }

  return prisma.customer.update({
    where: { id },
    data: {
      name,
      address: cleanOptional(input.address),
      city: cleanOptional(input.city),
      state: cleanOptional(input.state),
      zip: cleanOptional(input.zip),
      phone: cleanOptional(input.phone),
      email: cleanOptional(input.email),
      notes: cleanOptional(input.notes),
    },
  });
}

export async function getCustomer(id: string) {
  return prisma.customer.findUnique({ where: { id } });
}

/** Simple name/email/phone substring search — intentionally not fuzzy or paginated yet. */
export async function listCustomers(query?: string) {
  const trimmed = query?.trim();
  return prisma.customer.findMany({
    where: trimmed
      ? {
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { email: { contains: trimmed, mode: "insensitive" } },
            { phone: { contains: trimmed, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { name: "asc" },
  });
}
