# P3 M01–M07 formal revalidation matrix

Frozen baseline: `1cd69e33be80c81b9222c9a141393d570e692ec6`.

| Milestone | Historical status | Current acceptance gate | Tests / verification | Observed result | Limitation | P3 verdict | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| M01 | PASS | Isolated Compose startup, health, provisioning, private bucket, restart | Docker/Compose operational gate + M02 foundation regression | Services healthy; jobs 0; private bucket; restart PASS; foundation 15/15 | Local development topology | **PASS** | [M01](p3/M01_REVALIDATION.md) |
| M02 | PASS | Migrations/schema/pgvector/least privilege/forced RLS/pool isolation | Tenant 1 + schema 6 + RLS 8 | **15/15** | No destructive downgrade | **PASS** | [M02](p3/M02_REVALIDATION.md) |
| M03 | PASS | Domain/repository/transaction/audit/idempotency/UNKNOWN | Domain 9 + shared acceptance 2 | **9/9**, shared **2/2** | No automatic reconciler | **PASS** | [M03](p3/M03_REVALIDATION.md) |
| M04 | PASS with E02 | Exact ten tools, strict admission, effects/failures/evidence | Contract 23 + shared acceptance 2 | **23/23**, shared **2/2** | E02 mutation denied | **PASS WITH APPROVED LIMITATION — E02** | [M04](p3/M04_REVALIDATION.md) |
| M05 | PASS | OIDC/JWKS/membership/object/tenant authorization | Identity/Keycloak 11 plus RLS/tool negatives | **11/11**; related negatives green | No public feature/auth route | **PASS** | [M05](p3/M05_REVALIDATION.md) |
| M06 | PASS | Seven-part typed read-only Brain | Brain unit/integration 19 | **19/19** | Not orchestration | **PASS** | [M06](p3/M06_REVALIDATION.md) |
| M07 | PASS | Private object/RAG/version/ACL/revocation lifecycle | Knowledge unit/integration/local-model 35 | **35/35** | text/plain UTF-8 development parser | **PASS** | [M07](p3/M07_REVALIDATION.md) |

The final non-overlapping M01–M07 regression manifest contains 114 cases and passed **114/114**. Individual runs and the final suite are overlapping evidence and are not summed. M08's five scripted provider-adapter tests and all provider/live acceptance remain excluded.
