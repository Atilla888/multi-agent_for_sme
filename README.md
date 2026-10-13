# Diploma Project

Development of an Intelligent Adaptive Multi-Agent Platform for Customer Interaction Automation and Business Analytics in SMEs.

## Repository structure

- [`platform/`](platform/) — reconstructed backend/infrastructure candidate and [current recovery status](platform/RECOVERY_STATUS.md).
- [`docs/`](docs/) — approved product, architecture, design and research documents.
- [`design/`](design/) — local Figma development plugins and visual-source guidance.
- [`research/master/release/`](research/master/release/) — development-safe consolidated master release.
- [`recovery/`](recovery/) — sanitized reconstruction provenance and executable evidence.

No `frontend/` has been created.

## Current status

- Design phases 2A–3F: **COMPLETE** as recorded design status.
- Platform reconstruction P2: **COMPLETE**.
- Formal revalidation P3: **COMPLETE** against frozen baseline `1cd69e3`.
- M01, M02, M03, M05, M06 and M07: **PASS**; M04: **PASS WITH APPROVED LIMITATION — E02**.
- M08: **PARTIAL / BLOCKED / DEFERRED**.
- M09–M13, Pilot and Final: **NOT STARTED / not re-established**.
- Frontend: **NOT STARTED**.

P3 independently froze source/tests, ran milestone-specific gates on fresh isolated volumes, and passed the final M01–M07 regression **114/114** with no failures or skips. See the [formal P3 report](recovery/P3_M01_M07_FORMAL_REVALIDATION.md) and [test evidence](recovery/P3_TEST_RESULTS.md).

## Canonical documentation

Start with [PRD](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), [rules](docs/RULES.md), [design](docs/DESIGN.md), [tasks](docs/TASKS.md), and [memory](docs/MEMORY.md). Detailed UX research is under [`docs/research/`](docs/research/). Where older working text conflicts with the safe final master or later approved phase records, follow the documented authority order.

## Platform entry point

Read [`platform/RECOVERY_STATUS.md`](platform/RECOVERY_STATUS.md) and [`platform/README.md`](platform/README.md). Reproducible P2 setup uses official Python 3.12, `platform/.venv`, the project dependency pins and isolated Docker Compose resources. Local `.env` files and credentials are not committed.

## UX / design

The Figma cloud file is the visual source of truth. See [`design/README.md`](design/README.md). Four local development plugins are under [`design/figma-plugins/`](design/figma-plugins/), with existing `dist/` bundles retained and `node_modules/` omitted.

## Research master and provenance

The canonical safe release is [`FINAL_MASTER_DEVELOPMENT_SAFE.pdf`](research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), SHA-256 `7CD44044971EFB42451CF236078E8FBA8D9FF6ABCB264B0C005938204D008D45`. An INTERNAL edition exists outside this repository and remains owner-restricted.

Recovery evidence distinguishes original/session-evidenced content, documentation-guided reconstruction and new tests. The larger historical sanitized handoff package is unavailable; its only current runtime dependency, the hash-pinned physical SQL, is present and verified. Raw session journals, historical secrets and private research material are not repository content.

## Next step

Recommended next authorized sequence: **P4 — freeze M08 as deferred**, then **P5 — frontend implementation**. Neither has started.
