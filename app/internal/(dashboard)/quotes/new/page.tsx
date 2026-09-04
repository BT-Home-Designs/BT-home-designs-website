import type { Metadata } from "next";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { listCustomers } from "@/lib/quotes/customers";
import { NewQuoteForm } from "@/components/internal/quotes/NewQuoteForm";
import { createQuoteAction } from "../actions";

export const metadata: Metadata = {
  title: "New Quote",
  robots: { index: false, follow: false },
};

export default async function NewQuotePage() {
  await requireInternalUser();
  const customers = await listCustomers();

  return (
    <div>
      <p className="eyebrow mb-2">Internal</p>
      <h1 className="mb-8 font-display text-3xl text-charcoal">New Quote</h1>
      <NewQuoteForm action={createQuoteAction} customers={customers} />
    </div>
  );
}
