# P2 baseline inventory (before implementation)

Branch: `reconstruction/p2-platform-completion`; starting Git tree was clean at P1 commit `775f0b0`. This records the imported candidate, not a runtime PASS.

| Area | Present | Partial / missing / unknown |
| --- | --- | --- |
| Python source | 63 complete `.py` files in `platform/`; 40 under `services/` | Seven core Python modules excluded by P1 recovery: repository, executor, ports, Brain contracts/service/sources, Knowledge service |
| Tests | 16 complete Python files under `tests/` | `test_knowledge.py`, `test_m08_specialists.py`, two external M08 tests partial |
| Project metadata | `pyproject.toml`, Python `>=3.11,<3.14` and pinned direct dependencies | Host only has Python 3.10.7; test environment not established |
| Requirements | `requirements-m01-m02.lock`, `requirements-m01-m05.lock` | Final generated `requirements-m01-m07.lock` unknown |
| Docker / Compose | Historical execution reports, `.dockerignore` | Final backend Dockerfile and `infra/compose/compose.yaml` excluded as partial |
| Database / Alembic | `alembic.ini`, `env.py`, script template, revisions `0001`–`0005` | `0001` requires absent hash-pinned `implementation_handoff/contracts/docs/engineering/physical_schema.sql`; repository module partial |
| Configuration | `infrastructure/settings.py`, `pyproject.toml` | `.env.example` and MinIO policy partial; real `.env` intentionally absent |
| Security / identity | OIDC, policy, tenant and identity modules; security tests | Depends on unresolved repository and live Keycloak/PostgreSQL for behavior checks |
| Domain / application | Models, errors, context, orders, queries and evidence modules | Depends on unresolved repository implementation |
| Ten tools | `tools/contracts.py` and cursor; contract test | Executor and ports partial |
| Business Brain / RAG | Conflict logic, Knowledge contracts/embedding/processing/repository/storage | Brain contracts/service/sources and Knowledge service partial |
| Agents | Contracts, prompts, provider and runtime for three specialists; provider unit test | M08 integration/live tests partial; no provider credentials; M08 deferred |
| Orchestration | Empty package marker and historical design docs | Shared foundation not implemented; M09–M13 treatments out of scope |
| Other tree | `apps/web`, `packages`, `data`, `experiments` contain placeholders only | No frontend; no trained forecast artifact, which is consistent with pre-artifact `MODEL_NOT_READY` |
| Implementation documentation | 19 Markdown files under `platform/docs/implementation` | Sanitized handoff payload absent; `SANITIZATION_REPORT.json` partial |

Static local-import analysis from the P1 candidate found six unresolved modules: `platform_backend.brain.{contracts,service,sources}`, `platform_backend.knowledge.service`, `platform_backend.repositories.postgres`, and `platform_backend.tools.executor`. `tools.ports` is also absent and must be checked via relative imports/callers. Initial host `python --version`: 3.10.7, below the declared minimum. `docker --version` returned 29.7.2 but warned that its user config could not be read; Docker runtime readiness is unknown.

The 17 recovery-path notes and 11 safe Python patch-fragment files were inspected from `C:\Users\Asus\Desktop\PlatformRecovery\extracted\partial` read-only. No raw secret journal or INTERNAL master was opened at this baseline step.
