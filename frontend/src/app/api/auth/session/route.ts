import { NextResponse } from "next/server";
import { serverAuthAdapter } from "@/services/auth/server";
import { ApiError } from "@/services/api/client";

export const runtime = "nodejs";
export async function GET() {
  try {
    const identity = await serverAuthAdapter.getSession();
    return NextResponse.json(identity ? { identity } : { code: "UNAUTHENTICATED" }, { status: identity ? 200 : 401, headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    const status = error instanceof ApiError && error.status === 403 ? 403 : 503;
    return NextResponse.json({ code: status === 403 ? "FORBIDDEN" : "DEPENDENCY_UNAVAILABLE" }, { status, headers: { "Cache-Control": "no-store" } });
  }
}
