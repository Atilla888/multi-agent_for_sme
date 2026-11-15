# Diploma Project

Development of an Intelligent Adaptive Multi-Agent Platform for Customer Interaction Automation and Business Analytics in SMEs.

## Repository structure

- [`platform/`](platform/) — reconstructed backend/infrastructure candidate.
- [`docs/`](docs/) — approved product, architecture, design and research documents.
- [`docs/uml/`](docs/uml/) — UML 2.5 diagrams (all 14 types) and ER diagrams as PlantUML sources, PNG renders and one combined PDF.
- [`design/`](design/) — local Figma development plugins and visual-source guidance.
- [`research/master/release/`](research/master/release/) — development-safe consolidated master release.
- [`frontend/`](frontend/) — P5A/P5B foundation and design system plus the completed P5C Conversations + Escalations, P5D Business Screens, P5E Documents / Knowledge, P5F Analytics + Forecasts, and P5G/H Web Chat + Administration slices.

## Current status

- Design phases 2A–3F: **COMPLETE** as recorded design status.
- Platform reconstruction P2: **COMPLETE**.
- Formal revalidation P3: **COMPLETE** against frozen baseline `1cd69e3`.
- M08 deferred freeze P4: **COMPLETE**.
- Private GitHub publication P4.5: **COMPLETE**.
- M01, M02, M03, M05, M06 and M07: **PASS**; M04: **PASS WITH APPROVED LIMITATION — E02**.
- M08: **PARTIAL / BLOCKED / DEFERRED**.
- M09–M13, Pilot and Final: **NOT STARTED / not re-established**.
- Frontend track: **IN PROGRESS**; P5A–P5I are **COMPLETE** in their recorded scopes; P5J/K are **READY / NOT STARTED**.

P3 independently froze source/tests, ran milestone-specific gates on fresh isolated volumes, and passed the final M01–M07 regression **114/114** with no failures or skips. P4 then froze M08 without weakening its live-provider acceptance gate and opened the independent frontend track.

## Canonical documentation

Start with [PRD](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), [rules](docs/RULES.md), [design](docs/DESIGN.md), [tasks](docs/TASKS.md), and [memory](docs/MEMORY.md). Detailed UX research is under [`docs/research/`](docs/research/). Where older working text conflicts with the safe final master or later approved phase records, follow the documented authority order.

## Platform entry point

Read [`platform/README.md`](platform/README.md). Reproducible P2 setup uses official Python 3.12, `platform/.venv`, the project dependency pins and isolated Docker Compose resources. Local `.env` files and credentials are not committed.

## UX / design

The Figma cloud file is the visual source of truth: [Diplom — Multi-Agent Platform UI (Lab 3)](https://www.figma.com/design/W6XefZbbmZq1YZltBfsry7) (`W6XefZbbmZq1YZltBfsry7`), a clickable prototype with desktop, tablet and mobile layouts on mock data (see [`docs/DESIGN.md` §29](docs/DESIGN.md#29-lab-3-clickable-prototype-responsive-mock-data)). See also [`design/README.md`](design/README.md).

## Research master and provenance

The canonical safe release is [`FINAL_MASTER_DEVELOPMENT_SAFE.pdf`](research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), SHA-256 `7CD44044971EFB42451CF236078E8FBA8D9FF6ABCB264B0C005938204D008D45`. An INTERNAL edition exists outside this repository and remains owner-restricted.

Recovery evidence distinguishes original/session-evidenced content, documentation-guided reconstruction and new tests. The larger historical sanitized handoff package is unavailable; its only current runtime dependency, the hash-pinned physical SQL, is present and verified. Raw session journals, historical secrets and private research material are not repository content.

## Next step

Primary active track: **P5 — frontend implementation**. P5A established the technical foundation, [P5B](docs/frontend/P5B_DESIGN_SYSTEM_IMPLEMENTATION.md) implemented the reusable design system, [P5C](docs/frontend/P5C_CONVERSATIONS_ESCALATIONS_IMPLEMENTATION.md) completed Conversations + Escalations, [P5D](docs/frontend/P5D_BUSINESS_SCREENS_IMPLEMENTATION.md) completed truthful Customers, Orders, Products and Inventory, [P5E](docs/frontend/P5E_DOCUMENTS_KNOWLEDGE_IMPLEMENTATION.md) completed Documents / Knowledge, [P5F](docs/frontend/P5F_ANALYTICS_FORECASTS_IMPLEMENTATION.md) completed historical Analytics plus truthful Forecasts `MODEL_NOT_READY`, and [P5G/H](docs/frontend/P5GH_WEBCHAT_ADMIN_IMPLEMENTATION.md) completed separate Customer Web Chat plus truthful Administration screens. [P5I](docs/frontend/P5I_FULLSTACK_INTEGRATION_IMPLEMENTATION.md) completed real authentication and available safe reads. **P5J/K are READY / NOT STARTED**.

Deferred dependency: **M08 external provider/API acceptance**. M08 remains PARTIAL / BLOCKED / DEFERRED and unavailable live capabilities must not be presented as operational.

P5I completed [real FastAPI + Keycloak integration](docs/frontend/P5I_FULLSTACK_INTEGRATION_IMPLEMENTATION.md) for available safe reads. See the [final capability matrix](docs/frontend/P5I_FINAL_CAPABILITY_MATRIX.md) for remaining fixture/unavailable surfaces. Recommended next step: review and merge the P5I integration branch, then separately authorize P5J/K QA/deployment-hardening scope.

Parallel future experiment: **Ollama/local-model evaluation** on separate hardware/branch. It does not replace or complete formal M08 acceptance.
