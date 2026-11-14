import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, verifySessionValue } from "@/lib/quotes/session";

/**
 * - /admin/** and /api/admin/**: require a valid signed owner session
 *   (every admin action re-checks this server-side as well).
 * - Customer quote pages, quote APIs, and quote files: never indexed,
 *   never cached by shared caches, and never leak the private URL via
 *   the Referer header (e.g. when the customer clicks through to Square).
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isAdminArea = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isLogin = pathname === "/admin/login";

  let res: NextResponse;
  if (isAdminArea && !isLogin && !(await verifySessionValue(req.cookies.get(ADMIN_COOKIE)?.value))) {
    if (pathname.startsWith("/api/")) {
      res = NextResponse.json({ error: "Not signed in." }, { status: 401 });
    } else {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      res = NextResponse.redirect(url);
    }
  } else {
    res = NextResponse.next();
  }

  res.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive, nosnippet");
  res.headers.set("Referrer-Policy", "no-referrer");
  res.headers.set("Cache-Control", "private, no-store, max-age=0");
  res.headers.set("X-Frame-Options", "DENY");
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/q/:path*", "/api/q/:path*", "/api/quote-files/:path*"],
};
