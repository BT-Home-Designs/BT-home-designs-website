"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { createCustomer, updateCustomer, type CustomerInput } from "@/lib/quotes/customers";

function parseCustomerForm(formData: FormData): CustomerInput {
  const get = (key: string): string | null => {
    const value = formData.get(key);
    return typeof value === "string" && value.trim() !== "" ? value : null;
  };
  return {
    name: String(formData.get("name") ?? "").trim(),
    address: get("address"),
    city: get("city"),
    state: get("state"),
    zip: get("zip"),
    phone: get("phone"),
    email: get("email"),
    notes: get("notes"),
  };
}

export async function createCustomerAction(formData: FormData) {
  await requireInternalUser();
  const input = parseCustomerForm(formData);
  const customer = await createCustomer(input);
  revalidatePath("/internal/customers");
  redirect(`/internal/customers/${customer.id}`);
}

export async function updateCustomerAction(customerId: string, formData: FormData) {
  await requireInternalUser();
  const input = parseCustomerForm(formData);
  await updateCustomer(customerId, input);
  revalidatePath("/internal/customers");
  revalidatePath(`/internal/customers/${customerId}`);
  redirect(`/internal/customers/${customerId}`);
}
