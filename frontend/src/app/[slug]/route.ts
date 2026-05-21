import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const NEXT_ROUTES = new Set(["dashboard", "login", "register", "settings", "api", "_next"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (NEXT_ROUTES.has(slug)) {
    return NextResponse.next();
  }

  const res = await fetch(`${BACKEND}/${slug}`, { redirect: "manual" });

  const location = res.headers.get("location");
  if (location) {
    return NextResponse.redirect(location);
  }

  return NextResponse.redirect(new URL("/", _request.url));
}
