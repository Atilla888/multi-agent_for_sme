# M02 execution report — real PostgreSQL migrations and tenant isolation

Executed 2026-09-29 (Asia/Qyzylorda). These are actual PostgreSQL 17.8 / pgvector 0.8.1
results, not SQLite, mocks or schema-only inference. The approved physical SQL was applied
byte-for-byte by digest-guarded revision 0001; its expected SHA-256 is
`5535ba8ab12b17eb5192b034c8b6eda840fadd95dc4eb3cee93d3b4b909c6c94`.

## Migration and catalog evidence

| Executed check | Exact observed result | Status |
|---|---|---|
| Compose migration job against healthy PostgreSQL | Exit 0; Alembic upgraded through `0001_approved_schema`, `0002_tenant_security`, `0003_readiness_grant`. | PASSED |
| `SELECT version_num FROM alembic_version` | `0003_readiness_grant` | PASSED |
| `SELECT extversion FROM pg_extension WHERE extname='vector'` | `0.8.1` | PASSED |
| PostgreSQL catalog inspection | 26 public tables = 25 approved application tables plus `alembic_version`; 24 business-owned tables with forced RLS; 24 `tenant_isolation` policies; 26 PKs; 50 FKs; 16 UNIQUE constraints; 64 CHECK constraints; 61 indexes. | PASSED |
| `docker compose --env-file .env -f infra/compose/compose.yaml run --rm --no-deps migration` | Exit 0 with no pending upgrade; idempotent `upgrade head` on the existing database. | PASSED |
| Restart/recovery check | Before/after restart: `businesses=38`, `customers=26`, revision `0003_readiness_grant`; pgvector remained 0.8.1. | PASSED |

Revision 0003 is a narrow follow-up grant for readiness. It does not redesign or edit the
approved schema. The migrator is a separate privileged bootstrap credential, not the
application connection credential. Destructive Alembic downgrade was reviewed but **not
executed**, as it would drop the approved tables/extension and user data; it is not counted
as a passed runtime test.

## Role, grants and negative-test evidence

The live application role was `platform_runtime`: `rolsuper=false`, `rolbypassrls=false`,
`rolcreatedb=false`, `rolcreaterole=false`; it is not the table owner (`customers` is owned
by `platform_migrator`) and is not a member of the migrator role. It can SELECT
`alembic_version` for readiness, but cannot SELECT `app_users`, INSERT `businesses`, or
DELETE `audit_logs`. Every one of the 24 business-owned tables has enabled and forced RLS
plus a tenant policy.
Catalog inspection also found 24/24 policy expressions scoped by
`current_setting('app.current_business_id', true)`, with matching `USING` and `WITH CHECK`
expressions (the `businesses` policy uses `id`; the other 23 use `business_id`).

The executed negative tests confirmed that a missing tenant context sees zero customer
rows, tenant A cannot read tenant B rows, an A-context insert with B's `business_id` fails,
and `SET row_security = off` cannot yield a bypass. Two independent one-connection-pool
tests (Psycopg pool and SQLAlchemy pool) exercised A → release/rollback → no tenant context
→ B; the backend PID was reused in the SQLAlchemy test, with zero rows visible between
tenants. Composite FK cross-tenant inventory insertion, CHECK (negative price and version
zero), UNIQUE duplicate SKU, transaction rollback, and mandatory forecast-artifact FK
were also exercised against PostgreSQL.

## Executed test count and command

`docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests`
ran after migration and again after clean restart. The post-restart run reported
`15 passed in 0.63s`; rebuilt-image rechecks reported `15 passed in 0.67s` and
`15 passed in 0.64s` on the final images.
There are 15 distinct collected tests: 6 schema/integration, 8 security, 1 unit.
For the final full suite: **PASSED 15 / FAILED 0 / SKIPPED 0 / BLOCKED 0**.
Earlier failed startup attempts were setup failures, fixed and recorded in the M01 report;
they are not hidden as test passes or conflated with the final test count.

The runtime role receives the tenant ID from trusted application code in a transaction-
local PostgreSQL setting. RLS is defense in depth, not a substitute for future authenticated
principal/tenant authorization. M03 and later identity/API behavior are not claimed.

**Exact M02 status: PASSED.** All previously blocked M02 runtime tests and database
security checks listed above were executed successfully.
