import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // Best-effort: revoke token on the Laravel side
  if (token) {
    await fetch(`${BACKEND}/api/auth/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    }).catch(() => {});
  }

  const response = NextResponse.json({ message: "Logged out." }, { status: 200 });
  response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
  return response;
}
