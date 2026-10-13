# Recovery completeness matrix

This is file-content recovery from the 29 September journal, not a working-build certification. “Complete” means the listed file contents have a continuous, successful patch history; it does not mean the whole subsystem is runnable. See [RECOVERABLE_PATHS.md](RECOVERABLE_PATHS.md) for every path and per-file status.

| Component | Expected from historical audit / development-safe master | Recovered evidence | Missing or unresolved evidence | Completeness | Confidence |
| --- | --- | --- | --- | --- | --- |
| Repository / foundation | Project skeleton, dependency and handoff baseline | `README.md`, `pyproject.toml`, ignore files, structure verifier, placeholder dirs | Original `.git`, actual sanitized `implementation_handoff/` payload and its verifier inputs | PARTIAL | HIGH |
| Configuration | Development config and safe template | `pyproject.toml`, settings module, older lock files | Final `.env.example` touched by dynamic patch; `.env` deliberately omitted | PARTIAL | HIGH |
| Docker | Backend image and Compose services | Path/revision evidence for Dockerfile and Compose | Exact final Dockerfile and Compose are unresolved; M01–M07 final lock generated dynamically | PARTIAL | HIGH |
| Database / Alembic | PostgreSQL physical schema, tenant isolation, revisions | Alembic config/env and revisions `0001`–`0005` | `repositories/postgres.py` final text ambiguous; original handoff SQL absent; runtime revalidation blocked | PARTIAL | HIGH |
| Security / identity | OIDC, policy, tenant boundary, identity service | `security/{oidc,policy}.py`, `application/identity.py`, `domain/context.py`, security tests | Repository dependency partial; Keycloak/DB execution not rerun | PARTIAL | HIGH |
| Domain / application services | Models, reads, order mutation, durable operation evidence | Domain modules and `application/{orders,queries,evidence}.py` | Repository implementation partial; no live DB validation | PARTIAL | HIGH |
| Ten tools / executor | Ten frozen contracts, admission and execution | `tools/{contracts,cursor}.py`, contract test | Final `executor.py` changed by dynamic patch; `ports.py` patch context unresolved | PARTIAL | HIGH |
| Business Brain | Typed ContextBundle, assembly, sources and conflict handling | `brain/conflicts.py`, `brain/__init__.py`, integration/unit tests | Final `brain/{contracts,service,sources}.py` unresolved | PARTIAL | HIGH |
| RAG | Ingestion, publication, retrieval and evidence | `knowledge/{contracts,embedding,processing,repository,storage}.py`, migration `0005`, real-model test | Final `knowledge/service.py`, Compose/MinIO policy and integration test unresolved | PARTIAL | HIGH |
| Agents | Three specialist contracts/prompts/runtime | `agents/{contracts,prompts,provider,runtime}.py`, provider unit test | Specialist integration and external live tests partial; runtime imports partial Brain/Executor | PARTIAL | HIGH |
| Orchestration | Adaptive routing and recoverable state | Architecture docs and empty `orchestration/__init__.py` | No implemented M09+ orchestration source recovered; historical M09+ not started | MISSING | HIGH |
| Tests | Unit, contract, integration, security and live-provider checks | 16 complete Python files under `tests/`, including 13 `test_*.py` modules | Four test files partial; DB/provider dependencies unavailable in this candidate | PARTIAL | HIGH |
| M08 provider layer | Gemini adapter and provider contract | `agents/provider.py`, `tests/unit/test_m08_provider.py`, prompt/model registry | External live tests partial; prior live-provider gate failed five cases; not accepted | PARTIAL | HIGH |
| Documentation / evidence | M01–M08 execution provenance and sanitized handoff | 19 `docs/implementation/` Markdown files, including M01–M08 reports | Handoff payload absent; sanitization report base missing; M09–M12 files are planning/status records, not passed execution | PARTIAL | HIGH |

The counts above intentionally do not turn historical test reports into fresh PASS results. Unknown future components and unlisted files cannot be declared recovered just because the architecture describes them.
