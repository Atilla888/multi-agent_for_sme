# P5I — Full-Stack Integration

Status: **COMPLETE** for the audited, available read-first local MVP scope.
Branch: `integration/p5i-fastapi-keycloak`.
Date: 2026-10-15 (local project time).

## Scope

P5I connects Next.js to real Keycloak authentication and purpose-specific FastAPI reads using the existing trusted identity, business scope and QueryService. No business mutation, generic tool RPC, messaging subsystem, forecast service, database migration or new domain query is introduced.

## Starting State

Canonical starting commit `a186331d5bb23dbcd04359b6a7b1e751885f5fc2` contains merged P5G/H. Initial worktree was clean. The integration branch was created and pushed before source changes.

Initial frontend baseline: Node 24.12.0, npm 11.6.2, clean install, lint, typecheck, 128/128 tests and production build PASS. Python environment: 3.12.10, `pip check` PASS. Compose configuration PASS; Alembic head `0005_embedding_provenance`. A fresh isolated baseline stack passed the unchanged 114/114 M01–M07 regression using the pinned Python 3.12 container.

## API Audit

The [audit](P5I_FULLSTACK_INTEGRATION_AUDIT.md) preceded implementation. Starting HTTP routes were only `/health/live` and `/health/ready`. Existing QueryService safely supports Product search/detail, bounded Inventory lookup, Customer detail, Order detail and OWNER sales reports. Missing list/administration/messaging contracts remain absent instead of becoming new domain features.

## Integration Matrix

The [pre-implementation matrix](P5I_API_INTEGRATION_MATRIX.md) explains every exposure decision. The [final capability matrix](P5I_FINAL_CAPABILITY_MATRIX.md) records REAL / FIXTURE / UNAVAILABLE / TARGET behavior for all fifteen staff families and separate Web Chat. Customer/Order lists and real details are separate datasets and routes.

## Keycloak / OIDC Architecture

The [auth decision](P5I_AUTH_DECISION.md) selected server-side Authorization Code + S256 PKCE, state and nonce through `openid-client@6.8.8`. Signature verification is enabled, including issuer/audience/nonce checks. Browser credentials go only to Keycloak. Access/ID tokens stay in the server registry; browser receives an opaque HttpOnly, SameSite=Lax cookie. HTTPS requires Secure; explicitly configured loopback development HTTP is the only exception.

The local MVP runs one Next.js Node instance. Session state is bounded and expiring; a restart invalidates sessions. No long-lived refresh token or localStorage persistence exists. Production multiple-instance/shared storage and backchannel logout remain deployment work. Explicit logout deletes the app session and completes standard Keycloak RP-initiated logout. Expired sessions require sign-in again.

## Current Principal

`GET /me` delegates to unchanged StaffIdentityService/OidcVerifier. It returns only the mapped application subject, USER kind, effective database role, verified selected business, optional business name and expiry. The existing configuration tuple is a version tuple, not a name: business_name is deliberately null, and the shell wraps the verified UUID.

Next.js `GET /api/auth/session` returns only the safe session projection. Callback must successfully resolve `/me` before creating a session. Staff layout and real data requests require the server AuthAdapter. Backend identity/membership is revalidated per request, with request-local React caching to avoid duplicate `/me` reads inside one render.

## Business Scope

One server-configured APP_BUSINESS_ID is supported. X-Business-ID is a requested scope, never trusted authorization. StaffIdentityService validates provisioned issuer/subject and selected membership, then unchanged query policies check membership/resource assignment. OWNER/OPERATOR grants come from the database. PLATFORM_ADMIN does not imply Owner business access. No browser-controlled role or business grant is accepted.

## Public Read APIs

| Endpoint | Existing source | Boundary |
|---|---|---|
| `GET /me` | StaffIdentityService / PrincipalContext | OIDC verification and selected membership |
| `GET /products` | QueryService.find_products | Nonempty query, 1–50 limit, existing cursor semantics |
| `GET /products/{UUID}` | QueryService.get_product | Business access; privacy-safe inaccessible response |
| `GET /inventory` | QueryService.check_inventory | Bounded unique Product IDs; observed quantities |
| `GET /customers/{UUID}` | QueryService.find_customer | OWNER or explicitly assigned OPERATOR |
| `GET /orders/{UUID}` | QueryService.get_order | Existing customer/object authorization |
| `GET /analytics/sales` | QueryService.report | OWNER only; timezone-aware range and existing measures |

All responses use explicit DTOs and exact decimal strings. Missing/invalid auth is 401, forbidden membership is 403, inaccessible/not-found objects are 404, conflicts 409, invalid requests 422 and unavailable sources 503. Internal exception details, SQL objects, JWT claims, provider secrets and tool arguments are not returned. Health routes remain available. No public create/reserve/update endpoint exists.

## Frontend API Client

The existing P5A client now validates origin/path, adds server Bearer and business scope, generates/preserves request UUIDs, uses no-store and finite timeout, rejects redirects and maps semantic failures. Components receive typed read models instead of calling fetch. Runtime DTO validation rejects malformed values; network/schema failure never substitutes fixture records.

## Fixture Replacement

Products and Inventory use real API by default. Customer and Order UUID detail routes use real API; their unsupported lists remain explicitly fixture-backed. Analytics uses real confirmed-order units/value, separates currencies and preserves exact table decimals. Existing ACTUAL chart is reused for returned observations; omitted periods are not connected or zero-filled. Multiple charts have distinct accessible title IDs.

Integrated fixtures remain test/demo infrastructure. Explicit `mode=fixture` review requires `P5I_ENABLE_FIXTURE_REVIEW=true`; it defaults false. Mutations remain unavailable. A known failure is not OUTCOME_UNKNOWN; no mutation replay or automatic retry was added.

The observed-Inventory caveat is a neutral Card, not a Pending operation badge: known returned quantities must not acquire an unsourced operation state. A component assertion and final real-browser check cover this distinction.

## Remaining Fixture Screens

Conversations, Escalations, Documents, Integrations, Settings, Audit and Agent Runs retain labelled fixtures because no safe public query contract exists. Audit/Agent Runs default restricted states remain. Web Chat is separate and NOT_CONFIGURED with no send transport. Overview has no populated dashboard query. Forecasts remains current MODEL_NOT_READY with a separate illustrative target specimen.

## Error Mapping

401 maps to session-expired/sign-in; 403 to PermissionDenied/Restricted; 404 to privacy-safe inaccessible; 409 to stale/conflict review; 422 to a known invalid read request; network/5xx to unavailable. Auth/backend failure hides business records instead of retaining prior data or inventing zeros. Staff loading has a semantic loading boundary. Safe callback logs contain only a category, never URL, code, token or credential.

## Security

Backend core domain/application/repository/security/tool/Brain/RAG behavior is unchanged. Only HTTP adapters, DTOs, bootstrap/configuration, tests and safe env examples were changed. Base Compose, Dockerfile, schema and all five migrations are unchanged; optional compose.p5i.yaml contains OIDC/CORS transport wiring only. Explicit origins, GET methods and limited headers are configured; credential wildcard CORS is absent.

Negative tests cover all seven reads with missing/invalid tokens and foreign business scope, platform-admin non-grant, foreign object IDs, unassigned Operators, Owner-only analytics, expired token, removed membership, invalid queries, unsupported mutation/tool routes and CORS refusal. Frontend tests cover configuration, open redirects, opaque registry expiry/single use, same-origin logout, status mapping, no token forwarding, schema validation and no fixture fallback.

## Backend Tests

New HTTP tests: **39/39 PASS** against real PostgreSQL and signed JWT verification. Final complete safe tree: **164/164 PASS**, zero failures/skips, 30.15 s in the rebuilt isolated regression image. This includes the historical 114, 39 new HTTP tests, six reconstruction checks and five existing offline MockTransport M08 provider tests. No external provider was contacted and those five tests do not complete M08 acceptance.

Final Ruff lint PASS, format check PASS (70 files), mypy PASS (50 source files). Alembic remains `0005_embedding_provenance`. Existing core tests were not weakened.

## Frontend Tests

**160/160 PASS across 22 files**; all original 128 remain green. Clean npm ci installed 389 packages. Lint, TypeScript and production build PASS (23 generated pages); production audit reports **0 vulnerabilities**. Five existing development-only advisories remain. No npm audit fix was run. Added dependencies are the focused openid-client and its jose/oauth4webapi protocol dependencies; no UI, chat, state-management or admin framework was added.

## Full-Stack Smoke

Real headless Edge used the production Next.js app, local Keycloak 26.3.3 and real isolated PostgreSQL records. The frontend client had code flow and mandatory S256 PKCE; direct/password grant was disabled. The test account was a genuine local Keycloak subject with a provisioned OWNER membership, not a fabricated app identity.

Final result: **24/24 route/state checks PASS**, real login PASS, `/me` role/business resolution PASS, real Products/Inventory/Customer/Order/Analytics reads PASS, logout PASS, Keycloak SSO logout PASS. Replaying the old app cookie returned 401. Missing/invalid backend auth returned 401/401; cross-origin logout returned 403. A controlled stop of only the test backend produced an unavailable screen without prior records. Real two-minute session expiry returned 401 and redirected staff routes to sign-in.

Screenshots reviewed: long real Product name/reference, wrapped business UUID, Inventory at exact 390 px, real empty Analytics, authorization denial, backend outage and expired session. At 390 px both viewport and document widths are 390; tables scroll locally. Initial login plus first real read took 3858 ms; current-principal round trip 54 ms; observed route rendering was 84–499 ms. These are local observations, not a production SLA. No frontend request loop or per-row HTTP N+1 was found; Inventory uses one bounded batch request.

The final copy-only visual rerun also passed 24/24 and the neutral Inventory assertion at 390 px. That cold local run measured 17806 ms for login/first read and 291 ms for current-principal round trip; host load/startup variability is visible and should be profiled during P5J/K rather than represented as a production guarantee. Extended outage/expiry evidence from the prior full smoke remains separately retained.

Reproducible tooling: `platform/tests/p5i/provision_local.py` and `frontend/scripts/p5i-browser-smoke.mjs`. Provisioning is limited to a `p5i-engineering-*` realm and isolated test tenant. Private random credentials are written to an untracked private temp file, never logs or Git. The browser script validates cookie policy, data separation, denied/expired states and optional controlled outage/expiry. Its evidence contains no access tokens. Task-owned services are stopped after checks, the temporary realm is removed and private credential/profile artifacts are removed; isolated test volumes remain for traceability.

## P5I.5 — OIDC Prefetch Race Fix

The controlled P5I.4 browser diagnosis identified an auth-start race, not a reason to relax protocol validation. The login page's Next.js `Link` pointed to `/api/auth/login`. Automatic router prefetch could GET that side-effecting endpoint while another login was in progress. Login A created transaction A; the speculative request created transaction B and replaced the shared `diploma_oidc_transaction` cookie. Callback A then selected transaction B. `openid-client` correctly rejected the mismatched state with `OAUTH_INVALID_RESPONSE` before code exchange. This controlled reproduction establishes the mechanism; a generic earlier callback error alone would not identify its cause.

The fix replaces only that `Link` with a native `<a href="/api/auth/login">`, keeping its existing button classes, copy and appearance. The anchor has no Next router prefetch behavior; authentication starts on explicit navigation. No JavaScript navigation workaround or speculative-request heuristic was added. The existing auth-start redirect already sends `Cache-Control: no-store` and `Referrer-Policy: no-referrer`; the route and cookie policy are unchanged.

`loginNavigation.test.tsx` checks that rendering normal/error/expired login states invokes neither authentication nor network traffic, that the control is native navigation, and that explicit auth-start remains non-cacheable. `oidcProtocol.test.ts` exercises the real application OIDC implementation and actual protocol library against an in-memory issuer with ephemeral signing keys. It verifies state rejection before exchange, transaction single use, S256/verifier binding, and rejection of wrong nonce/audience, expired ID tokens and invalid signatures. These tests do not mock the protocol validator or introduce a bypass.

The reproducible `frontend/scripts/p5i-login-race-smoke.mjs` uses the production app and the existing isolated real Keycloak seed. It checks normal login, then starts transaction A, opens another login tab without clicking, observes zero background auth-start requests and an unchanged transaction cookie, and completes callback A. It separately checks fail-closed behavior for a callback with mismatched state. Evidence records only outcomes/counts, never cookie values, state, nonce, authorization codes, tokens, PKCE verifiers or credentials.

P5I.5 verification on 2026-10-15: normal single-tab login PASS; background-tab race regression PASS (zero background auth-start requests, original cookie unchanged, original callback accepted); mismatched-state browser callback REJECTED with no session. The 11 new focused regression cases PASS, and the complete frontend suite is **171/171 across 24 files** (all prior 160 retained). Clean `npm ci` installed the same 389 packages; lint, TypeScript and production build PASS; production audit **0 vulnerabilities**. No dependency or lockfile change was made. After PostgreSQL/Keycloak health and direct discovery/JWKS readiness checks, the unchanged complete backend suite passed **164/164**, zero failures/skips, in 39.89 s. The existing full-stack smoke also passed **24/24**, with real login/callback, verified principal/business reads, real data isolation, logout and old-session replay rejection, Keycloak logout, missing/invalid backend auth rejection, cross-origin logout denial, controlled backend outage without stale records, and actual session expiry (401/sign-in redirect). Signature, nonce, audience and expiry negative protocol tests remained green; state/nonce/PKCE validation and auth timeouts were not changed.

Only login navigation, focused frontend tests/browser regression tooling and this evidence record changed in P5I.5. Backend source/tests, domain/tools, schema/migrations, Keycloak configuration sources, Figma/research and authority documents are unchanged. M08 remains deferred, M12 TARGET / NOT STARTED, M13 NOT STARTED and E02 active. Main is not merged or pushed by this fix; P5J/K is not started. The passing feature branch is ready for a separately authorized final P5I merge.

## P5I.6 — Keycloak Test Provisioning Hardening

The later closure run passed container health, discovery and JWKS readiness, but the live test timed out in `tests/security/test_keycloak_live.py::_http` while waiting for `POST http://keycloak:8080/admin/realms`. The helper used a shared 10-second socket timeout for temporary admin setup and token requests. The complete run ended with 163 passed / 1 failed. This was test-realm provisioning under container load, not a JWT verification, business-scope or browser callback failure; the previously fixed prefetch defect is separate.

`tests/keycloak_admin.py::KeycloakTestAdmin` now applies a bounded **30-second test-admin request timeout** to disposable realm/client/user setup and cleanup. The live test's ordinary token HTTP timeout remains 10 seconds, its real `OidcVerifier` timeout remains 5 seconds, and production authentication/JWKS/frontend timeouts and semantics are unchanged. Before setup, the runner requires healthy PostgreSQL/Keycloak containers and reachable discovery/JWKS. The test must successfully acquire its real master admin token; the helper then actively polls an authenticated lightweight master-realm read (at most three reads within a 60-second budget) before creation. Container health alone is not sufficient.

Only a fresh `m05-smoke-<UUID>` realm is eligible. The helper first confirms absence, then creates it with a per-attempt ownership attribute. After success, conflict, timeout, lost transport or transient server response, an exact-name admin GET reconciles the result. Success requires both the exact realm name and the current attempt marker. A second POST is permitted only after confirmed 404, with the same name/marker; there are at most two creation POSTs. The second result is reconciled again. Unreadable/unknown final state or another owner's realm fails explicitly, without another mutation. Read reconciliation itself is bounded to two requests. Cleanup verifies ownership and never deletes an unrelated realm; an ambiguous DELETE is reconciled without repeating it. This logic applies only to disposable test infrastructure and does not change application OUTCOME_UNKNOWN/no-blind-retry rules.

Focused helper tests live in `platform/tests/unit/test_keycloak_admin.py` and are included in normal full-suite discovery. They cover normal setup, ambiguous creation with an existing owned realm, confirmed absence followed by the one retry, ambiguous retry and 409 reconciliation, final unknown/absent failures, wrong-name/owner protection, bounded readiness, cleanup ownership and ambiguous cleanup, and token/admin timeout separation. No original test, security assertion or discovery path was removed; therefore the full regression now contains the historical 164 cases **plus 22 new helper cases**.

Final P5I.6 evidence (2026-10-15): focused helper tests **22/22 PASS** (0.52 s), scoped Ruff lint/format PASS; the targeted live Keycloak test passed its single execution (**1/1**, 6.79 s). The subsequent complete backend suite ran once and passed **186/186** in 25.88 s, zero failures/skips: all historical **164/164** plus the 22 new infrastructure checks. No selective rerun, skip or xfail was used. Reproduction uses the existing isolated `diploma-p5i-close-regression` Compose setup, real readiness checks, `pytest -q -p no:cacheprovider tests/unit/test_keycloak_admin.py`, the targeted `tests/security/test_keycloak_live.py::test_live_keycloak_token_jwks_membership_and_wrong_audience`, then `pytest -q --tb=native -p no:cacheprovider tests` for the complete gate.

After the backend PASS, clean `npm ci` installed the unchanged 389 packages; frontend lint, TypeScript, **171/171 tests across 24 files**, production build and production audit (**0 vulnerabilities**) passed. Five existing development-only advisories remain; no audit fix or dependency change was made. The existing race smoke passed normal login and the background-tab scenario (zero background auth-start requests, transaction A unchanged, callback A accepted), and mismatched state was rejected without a session. Wrong nonce/audience, expired ID tokens and invalid signatures remained rejected by the unchanged frontend protocol regression; the live/backend tests independently retained real token/JWKS verification and membership/foreign-business rejection.

The complete production-app browser smoke passed **24/24**, including real Keycloak login/callback, verified principal/business scope, real authorized reads and foreign-object denial, logout/old-session replay rejection, Keycloak logout, actual expiry (401/sign-in redirect), cross-origin logout denial and controlled isolated backend outage without stale records. No credentials, tokens, codes, state values or PKCE verifiers are included in evidence. P5I.6 changes are restricted to the test-admin helper, its focused tests, live-test setup/cleanup wiring and this record. Production source, state/nonce/PKCE, JWT verification, domain/tools, schema/migrations, frontend product behavior and Figma are unchanged. M08/M12/M13, E02 and OUTCOME_UNKNOWN remain unchanged. Main is not merged/pushed; P5J/K is not started. The feature branch is ready for a separately authorized FINAL P5I merge; the new complete backend baseline is **186**, not 164 alone.

## Known Gaps

- One configured business and one Next.js instance; no business discovery/switch or shared production session store.
- Production realm/client provisioning, HTTPS ingress, session-storage deployment and backchannel logout require deployment configuration.
- Business name, Customer/Order lists and safe Documents/Audit/Agent Runs/staff messaging queries are not available in current core contracts.
- No activated business writes, delivery provider, customer chat, M12 Resume or M13 forecast.
- Formal cross-browser, assistive-technology, localization and user testing remain later QA gates.
- Native Next.js callback request URLs may contain the internal bind hostname; transport now checks Host and reconstructs the fixed public callback origin. A regression test covers this verified integration defect.

## P5I Verdict

**COMPLETE for the authorized available-contract scope.** Real authentication, independently validated backend identity, tenant-safe available reads, semantic failures, full backend/frontend regressions and actual browser login/read/logout/outage/expiry have passed. Remaining fixtures/unavailable capabilities are intentional audited contract gaps and do not imply new platform milestones. M08, M12, M13, E02 and OUTCOME_UNKNOWN remain unchanged. Figma/research/authority sources remain untouched.

## P5J/K Readiness

Ready for review of the integration branch and a separately authorized P5J/K scope. Recommended sequence: review/merge this PR, then full-stack E2E and UX/accessibility/localization QA against the final matrix, plus deployment hardening of the real identity/session setup. Missing query/domain capabilities require their own approved backend tasks; they must not be filled implicitly during QA. P5J/K was not started and main was not modified by this task.
