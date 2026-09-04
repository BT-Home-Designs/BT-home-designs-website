import type { Metadata } from "next";
import { LoginForm } from "@/components/internal/LoginForm";
import { business } from "@/lib/data/business";

export const metadata: Metadata = {
  title: "Staff Sign In",
  robots: { index: false, follow: false },
};

export default async function InternalLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;
  const callbackUrl = params.callbackUrl && params.callbackUrl.startsWith("/internal") ? params.callbackUrl : "/internal";

  return (
    <div className="flex min-h-screen items-center justify-center bg-warm-white px-6">
      <div className="w-full max-w-sm">
        <p className="eyebrow mb-2">{business.name} — Internal</p>
        <h1 className="mb-8 font-display text-2xl text-charcoal">Staff Sign In</h1>
        <LoginForm callbackUrl={callbackUrl} />
      </div>
    </div>
  );
}
