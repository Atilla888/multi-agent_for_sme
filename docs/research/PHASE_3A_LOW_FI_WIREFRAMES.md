# Phase 3A — Low-Fidelity Wireframes

## 3A.0 Scope and Source Authority

Phase 3A translates the approved Phase 2C information architecture, Phase 2D flows, and Phase 2E functional inventory into editable low-fidelity Figma wireframes. The current consolidated master PDF remains the primary technical and evidence authority. No approved input, flow, requirement, or architecture boundary is changed.

Figma file: [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy) (`OFXTN83nFl3RqukrEYQrFy`). Page: `03A — Low-Fi Wireframes`.

## 3A.1 Wireframe Principles

The wireframes apply task-first structure, context near action, progressive disclosure, visible but non-dominant AI state, business result before tool detail, explicit uncertainty, and a strict separation between customer and staff surfaces. They use grayscale only and do not establish final visual tokens, typography, branding, or a design system.

## 3A.2 Figma File Structure

The page contains nine named top-level sections: Notes / Principles, Shared Staff Shell, Conversations, Escalations, Orders, Customer Web Chat, Analytics, Forecasts, and Flow Review. The audited file contains 679 editable native nodes: 308 frames and 371 text nodes. It contains no image-filled nodes and no generic frame names.

## 3A.3 Shared Staff Shell

All staff P0 views use one desktop SaaS shell with the frozen six-area navigation: Overview, Conversations, Business, Knowledge, Analytics, and Administration. It includes active area, business/tenant context, account/session context, and the main workspace. Orchestrator, Business Brain, LangGraph, tools, and databases are not product navigation.

## 3A.4 Conversations — Alternatives

`P0 / Conversations / Alternative A` uses Navigation + Conversation List + Conversation Workspace + persistent Context Panel. `P0 / Conversations / Alternative B` uses Navigation + Conversation List + Conversation Workspace, with customer/order/inventory/activity context behind tabs or a contextual drawer.

Alternative A was selected. It uses more horizontal space, but keeps customer, order/reservation, inventory, handler, handoff, escalation, and uncertain-effect context visible together. Alternative B gives the thread more space but adds context switching and can hide operationally critical state.

## 3A.5 Conversations — Selected Structure

The selected three-pane structure provides homes for discovery, active thread, reply composer, customer summary, related order, reservation, product/inventory facts, current and previous handler, handoff event, business-action result, escalation, and permissioned contextual links to Agent Run/Audit evidence.

## 3A.6 Conversations — State Variants

Delta frames cover default active, Sales active, Support active, Support-to-Sales handoff, Human Operator takeover, waiting for human, awaiting customer confirmation, action executing, confirmed effect, known failure, `OUTCOME_UNKNOWN`, dependency unavailable, and message delivery failure after a confirmed effect.

## 3A.7 Escalations

Escalations remains nested under Conversations. The queue exposes waiting/assigned/status/reason/customer/conversation/order context. Detail exposes why automation stopped, verified facts, completed/failed/pending operations, restrictions, evidence summary, requested decision, and only supported decision categories. Resume is annotated as TARGET behavior because M12 is not implemented. Reconciliation and `OUTCOME_UNKNOWN` prohibit blind retry.

## 3A.8 Orders

Orders includes list and detail structures. Detail shows Order State and Reservation State as independent blocks, plus customer, items, quantity, linked conversation, activity, attention/escalation, and freshness/revision. Variants cover confirmed reservation, failed reservation, `OUTCOME_UNKNOWN`, human attention, stale/conflicting state, and the policy-denied E02 update path.

## 3A.9 Customer Web Chat

Customer Web Chat is a separate surface without staff navigation. It supports messages, input, clarification, confirmation, processing, business result, pending human support, and connection/delivery state. It excludes tool names, Agent Runs, Audit, confidence, orchestration, LangGraph, raw evidence, and internal handoff details.

## 3A.10 Analytics

Analytics is explicitly observed/historical. Its structure contains metric, period, optional granularity, KPI summary, historical visualization placeholder, detail table, completeness, freshness, and a link to Forecasts. Valid empty is distinct from error, and an unavailable source is not represented as zero sales.

## 3A.11 Forecasts

Forecasts is nested under Analytics and keeps actual history separate from predicted values. It provides target, cutoff, horizon, request/configuration, result/provenance/limitations, and an optional ForecastRun reference only when a run exists. `MODEL_NOT_READY` is the current M13 state and creates neither a prediction nor a fictitious ForecastRun. A ready-state is labeled TARGET UX.

## 3A.12 Global State Treatment

`OUTCOME_UNKNOWN` means an effect may have committed. It is neither success nor confirmed failure and requires preserved operation context, reconciliation, and no blind write retry. A confirmed business effect remains confirmed when outbound message delivery fails; only delivery may be retried. Known failure, dependency failure, authorization denial, stale state, pending, and valid empty remain semantically distinct.

## 3A.13 Contextual Navigation

The wireframes provide contextual homes for Conversation → Customer/Order/Escalation/Agent Run, Escalation → Conversation/Order/Agent Run, Order → Customer/Conversation, and Analytics → Forecasts. P1/P2 destinations are references only and are not fully designed.

## 3A.14 Phase 2D Flow Coverage

Conversations supports Flows 01–06; Escalations supports Flow 06; Orders supports Flows 02, 03, 05, and 06; Web Chat supports customer portions of Flows 01–06; Analytics supports Flow 07; Forecasts supports Flow 08. The Flow Review section traces product availability, purchase/reservation, Support-to-Sales handoff, human escalation/safe resume, owner analytics, and forecast paths without rewriting the flows.

## 3A.15 Component Reuse

The layouts reuse Phase 2E functional contracts for shell/navigation, conversation list/thread/composer, customer and business context, handler/handoff, business result, status, escalation, order/reservation, analytics controls/result, forecast result, and system states. No functional component gap was found at low-fidelity scope.

## 3A.16 Current vs Target Engineering States

E02 `update_order` remains restricted and is not shown as a normal enabled success path. M12 durable resume is TARGET UX and requires authorization/state/revision/effect revalidation. M13 ready forecasting is TARGET UX; current behavior is `MODEL_NOT_READY`. M08 channel/provider status is not overclaimed: the conversation example is labeled SANDBOX.

## 3A.17 UX Issues Found

The initial side-by-side alternative comparison exceeded the section width. It was corrected to a vertical comparison so both alternatives remain fully visible and editable. The audit found no top-level overlap, generic frame names, rasterized UI, or non-Inter text.

## 3A.18 Inputs for Phase 3B

Phase 3B should test whether the persistent context panel remains usable at realistic message density, which facts deserve fixed versus collapsible placement, how operator decisions are worded, and how uncertainty is recognized without color. It should also validate role/device/language assumptions before visual design decisions.

## 3A.19 Open Questions

Open questions include the dominant staff device and density, target languages/scripts, exact operator permission boundaries, approved E02 mutations, final resume decisions, forecast target/horizon, and which contextual traces are visible to each role without tenant leakage.

## 3A.20 Phase 3A Summary

Phase 3A is complete in its approved P0 scope. The editable Figma file contains the six P0 areas, two Conversations alternatives and a documented selection, required state variants, current-versus-target limitations, and Phase 2D flow review. It does not contain high-fidelity UI, an approved design system, application code, or Phase 3B work.
