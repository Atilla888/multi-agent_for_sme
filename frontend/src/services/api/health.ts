import type { ApiClient } from "./client";

export interface LivenessResponse {
  readonly status: "alive";
}

export interface ReadinessResponse {
  readonly status: "ready" | "not_ready";
  readonly migration?: string;
}

export const healthApi = (client: ApiClient) => ({
  liveness: () => client.request<LivenessResponse>("/health/live"),
  readiness: () => client.request<ReadinessResponse>("/health/ready"),
});
