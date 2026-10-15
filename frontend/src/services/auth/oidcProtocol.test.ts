import { createHash, generateKeyPairSync, randomUUID, sign } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const issuer = "http://127.0.0.1:8185/realms/p5i-test";
const clientId = "test-client";
const keys = generateKeyPairSync("rsa", { modulusLength: 2048 });
const jwk = { ...keys.publicKey.export({ format: "jwk" }), kid: "ephemeral-test-key", alg: "RS256", use: "sig" };
type Failure = "nonce" | "audience" | "expiry" | "signature";

function idToken(nonce: string, failure: Failure) {
  const now = Math.floor(Date.now() / 1000);
  const claims = { iss: issuer, aud: failure === "audience" ? randomUUID() : clientId, sub: randomUUID(),
    iat: failure === "expiry" ? now - 120 : now, exp: failure === "expiry" ? now - 60 : now + 120,
    nonce: failure === "nonce" ? randomUUID() : nonce };
  const encoded = [ { alg: "RS256", kid: jwk.kid }, claims ].map(value => Buffer.from(JSON.stringify(value)).toString("base64url")).join(".");
  const signature = sign("RSA-SHA256", Buffer.from(encoded), keys.privateKey);
  if (failure === "signature") signature[0] ^= 1;
  return `${encoded}.${signature.toString("base64url")}`;
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("APP_ORIGIN", "http://127.0.0.1:3100");
  vi.stubEnv("API_SERVER_BASE_URL", "http://127.0.0.1:8105");
  vi.stubEnv("OIDC_ISSUER", issuer);
  vi.stubEnv("OIDC_CLIENT_ID", clientId);
  vi.stubEnv("OIDC_CLIENT_SECRET", "");
  vi.stubEnv("APP_BUSINESS_ID", "00000000-0000-4000-8000-000000000001");
  vi.stubEnv("OIDC_ALLOW_LOCAL_HTTP", "true");
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

async function flow(failure: Failure = "nonce") {
  let expectedNonce = "";
  let tokenBody: URLSearchParams | undefined;
  const network = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) return Response.json({
      issuer, authorization_endpoint: `${issuer}/protocol/openid-connect/auth`,
      token_endpoint: `${issuer}/protocol/openid-connect/token`, jwks_uri: `${issuer}/protocol/openid-connect/certs`,
      response_types_supported: ["code"], subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"], token_endpoint_auth_methods_supported: ["none"],
      code_challenge_methods_supported: ["S256"], authorization_response_iss_parameter_supported: true,
    });
    if (url.endsWith("/token")) {
      tokenBody = new URLSearchParams(String(init?.body));
      return Response.json({ access_token: randomUUID(), token_type: "Bearer", expires_in: 120, id_token: idToken(expectedNonce, failure) });
    }
    if (url.endsWith("/certs")) return Response.json({ keys: [jwk] });
    throw new Error("A rejected OIDC response must not reach the business API");
  });
  vi.stubGlobal("fetch", network);
  const auth = await import("./oidc");
  const store = await import("./store");
  const login = await auth.beginOidcLogin("/products");
  expectedNonce = login.destination.searchParams.get("nonce")!;
  const callback = new URL("http://127.0.0.1:3100/api/auth/callback");
  callback.searchParams.set("code", randomUUID());
  callback.searchParams.set("state", login.destination.searchParams.get("state")!);
  callback.searchParams.set("iss", issuer);
  return { auth, store, login, callback, network, tokenBody: () => tokenBody };
}

describe("unchanged real OIDC protocol validation", () => {
  it("rejects mismatched state before code exchange and consumes the transaction once", async () => {
    const f = await flow();
    f.callback.searchParams.set("state", randomUUID());
    await expect(f.auth.finishOidcLogin(f.callback, f.login.transactionId)).rejects.toMatchObject({ code: "OAUTH_INVALID_RESPONSE" });
    expect(f.tokenBody()).toBeUndefined();
    expect(f.store.transactions.get(f.login.transactionId)).toBeNull();
  });

  it("retains S256 PKCE and passes the bound verifier only to the token endpoint", async () => {
    const f = await flow();
    const transaction = f.store.transactions.get(f.login.transactionId)!;
    const challenge = createHash("sha256").update(transaction.verifier).digest("base64url");
    expect(f.login.destination.searchParams.get("code_challenge_method")).toBe("S256");
    expect(f.login.destination.searchParams.get("code_challenge")).toBe(challenge);
    expect(f.login.destination.searchParams.has("code_verifier")).toBe(false);
    await expect(f.auth.finishOidcLogin(f.callback, f.login.transactionId)).rejects.toMatchObject({ code: "OAUTH_JWT_CLAIM_COMPARISON_FAILED" });
    expect(f.tokenBody()?.get("code_verifier")).toBe(transaction.verifier);
    expect(f.tokenBody()?.get("redirect_uri")).toBe("http://127.0.0.1:3100/api/auth/callback");
    expect(f.network.mock.calls.every(([url]) => String(url).startsWith(issuer))).toBe(true);
  });

  it.each([
    ["nonce", "OAUTH_JWT_CLAIM_COMPARISON_FAILED"],
    ["audience", "OAUTH_JWT_CLAIM_COMPARISON_FAILED"],
    ["expiry", "OAUTH_JWT_TIMESTAMP_CHECK_FAILED"],
    ["signature", "OAUTH_INVALID_RESPONSE"],
  ] as const)("still rejects invalid ID token %s", async (failure, code) => {
    const f = await flow(failure);
    await expect(f.auth.finishOidcLogin(f.callback, f.login.transactionId)).rejects.toMatchObject({ code });
    expect(f.tokenBody()).toBeDefined();
    expect(f.network.mock.calls.every(([url]) => String(url).startsWith(issuer))).toBe(true);
  });
});
