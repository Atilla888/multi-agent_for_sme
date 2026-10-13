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
}

export interface ApiClientOptions {
  readonly baseUrl?: string;
  readonly getAccessToken?: () => Promise<string | null>;
}

export interface ApiClient {
  request<T>(path: string, init?: RequestInit): Promise<T>;
}

export function createApiClient(options: ApiClientOptions = {}): ApiClient {
  const baseUrl = (options.baseUrl ?? getApiBaseUrl()).replace(/\/$/, "");

  return {
    async request<T>(path: string, init: RequestInit = {}): Promise<T> {
      const token = await options.getAccessToken?.();
      const headers = new Headers(init.headers);
      headers.set("Accept", "application/json");
      if (token) headers.set("Authorization", `Bearer ${token}`);

      const response = await fetch(`${baseUrl}${path.startsWith("/") ? path : `/${path}`}`, {
        ...init,
        headers,
      });
      const requestId =
        response.headers.get("x-request-id") ?? response.headers.get("x-correlation-id");

      if (!response.ok) {
        throw new ApiError(`Backend request failed with status ${response.status}.`, response.status, requestId);
      }

      return (await response.json()) as T;
    },
  };
}
