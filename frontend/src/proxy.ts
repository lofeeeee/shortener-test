import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register"];
const SLUG_PATTERN = /^\/[a-z0-9][a-z0-9_-]{1,18}[a-z0-9]$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;

  const isPublic =
    PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith("/login") || pathname.startsWith("/register")) ||
    SLUG_PATTERN.test(pathname);

  if (!isPublic && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
