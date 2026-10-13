import type { AuthenticatedSession } from "@/types/auth";

export interface AuthAdapter {
  getSession(): Promise<AuthenticatedSession | null>;
  beginLogin(returnTo: string): Promise<void>;
  logout(): Promise<void>;
}

export const keycloakBoundary = {
  provider: "Keycloak / OIDC",
  status: "not-configured",
  tokenStorageRule: "Do not store access tokens in localStorage.",
  authorizationRule: "Backend authorization remains decisive for every read and action.",
} as const;
