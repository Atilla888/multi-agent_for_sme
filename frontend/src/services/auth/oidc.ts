import * as oidc from "openid-client";
import { createApiClient } from "@/services/api/client";
import { readApi } from "@/services/api/reads";
import { oidcEnvironment, safeReturnTo } from "./configuration";
import { sessions, transactions } from "./store";

let discovery: Promise<oidc.Configuration> | undefined;
async function configuration() {
  const env = oidcEnvironment();
  if (!discovery) {
    discovery = oidc.discovery(new URL(env.issuer), env.clientId,
      { client_secret: env.clientSecret, id_token_signed_response_alg: "RS256" },
      env.clientSecret ? oidc.ClientSecretPost(env.clientSecret) : oidc.None(),
      { timeout: 8, execute: [...(env.allowLocalHttp ? [oidc.allowInsecureRequests] : []), oidc.enableNonRepudiationChecks] });
  }
  try { return await discovery; } catch { discovery = undefined; throw new Error("Identity provider is unavailable."); }
}

export async function beginOidcLogin(returnTo: string | null) {
  const env = oidcEnvironment();
  const config = await configuration();
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const nonce = oidc.randomNonce();
  const transactionId = transactions.put({ verifier, state, nonce, returnTo: safeReturnTo(returnTo) }, 300_000);
  const destination = oidc.buildAuthorizationUrl(config, {
    redirect_uri: `${env.origin}/api/auth/callback`, response_type: "code", scope: "openid profile",
    code_challenge_method: "S256", code_challenge: await oidc.calculatePKCECodeChallenge(verifier), state, nonce,
  });
  return { transactionId, destination, env };
}

export async function finishOidcLogin(currentUrl: URL, transactionId: string | undefined) {
  const env = oidcEnvironment();
  if (currentUrl.origin !== env.origin || currentUrl.pathname !== "/api/auth/callback") throw new Error("Invalid callback origin.");
  const transaction = transactions.take(transactionId);
  if (!transaction) throw new Error("Login transaction expired.");
  const tokens = await oidc.authorizationCodeGrant(await configuration(), currentUrl, {
    pkceCodeVerifier: transaction.verifier, expectedState: transaction.state, expectedNonce: transaction.nonce, idTokenExpected: true,
  });
  const claims = tokens.claims();
  if (!claims || !tokens.id_token || !tokens.access_token) throw new Error("Verified tokens required.");
  const api = readApi(createApiClient({ baseUrl: env.backendUrl, businessId: env.businessId, getAccessToken: async () => tokens.access_token }));
  const me = await api.me();
  if (me.business_id !== env.businessId) throw new Error("Unexpected resolved business scope.");
  const lifetime = Math.min(tokens.expires_in ?? 0, 600, Math.floor((Date.parse(me.expires_at) - Date.now()) / 1000));
  if (lifetime <= 0) throw new Error("Session expired.");
  const identity = { subject: me.subject, displayName: typeof claims.name === "string" ? claims.name : "Authenticated staff", roles: [me.role], activeBusinessId: me.business_id, businessName: me.business_name, expiresAt: new Date(Date.now() + lifetime * 1000).toISOString() };
  const sessionId = sessions.put({ accessToken: tokens.access_token, idToken: tokens.id_token, identity }, lifetime * 1000);
  return { sessionId, returnTo: transaction.returnTo, lifetime, env };
}

export async function providerLogout(idToken: string) {
  const env = oidcEnvironment();
  return oidc.buildEndSessionUrl(await configuration(), { id_token_hint: idToken, post_logout_redirect_uri: `${env.origin}/login`, client_id: env.clientId });
}
