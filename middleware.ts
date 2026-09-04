import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Security boundary between the public marketing site and the internal
 * quote application. Everything under /internal requires a valid session
 * EXCEPT the login page itself (or this would redirect-loop).
 *
 * Uses next-auth's getToken() rather than a Prisma/DB lookup: it only
 * verifies the signed JWT session cookie, so it's safe to run on the Edge
 * runtime and never touches the database. The actual credential check
 * (email/password against InternalUser) happens in lib/auth/options.ts,
 * which runs in the Node.js runtime API route, not here.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/internal/login") {
    return NextResponse.next();
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  if (!token) {
    const loginUrl = new URL("/internal/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/internal/:path*"],
};
