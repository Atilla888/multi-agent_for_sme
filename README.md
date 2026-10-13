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
- M01–M07: historically PASS and now **READY FOR P3 REVALIDATION**; P2 does not declare a new formal milestone PASS.
- M08: **PARTIAL / BLOCKED / DEFERRED**.
- M09–M13, Pilot and Final: **NOT STARTED / not re-established**.
- Frontend: **NOT STARTED**.

P2's final rebuilt-tree gate collected 114 in-scope tests and passed **114/114** in an isolated Docker environment after a fresh Alembic 0001–0005 migration. Ruff, format and mypy also pass. See the [P2 completion report](recovery/P2_COMPLETE_PLATFORM_RECONSTRUCTION.md) and [exact test evidence](recovery/P2_TEST_RESULTS.md).

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

Run **P3 — formal M01–M07 revalidation** as a separate authorized phase. Do not implicitly start frontend work or M08 provider integration.
