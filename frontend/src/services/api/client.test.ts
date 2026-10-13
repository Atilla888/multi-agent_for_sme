import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError, createApiClient } from "./client";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("API client boundary", () => {
  it("adds a bearer token without persisting it and returns typed JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ status: "alive" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);
    const client = createApiClient({
      baseUrl: "http://127.0.0.1:8000/",
      getAccessToken: async () => "ephemeral-token",
    });

    await expect(client.request<{ status: string }>("health/live")).resolves.toEqual({ status: "alive" });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://127.0.0.1:8000/health/live");
    expect(new Headers(init.headers).get("Authorization")).toBe("Bearer ephemeral-token");
  });

  it("preserves backend status and request correlation on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 503, headers: { "x-request-id": "request-7" } })),
    );
    const client = createApiClient({ baseUrl: "http://127.0.0.1:8000" });

    const error = await client.request("/health/ready").catch((cause: unknown) => cause);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 503, requestId: "request-7" });
  });
});
