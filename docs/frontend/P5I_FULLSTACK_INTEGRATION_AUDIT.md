# P5I — Full-Stack Integration Audit

Status: COMPLETE before implementation. Starting commit: `a186331d5bb23dbcd04359b6a7b1e751885f5fc2`.

## Baselines

Node 24.12.0 / npm 11.6.2: clean install, lint, TypeScript, 128/128 frontend tests and production build PASS. Windows uses `npm.cmd` because PowerShell script policy blocks `npm.ps1`.

Python 3.12.10 environment: `pip check` PASS; Compose `config --quiet` PASS; Alembic head `0005_embedding_provenance`. Docker was stopped and was started for the isolated `diploma-p5i-baseline` project (backend 8105, Keycloak 8185). Fresh M01–M07 regression PASS: **114/114**, zero failures/skips, using `pytest -q --tb=line -p no:cacheprovider tests/unit/test_tenant_contract.py tests/unit/test_brain_contracts.py tests/unit/test_knowledge_processing.py tests/contract tests/security tests/integration` in the Python 3.12 Compose db-tests image.

## API and application audit

`api/app.py` exposes only `/health/live` and `/health/ready`. `application/queries.py` already provides authorized Product search/detail, Inventory batch lookup, Customer lookup, Order detail and Owner sales reports. All use existing tenant transactions and policy checks. Product search requires a nonempty query; it is not an unrestricted catalog list. Customer and Order lists are absent. Exact decimal values, price currencies, versions and Inventory observation time are supported; live delivery and uncertain-operation reconciliation projections are absent.

`repositories/postgres.py` supports the query services, tenant predicates and RLS. It has internal conversation/run/config reads but no public safe run/audit/list DTO or field authorization. M07 has lifecycle and retrieval services, but no approved document administration list/query DTO. Adding those projections would introduce business query behavior rather than thin transport, so these screens retain explicit fixtures.

## Security and business scope

`security/oidc.py` verifies RS256, trusted issuer, audience, signature, expiry and Bearer token type. `StaffIdentityService.resolve` maps issuer/subject to provisioned `app_users`, then reads the selected business membership. OWNER/OPERATOR come from the database. PLATFORM_ADMIN is a recognized identity but does not automatically gain business-data access. `security/policy.py` checks current membership for business reads, explicit customer assignment for Operators, and OWNER for reports. No domain/policy/repository behavior may change.

The transport will accept a selected `X-Business-ID` only as a requested scope and pass it through existing identity/membership resolution on every request. The Next.js server will use one configured business scope; the browser will not choose a trusted tenant. No new membership discovery contract is invented.

## Keycloak topology

Compose pins Keycloak 26.3.3 backed by its own PostgreSQL database. No persistent realm/client export exists. The existing M05 live test creates and removes a synthetic realm and `business-api` audience client. Therefore there is no approved production realm name to assume. P5I will supply an explicitly isolated local test realm/client provisioner for genuine code-flow testing; production administrators must configure the actual issuer/client and provision database membership separately.

The access-token contract uses `iss`, `sub`, `aud`, `iat`, `exp`, `typ=Bearer`; business authorization comes from database membership, not arbitrary token attributes or UI role claims. External issuer and internal JWKS transport may differ in Docker; a configured internal JWKS fetch adapter must retain exact external issuer validation.

## Frontend audit

`services/auth/contracts.ts` has an unconfigured AuthAdapter; `types/auth.ts` defines safe session projections. `services/api/client.ts` centralizes bearer requests but lacks timeout, semantic error mapping, request validation and business scope. Staff layout currently renders the shared shell publicly. Login is an unavailable boundary. Every feature adapter currently returns deterministic fixtures, except the health client. Feature components remain separate from adapter transport.

Products and Inventory can reuse existing view models with a REAL mode and explicit missing-field labels. Customer and Order detail can expose existing safe records without inventing relationship lists or delivery results. Analytics must retain per-currency, confirmed-order semantics; no currency conversion, missing-period zero fill or forecast is allowed. Remaining fixture screens must stay visibly separated from real records.

## Environment, CORS and integration decision

Current frontend `.env.example` contains only a public API origin. Backend Settings contains only DATABASE_URL. No OIDC transport bootstrap or CORS exists. P5I may add validated integration settings, auth dependencies, typed read DTOs and explicit local-origin CORS. Next.js will use a server-side OIDC client and opaque HttpOnly session cookie; tokens never enter client storage or React props. Existing fixtures remain available for deterministic tests. Real API failure never falls back to fixture records.

## Frozen boundaries

M08 remains PARTIAL / BLOCKED / DEFERRED; M12 TARGET / NOT STARTED; M13 NOT STARTED; E02 active. Domain, tools, policy, repositories, schema, migrations, Business Brain/RAG and Figma remain frozen. No generic tool execution HTTP endpoint or new domain query feature is authorized.
