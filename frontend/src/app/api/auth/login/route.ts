import { NextRequest, NextResponse } from "next/server";
import { beginOidcLogin } from "@/services/auth/oidc";
import { transactionCookie } from "@/services/auth/store";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  try {
    const login = await beginOidcLogin(request.nextUrl.searchParams.get("returnTo"));
    const response = NextResponse.redirect(login.destination);
    response.cookies.set(transactionCookie, login.transactionId, { httpOnly: true, secure: login.env.origin.startsWith("https:"), sameSite: "lax", path: "/", maxAge: 300 });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch { return NextResponse.redirect(new URL("/login?state=unavailable", request.url)); }
}
