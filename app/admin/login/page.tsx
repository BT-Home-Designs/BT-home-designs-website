/* eslint-disable @next/next/no-img-element */
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/quotes/auth";
import { adminConfigured } from "@/lib/quotes/session";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = adminConfigured();
  return (
    <div className="flex min-h-dvh items-center justify-center px-5">
      <div className="w-full max-w-sm rounded-md border border-bt-gold/30 bg-bt-cream p-7 shadow-sm">
        <img src="/images/brand/bt-logo-240.png" alt="BT Home Designs" className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-4 text-center font-display text-2xl text-bt-green">Quote Dashboard</h1>
        <p className="mb-6 mt-1 text-center text-sm text-charcoal-soft">Owner sign-in</p>
        <LoginForm disabled={!configured} />
        {!configured && (
          <p className="mt-5 rounded-sm bg-amber-50 p-3 text-[13px] leading-snug text-amber-900">
            Setup needed: set <code>QUOTE_ADMIN_PASSWORD</code> (12+ characters) and <code>QUOTE_SESSION_SECRET</code> (32+ random characters) in your hosting
            environment variables, then redeploy.
          </p>
        )}
      </div>
    </div>
  );
}
