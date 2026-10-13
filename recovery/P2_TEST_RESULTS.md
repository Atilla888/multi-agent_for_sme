# P2 test and validation results

Date: 2026-10-13. Branch: `reconstruction/p2-platform-completion`.

## Reproducible environment

- Initial host runtime: Python 3.10.7, outside the declared `>=3.11,<3.14` range.
- Installed runtime: official CPython 3.12.10 at `C:\Users\Asus\AppData\Local\Programs\Python\Python312\python.exe`.
- Isolated environment: `platform/.venv`, Python 3.12.10, pip 25.0.1; Git-ignored.
- Dependency authority: direct/dev pins from `pyproject.toml`, with `requirements-m01-m07.lock` used as constraints. Linux-only `uvloop` was not forced onto Windows.
- Install: `.venv\Scripts\python.exe -m pip install --constraint requirements-m01-m07.lock --editable ".[dev]"` — PASS.
- Dependency consistency: `.venv\Scripts\python.exe -m pip check` — PASS, no broken requirements.

## Static and local gates

| Gate | Result |
| --- | --- |
| Compile all project Python, excluding `.venv` | PASS — 72 files |
| `ruff check --no-cache .` with pinned Ruff 0.12.11 | PASS |
| `ruff format --check --no-cache .` | PASS — 72 files already formatted |
| `mypy --no-incremental` | PASS — 47 source files |
| P2 reconstruction tests | PASS — 6 passed in 75.39s |
| Safe local non-provider subset | PASS — 34 passed, 5 skipped in 63.44s |

The five local skips are database-dependent identity cases without a local `DATABASE_URL`; they were exercised later inside the isolated Compose stack. No failed test was reclassified as skipped.

## Collection and infrastructure gates

| Gate | Result |
| --- | --- |
| Exact M01–M07 collection, excluding M08 provider test | PASS — 114 collected, 0 errors in 3.44s |
| Docker Engine | PASS — server 29.7.2 |
| Docker Compose | PASS — v5.5.0 |
| Isolated Compose project | PASS — `diploma-p2`; ordinary services healthy, setup jobs exited 0 |
| Compose config | PASS — `config --quiet` |
| Images from current source | PASS — migration, backend and db-tests built |
| Alembic fresh upgrade | PASS — revisions 0001 through 0005 applied |
| `alembic heads` / `alembic current` | PASS — `0005_embedding_provenance (head)` |

The project used isolated `diploma-p2_*` resources. Existing unrelated containers, images and historical volumes were not deleted or modified. The local `.env.p2.local` contains generated development-only values, is Git-ignored and was not printed or committed.

## Database/integration gate

The first full run produced **99 passed, 15 failed**. Every failure was a fail-closed MinIO `OBJECT_UNAVAILABLE` caused by the documentation-guided example bucket `platform-private-dev` not matching the recovered least-privilege policy's approved `sme-private-objects` bucket. Project implementation evidence names `sme-private-objects` as the approved development default, so `.env.example` and the ignored P2 environment were corrected; the policy and authorization behavior were not broadened.

After rebuilding from the final formatted source, the exact M01–M07 scope completed with:

**114 passed, 0 failed, 0 skipped in 23.01s.**

This is the P2 completion gate and establishes readiness for P3 revalidation. It does not relabel M01–M07 as newly formal PASS milestones.

## Exclusions

- `tests/unit/test_m08_provider.py` and all live/external provider acceptance remain excluded because M08 is PARTIAL/BLOCKED/DEFERRED.
- No provider credential or external LLM call was used.
- M09–M13, Pilot, Final and frontend execution were not started.
