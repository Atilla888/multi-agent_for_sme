# P5I — Authentication Decision

Status: approved implementation decision before source changes.

## Current topology

Keycloak 26.3.3 is pinned in Compose. Existing M05 tests provision temporary synthetic realms; there is no canonical production realm/client export. Backend OidcVerifier already validates RS256 issuer/audience/expiry/signature and StaffIdentityService resolves database users/membership. OWNER and OPERATOR are database grants; PLATFORM_ADMIN never implies Owner access.

## Selected flow

Next.js Node runtime acts as an OIDC relying party using **Authorization Code + S256 PKCE + state + nonce**. Redirects are built from fixed trusted environment configuration. `openid-client` is the focused standards library; its discovery, code-grant validation and signature validation avoid implementing OAuth cryptography locally. Its exact dependency version will be pinned before use. No password form exists in Next.js.

Browser receives only an opaque random HttpOnly, SameSite=Lax, Path=/ cookie. Secure is mandatory for HTTPS; HTTP is permitted only on explicit loopback development configuration. Access and ID tokens stay in a bounded, expiring server session registry. The single-process local MVP intentionally expires sessions on restart and requires one Next.js instance. Shared production session storage is a deployment follow-up, not an invented business database schema.

## Lifetime, refresh and logout

Session lifetime is bounded by the returned access-token expiry and a short application maximum. No long-lived refresh token is retained; expiry requires a fresh Keycloak login. Pending login transactions expire after five minutes and are consumed once. Tokens are never persisted in localStorage, browser-readable cookies, URLs returned by application data APIs, component props or evidence.

Logout is same-origin POST, deletes the server session immediately, expires the cookie and redirects through Keycloak RP-initiated logout. ID-token hint is used only for the standard provider logout navigation; application data never exposes it. No generic token endpoint/proxy is provided. Backchannel logout/multi-instance sessions remain explicit deployment limitations.

## Backend validation and current principal

The callback validates OIDC tokens and calls FastAPI `/me` using the access token and configured business ID. Backend independently verifies the token and existing database membership. Staff routes call the existing AuthAdapter integration and require a current server session; real reads go through the same server API client. Membership is checked again on each backend read. No frontend role claim becomes authority.

## Business scope and transport

One selected business ID is configured on the server for this MVP. It is a requested scope, never a trusted grant. Backend `StaffIdentityService.resolve` verifies it; business query policies recheck membership and object access. Business switching/discovery is unavailable until an approved query exists.

Server API requests use validated configured base URL, Bearer authorization, X-Business-ID and a request UUID, no shared caching, finite timeout and semantic 401/403/404/409/5xx errors. Explicit CORS origins permit only configured frontend origins; no wildcard credentials. Internal JWKS URL, when needed by Docker, is separately trusted transport configuration while issuer/audience/signature remain unchanged.

## Alternatives rejected

- Password grant in frontend: would handle passwords and add a second credential surface.
- Browser bearer/localStorage: exposes durable tokens to JavaScript.
- Unvalidated JWT role decoding or fake users: bypasses the established principal contract.
- Generic browser tool RPC: violates trusted executor ownership.
- Automatic token refresh/replay/mutations: not required for read-first P5I and complicates expiry/effect safety.

## Primary references

- [Keycloak OIDC endpoints and code flow](https://www.keycloak.org/securing-apps/oidc-layers)
- [openid-client maintained implementation](https://github.com/panva/openid-client)
- [Next.js authentication/session guidance](https://nextjs.org/docs/app/guides/authentication)
- [Next.js cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)
- [FastAPI explicit-origin CORS](https://fastapi.tiangolo.com/tutorial/cors/)
