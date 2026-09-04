import type { Metadata } from "next";
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
        This is the foundation for the internal quoting system. Authentication, the database
        connection, and this protected area are now in place. Quote creation, pricing, and
        customer management are built in the next phases.
      </p>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="rounded-sm border border-charcoal/10 bg-cream/40 p-5">
          <h2 className="font-display text-lg text-charcoal">Quotes</h2>
          <p className="mt-1 text-[13px] text-charcoal-soft">Coming in a later phase.</p>
        </div>
        <div className="rounded-sm border border-charcoal/10 bg-cream/40 p-5">
          <h2 className="font-display text-lg text-charcoal">Customers</h2>
          <p className="mt-1 text-[13px] text-charcoal-soft">Coming in a later phase.</p>
        </div>
      </div>
    </div>
  );
}
