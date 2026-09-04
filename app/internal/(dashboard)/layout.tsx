import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { InternalNav } from "@/components/internal/InternalNav";

/**
 * Defense-in-depth: middleware.ts already blocks unauthenticated requests
 * to everything under /internal (except /internal/login) at the edge. This
 * layout re-checks the session server-side before rendering, so a page
 * under this route group is never rendered for a logged-out request even
 * if middleware were ever misconfigured or bypassed.
 */
export default async function InternalDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/internal/login");
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <InternalNav userEmail={session.user.email ?? ""} userName={session.user.name ?? ""} />
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
