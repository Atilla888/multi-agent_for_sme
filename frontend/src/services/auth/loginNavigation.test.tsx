import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Children, isValidElement, type ReactElement, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { NextRequest } from "next/server";
import LoginPage from "@/app/(auth)/login/page";
import { GET as startLogin } from "@/app/api/auth/login/route";

const { beginLogin } = vi.hoisted(() => ({ beginLogin: vi.fn() }));
vi.mock("@/services/auth/oidc", () => ({ beginOidcLogin: beginLogin }));

beforeEach(() => {
  vi.stubEnv("APP_ORIGIN", "http://127.0.0.1:3100");
  vi.stubEnv("API_SERVER_BASE_URL", "http://127.0.0.1:8105");
  vi.stubEnv("OIDC_ISSUER", "http://127.0.0.1:8185/realms/p5i-test");
  vi.stubEnv("OIDC_CLIENT_ID", "test-client");
  vi.stubEnv("APP_BUSINESS_ID", "00000000-0000-4000-8000-000000000001");
  vi.stubEnv("OIDC_ALLOW_LOCAL_HTTP", "true");
  beginLogin.mockReset();
});
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

function authControl(node: ReactNode): ReactElement<{ href?: string; children?: ReactNode }> | undefined {
  for (const child of Children.toArray(node)) {
    if (!isValidElement<{ href?: string; children?: ReactNode }>(child)) continue;
    if (child.props.href === "/api/auth/login") return child;
    const nested = authControl(child.props.children);
    if (nested) return nested;
  }
}

describe("explicit browser login initiation", () => {
  it.each([undefined, "session-expired", "login-failed", "unavailable"])("rendering login state %s does not initiate an OIDC transaction", async state => {
    const network = vi.fn();
    vi.stubGlobal("fetch", network);
    const page = await LoginPage({ searchParams: Promise.resolve(state ? { state } : {}) });
    const control = authControl(page);
    // A native anchor has no router prefetch behavior; styling remains the approved button.
    expect(control?.type).toBe("a");
    const markup = renderToStaticMarkup(page);
    expect(markup).toContain('href="/api/auth/login"');
    expect(markup).toContain('class="button button--primary"');
    expect(markup).toContain(">Sign in</a>");
    expect(beginLogin).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
  });

  it("only explicit navigation to the auth-start endpoint invokes transaction creation, without caching", async () => {
    const page = await LoginPage({ searchParams: Promise.resolve({}) });
    expect(beginLogin).not.toHaveBeenCalled();
    beginLogin.mockResolvedValue({
      destination: new URL("http://127.0.0.1:8185/realms/p5i-test/protocol/openid-connect/auth"),
      transactionId: crypto.randomUUID(), env: { origin: "http://127.0.0.1:3100" },
    });
    const response = await startLogin(new NextRequest(new URL(authControl(page)!.props.href!, "http://127.0.0.1:3100")));
    expect(beginLogin).toHaveBeenCalledExactlyOnceWith(null);
    expect(response.status).toBe(307);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("Referrer-Policy")).toBe("no-referrer");
    const cookie = response.cookies.get("diploma_oidc_transaction");
    expect(cookie).toMatchObject({ path: "/", httpOnly: true, secure: false, sameSite: "lax", maxAge: 300 });
  });
});
