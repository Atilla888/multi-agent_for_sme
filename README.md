# Diploma Project

Development of an Intelligent Adaptive Multi-Agent Platform for Customer Interaction Automation and Business Analytics in SMEs

## 1. Project Overview

This is the canonical monorepo baseline for the diploma's product documentation, Figma tooling, safe research master, and a **partial** session-reconstructed backend candidate. It is not a declaration that the runtime has been restored.

## 2. Repository Structure

- [`platform/`](platform/) — evidenced reconstructed source candidate and [recovery status](platform/RECOVERY_STATUS.md).
- [`docs/`](docs/) — approved product, architecture and UX working documents.
- [`design/`](design/) — local Figma development plugins and visual-source guidance.
- [`research/master/release/`](research/master/release/) — development-safe consolidated master release.
- [`recovery/`](recovery/) — sanitized recovery provenance and [monorepo creation report](recovery/MONOREPO_CREATION_REPORT.md).

No `frontend/` has been created.

## 3. Current Status

Design phases 2A–3F: **COMPLETE** as project-reported design status; the imported Markdown UX records currently run through Phase 3E. Platform reconstruction: **PARTIAL**. M01–M07: **HISTORICALLY PASSED — REVALIDATION REQUIRED** in this new tree. M08: **PARTIAL / BLOCKED / DEFERRED**. M09–M13: **NOT STARTED / not re-established**. Frontend: **NOT STARTED**. No reconstructed runtime or platform test success is claimed.

## 4. Canonical Documentation

Start with [PRD](docs/PRD.md), [architecture](docs/ARCHITECTURE.md), [rules](docs/RULES.md), [design](docs/DESIGN.md), [tasks](docs/TASKS.md), and [memory](docs/MEMORY.md). Detailed UX research is under [`docs/research/`](docs/research/). Where older working text conflicts with the safe final master or later approved phase records, use the documented authority order rather than silently rewriting historical evidence.

## 5. Platform Status

The platform directory contains 127 recovered files plus a new status notice. Seventeen platform paths remain partial and excluded from the active code tree. The original Git history is unavailable. Read [`platform/RECOVERY_STATUS.md`](platform/RECOVERY_STATUS.md) before attempting builds or tests.

## 6. UX / Design

The Figma cloud file is the visual source of truth. See [`design/README.md`](design/README.md). Four local development plugins are copied under [`design/figma-plugins/`](design/figma-plugins/), with existing `dist/` bundles retained for manifest import and `node_modules/` omitted.

## 7. Research Master

The canonical safe release is [`FINAL_MASTER_DEVELOPMENT_SAFE.pdf`](research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), SHA-256 `7CD44044971EFB42451CF236078E8FBA8D9FF6ABCB264B0C005938204D008D45`. An INTERNAL master edition exists outside this repository and is owner-restricted; it must not be imported here.

## 8. Recovery Provenance

The sanitized [final recovery report](recovery/FINAL_RECOVERY_REPORT.md), [path inventory](recovery/RECOVERABLE_PATHS.md), and [creation report](recovery/MONOREPO_CREATION_REPORT.md) distinguish evidenced code from gaps. Raw Codex JSONL and partial source fragments remain only in the separate `PlatformRecovery` staging area; they are not repository content.

## 9. Development Entry Points

The current safe entry points are documentation review and static inspection of `platform/`. Figma plugin manifests are under `design/figma-plugins/<phase>/manifest.json`; re-import them in Figma Desktop if the manifest path changes. Do not run the platform's full test or infrastructure stack as a revalidation claim until the partial reconstruction is completed.

## 10. Secrets / Local Configuration

No old `.env` or provider/API credentials were imported. Create fresh local configuration only in a later authorized setup step. `.env`, private keys, raw recovery evidence, `node_modules`, local tool caches and private research material are ignored by Git.

## 11. Next Steps

P2 — complete the missing platform reconstruction with explicit provenance. After that, perform fresh M01–M07 revalidation before frontend work; M08 remains blocked until its separate gate is addressed.
