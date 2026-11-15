import type { AuthenticatedSession } from "@/types/auth";

/**
 * Local preview without sign-in: browse the staff app on sample data with no Keycloak or backend.
 * Only for `npm run dev` with LOCAL_PREVIEW_NO_SIGN_IN=true; a production build never enables it.
 * It grants nothing on the backend: there is no access token, so every screen shows sample data.
 */
export function localPreviewEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.LOCAL_PREVIEW_NO_SIGN_IN === "true";
}

export const localPreviewIdentity: AuthenticatedSession = {
  subject: "00000000-0000-4000-8000-0000000000aa",
  displayName: "Demo owner",
  roles: ["OWNER"],
  activeBusinessId: null,
  businessName: "Demo shop",
  expiresAt: "2099-01-01T00:00:00.000Z",
};
