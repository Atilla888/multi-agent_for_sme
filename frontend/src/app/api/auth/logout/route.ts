import { NextRequest, NextResponse } from "next/server";
import { oidcEnvironment } from "@/services/auth/configuration";
import { providerLogout } from "@/services/auth/oidc";
import { sessionCookie, sessions } from "@/services/auth/store";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const env = oidcEnvironment();
  if (request.headers.get("origin") !== env.origin) return NextResponse.json({ code: "FORBIDDEN" }, { status: 403 });
  const session = sessions.take(request.cookies.get(sessionCookie)?.value);
  let destination = new URL("/login", env.origin);
  if (session) { try { destination = await providerLogout(session.idToken); } catch { /* Local session is already revoked. */ } }
  const response = NextResponse.redirect(destination, 303);
  response.cookies.delete(sessionCookie);
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
