import { NextRequest, NextResponse } from "next/server";
import { finishOidcLogin } from "@/services/auth/oidc";
import { sessionCookie, sessions, transactionCookie } from "@/services/auth/store";
import { ApiError } from "@/services/api/client";
import { canonicalCallbackUrl, oidcEnvironment } from "@/services/auth/configuration";

export const runtime = "nodejs";
export async function GET(request: NextRequest) {
  let response: NextResponse;
  try {
    const login = await finishOidcLogin(canonicalCallbackUrl(request.url, request.headers.get("host")), request.cookies.get(transactionCookie)?.value);
    sessions.take(request.cookies.get(sessionCookie)?.value);
    response = NextResponse.redirect(new URL(login.returnTo, login.env.origin));
    response.cookies.set(sessionCookie, login.sessionId, { httpOnly: true, secure: login.env.origin.startsWith("https:"), sameSite: "lax", path: "/", maxAge: login.lifetime });
  } catch (error) {
    // Report only a stable error category, never error text, request URLs or tokens.
    const category = error instanceof ApiError ? `HTTP_${error.status}` :
      error && typeof error === "object" && "code" in error && typeof error.code === "string" && /^[A-Z_]+$/.test(error.code) ? error.code : "OIDC_REJECTED";
    console.warn("OIDC_CALLBACK_REJECTED", category);
    let origin: string | null = null;
    try { origin = oidcEnvironment().origin; } catch { /* Fail closed when not configured. */ }
    response = origin ? NextResponse.redirect(new URL("/login?state=login-failed", origin)) : NextResponse.json({ code: "NOT_CONFIGURED" }, { status: 503 });
  }
  response.cookies.delete(transactionCookie);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
