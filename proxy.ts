// Next.js 16 uses proxy.ts. On Next.js 15 or older: rename this file to
// middleware.ts and rename the function below to `middleware`.
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const PUBLIC_PREFIXES = ["/login", "/signup", "/apply", "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic =
    pathname === "/" ||
    PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (isPublic) return NextResponse.next();

  // Optimistic redirect only (cookie exists?). This is NOT security.
  // The real checks happen on the server in requireOrg().
  if (!getSessionCookie(request)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};