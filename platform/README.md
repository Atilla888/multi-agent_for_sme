# Intelligent Adaptive Multi-Agent Platform

> **Current P2 status: PARTIAL.** The original README text below describes the historical pre-reconstruction repository and must not be treated as current validation. This branch now contains restored PostgreSQL, trusted tools, Business Brain and Knowledge/RAG source, plus the hash-matching physical SQL. Static checks pass, but M01–M07 were **not revalidated**: the host has Python 3.10 while the project requires 3.11–3.13, and the Docker daemon is unavailable. M08 remains deferred. No real `.env` or full sanitized handoff was restored. See [RECOVERY_STATUS.md](RECOVERY_STATUS.md) and [P2 results](../recovery/P2_TEST_RESULTS.md). Do not use the historical start instructions below until a supported isolated environment is available.

This fresh repository implements verified M01–M05 foundations: Compose/PostgreSQL/RLS,
the tenant-scoped domain/repository core, ten strict business tool boundaries, and
identity/authorization. The `update_order` mutation branch is policy-blocked pending an
approved E02 editable-field allowlist; `forecast_sales` returns `MODEL_NOT_READY` before a
validated artifact. Business LLM agents, orchestration, Brain/RAG, model training, frontend,
and experiment execution are intentionally absent.

Authoritative implementation context is the verified `implementation_handoff/` package.
Never import private or Final benchmark material into this repository.

## Local start

1. Copy `.env.example` to `.env` and replace every placeholder.
2. Run `docker compose --env-file .env -f infra/compose/compose.yaml config --quiet` (do not print expanded secrets).
3. Run `docker compose --env-file .env -f infra/compose/compose.yaml up --build --wait`.
4. Run the M01–M05 PostgreSQL and local Keycloak tests with
   `docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q tests/unit tests/integration tests/security tests/contract`.

The host requires Docker. Backend compatibility is established by the Python 3.12 container,
not by an older host Python.

