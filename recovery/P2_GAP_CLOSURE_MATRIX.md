# P2 gap closure matrix

| Area | Initial gap | P2 closure | Verification | Remaining gap |
| --- | --- | --- | --- | --- |
| R0 Foundation | Missing modules; unsupported Python 3.10 | Restored source; installed official Python 3.12.10 and isolated `.venv` | 72 files compile; 114 tests collect; Ruff/mypy pass | None for P2 |
| R1 Config / Docker | Missing lock, Compose, Dockerfile, MinIO policy and env template | Restored evidenced config; safe placeholder template; approved MinIO bucket aligned | Compose config/build/start healthy under isolated `diploma-p2` | None for P2 |
| R2 Database / Alembic | Missing repository and migration-0001 SQL | Restored adapter and exact hash-pinned SQL | Fresh 0001–0005 upgrade; current/head 0005; DB tests pass | Historical handoff package absent, non-blocking |
| R3 Security / Identity | Runtime dependencies unavailable | Restored dependencies and isolated Keycloak/PostgreSQL services | Security/identity/RLS cases pass in 114-test gate | None for P2 |
| R4 Domain / Application | Repository dependency missing | Restored repository without business-rule expansion | Domain/acceptance cases pass | None for P2 |
| R5 Ten Tools / Executor | Executor and ports missing | Restored frozen ten-tool boundary and ports | Contract/security tests pass; E02 remains enforced | None for P2 |
| R6 Brain / RAG | Brain and Knowledge gaps; formatter-obscured provenance | Restored/reconstructed with explicit provenance; normalized with pinned Ruff | Brain, Knowledge, object-store and local-model tests pass | Historical byte identity remains unknowable, non-blocking |
| R7 Agents | M08 partial code only | Preserved without provider extension | Shared source compiles/lints/types; provider test excluded | M08 intentionally PARTIAL/BLOCKED/DEFERRED |
| R8 Orchestration foundation | No standalone worker or later algorithms | Preserved evidenced shared contracts only | Static/runtime shared checks pass | M09–M12 intentionally not started |

P2 is **COMPLETE**. The executable results establish that M01–M07 are **READY FOR P3 REVALIDATION**, not newly declared PASS. No frontend, provider completion or later milestone was started.
