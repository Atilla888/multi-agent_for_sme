import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client";
import { parseInventory, parsePrincipal, parseProducts, parseSales } from "./reads";

afterEach(() => { vi.unstubAllGlobals(); });
describe("real HTTP client and transport DTOs", () => {
  it("adds verified server scope, correlation, timeout and no-store without replacing headers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ status: "alive" })));
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient({ baseUrl: "http://127.0.0.1:8105", businessId: "selected-scope", getAccessToken: async () => "server-token" });
    await client.request("/me", { headers: { "X-Request-ID": "existing-request" } });
    const [, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(options.headers).get("X-Business-ID")).toBe("selected-scope");
    expect(new Headers(options.headers).get("X-Request-ID")).toBe("existing-request");
    expect(options.cache).toBe("no-store");
    expect(options.redirect).toBe("error");
    expect(options.signal).toBeDefined();
  });
  it.each([[401, "unauthenticated"], [403, "permission-denied"], [404, "not-found"], [409, "stale-conflict"], [422, "validation-error"], [503, "dependency-unavailable"]]) ("maps HTTP %s to %s", async (status, kind) => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(null, { status: Number(status) })));
    const error = await createApiClient({ baseUrl: "http://127.0.0.1:8105" }).request("/me").catch(value => value);
    expect(error).toBeInstanceOf(ApiError);
    expect(error instanceof ApiError && error.kind).toBe(kind);
  });
  it("maps network errors without retry or fixture fallback", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error("network unavailable"));
    vi.stubGlobal("fetch", fetchMock);
    const error = await createApiClient({ baseUrl: "http://127.0.0.1:8105" }).request("/products?q=lamp").catch(value => value);
    expect(error instanceof ApiError && error.kind).toBe("dependency-unavailable");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("rejects cross-origin token forwarding", async () => {
    const fetchMock = vi.fn(); vi.stubGlobal("fetch", fetchMock);
    await expect(createApiClient({ baseUrl: "http://127.0.0.1:8105" }).request("//foreign.example.invalid")).rejects.toThrow();
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("rejects malformed DTOs instead of casting or substituting fixtures", () => {
    expect(() => parsePrincipal({ role: "OWNER" })).toThrow();
    expect(() => parseProducts({ items: [{ id: "fixture-id" }], next_id: null, next_name: null })).toThrow();
    expect(() => parseInventory({ items: [{ available_quantity: 0 }] })).toThrow();
    expect(() => parseSales({ series: [], included_statuses: ["CREATED"] })).toThrow();
  });
});
