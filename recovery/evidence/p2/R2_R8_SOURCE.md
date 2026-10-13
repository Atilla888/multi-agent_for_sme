# R2–R8 source evidence

All checks ran on 2026-10-13 on branch `reconstruction/p2-platform-completion`. P2 does not rerun formal milestones.

| Wave | Documentation authority consulted before change | Source action | Test/evidence | Limit |
| --- | --- | --- | --- | --- |
| R2 | Approved physical schema digest in Alembic 0001; M01/M03 reports | Restored byte-exact SQL and bounded final PostgreSQL adapter | P2 static test verifies five-link revision chain and exact schema digest | No database/upgrade test |
| R3 | Security/identity files, M05 report | No policy changes; repository dependency restored | All source parses; local import graph closed | Identity/RLS tests cannot run under 3.10/no services |
| R4 | M03 domain/application reports and recovered source | No domain business rules changed; repository dependency restored | All source parses; local import graph closed | Business integration tests cannot run |
| R5 | Frozen M04 ten-tool matrix, E02 and unknown-outcome reports | Executor/ports restored from bounded successful outputs | P2 static ten-name/three-role and E02/unknown/forecast checks pass; targeted Ruff pass | No supported-runtime contract execution |
| R6 | M06/M07 reports, recovered Knowledge contracts and safe patch fragments | Brain modules restored; Knowledge service/test completed with documented reconstruction deltas | Source parse and targeted Ruff pass; P2 static import gate passes | No PostgreSQL/MinIO/embedding integration execution |
| R7 | M08 report says partial/blocked | Recovered three-specialist code retained, not extended | Source parse and local import graph pass | No live provider call; M08 deferred |
| R8 | Architecture map explicitly has no orchestration worker; M08 contracts/runtime provide in-memory outcome/handoff/budget structures | No new router, durable resume or later treatment | Static review of `agents/contracts.py`, `agents/runtime.py`, `application/evidence.py` | No M09–M12 claimed |

No generated application secret, real provider request, or mutable database command was used.
