import { getApiBaseUrl } from "@/lib/env";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId: string | null,
  ) {
    super(message);
    this.name = "ApiError";
  }

  get kind() {
    if (this.status === 401) return "unauthenticated";
    if (this.status === 403) return "permission-denied";
    if (this.status === 404) return "not-found";
    if (this.status === 409) return "stale-conflict";
    if (this.status === 422) return "validation-error";
    return "dependency-unavailable";
  }
}

export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly getAccessToken?: () => Promise<string | null>;
  readonly businessId?: string;
  readonly timeoutMs?: number;
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = (options.baseUrl ?? getApiBaseUrl()).replace(/\/$/, "");
  const base = new URL(baseUrl);
  if (base.username || base.password || base.search || base.hash ||
    !["http:", "https:"].includes(base.protocol)) {
    throw new Error("Invalid API origin configuration.");
  }

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const token = await options.getAccessToken?.();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);
      if (options.businessId) headers.set("X-Business-ID", options.businessId);
      if (!headers.has("X-Request-ID")) headers.set("X-Request-ID", crypto.randomUUID());

      const destination = new URL(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`);
      if (destination.origin !== base.origin || path.includes("\\") || path.startsWith("//") || path.includes("://")) {
        throw new Error("API request must stay inside the configured backend origin.");
      }

      let response: Response;
      try {
        response = await fetch(destination.toString(), {
          ...init, headers, cache: "no-store", redirect: "error",
          signal: init.signal ?? AbortSignal.timeout(options.timeoutMs ?? 8000),
        });
      } catch {
        throw new ApiError("Backend is unavailable.", 0, headers.get("X-Request-ID"));
      }
      const requestId =
        response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id");

      if (!response.ok) {
        throw new ApiError(`Backend request failed with status ${response.status}.`, response.status, requestId);
      }

      try {
        return (await response.json()) as T;
      } catch {
        throw new ApiError("Backend response is unavailable.", 502, requestId);
      }
    },
  };
}
