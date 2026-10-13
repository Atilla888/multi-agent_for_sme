# P5C Audit

Date: 2026-10-14
Phase: P5C — Conversations + Escalations

## 1. Authorities

Reviewed authority, in precedence order:

1. `docs/DESIGN.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`.
2. P5A/P5B frontend foundation and design-system audit, matrix, and implementation reports.
3. `design/README.md` and Phase 3D/3E research reports.
4. Local Phase 3D Conversations/Escalations builders and Phase 3E Flows 1–6.
5. Actual FastAPI, domain, Business Brain, agent, security, repository, and physical-schema code.

Figma was not modified. Local builders were used as the recoverable implementation authority.

## 2. Conversations Visual Contract

Confirmed desktop structure:

- one staff-shell page containing a three-pane product workspace;
- conversation list, selected conversation workspace, and persistent context panel;
- selected row has a distinct selected surface and marker;
- list supports search and the All, Attention, and Waiting Human filters;
- rows expose participant, time, channel, current handler, state, and a short preview;
- the message workspace has conversation metadata, status, message thread, state/result notice,
  and a composer area;
- actor identity distinguishes Customer, Human Operator, Sales Agent, Support Agent,
  Analytics Agent, and System without presenting the orchestrator as an agent;
- context separates verified/current facts, Customer, Order, Reservation, Product/Inventory,
  Active Handler, and Escalation status;
- Order State is not Reservation State;
- observed inventory is timestamped/freshness-aware and is not a live-stock promise;
- visible links do not grant backend access;
- customer data and source/freshness information are compact context, not full Customer/Order screens.

Confirmed variants include Default/Active, Support Active, Sales Active, Support to Sales
Handoff, Human Takeover, Waiting Human/Escalation, Awaiting Confirmation, Processing, Confirmed
Result, Known Failure, OUTCOME_UNKNOWN, Dependency Unavailable, and Message Delivery Failure.

Confirmed safety distinctions:

- known reservation failure means the result is known and an authorized recovery can be chosen;
- OUTCOME_UNKNOWN means the effect may have committed, confirmation is unavailable, and
  authoritative-state reconciliation is required before any mutation retry;
- message delivery failure does not erase a confirmed business effect;
- retrying communication is not retrying a business mutation.

Responsive behavior beyond desktop is **NOT SPECIFIED** by exact breakpoint/measure. P5C will
therefore preserve pane priority intentionally: list plus workspace at medium widths, then a
single-column sequence with the selected workspace first at narrow widths. It will not modify
the Customer Web Chat mobile design.

Live unread synchronization, real-time presence, WebSocket behavior, and live channel delivery
are **NOT SPECIFIED / NOT AVAILABLE**.

## 3. Escalations Visual Contract

Confirmed structure:

- left escalation queue and right Decision Context;
- queue rows expose case/conversation/order identity, reason, status, and selected treatment;
- Decision Context hierarchy is: Why automation stopped, Confirmed facts, Uncertain effect,
  Constraints, Next safe step, Human decision;
- handler/agent identity and related conversation context remain visible;
- Agent Run is contextual/restricted, not a universal operator destination;
- WAITING_HUMAN is an automation stop with a human owner/decision pending;
- OUTCOME_UNKNOWN is a separate safety state, never an ordinary failure;
- E02 restricted means `update_order` did not execute and no changed order may be claimed;
- stale/conflicting and known failure remain separate;
- Resolved and Closed are distinct visual concepts where represented;
- Resume Pending is an approved M12 TARGET state, not a current action.

Action availability is contract-bound. The current backend has no public decision, claim,
reconciliation, or resume endpoints, so P5C renders read-only fixture states and disabled or
TARGET-only controls only.

## 4. Relevant Prototype Flows

| Flow | Entry | Approved progression | Current/Target boundary |
| --- | --- | --- | --- |
| Product Availability | Default / Active | external prototype step to Support Active | UI state is fixture-only; verified Product + Inventory context is read-only; M08 delivery is unavailable. |
| Purchase Success | Awaiting Confirmation | confirmation event to Processing, trusted result to Confirmed, then Open Order | Product controls and prototype annotations are not copied as fake product behavior; no real mutation occurs. |
| Reservation Failure | Known Failure | Open Order to Reservation Failed | Known result; review current facts and choose authorized recovery; no reconciliation language or automatic retry. |
| Support to Sales Handoff | Support Active | Handoff to Sales Active | Handoff may be shown as a fixture event; current runtime says orchestration is still required. Permissions do not transfer. |
| OUTCOME_UNKNOWN to Escalation | Conversation OUTCOME_UNKNOWN | Open Escalation to Reconciliation | No blind retry; reconciliation is required. No reconciliation command endpoint exists. |
| Human Decision / Resume | Awaiting Decision | revalidation gate to Resume Pending | Entire durable Resume path is M12 TARGET-only; no persistence or successful transition is simulated. |

Phase 3E prototype-only continue controls are navigation aids and are not implemented as product
controls.

## 5. Backend/API Contract Inventory

Public routes:

- `GET /health/live`;
- `GET /health/ready`.

Relevant internal contracts:

- `PrincipalContext`, staff roles, tenant/customer authorization policies;
- `ConversationContext`, `ConversationMessage`, provenance and freshness/status contracts;
- Product, Inventory, Customer, Order, Runtime State, Rules, and Permissions context;
- specialist roles Sales, Support, Analytics;
- agent outcomes including CONTROLLED_ESCALATION and OUTCOME_UNKNOWN;
- handoff proposal in the agent contract, with runtime explicitly requiring orchestration;
- persistence for conversations, messages, agent runs, escalations, idempotency operations,
  tool calls, and audit logs.

Missing public contracts are listed in section 11 and in
`P5C_BACKEND_CONTRACT_AUDIT.md`.

## 6. Current Capability Matrix

- Health: **LIVE-CONTRACT-READY**.
- Conversation/message/context domain shapes: **READ-ONLY CONTRACT**.
- Conversation and Escalation screens: **LOCAL UI FIXTURE ONLY**.
- Current principal/session, live channel delivery, enabled escalation commands: **UNAVAILABLE**.
- Human Decision and durable Resume: **TARGET-ONLY**.

All fixture states will carry an explicit development/demo label and live outside API client code.

## 7. M08 Boundary

M08 remains PARTIAL / BLOCKED / DEFERRED. Channel labels in fixtures are historical/demo context,
not evidence of a connected provider. The composer must not claim that a message can be sent,
delivered, or synchronized. Dependency-unavailable and message-delivery-failure states remain
semantically distinct from business effects.

## 8. M12 Boundary

Durable Human Resume is TARGET / NOT STARTED. The approved Resume Pending treatment may be shown
only as TARGET-only, with no backend call, no simulated persistence, no replay, and no successful
resume transition. Revalidation requirements remain visible.

## 9. OUTCOME_UNKNOWN Boundary

The UI must state all four facts:

1. the mutation may have committed;
2. confirmation is unavailable/insufficient;
3. reconciliation against authoritative state is required;
4. blind mutation retry is unsafe.

No Retry transaction, Repeat order, or equivalent mutation action may appear.

## 10. Implementation Plan

1. Add typed Conversations/Escalations view models.
2. Add deterministic, clearly named local UI fixtures and a fixture adapter separate from API code.
3. Build reusable feature components that compose existing P5B primitives.
4. Replace only `/conversations`, `/conversations/[id]`, and `/escalations` placeholders.
5. Keep route-based selection and expose deterministic validation states through documented query
   parameters without pretending they are backend resources.
6. Add purposeful desktop, medium, and narrow layout behavior.
7. Test rendering, routing selection, actors, empty/loading/unavailable, handoff,
   OUTCOME_UNKNOWN, WAITING_HUMAN, and M12 TARGET-only behavior.
8. Run lint, typecheck, tests, build, route smoke, dependency audit, and visual review.

## 11. Unknown / Missing Contracts

- authenticated current-principal and active-business response;
- staff conversation list/detail/messages API;
- message send/delivery API and live M08 channel configuration;
- escalation list/detail/assignment/decision API;
- authorized handoff orchestration API;
- reconciliation request/status API;
- durable M12 Human Resume API and response lifecycle;
- public source/freshness mapping for the complete UI context panel;
- unread synchronization semantics;
- exact responsive breakpoints from design authority.

These gaps are represented through LOCAL UI FIXTURE ONLY, UNAVAILABLE, or TARGET-ONLY modes;
none are filled with a fake endpoint.
