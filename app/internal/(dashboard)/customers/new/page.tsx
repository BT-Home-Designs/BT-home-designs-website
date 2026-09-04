import type { Metadata } from "next";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { CustomerForm } from "@/components/internal/customers/CustomerForm";
import { createCustomerAction } from "../actions";

export const metadata: Metadata = {
  title: "New Customer",
  robots: { index: false, follow: false },
};

export default async function NewCustomerPage() {
  await requireInternalUser();

  return (
    <div>
      <p className="eyebrow mb-2">Internal</p>
      <h1 className="mb-8 font-display text-3xl text-charcoal">New Customer</h1>
      <CustomerForm action={createCustomerAction} submitLabel="Create Customer" />
    </div>
  );
}
