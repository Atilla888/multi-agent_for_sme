import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { canonicalCallbackUrl, oidcEnvironment, safeReturnTo, trustedOrigin } from "./configuration";
import { ExpiringRegistry, sessionCookie, sessions } from "./store";
import { POST as logout } from "@/app/api/auth/logout/route";

afterEach(() => { vi.unstubAllEnvs(); vi.restoreAllMocks(); });
function configure() {
  vi.stubEnv("APP_ORIGIN", "http://127.0.0.1:3100");
  vi.stubEnv("API_SERVER_BASE_URL", "http://127.0.0.1:8105");
  vi.stubEnv("OIDC_ISSUER", "http://127.0.0.1:8185/realms/p5i-test");
  vi.stubEnv("OIDC_CLIENT_ID", "test-client");
  vi.stubEnv("APP_BUSINESS_ID", "00000000-0000-4000-8000-000000000001");
  vi.stubEnv("OIDC_ALLOW_LOCAL_HTTP", "true");
}

describe("server OIDC and opaque session boundaries", () => {
  it("requires all trusted configuration and a real business UUID", () => {
    configure();
    expect(oidcEnvironment().businessId).toBe("00000000-0000-4000-8000-000000000001");
    vi.stubEnv("APP_BUSINESS_ID", "browser-role-is-not-a-grant");
    expect(oidcEnvironment).toThrow();
  });
  it.each(["http://external.example.invalid", "https://user:password@example.invalid", "https://example.invalid/path", "https://example.invalid?token=1"]) ("rejects unsafe application origin %s", value => { expect(() => trustedOrigin(value, true)).toThrow(); });
  it("permits local HTTP only with explicit opt-in", () => {
    expect(() => trustedOrigin("http://127.0.0.1:3000", false)).toThrow();
    expect(trustedOrigin("http://127.0.0.1:3000", true)).toBe("http://127.0.0.1:3000");
  });
  it.each(["//foreign.example.invalid", "https://foreign.example.invalid", "/products\\evil", "/api/auth/callback", "/products\r\nLocation: evil"]) ("does not accept open return redirects %s", value => { expect(safeReturnTo(value)).toBe("/overview"); });
  it("preserves a valid staff return path", () => { expect(safeReturnTo("/products?q=Lamp")).toBe("/products?q=Lamp"); });
  it("uses configured public callback origin after verifying Host, even with an internal Next.js bind URL", () => {
    configure();
    expect(canonicalCallbackUrl("http://localhost:3100/api/auth/callback?code=local-code&state=bound-state", "127.0.0.1:3100").href).toBe("http://127.0.0.1:3100/api/auth/callback?code=local-code&state=bound-state");
    expect(() => canonicalCallbackUrl("http://localhost:3100/api/auth/callback", "foreign.example.invalid")).toThrow();
  });
  it("uses unpredictable opaque IDs, expiry and single-use transactions", () => {
    const store = new ExpiringRegistry<{ token: string }>();
    const key = store.put({ token: "server-secret" }, 1000, 0);
    expect(key).not.toContain("server-secret");
    expect(key.length).toBeGreaterThanOrEqual(43);
    expect(store.get(key, 999)).toEqual({ token: "server-secret" });
    expect(store.get(key, 1000)).toBeNull();
    const once = store.put({ token: "once" }, 1000);
    expect(store.take(once)).toEqual({ token: "once" });
    expect(store.take(once)).toBeNull();
  });
  it("refuses cross-origin logout and supports no-session local logout", async () => {
    configure();
    const refused = await logout(new NextRequest("http://127.0.0.1:3100/api/auth/logout", { method: "POST", headers: { origin: "https://foreign.example.invalid" } }));
    expect(refused.status).toBe(403);
    const response = await logout(new NextRequest("http://127.0.0.1:3100/api/auth/logout", { method: "POST", headers: { origin: "http://127.0.0.1:3100" } }));
    expect(response.status).toBe(303);
    expect(response.headers.get("location")).toBe("http://127.0.0.1:3100/login");
    expect(response.headers.get("set-cookie")).toContain(sessionCookie);
  });
  it("unknown browser-supplied session IDs cannot produce a staff identity", () => {
    expect(sessions.get("fake-owner-role-cookie")).toBeNull();
  });
});
