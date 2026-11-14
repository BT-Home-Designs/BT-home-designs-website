/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "../actions";
import { isAdmin } from "@/lib/quotes/auth";
import { storageMode } from "@/lib/quotes/store";

export const dynamic = "force-dynamic";

export default async function DashLayout({ children }: { children: React.ReactNode }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const mode = storageMode();
  return (
    <>
      <header className="border-b border-bt-gold/30 bg-bt-green text-bt-cream">
        <div className="mx-auto flex max-w-[1400px] items-center gap-3 px-4 py-3 sm:px-6">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/images/brand/bt-logo-240.png" alt="" className="h-9 w-9 rounded-full ring-1 ring-bt-gold/60" />
            <span className="font-display text-lg">Quote Dashboard</span>
          </Link>
          <span className="ml-auto hidden text-[11px] uppercase tracking-[0.14em] text-bt-cream/70 sm:inline">
            Storage: {mode === "postgres" ? "Database" : mode === "local-files" ? "Local files (dev/preview)" : "NOT CONFIGURED"}
          </span>
          <form action={logoutAction} className="ml-auto sm:ml-0">
            <button className="rounded-sm border border-bt-cream/30 px-3 py-1.5 text-[12px] hover:bg-bt-cream/10">Sign out</button>
          </form>
        </div>
      </header>
      {mode === "unconfigured" && (
        <p className="bg-red-700 px-4 py-2 text-center text-sm text-white">Quote storage is not configured. Set DATABASE_URL before creating quotes.</p>
      )}
      {children}
    </>
  );
}
