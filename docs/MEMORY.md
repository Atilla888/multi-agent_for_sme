# Project Memory

This file records durable project context, evidence limits, and decisions that affect later sessions. Product requirements live in [PRD.md](PRD.md); technical direction lives in [ARCHITECTURE.md](ARCHITECTURE.md); work status lives in [TASKS.md](TASKS.md).

## Current project status and evidence

**Repository audit:** `C:\Users\Asus\Desktop\Diplom` was empty before this documentation work. It had no Git repository, README, source code, requirements, reports, UML/diagrams, PDF/text exports, environment examples, manifests, Docker files, workflows, or `AGENTS.md`. Therefore no application feature, technology, integration, experiment, or design is confirmed as implemented by repository evidence. These six documents are the first project files in this folder.

**Source of this foundation:** the user's documentation-foundation brief and subsequent project corrections. They establish the project scope and baseline decisions, but are not evidence of running software.

**Status vocabulary:** **IMPLEMENTED** = artifact/behavior verified in this repository; **PROJECT BASELINE / PLANNED** = accepted product/technology decision not yet built; **RESEARCH TARGET** = proposed question or mechanism requiring design/evaluation; **OPTIONAL / FUTURE** = outside the current MVP commitment. Documentation and the public-source UX research report exist; no application capability is **IMPLEMENTED** here.

**Current authority caveat:** the audit above describes the initial/local `Diplom` folder, not the whole project's newer engineering status. The current [consolidated master PDF](../research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), including its Phase 6F evidence appendix and current D01–D13/V01–V07 diagrams, has higher authority than these older working documents. It reports M01–M07 passed in scope (M04 with E02 limitation), M08 partial/blocked, M09–M13 not started, and no working frontend or completed Pilot/Final. Do not reinterpret the old local zero-implementation wording as a project-wide status claim.

## Established product and research decisions

- **Positioning — PROJECT BASELINE / PLANNED:** AI-Native Business Operating System for SMEs. The MVP serves retail/e-commerce businesses, with Instagram, WhatsApp, Telegram, and Web Chat as target channels.
- **Core agents — PROJECT BASELINE / PLANNED:** Sales Agent, Support Agent, and Analytics Agent.
- **Shared core — PROJECT BASELINE / PLANNED:** Business Brain includes structured business data, unstructured knowledge/RAG, business state, history, business rules, and available tools. RAG primarily serves unstructured knowledge; structured operational facts come from authorized business sources.
- **Actions — PROJECT BASELINE / PLANNED:** Agents act through validated, permitted business tools; human escalation preserves relevant context.
- **Adaptive orchestration — RESEARCH TARGET:** The orchestrator may consider intent, context, business state, task complexity, confidence, available tools, and permissions when selecting a next step.
- **Architecture comparison — RESEARCH TARGET:** Compare (1) Single Agent, (2) Static Multi-Agent, and (3) Context-Aware Adaptive Multi-Agent under comparable conditions. The scientific contribution is **not** the invention of AI agents; it is the experimental comparison of orchestration architectures, especially context-aware adaptive multi-agent orchestration. No outcome is pre-judged.
- **OPTIONAL / FUTURE:** Extra specialist agents and broader ML or enterprise infrastructure beyond the bounded MVP.

**Current candidate evaluation metrics:** Task Success Rate; Tool Selection Accuracy; Invalid Action Rate; Human Intervention Rate; Latency; Cost per Successful Task; Hallucination / grounding quality. Exact definitions and scoring remain for the research protocol.

## Accepted technology baseline — planned, not implemented

| Area | Project baseline |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Backend | Python, FastAPI, Pydantic |
| Authentication and access | Keycloak, OAuth2/OIDC/JWT, RBAC |
| AI and orchestration | LangGraph; LangChain where justified; API-based and open-source LLMs for experiments |
| Data | PostgreSQL, pgvector, Redis, MinIO/S3 |
| ML | pandas, scikit-learn, XGBoost, PyTorch |
| Infrastructure | Docker, Docker Compose, GitHub Actions |

These are accepted diploma-project choices in **PROJECT BASELINE / PLANNED** status, not arbitrary candidates and not **IMPLEMENTED**. Exact versions, component responsibilities, data model, and deployment topology remain open. Kafka/NATS, ClickHouse, Kubernetes, and similar major additions are **OPTIONAL / FUTURE**.

## Competitor / reference map

These are research references only, not endorsements or claims of feature parity. Public-source findings and their evidence limits are recorded separately below and in the research report.

| Lens | References |
| --- | --- |
| Customer / CRM | SleekFlow, respond.io, CareHub |
| AI team | Sintra AI, Vendasta |
| Shared AI context | Sintra AI |
| Real business actions | aspanCRM, HighLevel, SleekFlow |
| Local CRM + AI | Senbi, aspanCRM |
| Additional | Bayge CRM, Ubee, AIQazaq |

## UX research findings (public sources, 2026-09-29)

The evidence and limits are in [UX_COMPETITOR_ANALYSIS.md](research/UX_COMPETITOR_ANALYSIS.md). SleekFlow is the primary documented customer-workspace reference (Inbox, contact context, AI session control, action trace); Sintra AI is the primary specialist-team/shared-knowledge reference. Among Kazakhstan products, aspanCRM is the clearest publicly described CRM-action reference, CareHub the clearest operator-Inbox/handoff reference, and Senbi a reference for owner questions over structured CRM data. These are **research reference choices**, not approved UI patterns or claims that any competitor reproduces our complete architecture. No live authenticated usability test was performed. The first seven-surface IA and screen inventory were **pre-master proposals**, superseded for functional coverage and IA by the Phase 2B/2C work below.

## Phase 2B durable UX decisions

The [Phase 2B validation](research/PHASE_2B_UX_VALIDATION.md) uses the current master, not the older seven-surface research proposal, for functional UX requirements. D01 defines Customer, Business Owner, Human Operator, Platform Administrator and Channel Provider as external actors; Channel Provider is a system actor without a normal dashboard UI. **Adaptive Orchestrator is internal**: show active agent, handoff, reason/status and outcome where useful, but do not invent a normal Orchestrator page or expose LangGraph controls.

- The master frontend register has fifteen **screen families**, not fifteen required sidebar entries or final routes. The prior seven-surface proposal is historical research input; Phase 2C has since selected the IA below, while Phase 2E must still finalize the screen inventory.
- The three mandatory specialists remain Sales, Support and Analytics with distinct admissions. The canonical business-tool registry is **exactly ten**: `find_product`, `check_inventory`, `find_customer`, `get_order`, `create_order`, `update_order`, `reserve_inventory`, `get_delivery_status`, `get_sales_report`, `forecast_sales`. The agent proposes; the trusted executor/domain layer authorizes and confirms an effect. E02 `update_order` mutation remains denied in the current implementation evidence.
- `create_order` and `reserve_inventory` are separate effects and must have separately truthful UI results. `OUTCOME_UNKNOWN` means a write may have committed: show pending reconciliation, not success, rollback or blind retry. Outbound reply delivery failure is separate from business-effect status.
- Business Brain is seven-part scoped context (request, conversation, structured facts, retrieved knowledge, runtime state, rules, permissions), **not RAG alone**. Expose relevant projections across conversation, records, documents, runs and escalations; no standalone Brain page follows automatically.
- Human escalation requires visible reason, verified facts, completed/pending operations, allowed decision and safe state. Resume must recheck rights/state/revision; the M12 durable resume behavior is design-only in current evidence. Actual sales reports and predicted forecasts need distinct semantics; `MODEL_NOT_READY` is the current truthful forecast result.
- No navigation, wireframes, visual tokens, Figma or frontend were approved/created in Phase 2B. Its screen gaps and open questions informed the subsequent Phase 2C IA decision below.

## Phase 2C durable information-architecture decisions

The [Phase 2C IA report](research/PHASE_2C_INFORMATION_ARCHITECTURE.md) selects **six role-visible staff product areas**: Overview, Conversations, Business, Knowledge, Analytics and Administration. Authentication is outside primary navigation; **customer Web Chat is a separate channel surface**, not a staff-dashboard family. The fifteen master screen families are all preserved, but do not become fifteen sidebar items. These are IA decisions for Phase 2D flow validation and Phase 2E final screen specifications, not implemented routes or visual design.

- Escalations has a **dedicated queue/detail nested under Conversations**, with a link to the affected conversation and run. `OUTCOME_UNKNOWN`/reconciliation appears as a case/order state and a reconciliation-needed escalation queue/filter, with permissioned run/audit evidence; no top-level Reconciliation area or blind retry control.
- Agent Runs and Audit remain distinct: Run = execution lifecycle/handoff/tool attempts, normally opened contextually by an Operator; Audit = durable effect/security record, primarily a restricted Administration destination. Administrator access does not automatically grant Owner business-data access.
- Analytics is one top-level area with **actual reports** and nested **Forecasts** as separate routes/states. `MODEL_NOT_READY` must not create a fictitious ForecastRun or prediction. Overview is a role-scoped orientation, not a duplicate analytics dashboard.
- The master Documents family is surfaced under the UI label **Knowledge** for managed policies/FAQ/source versions; it is **not** the whole seven-part Business Brain. Business Brain, Adaptive Orchestrator, LangGraph, Tool Executor and infrastructure stay system-only, with task-relevant status/evidence on existing surfaces.
- Business groups Customers, Orders, Products and Inventory as distinct authoritative record destinations. Conversation ↔ record/run/escalation/document deep links preserve a safe return path and scoped context; switching business clears prior-tenant data/subscriptions before new content renders. Backend authorization still governs every route.
- Phase 2D flows and Phase 2E functional screen inventory are now documented below. Wireframes, Figma, visual tokens and frontend implementation are **not complete**. The Phase 2C route names are conceptual and may change physically without changing these IA relationships.

## Phase 2D durable behavioral-flow decisions

The [Phase 2D report](research/PHASE_2D_CORE_USER_FLOWS.md) covers ten end-to-end flows and their user/staff states: product availability, purchase/reservation, order support, delivery status, Support-to-Sales handoff, human escalation/resume, owner sales analytics, forecast request, knowledge/document management and integration administration. It maps all fifteen master screen families without changing the six-area Phase 2C IA. This is design documentation, **not** proof that flows, routes or UI are implemented.

- A model proposal or tool attempt is not a trusted business effect. `create_order` and `reserve_inventory` have separate receipts and UI statuses; an Order may exist without a confirmed reservation. A mutating `OUTCOME_UNKNOWN` freezes blind replay until authoritative reconciliation. Outbound message failure is a separate delivery state and does not undo a confirmed business effect.
- Support-to-Sales handoff preserves verified customer/order context and ownership history but cannot elevate tool permissions. Current E02 `update_order` denial remains; an Operator decision is not a policy bypass. Durable safe human resume (M12) is still design-only and must recheck actor rights, case/business version, policy and effect status.
- Owner Analytics uses grounded historical report evidence; Forecasts are explicitly predictions. The current M13 model artifact is absent, so `MODEL_NOT_READY` is the truthful forecast state, not a generated number.
- Knowledge versions move through upload/process → READY → explicit version-aware publication; failed V2 does not displace active V1, and revoked/superseded versions must not be retrieval sources. Integration states distinguish configured/validated/active and LIVE/MOCK/SANDBOX; no live channel is inferred from a config row.
- Phase 2E has now specified screen-level behavior, visibility, validation and failure states from these flows. The unresolved decisions include E02 policy, M12 resume contract, M13 model/readiness, live channels, reconciliation/idempotency, freshness thresholds, document publishing policy and exact metric definitions. No wireframes, visual tokens, Figma or application code were created in Phase 2D/2E.

## Phase 2E durable functional-screen decisions

The [Phase 2E final inventory](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md) freezes functional responsibilities for **all fifteen master staff screen families** plus separate Customer Web Chat, with a shared staff shell and 29 reusable functional component contracts. The six Phase 2C areas and Phase 2D flows are unchanged; list/detail and queue/detail views remain inside their families. Authentication is outside staff navigation; Knowledge labels Documents; Escalations remains nested in Conversations; Forecasts remains nested in Analytics; Agent Runs remains restricted/contextual. Business Brain, Orchestrator and Tool Executor have no normal product page.

- Each screen has a defined primary actor/task/action category, required data, contextual links, agent/tool visibility and loading/empty/success/failure/denied/dependency/stale/pending/unknown behavior. Role visibility is presentation, never backend authorization. A tenant switch clears prior-business data/subscriptions before new content renders.
- The initial **P0 wireframe inputs** were Conversations, Escalations, Orders, Analytics, Forecasts and Customer Web Chat; Phase 3A has now completed those P0 low-fi structures. **P1:** Authentication, Overview, Customers, Products, Inventory, Knowledge/Documents and Integrations. **P2:** Agent Runs, Settings and Audit. P1/P2 remain priorities, not implementation claims.
- Cross-screen truth invariants remain: Order creation ≠ inventory reservation; trusted effect ≠ message delivery; `OUTCOME_UNKNOWN` blocks blind replay pending reconciliation; historical actual ≠ forecast; READY ≠ published; LIVE ≠ MOCK/SANDBOX. E02 mutation remains denied, M12 durable human resume remains design-only, M13 remains `MODEL_NOT_READY`, and live channels are not evidenced. Freshness thresholds and exact policy/metric definitions are still open. No wireframes, Figma, visual design or application code were created in Phase 2E.

## Important constraints and decisions

- Keep the MVP implementable and centered on complete retail/e-commerce workflows; do not turn it into a generic CRM or chatbot.
- Separate structured operational facts from document retrieval. Model text cannot bypass deterministic authorization or business rules.
- Keep Single, Static, and Adaptive variants comparable in legitimate business access and evaluation conditions.
- Use the completed Phase 3F `DESIGN.md` as the authoritative frontend UX/UI handoff; the older provisional-design wording applied before approved Phases 2C–3E and must not override them.
- Do not treat example tool names, baseline technology decisions, diagrams, or phase plans as implemented APIs or frozen design.

## Decisions log

### Documentation foundation — current session

**Decision:** Create only the six requested core documents; record accepted project decisions separately from implementation status.

**Reason:** The project folder contains no application artifacts, while the project brief and owner corrections establish product scope and a planned technology baseline.

**Impact:** Future work can use the accepted baseline without claiming that any stack component or product feature is already implemented.

## Open Questions

1. **Tool contracts:** The MVP brief suggests approximately 7–10 tools and illustrative names; the final list and contracts are not yet defined here.
2. **Technology implementation:** Baseline technologies are accepted, but versions, service boundaries, and configuration are not yet specified or implemented.
3. **Business semantics:** Customer verification, order changes/exchanges, inventory reservation, approval, retry/duplicate handling, tenant ownership, and forecast target are not specified sufficiently for executable contracts.
4. **Research protocol:** This documentation foundation does not specify the scenario corpus, metric formulas, budgets, model/provider, or evaluation procedure for future experiments.
5. **External integrations:** Channel API access, permissions, webhook behavior, and available test accounts are unknown.

## Future decisions

Define the remaining approved business semantics and experimental protocol in their owning documents. Use the current master and completed Phase 2B/2C/2D/2E work for later reviewed wireframes and visual design. Older open wording above remains historical until a separate core-document reconciliation.

## Phase 3A durable low-fidelity decisions

Phase 3A is complete for the six P0 areas in the editable Figma file [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy), page `03A — Low-Fi Wireframes`. The selected Conversations structure is a three-pane operational workspace with a persistent customer/business context panel; the rejected alternative keeps context behind tabs/drawer and remains documented for comparison. Escalations uses queue plus decision-context detail inside Conversations. Orders keeps order and reservation states independent. Customer Web Chat is separate from staff navigation and technical traces. Analytics is observed history; Forecasts is predicted output with current `MODEL_NOT_READY` and TARGET ready-state explicitly separated.

The Figma audit found 679 native editable nodes (308 frames, 371 text), no raster/image-filled nodes, no generic frame names, only Inter working text, and no top-level section overlap. E02 remains restricted, M12 resume remains TARGET/design-only, M13 remains `MODEL_NOT_READY`, M08 live-provider completeness is not claimed, and `OUTCOME_UNKNOWN` continues to require reconciliation without blind retry. Phase 2C IA, Phase 2D flows and Phase 2E functionality were not changed. See [PHASE_3A_LOW_FI_WIREFRAMES.md](research/PHASE_3A_LOW_FI_WIREFRAMES.md).

## Phase 3B durable UX decisions

[Phase 3B](research/PHASE_3B_UX_REVIEW.md) is complete in the six-P0 low-fi scope. The canonical Figma file retains untouched `03A` and reviewed `03B`; a local Figma Desktop development plugin supported controlled 03B refinement after MCP quota exhaustion. Owner-reported manual visual/semantic review and six scenario walkthroughs were completed; the final **17/17 structural PASS** confirms presence, not UX quality by itself. Conversations retains list + workspace + persistent context. Escalations separates Queue from Decision Context and scans reason → confirmed facts → uncertain effect → constraints → safe step → human decision.

Order creation and reservation remain separate. Known reservation failure leads to current-fact review and authorized recovery; `OUTCOME_UNKNOWN` means possible commit, reconciliation and no blind retry. Delivery failure does not undo or replay a confirmed business effect. Customer Web Chat uses plain-language uncertainty and explicit order confirmation, not internal tool/run terminology. Analytics is historical actuals; Forecasts is predicted information, with current `MODEL_NOT_READY` and TARGET ready-state separate. M12 durable Resume remains TARGET/revalidation-only; E02 `update_order` remains restricted. Phase 3B did not itself create visual tokens, high-fidelity UI or an application frontend; Phase 3C subsequently established the Design System below.

## Phase 3C durable Design System decisions

Phase 3C is **COMPLETE** in the canonical Figma file [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy), page `03C — Design System`; `03A`/`03B` remain protected. The approved direction is **Calm Operational SaaS**: a primary light theme with primitive-to-semantic token aliases, restrained surfaces/color/elevation, readable operational hierarchy and AI visible but secondary to business outcomes. Reusable Core, Navigation, Conversation/AI, Business, Escalation, Analytics, Forecast and Customer Web Chat families and six small Usage Examples were reviewed. The owner-reported final structural result is **49/49 PASS** after older Analytics/Forecast duplicate frames were archived by renaming, not deletion; manual visual review also occurred. Structural validation is not usability, localization or accessibility certification. See [the Phase 3C report](research/PHASE_3C_DESIGN_SYSTEM.md).

Durable distinctions: Known Failure is a known non-effect, while `OUTCOME_UNKNOWN` may have committed and requires reconciliation without blind retry; Order State ≠ Reservation State; Order Delivery ≠ Message Delivery; solid historical ACTUAL ≠ dashed future PREDICTED. Current M13 truth is `MODEL_NOT_READY`, not a produced forecast. Customer UI hides internal tool/run terminology and uses contextual **Confirm order**. The design target is **WCAG 2.2 AA-level**, not certification, with visible focus, non-color-only meaning and EN/RU/KZ wrapping resilience. M08 live channels remain incomplete; M12 Resume is TARGET-only; E02 `update_order` remains restricted; exact freshness rules, full responsive layouts and formal QA remain later work. Phase 3D subsequently applied this system; this Phase 3C close-out created no application code.

## Phase 3D durable high-fidelity decisions

**Phase 3D is COMPLETE** in the canonical Figma file [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy), page `03D — High-Fidelity Screens`. The Shared Staff Shell and six P0 families—Conversations, Escalations, Orders, Customer Web Chat, Analytics and Forecasts—were approved after incremental manual visual review. The owner-provided final aggregate validator reported **Shared Shell PASS; 6/6 P0 PASS; semantic consistency PASS; geometry PASS; Phase 3C asset usage PASS; source-page protection PASS; Overall PASS**. [The Phase 3D report](research/PHASE_3D_HIGH_FIDELITY.md) holds details; automated checks are not usability, localization or accessibility certification.

The **Calm Operational SaaS** Phase 3C system remains authoritative; 03D reuses its components and semantic variables without a second visual system. Staff and customer surfaces remain distinct; the Shell keeps six role-visible areas with Audit restricted and Agent Runs contextual/restricted. `OUTCOME_UNKNOWN` high-fi treatment requires authoritative reconciliation and no blind retry; known failure has a known recovery path. Order State ≠ Reservation State and Order Delivery ≠ Message Delivery. Analytics is observed-only; Forecast TARGET Ready is illustrative while current M13 remains `MODEL_NOT_READY`. E02 `update_order` is restricted and M12 Resume is TARGET-only. `03A`/`03B`/`03C` stayed protected during Phase 3D. Phase 3E subsequently built an interactive prototype from protected 03D sources; no application frontend was created by the Phase 3D close-out.

## Phase 3E durable interactive-prototype decisions

**Phase 3E is COMPLETE** in the canonical Figma file [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy), page `03E — Interactive Prototype`. Eight approved scenarios cover Product Availability, Purchase Success, Reservation Failure, Support → Sales Handoff, `OUTCOME_UNKNOWN` → Escalation, Human Decision / Resume TARGET, Analytics → Forecasts and Customer Web Chat. `03D — High-Fidelity Screens` remains the canonical visual source; 03E uses preserved copies, while 03A–03D remain protected. Existing visible product actions are used where appropriate; external prototype-board controls and annotations identify scenario/system/target-only progression without inventing product CTAs or invisible hotspots.

`OUTCOME_UNKNOWN` routes to authoritative reconciliation with no blind mutation retry; a known reservation failure instead calls for current-fact review and a new authorized recovery. Handoff does not transfer permissions. M12 Resume Pending is **TARGET only** after human decision and fresh revalidation, not replay or current durable execution; E02 remains restricted. Analytics shows observed data and current Forecasts shows `MODEL_NOT_READY`; M13 TARGET Ready is a separate non-interactive specimen, not a live prediction. Customer Web Chat's **Retry message** is communication-only and never repeats a confirmed Order or reservation. The owner-provided real-Figma result is **8/8 flows PASS; source-page protection PASS; visual-source preservation PASS; broken/prohibited destinations 0; Overall PASS**, with manual visual review of all eight flows. Formal flow starting points were read-only in the plugin API; reactions worked and external START annotations mark entry. [The Phase 3E report](research/PHASE_3E_INTERACTIVE_PROTOTYPE.md) records details and limits. This does not establish backend/frontend execution or formal usability/accessibility/localization certification. Phase 3F subsequently consolidated the approved design.

## Phase 3F final design handoff

**Phase 3F is COMPLETE.** [DESIGN.md](DESIGN.md) is the primary implementation-ready frontend UX/UI contract, not a provisional research skeleton. It consolidates the six-area Phase 2C IA, 15 staff families plus separate Customer Web Chat, Phase 2E functional screen contracts, the Phase 3C visual system, 03D high-fi P0 visuals and 03E validated interaction semantics without changing their sources. `03C — Design System` is visual/component authority; `03D — High-Fidelity Screens` is the approved P0 visual source; `03E — Interactive Prototype` is the flow/interaction reference. External Figma prototype controls are not product controls. Non-P0 families have approved IA/functional contracts but no equivalent 03D high-fi composition; they must reuse the shell and 03C system.

The final design handoff preserves trusted effect versus proposal/delivery, Order versus Reservation, Known Failure versus `OUTCOME_UNKNOWN`, authoritative reconciliation/no blind retry, handoff without permission transfer, and observed Analytics versus TARGET Forecast. M08 remains incomplete, E02 restricted, M12 TARGET only and M13 `MODEL_NOT_READY`. Figma design completion does not prove a working frontend, backend, live channels or formal QA. **Phase 4 — Frontend Implementation is READY / NOT STARTED** and requires a separate implementation task; Phase 3F created no application code.
