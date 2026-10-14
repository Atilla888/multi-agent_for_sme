export interface OidcEnvironment {
  readonly issuer: string;
  readonly clientId: string;
  readonly clientSecret?: string;
  readonly origin: string;
  readonly businessId: string;
  readonly backendUrl: string;
  readonly allowLocalHttp: boolean;
}

export const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("OIDC integration is not configured.");
  return value;
}

export function trustedOrigin(value: string, allowLocalHttp: boolean, issuer = false): string {
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1"].includes(url.hostname);
  if (url.username || url.password || url.search || url.hash ||
    (url.protocol !== "https:" && !(allowLocalHttp && local && url.protocol === "http:")) ||
    (!issuer && url.pathname !== "/")) {
    throw new Error("Trusted HTTPS integration URL is required.");
  }
  return url.toString().replace(/\/$/, "");
}

export function oidcEnvironment(): OidcEnvironment {
  const allowLocalHttp = process.env.OIDC_ALLOW_LOCAL_HTTP === "true";
  const businessId = required("APP_BUSINESS_ID");
  if (!uuidPattern.test(businessId)) throw new Error("Invalid configured business scope.");
  return {
    issuer: trustedOrigin(required("OIDC_ISSUER"), allowLocalHttp, true),
    clientId: required("OIDC_CLIENT_ID"),
    clientSecret: process.env.OIDC_CLIENT_SECRET,
    origin: trustedOrigin(required("APP_ORIGIN"), allowLocalHttp),
    backendUrl: trustedOrigin(required("API_SERVER_BASE_URL"), allowLocalHttp),
    businessId, allowLocalHttp,
  };
}

export function safeReturnTo(value: string | null): string {
  const supported = /^\/(overview|conversations|escalations|customers|orders|products|inventory|documents|analytics|forecasts|integrations|settings|audit|agent-runs)(\/|\?|$)/;
  return value && supported.test(value) && !value.includes("\\") && !/[\r\n]/.test(value)
    ? value : "/overview";
}

export function canonicalCallbackUrl(requestUrl: string, host: string | null): URL {
  const env = oidcEnvironment();
  const incoming = new URL(requestUrl);
  if (host !== new URL(env.origin).host || incoming.pathname !== "/api/auth/callback") {
    throw new Error("Untrusted callback host or path.");
  }
  // Next.js may use its internal bind hostname in request.url. Host is checked
  // against the fixed public origin; only path/query are copied to that origin.
  return new URL(incoming.pathname + incoming.search, env.origin);
}
