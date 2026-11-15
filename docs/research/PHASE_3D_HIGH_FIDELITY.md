# Phase 3D — High-Fidelity Figma

## 3D.0 Scope and Source Authority

Phase 3D is **COMPLETE** for the approved high-fidelity design scope: one Shared Staff Shell and six P0 screen families. The canonical artifact is **Diplom — Multi-Agent Platform UX/UI** (file key `OFXTN83nFl3RqukrEYQrFy`), page `03D — High-Fidelity Screens`. The owner-provided final aggregate report records **Overall: PASS**, and manual visual review was performed incrementally. This is a design deliverable, not a working application frontend, live customer channel, implemented M12 Resume or trained M13 forecast model.

Source precedence remains the supplied `FINAL_MASTER_DEVELOPMENT_SAFE.pdf` for architecture and engineering status; [Phase 2C IA](PHASE_2C_INFORMATION_ARCHITECTURE.md), [Phase 2D flows](PHASE_2D_CORE_USER_FLOWS.md) and [Phase 2E inventory](PHASE_2E_FINAL_SCREEN_INVENTORY.md) for structure and behavior; [Phase 3A](PHASE_3A_LOW_FI_WIREFRAMES.md) and [Phase 3B](PHASE_3B_UX_REVIEW.md) for the selected/reviewed low-fi UX; and [Phase 3C](PHASE_3C_DESIGN_SYSTEM.md) for visual foundations and components. Phase 3D applies these decisions without changing their authority or promoting design examples into implemented capabilities. Phase 3E is **NOT STARTED**.

## 3D.1 Inputs from Phase 3B and Phase 3C

Phase 3B supplied the approved six-area P0 layouts, recovery language, state distinctions and cross-screen relationships. Phase 3C supplied the selected **Calm Operational SaaS** direction, light-theme semantic variables, type hierarchy and reusable component families. Phase 3D combined them as full high-fi compositions; it did not define a competing design system or revise the Phase 2C six-area IA. The 03A, 03B and 03C pages remained protected.

## 3D.2 High-Fidelity Principles

The screens are business-first, trustworthy, restrained and moderately dense. AI ownership is visible where useful but subordinate to verified business outcomes. Surface grouping, readable labels, state language and next safe actions carry meaning with minimal decorative noise. Consequential distinctions use text, hierarchy and line/shape treatment as well as semantic color. A visible action or navigation link never grants backend authority.

## 3D.3 Shared Staff Shell

The approved desktop-reference shell keeps active business context, account/session, breadcrumb and current workspace visible. Its six top-level areas are **Overview, Conversations, Business, Knowledge, Analytics, Administration**. The nesting remains: Conversations → Escalations; Business → Customers, Orders, Products, Inventory; Knowledge → Documents; Analytics → Forecasts; Administration → Integrations, Settings, Audit, Agent Runs. These areas are role-visible, not a universal access grant.

**Audit** has a restricted/permissioned treatment; **Agent Runs** has a contextual/restricted treatment. Neither appears as an ordinary universally available Operator destination or as merely Disabled. The sidebar business control and header current-business indicator have distinct roles. Frontend visibility does not replace backend business, resource, action and current-policy authorization. Orchestrator, Business Brain, LangGraph, tools and databases do not become normal navigation.

## 3D.4 Conversations

The high-fi composition retains **Conversation List + Workspace + Persistent Context Panel** so message handling, verified customer/order/reservation facts, inventory/freshness, current handler, escalation and safe action state can be read together. Support Agent, Sales Agent and Human Operator ownership are distinct; a handoff preserves context but transfers no permissions. A proposal is not an executed result; a tool attempt is not a trusted business effect.

The 13 approved variants are **Default / Active; Support Active; Sales Active; Support → Sales Handoff; Human Takeover; Waiting Human / Escalation; Awaiting Customer Confirmation; Processing / Executing; Confirmed Business Result; Known Failure; OUTCOME_UNKNOWN; Dependency Unavailable; Message Delivery Failure After Confirmed Effect**. Known Failure is a known non-effect, while `OUTCOME_UNKNOWN` means possible commit and unavailable confirmation: reconcile authoritative state before any mutation retry. A failed outbound message does not undo or justify replaying a confirmed reservation. Order State and Reservation State remain separate.

## 3D.5 Escalations

Escalations is a nested **Queue + Decision Context** within Conversations. The queue supports triage; the selected case has a six-part decision hierarchy: **WHY AUTOMATION STOPPED → CONFIRMED FACTS → UNCERTAIN EFFECT → CONSTRAINTS → NEXT SAFE STEP → HUMAN DECISION**. The operator sees the case, related Conversation/Order, current human owner, relevant evidence and the permitted next decision, not a detached approve button.

The eight approved variants are **Waiting Assignment; Awaiting Decision; OUTCOME_UNKNOWN / Reconciliation Required; Stale Context; Authorization Changed; E02 Restricted; Resume Pending — TARGET M12; Resolved / Closed**. An uncertain effect requires authoritative-state reconciliation and **no blind retry**. E02 is an `update_order` policy restriction, not `OUTCOME_UNKNOWN`. The M12 path is target-only: **human decision → revalidation of rights/state/effect → controlled Resume request**, never mutation replay or a claim of implemented durable Resume. Resolved and Closed remain distinct.

## 3D.6 Orders

Orders has an **Orders List + Order Detail** structure. The seven approved variants are **Mixed List; Reservation Confirmed; Reservation Failed; OUTCOME_UNKNOWN; Needs Human Attention; Stale / Conflict; E02 Restricted**. Order State and Reservation State are independent: an Order may exist while inventory reservation fails or remains uncertain.

A **known reservation failure** is a known result: inventory was not reserved; review current inventory and choose an authorized recovery path. It does not require unknown-effect reconciliation by default. `OUTCOME_UNKNOWN` means the reservation may have committed; reconcile before any retry. E02 keeps automatic `update_order` mutation restricted. Stale/conflicting facts require refresh and revalidation. Product existence does not establish available stock; dependency unavailability is not zero stock. **Order Delivery** (fulfillment/logistics) and **Message Delivery** (communication) are separate; failed communication cannot erase or replay a confirmed business effect.

## 3D.7 Customer Web Chat

Customer Web Chat is a separate mobile-important customer surface, not a reduced staff dashboard. The ten approved variants are **Initial; Active; Clarification; Confirmation Required; Processing; Confirmed Result; Known Failure; Waiting Human; Confirmation Pending; Message Delivery Failure**. The contextual **Confirm order** action names the business authorization; **Change details** remains secondary. Processing promises an update without implying that the customer must keep the chat open.

Known reservation failure explains that the Order already exists, discourages placing the same order again and offers a plain-language next step. Confirmation Pending communicates uncertainty and duplicate-submission protection without exposing `OUTCOME_UNKNOWN`. Message Delivery Failure is a communication problem; a confirmed business result may remain confirmed. Customer frames do not surface `ToolCall`, Agent Run, LangGraph, `OUTCOME_UNKNOWN`, M12, E02, internal confidence or technical handoff details. The 44 px touch-target guidance and mobile reference are design examples, not frozen product breakpoints.

## 3D.8 Analytics

Analytics contains **observed/historical ACTUAL** data, not predictions. The six approved variants are **Valid; Valid Empty; Incomplete; Stale; Dependency Unavailable; Permission Denied**. Report metric, period, source, completeness and freshness stay visible with the historical chart and table. A missing observation is an explicit gap, not zero. Valid Empty is a successful no-record result, unlike an unavailable dependency. Incomplete does not mean zero activity; Stale retains observed history with a refresh warning. Permission Denied reveals no protected report values. Forecasts remains a separate nested destination.

## 3D.9 Forecasts

Forecasts has eight approved variants: **TARGET Ready; MODEL_NOT_READY; Insufficient History; Incomplete History; Unsupported Horizon; Model Unavailable; Timeout; Permission Denied**. The **current engineering state is `MODEL_NOT_READY`**: no validated M13 artifact, real prediction, zero forecast or fictitious ForecastRun is claimed. **TARGET Ready** is explicitly illustrative **TARGET PRODUCT UX**, not current capability.

The target chart distinguishes **solid historical ACTUAL → explicit CUTOFF / last observed → dashed future PREDICTED** with labels and position, not color alone. Non-ready states show no fake prediction. Insufficient History (too short) differs from Incomplete History (missing coverage); Model Unavailable differs from `MODEL_NOT_READY`. Permission Denied withholds protected result/provenance. Historical Analytics remains separately available.

## 3D.10 Semantic Consistency

Across all seven sections the durable rules are: **proposal ≠ execution; confirmed business effect ≠ message delivery; Known Failure ≠ `OUTCOME_UNKNOWN`; Order State ≠ Reservation State; Order Delivery ≠ Message Delivery; Analytics ≠ Forecasts; ACTUAL ≠ PREDICTED; `MODEL_NOT_READY` ≠ zero or valid-empty forecast**. `OUTCOME_UNKNOWN` requires reconciliation and prohibits blind mutation retry. Handoff does not transfer permissions; E02 remains restricted; M12 remains target-only. Frontend controls never override trusted policy, tenant scope or fresh authoritative facts.

## 3D.11 Phase 3C Design-System Reuse

The high-fi screens reuse Phase 3C semantic Variables, Inter typography, Core, Navigation, Conversation/AI, Business Entity, Escalation, Analytics/Data, Forecast and Customer Web Chat components. Native component instances are used where suitable; narrow or screen-specific compositions use the same approved semantic tokens. This is composition of the existing system, **not** a second component library. The final aggregate asset-usage gate passed.

## 3D.12 Accessibility / Localization Resilience

Visible focus, persistent labels, readable status text, non-color-only distinction, appropriately sized customer actions, wrapping and state explanation were carried into the high-fi design. EN/RU/KZ length and script expansion remain design considerations; structural and generated-node checks do not establish translation quality, keyboard behavior in a running application, responsive behavior on all devices or WCAG conformance. The Phase 3C WCAG 2.2 AA-level target remains a **target**, not a certification. Formal language QA and accessibility audit remain open.

## 3D.13 Geometry / Layout Validation

The final aggregate generated-node geometry gate was **PASS**: Conversations **8/8**, Escalations **8/8**, Orders **7/7**, Customer Web Chat **10/10**, Analytics **6/6**, Forecasts **9/9**. Existing validators checked applicable major-block overlap, clipping, text and state-composition fit, mobile Web Chat action geometry, and Analytics/Forecast chart geometry. These are bounded generated-node checks, not universal responsive or usability certification and not an aesthetic score.

## 3D.14 Manual Visual Review

Manual visual review took place incrementally throughout Phase 3D, separately from automated validation. It included the Shell's restricted/contextual Audit and Agent Runs treatment; Conversations result-state deduplication, Awaiting Confirmation copy, Message Delivery terminology/layout and `OUTCOME_UNKNOWN` composition; Escalations unknown-state wording/validator alignment; all seven Orders states; Web Chat mobile customer language and delivery safety; Analytics historical-only states and source resolution; and the Forecast ACTUAL/cutoff/dashed PREDICTED chart and its rotated-cutoff validator fix. This review is recorded as owner-provided acceptance, not a formal usability study.

## 3D.15 Figma Implementation

The canonical file is **Diplom — Multi-Agent Platform UX/UI** (`OFXTN83nFl3RqukrEYQrFy`), with exactly one canonical FRAME for each approved section `01 — Shared Staff Shell` through `07 — Forecasts` on `03D — High-Fidelity Screens`. The local implementation tool was `design/figma-plugins/figma-phase3d-plugin/`: its controlled builders wrote editable output directly into the real Figma file, and its Inspect/Validate actions read without modifying it. Figma MCP was not required for generation. `03A — Low-Fi Wireframes`, `03B — UX Review & Revisions` and `03C — Design System` were protected and unchanged; Phase 3D writes were scoped to 03D.

## 3D.16 Final Aggregate Validation

The owner-provided final aggregate validation result for the real Figma file is:

| Gate | Result |
| --- | --- |
| Shared Staff Shell | PASS |
| Conversations | PASS |
| Escalations | PASS |
| Orders | PASS |
| Customer Web Chat | PASS |
| Analytics | PASS |
| Forecasts | PASS |
| P0 high-fi screens | **6/6 PASS** |
| Semantic consistency | PASS |
| Geometry | PASS |
| Phase 3C asset usage | PASS |
| Source-page protection | PASS |
| **Overall** | **PASS** |

The validator covers structural presence, approved semantic checks, generated-node geometry, Phase 3C asset usage and source-page protection. **Structural, semantic and generated-node geometry validation does not equal formal usability, accessibility or localization certification.** Manual visual review is a separate owner-performed activity.

## 3D.17 Remaining Open Questions / Limitations

These are later engineering/product/QA dependencies, **not Phase 3D design-validation failures**: M08 live-provider/channel acceptance is incomplete; M12 durable replay-safe Resume remains TARGET only; E02 `update_order` needs an approved business-policy allowlist; M13 has no validated forecast artifact; numeric stock/report/provider freshness rules remain backend/domain decisions; full responsive staff layouts are future work; and formal EN/RU/KZ localization QA and accessibility audit/certification have not occurred. No current screen should suggest those capabilities are live merely because a target state is illustrated.

## 3D.18 Inputs for Phase 3E

Phase 3E is **NOT STARTED**. Its planned interactive Figma prototype should use the approved Phase 3D frames without redesigning them. Candidate paths are product availability; purchase/reservation success and known failure; Support → Sales handoff; `OUTCOME_UNKNOWN` → Escalation/reconciliation; human decision and a clearly marked **TARGET** Resume path; Analytics → Forecasts; customer confirmation; and recovery from Message Delivery Failure. Prototype links must not imply unavailable backend capability, live M12 Resume, live channels or a current forecast result. No interactions were created during Phase 3D documentation close-out.

## 3D.19 Phase 3D Summary

**COMPLETE:** the Shared Staff Shell and six P0 high-fidelity screen families were manually reviewed and approved; the final aggregate report returned **Overall PASS**, including 6/6 P0, semantic consistency, geometry, Phase 3C asset usage and source-page protection. The approved Calm Operational SaaS system and all current-versus-target safety distinctions remain intact. This close-out changes documentation only; Phase 3E, application frontend, formal QA and the blocked engineering capabilities remain separate work.
