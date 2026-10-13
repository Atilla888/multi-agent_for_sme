# Milestone recovery, not milestone re-acceptance

Historical status comes from the surviving development-safe master (release note, pp. 1–2) and session-backed `docs/implementation/m0*_execution_report.md`. It is not a new validation result. M01–M07: **HISTORICALLY PASSED — REVALIDATION REQUIRED**; M04 retains the approved E02 `update_order` mutation limitation. M08: **HISTORICALLY PARTIAL / BLOCKED**; scripted regression passed historically, but the latest required live-provider gate failed five cases. M09–M13 were not begun.

| Milestone | Historical status | Source recovery coverage | Test recovery coverage | Revalidate now? | Blocking gap |
| --- | --- | --- | --- | --- | --- |
| M01 repository / Compose | Passed in scope | Skeleton, `pyproject.toml`, verifier recovered; final Compose/Dockerfile and handoff absent | Historic report only; no runnable environment | NO | Compose/Dockerfile, generated final lock, handoff, local environment |
| M02 PostgreSQL / tenancy | Passed in scope | Alembic revisions `0001`–`0003` plus later revisions recovered | `test_schema.py`, `test_rls.py` recovered | PARTIAL | Final repository code and Compose missing; DB not started |
| M03 domain / repository | Passed in scope | Domain/application source recovered; `postgres.py` partial | `test_domain_core.py`, `test_acceptance_core.py` recovered | PARTIAL | Repository implementation final state unresolved |
| M04 ten tools | Passed with E02 limitation | Contracts/cursor recovered; executor and ports partial | `test_tools.py` recovered | PARTIAL | Executor final state unresolved; DB runtime unavailable |
| M05 security / identity | Passed in scope | OIDC/policy/identity source recovered | Identity, Keycloak and RLS tests recovered | PARTIAL | Repository/Compose and live Keycloak/DB unavailable |
| M06 Business Brain | Passed in scope | Conflict logic recovered; contracts/service/sources partial | Brain unit and integration tests recovered | NO | Three central Brain modules unresolved |
| M07 RAG | Passed in scope | Most knowledge modules and migration `0005` recovered; service partial | Real-model and processing tests recovered; integration test partial | NO | Knowledge service, Compose/MinIO policy, repository integration |
| M08 three agents / provider | Partial / blocked, not passed | Four agent modules recovered; upstream Brain/Executor partial | Provider unit test recovered; specialist integration and two external tests partial | NO | Upstream code, partial tests, secrets/config and prior five live-provider failures |

No row is marked newly passed. Static syntax checks are recorded in `FINAL_RECOVERY_REPORT.md`; they do not exercise PostgreSQL, Keycloak, MinIO, an LLM, or the frozen acceptance gates.
