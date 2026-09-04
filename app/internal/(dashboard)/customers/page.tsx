import type { Metadata } from "next";
import Link from "next/link";
import { requireInternalUser } from "@/lib/auth/requireInternalUser";
import { listCustomers } from "@/lib/quotes/customers";

export const metadata: Metadata = {
  title: "Customers",
  robots: { index: false, follow: false },
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireInternalUser();
  const { q } = await searchParams;
  const customers = await listCustomers(q);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow mb-2">Internal</p>
          <h1 className="font-display text-3xl text-charcoal">Customers</h1>
        </div>
        <Link
          href="/internal/customers/new"
          className="rounded-sm bg-matte-black px-5 py-2.5 text-[13px] font-medium text-warm-white transition-opacity hover:opacity-90"
        >
          New Customer
        </Link>
      </div>

      <form className="mt-6 max-w-sm">
        <input
          type="search"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search name, email, or phone"
          className="w-full rounded-sm border border-charcoal/20 bg-warm-white px-3 py-2 text-[14px] text-charcoal outline-none transition-colors focus:border-oak-dark"
        />
      </form>

      <div className="mt-6 overflow-x-auto rounded-sm border border-charcoal/10">
        <table className="w-full min-w-[640px] text-left text-[13px]">
          <thead className="bg-cream/60 text-[11px] uppercase tracking-wide text-charcoal-soft">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">City / State</th>
              <th className="px-4 py-3 font-medium">Phone</th>
              <th className="px-4 py-3 font-medium">Email</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {customers.map((customer) => (
              <tr key={customer.id} className="hover:bg-cream/30">
                <td className="px-4 py-3 font-medium text-charcoal">{customer.name}</td>
                <td className="px-4 py-3 text-charcoal-soft">
                  {[customer.city, customer.state].filter(Boolean).join(", ") || "—"}
                </td>
                <td className="px-4 py-3 text-charcoal-soft">{customer.phone || "—"}</td>
                <td className="px-4 py-3 text-charcoal-soft">{customer.email || "—"}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/internal/customers/${customer.id}`} className="font-medium text-oak-dark hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-charcoal-soft">
                  No customers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
