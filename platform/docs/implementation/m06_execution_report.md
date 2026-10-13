# M06 — Business Brain / Context Assembly execution report

Checkpoint: 2026-09-29, local Docker Compose/Python 3.12.12/PostgreSQL 17.8. Source authority was the verified sanitized `implementation_handoff/` only. The gate verifier returned `SANITIZED_HANDOFF_READY`, owner digest matched, zero findings; pre-change M01–M05 baseline was 60/60.

## Implementation

- `brain/contracts.py`: trusted `ContextRequest`, strict untrusted `ModelContextHints`, seven typed ContextBundle components, development limits, provenance, completeness/missing states, reduced future-model projection, canonical digest and build trace.
- `brain/sources.py`: bounded authorized conversation/history, structured Product/Inventory/Customer/Order/report reads through existing M03–M05 services, read-only durable run/operation state, trusted rules and explanatory permission projection. No LLM summary is assumed; an optional summary provider is explicitly derived.
- `brain/conflicts.py`: fact-specific precedence, not a global similarity score: current Order/Inventory over summary/document, machine policy over document instruction, current published document over retired, equal-authority contradiction as explicit `CONFLICT`.
- `brain/service.py`: read-only assembler and knowledge-provider port. Requested knowledge is `UNAVAILABLE` until M07 is attached; it is not silently fabricated. Cross-business and same-tenant STAFF-to-Customer knowledge evidence are refused again at assembly.
- `repositories/postgres.py` and `application/queries.py`: tenant-bound read methods for conversation, recent messages, run/operation refs, configuration version and Product. No business write is performed by context build.

The seven components are request, conversation, structured, retrieved, runtime state, rules and permissions. Provenance carries source/type/version/business/observation/scope and digest where relevant. Restricted fields and raw credentials do not enter the future-model projection. Developer limits (`DEV_CONTEXT_*`) record truncation; unresolved operations are not silently truncated. Equivalent source versions produce the same canonical context digest even when observation clocks or architecture mode differ. The context interface does not instantiate SINGLE/STATIC_MULTI/ADAPTIVE_MULTI execution or an agent.

## Executed evidence

```text
docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q --tb=line -p no:cacheprovider tests/unit tests/integration tests/security tests/contract
```

M06-specific: **19 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED** — 9 unit and 10 real-PostgreSQL integration cases (`tests/unit/test_brain_contracts.py`, `tests/integration/test_brain.py`). Full checkpoint: **79 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**; all previous 60 remain green. Tests cover owned/foreign/same-tenant unauthorized Orders, bounded history, stale Inventory metadata, summary conflict, source-authority rules, explicit equal-authority conflict, permission projection, analytics Owner vs Operator, run-role mismatch, same/foreign knowledge-scope denial, no write during build, mode invariance, digest, provenance and sensitive-field exclusion.

`ruff check --no-cache services/backend/src tests` passed; `ruff format --check --no-cache services/backend/src tests` reported 49 formatted files; `mypy --no-incremental services/backend/src` reported no issues in 36 source files.

## Limits and status

M06 does not claim real RAG retrieval, summarization, external API routes, LangGraph or an agent. Business rules are the currently machine-enforced baseline plus business configuration version; no editable E02 order policy was invented. Knowledge evidence was tested through a controlled provider interface; real MinIO/pgvector lifecycle belongs to M07. No migration or new dependency was needed for M06. **M06: PASSED** on its executed contract.

Subsequent M07 integration/regression checkpoint: the same 19 M06 cases remained green inside the executed **114 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED** full suite. M07's `KnowledgeContextProvider` now supplies real read-only evidence only when requested; M06's authority/projection rules were not replaced. See `m07_execution_report.md` for real MinIO/pgvector claims and the 0005 technical metadata migration. The original 79-case M06 checkpoint remains historical evidence, not an inflated total.
