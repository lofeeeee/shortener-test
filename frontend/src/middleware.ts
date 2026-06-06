import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Auth route handlers (/api/auth/login, /register, /logout) set/clear the
// HttpOnly cookie themselves. Every other /api/* request gets the token
// injected as a Bearer header so the Laravel backend receives it normally.
const AUTH_HANDLER_PATHS = new Set([
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
]);

export function middleware(request: NextRequest) {
  if (AUTH_HANDLER_PATHS.has(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  if (!token) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set("Authorization", `Bearer ${token}`);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: "/api/:path*",
};
