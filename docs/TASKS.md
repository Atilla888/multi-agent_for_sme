# Project Roadmap

## Current engineering recovery track

- [x] **P2 — Complete platform reconstruction:** supported Python 3.12 environment, pinned dependencies, isolated Docker stack, fresh Alembic 0001–0005 migration, source-quality gates and final **114/114** in-scope test gate are complete. This makes M01–M07 **READY FOR P3 REVALIDATION**, not newly formal PASS. See [P2 completion evidence](../recovery/P2_COMPLETE_PLATFORM_RECONSTRUCTION.md).
- [x] **P3 — Formal M01–M07 revalidation:** frozen-baseline common gates, independent fresh-state milestone suites and final **114/114** regression passed. M01–M03 and M05–M07 are PASS; M04 is PASS WITH APPROVED LIMITATION — E02. [Formal evidence](../recovery/P3_M01_M07_FORMAL_REVALIDATION.md).
- [x] **P4 — M08 Deferred Freeze:** M08 is formally **PARTIAL / BLOCKED / DEFERRED** because required external provider/API access is unavailable and the live gate is incomplete. Its exact resume gate, truthful frontend boundary, private-publish readiness and separate Ollama experiment boundary are recorded in the [P4 freeze](../recovery/P4_M08_DEFERRED_FREEZE.md).
- [ ] **P5 — Frontend Implementation: IN PROGRESS.** P5A–P5I are complete in their recorded scopes; P5J/K and later frontend phases remain.
  - [x] **P5A — Frontend Foundation:** Next.js App Router, React, TypeScript, Tailwind, exact six-area IA, shared staff shell, separate auth/customer routes, semantic tokens/states, API/auth boundaries, and lightweight quality gates. The implementation preserves E02, M08 deferred, M12 TARGET, and M13 `MODEL_NOT_READY`. See [P5A decision record](frontend/P5A_FRONTEND_FOUNDATION.md).
  - [x] **P5B — Design System Implementation:** approved 03C semantic tokens, typography, accessible generic primitives, state distinctions, table foundation and validation are complete. See [P5B implementation record](frontend/P5B_DESIGN_SYSTEM_IMPLEMENTATION.md).
  - [x] **P5C — Conversations + Escalations:** audited backend/session contracts, implemented the approved high-fidelity list/workspace/context and escalation decision states through isolated typed fixtures, and preserved M08 deferred, M12 TARGET-only, OUTCOME_UNKNOWN safety, and E02. See [P5C implementation](frontend/P5C_CONVERSATIONS_ESCALATIONS_IMPLEMENTATION.md).
  - [x] **P5D — Business Screens:** audited the design and backend boundaries, then implemented Customers, Orders, Products and Inventory through isolated typed fixtures with safe Order/Reservation, E02 and `OUTCOME_UNKNOWN` semantics. See [P5D implementation](frontend/P5D_BUSINESS_SCREENS_IMPLEMENTATION.md).
  - [x] **P5E — Documents / Knowledge:** completed design and M07 audits, then implemented the approved document list and version detail using typed local fixtures, explicit absent-API boundaries, separate stored/READY/published/retrievable semantics, business scope and safe provenance. See [P5E implementation](frontend/P5E_DOCUMENTS_KNOWLEDGE_IMPLEMENTATION.md).
  - [x] **P5F — Analytics + Forecasts:** completed design/backend audits, contract-limited historical ACTUAL Analytics with accessible chart/table and approved states, plus truthful default Forecasts `MODEL_NOT_READY` with no fake result or API. See [P5F implementation](frontend/P5F_ANALYTICS_FORECASTS_IMPLEMENTATION.md).
  - [x] **P5G/H — Web Chat + Administration:** completed the separate responsive customer surface plus truthful Integrations, read-only Settings, restricted Audit and contextual/restricted Agent Runs through typed deterministic fixtures and explicit unavailable-contract boundaries. M08 remains deferred, M12 TARGET-only, M13 not started, and E02 active. See [P5G/H implementation](frontend/P5GH_WEBCHAT_ADMIN_IMPLEMENTATION.md).
  - [x] **P5I — Real FastAPI + Keycloak Integration:** real OIDC code-flow authentication, verified principal/business scope and thin safe Product/Inventory/Customer/Order/Analytics reads; 164/164 backend, 160/160 frontend and 24/24 browser route checks PASS. Remaining fixtures and unavailable capabilities are recorded in the [final matrix](frontend/P5I_FINAL_CAPABILITY_MATRIX.md). See [implementation evidence](frontend/P5I_FULLSTACK_INTEGRATION_IMPLEMENTATION.md).
  - [ ] **P5J/K — READY / NOT STARTED:** separately authorize full-stack QA/accessibility/localization and deployment-hardening scope; missing query/domain contracts remain separate backend work.

The numbered Phase 0–11 sections below are the **older working roadmap** and await a separate reconciliation with the current consolidated master. Their unchecked engineering items must not be read as proof that the newer project-wide M01–M07 gates are unimplemented. For current design/engineering authority and evidence limits, use the [Phase 2B validation](research/PHASE_2B_UX_VALIDATION.md#2b0-scope-and-source-authority) and its linked master PDF. Product scope: [PRD.md](PRD.md). Technical direction: [ARCHITECTURE.md](ARCHITECTURE.md). Open decisions: [MEMORY.md](MEMORY.md).

## Current master-aligned UX track

- [x] **Phase 2A — Competitor UX research:** evidence recorded in [UX_COMPETITOR_ANALYSIS.md](research/UX_COMPETITOR_ANALYSIS.md); do not restart broad research without a new task.
- [x] **Phase 2B — Master documentation / UML → UX validation:** [PHASE_2B_UX_VALIDATION.md](research/PHASE_2B_UX_VALIDATION.md) records five actors, FR-01–FR-11 visibility, all fifteen master screen families, seven flow checks, functional components/states, and a 39-row actor/use-case → UI matrix; `DESIGN.md` and `MEMORY.md` carry only distilled decisions. No navigation or visual design was finalized.
- [x] **Phase 2C — Information architecture:** [PHASE_2C_INFORMATION_ARCHITECTURE.md](research/PHASE_2C_INFORMATION_ARCHITECTURE.md) classifies all fifteen master screen families, selects six role-aware staff product areas, resolves Conversations/Escalations, Agent Runs/Audit and Analytics/Forecasts, maps conceptual routes/contextual surfaces, and prepares Phase 2D inputs. `DESIGN.md` and `MEMORY.md` record the durable IA decisions; no wireframes or visual design were produced.
- [x] **Phase 2D — Core user flows:** [PHASE_2D_CORE_USER_FLOWS.md](research/PHASE_2D_CORE_USER_FLOWS.md) documents ten detailed behavioral flows, 85 exception/success branches, 78 distinct terminal-state labels, shared effect/delivery/unknown-state rules, coverage of all fifteen master screen families, and Phase 2E inputs. The six-area IA is unchanged; no wireframes, Figma, visual design or frontend code were produced.
- [x] **Phase 2E — Final screen inventory:** [PHASE_2E_FINAL_SCREEN_INVENTORY.md](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md) specifies all fifteen master staff families plus separate Customer Web Chat, the global shell, 29 shared functional components, role/screen and screen/flow/requirement matrices, P0/P1/P2 priorities and six P0 Phase 3A input cards. `DESIGN.md` and `MEMORY.md` carry only the durable summary; the Phase 2C IA and Phase 2D flows remain unchanged.
- [x] **Phase 3A — Low-fidelity wireframes:** editable native Figma output is complete for the six P0 areas; [PHASE_3A_LOW_FI_WIREFRAMES.md](research/PHASE_3A_LOW_FI_WIREFRAMES.md) records the alternatives, selected structures, state variants, flow coverage, limitations and audit evidence.
- [x] **Phase 3B — UX Review and Low-Fi Refinement:** [PHASE_3B_UX_REVIEW.md](research/PHASE_3B_UX_REVIEW.md) records manual semantic/visual review of all six P0 areas, 11 fixed findings and six reviewed scenario walkthroughs. The final local-plugin structural report is **17/17 PASS** (6/6 scenarios present), not independent semantic proof. Figma `03A — Low-Fi Wireframes` was preserved; `03B — UX Review & Revisions` contains the reviewed revisions.
- [x] **Phase 3C — Design System: COMPLETE.** [PHASE_3C_DESIGN_SYSTEM.md](research/PHASE_3C_DESIGN_SYSTEM.md) records the approved Calm Operational SaaS direction, light-theme foundations, semantic states, all component families and six Usage Examples. Manual visual review and Usage Examples review were completed; the owner-reported final Figma structural validation was **49/49 PASS** after older Analytics/Forecast duplicates were archived by renaming, with no section deletion. The local `design/figma-plugins/figma-phase3c-plugin/` wrote `03C — Design System`; `03A`/`03B` were preserved. Structural PASS is evidence of presence/organization, not quality certification.
- [x] **Phase 3D — High-Fidelity Figma: COMPLETE.** [PHASE_3D_HIGH_FIDELITY.md](research/PHASE_3D_HIGH_FIDELITY.md) records the approved Shared Staff Shell and six P0 high-fi families on `03D — High-Fidelity Screens`. Incremental manual visual review was completed. The owner-provided final aggregate result was **Overall PASS**: Shared Shell PASS; **6/6 P0 PASS**; semantic consistency PASS; geometry PASS; Phase 3C asset usage PASS; source-page protection PASS. The 03A/03B/03C baselines remained protected. This is design validation, not formal usability/accessibility/localization certification or evidence of a working frontend.
- [x] **Phase 3E — Interactive Prototype: COMPLETE.** [PHASE_3E_INTERACTIVE_PROTOTYPE.md](research/PHASE_3E_INTERACTIVE_PROTOTYPE.md) records eight 03D-derived interactive flows on `03E — Interactive Prototype`. The owner-provided final real-Figma validator reported **8/8 flows PASS; source-page protection PASS; visual-source preservation PASS; broken/prohibited destinations 0; Overall PASS**. Manual visual review covered every flow. The 03A–03D pages remained protected; this is design-prototype completion, not backend/frontend implementation or formal usability/accessibility/localization certification.
- [x] **Phase 3F — Final DESIGN.md: COMPLETE.** [DESIGN.md](DESIGN.md) is the consolidated, implementation-ready UX/UI contract: six-area IA, 15 staff families plus separate Web Chat, P0 versus non-P0 coverage, Phase 3C system, semantic states, eight Phase 3E flows, current/TARGET boundaries and frontend safety invariants. The documentation consistency/readiness check passed; no Figma or application code was changed.
- [ ] **Phase 4 — Frontend implementation: IN PROGRESS.** P5A–P5I are complete in their recorded scopes; P5J/K and later frontend work remain. Continue using [DESIGN.md](DESIGN.md), 03C/03D/03E, and trusted backend contracts.

The earlier Phase 0.5/Phase 1–11 labels below are preserved for deliberate later reconciliation, not silently treated as current master milestone statuses.

## Phase 0 — Documentation foundation

- [x] Audit `Diplom` and record the absence of prior repository artifacts in `MEMORY.md`.
- [x] Create the product requirements in `PRD.md`.
- [x] Create the conceptual technical architecture in `ARCHITECTURE.md`.
- [x] Establish development rules in `RULES.md`.
- [x] Record evidence, decisions, and open questions in `MEMORY.md`.
- [x] Create this phased roadmap.
- [x] Create the design research skeleton in `DESIGN.md`.

Acceptance: exactly six coherent core documents; no application source edits; all claims about implementation trace to actual repository evidence.

## Phase 0.5 — UX/UI Research & Lab 3

The supplied competitor-research brief labels its task “Phase 2”; this roadmap tracks that research under Phase 0.5. The roadmap's Phase 2 below remains Business Core.

- [x] Analyze Senbi, aspanCRM, and CareHub using public official sources; record evidence in [UX_COMPETITOR_ANALYSIS.md](research/UX_COMPETITOR_ANALYSIS.md).
- [x] Deeply analyze SleekFlow and Sintra AI using official documentation in the research report.
- [x] Use respond.io, HighLevel, and Vendasta as secondary references in the research report.
- [x] Map available PRD/use cases to provisional screens, information architecture and user flows in the research report; no UML file is present.
- [ ] Reconcile the provisional mapping and information architecture with actual UML/use-case materials when available, then review/approve the design direction.
- [ ] Produce low-fidelity wireframes and establish the design system.
- [ ] Produce high-fidelity Figma screens/prototype.
- [x] Update `DESIGN.md` with research-backed provisional directions and open questions.
- [ ] Record approved design decisions in `DESIGN.md` after wireframe/Figma review.

Acceptance: evidence-backed UX research, workflow-to-screen mapping, wireframes, design system, and reviewed Figma prototype define the design before application implementation. The later UX/UI implementation phase builds this approved design in the application.

## Phase 1 — Project foundation

- [ ] Choose and document the repo layout, approved stack versions, local development setup, and environment examples.
- [ ] Bootstrap frontend/backend and Docker Compose only after their responsibilities and basic contracts are agreed.
- [ ] Define authentication, staff roles, business ownership boundaries, and basic correlated logging.

Acceptance: a reproducible local app starts, staff access is protected, and a request can be traced through the API. Depends on Phase 0 decisions and access to required development services. Supports `FR-AUTH-001` and `FR-AUDIT-001`.

## Phase 2 — Business core

- [ ] Define minimal customer, product, inventory, order, and sales workflows and persistence contracts.
- [ ] Implement authorized reads and the smallest supported write path with explicit state, duplicate, and failure behavior.

Acceptance: business services enforce their own invariants and have focused tests. Depends on identity/ownership rules. Supports `FR-CORE-001`.

## Phase 3 — Business Brain

- [ ] Expose authorized structured context and conversation/execution history.
- [ ] Add document/FAQ ingestion and retrieval only for workflows needing unstructured evidence.
- [ ] Represent business rules, current state, source provenance, and tool availability consistently.

Acceptance: agents can access relevant, sourced context without mistaking retrieved prose for authoritative operational state. Supports `FR-BRAIN-001`, `FR-CONV-001`.

## Phase 4 — Business tools

- [ ] Select approximately 7–10 operations from the accepted end-to-end workflows; define typed contracts and per-tool permissions.
- [ ] Implement validated tool execution, audit, and safe failure/retry behavior for supported operations.

Acceptance: consequential actions are authorized, validated, traceable, and confirmed before the customer is told they succeeded. Supports `FR-TOOL-001`.

## Phase 5 — Specialized agents

- [ ] Implement Sales, Support, and Analytics roles against the permitted shared tools and context.
- [ ] Test grounded answers, restricted actions, unsupported requests, and escalation boundaries.

Acceptance: each role completes or safely hands off its selected MVP scenarios without bypassing the business layer. Supports `FR-AGENT-001` through `FR-AGENT-003`.

## Phase 6 — Orchestration and handoff

- [ ] Define and implement Single Agent and Static Multi-Agent baselines with comparable legitimate access.
- [ ] Design and implement the context-aware Adaptive Multi-Agent policy, preserved handoffs, and human escalation.
- [ ] Define confidence semantics and record routing decisions and terminal outcomes.

Acceptance: all three variants execute the same eligible scenarios under documented rules; escalation preserves necessary facts. Supports `FR-ORCH-001`, `FR-HUMAN-001`.

## Phase 7 — Customer channels

- [ ] Define normalized message and delivery contracts; integrate Web Chat and externally accessible channels in a feasible sequence.
- [ ] Test channel identity, duplicate events, failure handling, and conversation continuity.

Acceptance: a supported channel can complete an end-to-end workflow without losing context. Provider access and channel order remain open. Supports `FR-CHAN-001`, `FR-CONV-001`.

## Phase 8 — Analytics and ML

- [ ] Define the operational sales measure, report filters, history quality, and forecast target.
- [ ] Implement reports and a forecast baseline; evaluate forecast quality separately from agent orchestration.

Acceptance: outputs identify measure, period, source, and limitations; forecast evaluation uses a documented holdout. Supports `FR-ANALYTICS-001`.

## Phase 9 — UX / UI

- [ ] Implement the approved `DESIGN.md` and Figma flows as operator/owner/customer interfaces needed for the MVP, including accessible, responsive, pending, and error states.

Acceptance: real workflows and human handoff are usable and match the approved design from Phase 0.5.

## Phase 10 — Experimental evaluation

- [ ] Define and freeze a research protocol before final evaluation.
- [ ] Build/version comparable scenario sets, oracle, metrics, prompts/policies, and run instrumentation.
- [ ] Evaluate Single, Static, and Adaptive variants; perform justified ablations and report limitations.

Acceptance: results are reproducible and report task success, safety, grounding, human intervention, latency, and cost with appropriate uncertainty. Depends on Phases 2–8 and a verified protocol.

## Phase 11 — Hardening and diploma delivery

- [ ] Verify security, operational recovery, demo reliability, and documentation against the implemented product.
- [ ] Prepare the diploma narrative, artifacts, limitations, and reproducibility package from actual evidence.

Acceptance: the demo and written claims match tested behavior and recorded experimental results.

## Traceability anchors

| Requirement | Architecture responsibility | Roadmap phase | Candidate evaluation |
| --- | --- | --- | --- |
| `FR-CORE-001`, `FR-AGENT-001` | Structured facts → Sales → validated inventory tool | 2, 4, 5 | Task success; tool selection accuracy |
| `FR-HUMAN-001`, `FR-ORCH-001` | Orchestrator → context-preserving handoff | 5, 6 | Human intervention; task success |
| `FR-ANALYTICS-001` | Analytics → reports/forecast service | 8 | Report correctness; forecast error |
| `FR-AUDIT-001` | Correlated decision and tool traces | 1, 4, 10 | Trace completeness; invalid action rate |

Metrics here are candidates until the research protocol defines their exact denominators and scoring.
