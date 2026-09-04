"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { createCustomer, type CustomerInput } from "@/lib/quotes/customers";
import { createQuote } from "@/lib/quotes/quotes";

function getOptional(formData: FormData, key: string): string | null {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() !== "" ? value : null;
}

/**
 * Creates a quote, either against an existing customer or a brand-new one
 * entered inline on the same form — both paths land here so "select an
 * existing customer" and "create a new customer while creating a quote"
 * are one step, not two.
 */
export async function createQuoteAction(formData: FormData) {
  const user = await requireInternalUser();

  const mode = formData.get("customerMode");
  let customerId: string;

  if (mode === "existing") {
    const existingId = formData.get("existingCustomerId");
    if (typeof existingId !== "string" || existingId.length === 0) {
      throw new Error("Please select a customer.");
    }
    customerId = existingId;
  } else {
    const name = String(formData.get("name") ?? "").trim();
    if (!name) {
      throw new Error("Customer name is required.");
    }
    const input: CustomerInput = {
      name,
      address: getOptional(formData, "address"),
      city: getOptional(formData, "city"),
      state: getOptional(formData, "state"),
      zip: getOptional(formData, "zip"),
      phone: getOptional(formData, "phone"),
      email: getOptional(formData, "email"),
      notes: null,
    };
    const customer = await createCustomer(input);
    customerId = customer.id;
  }

  const quote = await createQuote({ customerId, createdById: user.id });
  revalidatePath("/internal/quotes");
  redirect(`/internal/quotes/${quote.id}`);
}
