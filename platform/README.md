# Intelligent Adaptive Multi-Agent Platform

> **Current status: P2 COMPLETE; M01–M07 READY FOR P3 REVALIDATION.** This is not a new formal M01–M07 PASS declaration. The final P2 gate collected and passed 114/114 in-scope tests on rebuilt images after a fresh Alembic 0001–0005 migration. M08 remains PARTIAL/BLOCKED/DEFERRED; frontend and later milestones were not started. See [RECOVERY_STATUS.md](RECOVERY_STATUS.md) and [P2 results](../recovery/P2_TEST_RESULTS.md).

The candidate provides PostgreSQL/pgvector and tenant isolation, the tenant-scoped domain/repository core, ten strict business-tool boundaries, identity/authorization, Business Brain and Knowledge/RAG foundations. The `update_order` mutation branch remains policy-blocked under E02; `forecast_sales` returns `MODEL_NOT_READY` before a validated artifact.

## Reproducible local environment

1. Use Python 3.12 and create `.venv`.
2. Install the project with dev dependencies using `requirements-m01-m07.lock` as constraints.
3. Copy `.env.example` to an ignored local env file and replace every `CHANGE_ME_*` placeholder.
4. Validate Compose without printing expanded secrets.
5. Start an isolated Compose project and wait for ordinary services to become healthy.
6. Run migrations and the scoped M01–M07 tests. Live/provider M08 tests require a separate authorized gate.

The exact P2 environment, commands, results and boundaries are recorded in [P2 environment and completion evidence](../recovery/P2_ENVIRONMENT_AND_COMPLETION.md). The Windows `py` launcher may require refresh after installing Python; the exact CPython executable or `.venv\Scripts\python.exe` is authoritative.

## Safety boundaries

- Keep `.env`, `.env.p2.local`, `.venv`, credentials and provider keys out of Git.
- Use isolated Compose project names; do not reuse or delete unrelated volumes.
- Preserve exactly ten trusted business tools, E02 restrictions and `OUTCOME_UNKNOWN` no-blind-retry behavior.
- Do not treat the unavailable full historical handoff as runtime authority. The required physical schema is hash-pinned and present.
- Do not claim M08, frontend, M09–M13, Pilot or Final completion from the P2 result.
