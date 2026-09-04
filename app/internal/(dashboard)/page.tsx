import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";

export const metadata: Metadata = {
  title: "Internal Dashboard",
  robots: { index: false, follow: false },
};

export default async function InternalDashboardPage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <p className="eyebrow mb-2">Internal</p>
      <h1 className="font-display text-3xl text-charcoal">Welcome, {session?.user?.name ?? session?.user?.email}</h1>
      <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-charcoal-soft">
        Create and manage quotes for BT Home Designs customers. Pricing for Roller Shade and
        Neolux line items is calculated automatically from the verified vendor matrix.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Link
          href="/internal/quotes"
          className="block rounded-sm border border-charcoal/10 bg-cream/40 p-5 transition-colors hover:border-oak-dark"
        >
          <h2 className="font-display text-lg text-charcoal">Quotes</h2>
          <p className="mt-1 text-[13px] text-charcoal-soft">Create, edit, and price customer quotes.</p>
        </Link>
        <Link
          href="/internal/customers"
          className="block rounded-sm border border-charcoal/10 bg-cream/40 p-5 transition-colors hover:border-oak-dark"
        >
          <h2 className="font-display text-lg text-charcoal">Customers</h2>
          <p className="mt-1 text-[13px] text-charcoal-soft">Look up or add customer information.</p>
        </Link>
      </div>
    </div>
  );
}
