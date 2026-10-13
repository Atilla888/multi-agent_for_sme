export type StaffRole = "OWNER" | "OPERATOR" | "PLATFORM_ADMIN";

export interface AuthenticatedSession {
  readonly subject: string;
  readonly displayName: string;
  readonly roles: readonly StaffRole[];
  readonly activeBusinessId: string | null;
  readonly expiresAt: string;
}
