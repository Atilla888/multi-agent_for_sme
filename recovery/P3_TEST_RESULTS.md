# P3 formal revalidation test results

Date: 2026-10-13. Branch: `revalidation/p3-m01-m07`. Frozen baseline: `1cd69e33be80c81b9222c9a141393d570e692ec6`.

## Environment and common gates

| Gate | Result |
| --- | --- |
| Python | PASS — CPython 3.12.10 in `platform/.venv` |
| Dependency consistency | PASS — pip 25.0.1; `pip check` found no broken requirements |
| Read-only compile | PASS — 72 Python files |
| Ruff lint | PASS |
| Ruff format check | PASS — 72 files |
| Mypy | PASS — 47 source files |
| Pytest collection | PASS — 114 collected, 0 errors in 2.05s |
| Reconstruction regression | PASS — 6 passed in 65.29s |
| Docker/Compose | PASS — Engine/CLI 29.7.2, Compose v5.5.0, `config --quiet` |
| Fresh Alembic chain | PASS — 0001→0005; current/head `0005_embedding_provenance` |

## Isolated runtime and reset method

Every database milestone was run under Compose project `diploma-p3`. Before M03, M04, M05, M06, M07, shared acceptance and final full regression, the exact volumes returned by Docker label `com.docker.compose.project=diploma-p3` were listed, then only those four volumes (`postgres`, `redis`, `minio`, `keycloak`) and project containers/networks were removed with project-scoped `down --volumes`. The unchanged stack was raised and migrations reapplied. No unrelated project resource was removed or pruned.

This makes each milestone start from a fresh known database/object/identity state. The final monolithic suite used another fresh reset, providing order/regression evidence after the independent runs.

## Individual milestone and shared results

| Gate | Exact scope | Result |
| --- | --- | --- |
| M02 | tenant contract + schema + RLS | 15 passed in 0.82s |
| M03 | `test_domain_core.py` | 9 passed in 1.47s |
| M04 | `test_tools.py` | 23 passed in 3.85s |
| M05 | identity + local live Keycloak | 11 passed in 6.20s |
| M06 | Brain unit + integration | 19 passed in 2.51s |
| M07 | Knowledge unit + integration + offline local model | 35 passed in 7.60s |
| Shared acceptance | positive effect/evidence + foreign/forbidden/no-effect | 2 passed in 1.05s |

## Full regression

Command scope inside the db-tests image:

`pytest -q --tb=line -p no:cacheprovider tests/unit/test_tenant_contract.py tests/unit/test_brain_contracts.py tests/unit/test_knowledge_processing.py tests/contract tests/security tests/integration`

Final fresh-state result: **114 passed, 0 failed, 0 skipped in 24.91s.**

## M01 operational evidence

The P3 images built from the frozen source. PostgreSQL/pgvector, Redis, MinIO, Keycloak DB, Keycloak and backend reached healthy; migration and provisioning jobs exited 0. Backend live/ready returned `alive`/`ready` at 0005. Object initialization was idempotent and the bucket remained private. Project stop/start restored health. Post-regression `alembic current` remained `0005_embedding_provenance (head)`.

## First-run and retry integrity

There were no failing platform tests, migrations, startups or milestone retries. One auxiliary read-only post-restart probe failed before DB execution with Python `SyntaxError` because nested shell quoting truncated the SQL string. The command was replaced only at the operator-command layer with a parameterized query; no repository artifact, test, service or database state was changed. The repeat returned revision 0005, pgvector 0.8.1 and initial business/customer counts 0/0. This diagnostic error is not hidden or counted as a platform pass/fail.

## Exclusions

- `tests/unit/test_m08_provider.py`: 5 scripted M08 adapter cases, not executed.
- M08 live/external provider and specialist acceptance: not executed; no active test files are present for that historical external scope.
- M09–M13, Pilot and Final: not executed.

No provider credential was read or printed and no provider/API call was made.

## Cleanup

After evidence capture, `docker compose --project-name diploma-p3 ... stop` completed successfully. All P3 containers are stopped; project test volumes were retained for traceability. No prune, unrelated-container removal or unrelated-volume deletion occurred. Keycloak's stopped container reports exit 137 because Compose terminated that long-running development process during shutdown; it was healthy throughout the gates and this post-validation stop status did not affect any result.
