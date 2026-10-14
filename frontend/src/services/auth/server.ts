import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ApiError, createApiClient } from "@/services/api/client";
import { readApi } from "@/services/api/reads";
import { oidcEnvironment, safeReturnTo } from "./configuration";
import { sessionCookie, sessions } from "./store";
import type { AuthAdapter } from "./contracts";

export const currentServerSession = cache(async () => {
  const cookieStore = await cookies();
  const id = cookieStore.get(sessionCookie)?.value;
  const session = sessions.get(id);
  if (!session) return null;
  const env = oidcEnvironment();
  try {
    const api = readApi(createApiClient({ baseUrl: env.backendUrl, businessId: env.businessId, getAccessToken: async () => session.accessToken }));
    const me = await api.me();
    if (me.subject !== session.identity.subject || me.business_id !== env.businessId) { sessions.take(id); return null; }
    return { ...session, identity: { ...session.identity, roles: [me.role], businessName: me.business_name } };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) { sessions.take(id); return null; }
    throw error;
  }
});

export const serverAuthAdapter: AuthAdapter = {
  async getSession() { return (await currentServerSession())?.identity ?? null; },
  async beginLogin(returnTo) { redirect(`/api/auth/login?returnTo=${encodeURIComponent(safeReturnTo(returnTo))}`); },
  async logout() { const store = await cookies(); sessions.take(store.get(sessionCookie)?.value); store.delete(sessionCookie); },
};

export async function authenticatedReadApi() {
  const session = await currentServerSession();
  if (!session) redirect("/login?state=session-expired");
  const env = oidcEnvironment();
  return readApi(createApiClient({ baseUrl: env.backendUrl, businessId: env.businessId, getAccessToken: async () => session.accessToken }));
}
