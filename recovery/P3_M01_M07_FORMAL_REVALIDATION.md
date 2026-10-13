# P3 — M01–M07 Formal Revalidation

## 1. Scope

P3 formally revalidated reconstructed M01–M07 without modifying production source, existing tests, migrations, dependencies or configuration semantics. M08 provider/live acceptance, frontend, M09–M13, Pilot and Final were outside scope.

## 2. Frozen Baseline

Commit `1cd69e33be80c81b9222c9a141393d570e692ec6` on new branch `revalidation/p3-m01-m07`. Platform Git tree `c60d6d56a0e9a7c991b245fd2e7750267a49546b`; test tree `def828324e8eab96b03acc38df05962c48a1e9c1`. Full hashes are in [P3_BASELINE_MANIFEST.md](P3_BASELINE_MANIFEST.md).

## 3. Environment

Python 3.12.10 isolated `.venv`; pip 25.0.1; frozen dependency manifests; Docker 29.7.2; Compose v5.5.0; isolated `diploma-p3` project; fresh PostgreSQL/pgvector, Redis, MinIO and Keycloak resources. Local ignored credentials were not printed or committed.

## 4. Milestone Definition Recovery

Definitions were recovered before verdicts from the development-safe master Appendix I and evidence sources S031–S039, then cross-checked with surviving reports. See [P3_MILESTONE_DEFINITION_MAP.md](P3_MILESTONE_DEFINITION_MAP.md). No milestone meaning or new limitation was invented.

## 5. Test Manifest

Fifteen test modules were frozen by path/function/hash. The M01–M07 regression contains 114 expanded cases. Six reconstruction checks are separate. Five M08 scripted provider cases plus live/external acceptance are explicit exclusions. See [P3_TEST_MANIFEST.md](P3_TEST_MANIFEST.md).

## 6. Common Gates

Python compile 72/72, pip check, Ruff lint/format, mypy 47 files, Compose config, Docker startup, pytest collection 114/0 errors, fresh Alembic 0001→0005 and six reconstruction tests all passed.

## 7. M01

Isolated Compose build/start, required health gates, zero-exit migration/provisioning, backend revision readiness, idempotent bucket creation, private anonymous policy and clean stop/start passed. **Verdict: PASS.**

## 8. M02

Fresh migrations, schema/pgvector, constraints, least privilege, forced RLS and tenant/pool negatives passed **15/15**. **Verdict: PASS.**

## 9. M03

Domain/repository transactions, concurrency, audit/idempotency and durable unknown state passed **9/9**; both shared acceptance paths also passed. **Verdict: PASS.**

## 10. M04

Exact ten-tool admission, schemas, permissions, effects/failure semantics, durable evidence, unknown-state reconciliation/no blind retry, delivery separation and `MODEL_NOT_READY` passed **23/23** plus shared acceptance. The approved E02 mutation denial is unchanged. **Verdict: PASS WITH APPROVED LIMITATION — E02.**

## 11. M05

Local live Keycloak token/JWKS plus identity, membership, object, operator and cross-tenant negatives passed **11/11**, with RLS/tool negatives green elsewhere in the same frozen set. **Verdict: PASS.**

## 12. M06

Seven-part typed context, provenance, authority/conflicts, permissions, boundedness, redaction, mode invariance and no-write behavior passed **19/19**. **Verdict: PASS.**

## 13. M07

Private object/RAG lifecycle, parser/chunks, offline local embeddings, pgvector provenance, explicit publication, version/tenant/ACL filtering, revocation and failure/injection negatives passed **35/35**. **Verdict: PASS.**

## 14. Full Regression

After another project-scoped fresh-volume reset, the complete frozen M01–M07 suite passed **114 passed, 0 failed, 0 skipped in 24.91s**. Independent milestone runs plus the final fresh monolithic run showed no order-dependent failure. Counts are overlapping evidence and are not summed.

## 15. Limitations

M01 is local-development topology, M02 has no destructive downgrade claim, M03 has no automatic reconciler, M04 retains E02, M05 has no public feature routes/live channels, M06 is read-only context rather than orchestration, and M07 supports only text/plain UTF-8 development ingestion. `forecast_sales` remains truthful `MODEL_NOT_READY` without M13.

## 16. M08 Boundary

M08 remains **PARTIAL / BLOCKED / DEFERRED**. Its five scripted provider-adapter tests and all provider/live specialist acceptance were excluded. No provider call, model switch, credential use or M08 implementation occurred.

## 17. Evidence Integrity

Each DB milestone and both shared/final gates used fresh volumes labelled only for `diploma-p3`. No unexplained failure or skip occurred. One malformed auxiliary shell-quoted read probe failed before execution and is disclosed in [P3_TEST_RESULTS.md](P3_TEST_RESULTS.md); its legitimate unchanged read-only retry succeeded. Frozen platform and test Git tree IDs remained identical after all gates. The INTERNAL master, private benchmark/oracle, Figma and frozen PRD/ARCHITECTURE/RULES/DESIGN were untouched.

## 18. P3 Verdict

**P3 STATUS: COMPLETE.** M01, M02, M03, M05, M06 and M07 are PASS. M04 is PASS WITH APPROVED LIMITATION — E02. **FRONTEND FOUNDATION READY: YES**, meaning the M01–M07 platform foundation is formally revalidated; this does not claim a finished feature API, live channels or M08 capability.

Recommended next authorized sequence: **P4 — freeze M08 as deferred**, then **P5 — frontend implementation**. Neither phase was started here.

The isolated `diploma-p3` containers were stopped after evidence capture. No Docker prune or unrelated-resource deletion was performed; the final project-scoped test volumes were retained.
