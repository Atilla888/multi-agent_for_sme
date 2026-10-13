# P2 test and validation results

Date 2026-10-13. Branch `reconstruction/p2-platform-completion`. Host Python 3.10.7 is **outside** `pyproject.toml`'s `>=3.11,<3.14`; installed package versions also differ from the recovered M07 lock. No dependencies were upgraded or substituted. Counts below are observed process results, not historical claims.

| Exact command / scope | Exit | Passed | Failed/errors | Skipped | Blocked / interpretation |
| --- | ---: | ---: | ---: | ---: | --- |
| `python -c "... ast.parse(...) for platform/**/*.py ..."` / complete source | 0 | 72 files parse | 0 | 0 | Syntax only |
| AST absolute-local-import resolution / full source | 0 | 0 missing `platform_backend.*` modules | 0 | 0 | Relative/dynamic runtime imports still need P3 collection |
| `python -c "import sys,pytest;sys.dont_write_bytecode=True;sys.exit(pytest.main(['-q','-p','no:cacheprovider','tests/reconstruction/test_p2_static.py']))"` / six P2 static tests | 0 | 6 | 0 | 0 | Static-only; includes Alembic chain and schema hash |
| `ruff check --no-cache tests/reconstruction/test_p2_static.py services/backend/src/platform_backend/knowledge/service.py tests/integration/test_knowledge.py services/backend/src/platform_backend/repositories/postgres.py services/backend/src/platform_backend/brain services/backend/src/platform_backend/tools` | 0 | Targeted restored/new files | 0 | 0 | Available Ruff 0.11.7, not pinned 0.12.11 |
| `ruff check --no-cache .` / all platform source and tests | 1 | — | 8 issues in previously recovered unchanged files | 0 | Non-gating diagnostic with older host Ruff; no unrelated M08/Knowledge files rewritten |
| `docker compose --env-file .env.example -f infra/compose/compose.yaml config --quiet` / structural Compose | 0 | 13-service config accepted | 0 | 0 | No service started, no secrets printed |
| `docker info --format '{{.ServerVersion}}'` / daemon probe | 1 | 0 | Docker API pipe missing | 0 | Container builds, PostgreSQL/MinIO/Keycloak and Alembic execution BLOCKED |
| `python -c "import sys,pytest;sys.dont_write_bytecode=True;sys.path.insert(0,'services/backend/src');sys.exit(pytest.main(['--collect-only','-q','-p','no:cacheprovider','tests/unit/test_tenant_contract.py','tests/unit/test_brain_contracts.py','tests/unit/test_knowledge_processing.py','tests/contract','tests/security/test_identity.py']))"` | 1 | 1 collected | 4 collection errors | 0 | `datetime.UTC` / `enum.StrEnum` unavailable in Python 3.10; M01–M07 collection BLOCKED |
| Local non-provider M01–M07 behavior and M07 database/integration tests | not run | 0 | 0 | 0 | BLOCKED by unsupported Python and unavailable Docker daemon |
| Alembic `upgrade head` against PostgreSQL | not run | 0 | 0 | 0 | BLOCKED; static chain/hash PASS only, no mutation of user DB |
| M08 live/external tests | not run | 0 | 0 | 0 | Intentionally DEFERRED / out of P2 scope |

`pytest` collection failures above are environmental but still prevent P2 COMPLETE under the stated gate. They are not reclassified as skips or passed tests. The earlier M01–M07 historical PASS reports have not been reproduced on this tree.
