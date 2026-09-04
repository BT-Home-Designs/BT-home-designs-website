import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { getCustomer } from "@/lib/quotes/customers";
import { CustomerForm } from "@/components/internal/customers/CustomerForm";
import { updateCustomerAction } from "../actions";

export const metadata: Metadata = {
  title: "Edit Customer",
  robots: { index: false, follow: false },
};

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireInternalUser();
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const boundAction = updateCustomerAction.bind(null, customer.id);

  return (
    <div>
      <p className="eyebrow mb-2">Internal</p>
      <h1 className="mb-8 font-display text-3xl text-charcoal">Edit Customer</h1>
      <CustomerForm action={boundAction} defaultValues={customer} submitLabel="Save Changes" />
    </div>
  );
}
