# Phase 3C — Design System

## 3C.0 Scope and Source Authority

Phase 3C is complete for the design-system scope of the diploma UX/UI track. The canonical artifact is the editable Figma file **Diplom — Multi-Agent Platform UX/UI** (key `OFXTN83nFl3RqukrEYQrFy`), page `03C — Design System`. This report records the owner's final 49/49 structural validation and manual visual review, the existing Phase 3B UX decisions, and the local Phase 3C plugin's token/component definitions. It does not claim that a frontend, full high-fidelity screens, prototype, or backend capabilities were implemented.

The [Phase 3B review](PHASE_3B_UX_REVIEW.md) remains the authority for approved low-fi layouts and safe flow semantics; the [Phase 2C IA](PHASE_2C_INFORMATION_ARCHITECTURE.md), [Phase 2D flows](PHASE_2D_CORE_USER_FLOWS.md), and [Phase 2E inventory](PHASE_2E_FINAL_SCREEN_INVENTORY.md) retain their respective functional authority. Phase 3C supplies reusable visual language and components, not new product behavior.

## 3C.1 Design Direction

**Approved: Calm Operational SaaS.** It is trustworthy, professional, operational and business-first: calm surfaces, restrained color, readable dense information, explicit business states, and visible—but subordinate—AI assistance. The other exploratory directions (Modern AI Workspace and Data-Forward Business Console) were comparison candidates, not the selected system. This product is not a playful AI assistant, cyberpunk/developer console, marketing landing page, generic admin template, or pure BI dashboard.

## 3C.2 Design Principles

- Put verified business facts, authorization boundaries and next safe actions before AI spectacle.
- Keep independent facts independent: order/reservation, business effect/message delivery, actual/predicted, current/target capability.
- Use a consistent component family and semantic state language across staff and customer surfaces, but simplify customer copy and hide internal implementation vocabulary.
- Prefer labels, shape, line style, hierarchy and source/time context alongside color; do not encode consequential meaning with color alone.
- Compose components for task contexts; do not treat a style specimen as a full screen or as proof of implemented behavior.

## 3C.3 Foundations

The approved base is a primary **light theme**. The Figma collection `Phase 3C / Light` separates primitive colors from semantic aliases so later theming can reuse meanings without redefining product states. Inter is the documented working type family. A consistent icon-family principle applies across navigation, actions and status cues; no new icon library is asserted here. Staff UI is desktop-primary, while Customer Web Chat is mobile-important. Foundations establish design rules, not final responsive screen compositions.

## 3C.4 Color Architecture

The implementation defines `primitive/color/*` and semantic aliases under `semantic/surface/*`, `semantic/text/*`, `semantic/border/*`, `semantic/action/*`, `semantic/status/*`, plus `semantic/focus/ring` and `semantic/chart/*`. Exact names come from `design/figma-plugins/figma-phase3c-plugin/src/tokens.ts`; this report does not invent additional tokens. The neutral range supports calm page/card surfaces and readable text, navy supports primary action, and restrained green/blue/amber/red/violet/indigo/teal distinguish states without serving as their only cue. `chart/actual` and `chart/predicted` are separate, but line style and labels also distinguish series.

Meaning matters more than hue: `status/unknown` is distinct from `status/error`, `status/success`, and `status/pending`; `status/model-not-ready` does not imply a zero prediction. Destructive action color denotes the action's consequence, not a generic failure state.

## 3C.5 Typography

The operational hierarchy uses Inter Regular, Medium, Semi Bold and Bold. The implemented scale is: Page Title 28/36, Section Heading 20/28, Card Heading 16/24, Body and Body Strong 14/22, Small 13/20, Caption and Label 12/18, Metric 24/32 (font size/line height in px). Labels remain visible; critical text is not shrunk or replaced by an icon to fit. Text hierarchy separates decision/action, verified fact, secondary provenance and helper copy.

## 3C.6 Spacing / Sizing / Density

The implemented spacing scale is **4, 8, 12, 16, 24, 32, 48 px**, with a 4-point base. Staff surfaces allow moderate operational density while keeping status, source, ownership and action hierarchy scannable. Customer controls use mobile-important sizing, including 44 px touch-target examples. Exact full-screen breakpoints and dense responsive compositions remain Phase 3D work.

## 3C.7 Radius / Borders / Elevation

Implemented radii are small **4 px**, control **6 px**, card **8 px**, and pill **999 px**. Borders and subtle dividers express grouping before elevation does. The documented elevation levels are base (none), floating (subtle shadow plus border), and modal (moderate shadow plus scrim); avoid an excessively raised or decorative interface.

## 3C.8 Semantic States

| State | Meaning and safe treatment |
| --- | --- |
| Success | A general UI/system operation completed; not automatically a business effect. |
| Confirmed | Trusted evidence confirms a business effect. |
| Pending | Awaiting a result, confirmation or event. |
| Processing | Work is active; completion is not implied. |
| Known Failure | The effect is known not to have completed; review current facts and authorized recovery. |
| `OUTCOME_UNKNOWN` | The effect may have committed, confirmation is unavailable; reconcile authoritative state before any mutation retry. |
| Stale | Data exists but may no longer be decision-safe; refresh/revalidate. |
| Restricted | Automatic operation is intentionally unavailable or constrained, including E02 where applicable. |
| Permission Denied | The current principal is not authorized; hiding a control is not an authorization substitute. |
| Waiting Human | A human owns the next decision; no implicit permission transfer. |
| Dependency Unavailable | A trusted source cannot supply a reliable result; never substitute zero. |
| `MODEL_NOT_READY` | No validated forecast artifact and no prediction produced. |
| Delivery Failed | Communication failed; a confirmed business effect may remain confirmed. |
| Valid Empty | A successful query genuinely returned no records; not an outage or zero-filled missing data. |

Status components combine explicit labels, structural cues, explanatory copy and safe next steps. Destructive is an **action** emphasis, not another system state. Known failure and `OUTCOME_UNKNOWN` must never share a generic retry treatment.

## 3C.9 Core Components

The reusable core includes Button, Icon Button, Input, Textarea, Search Input, Select, Checkbox, Tabs, Badge/Status Badge, Alert/State Banner, Card/Panel, Divider, Avatar, Empty State, Loading/Skeleton, Pagination and Context Helper. Button emphasis is **Primary, Secondary, Tertiary/Ghost, Destructive**; states are **Default, Hover, Pressed, Focus, Disabled, Loading**. One dominant primary action is preferred. Destructive styling is reserved for destructive actions, not Known Failure or `OUTCOME_UNKNOWN` labels.

Input states are **Default, Focused, Filled, Error, Disabled, Read-only**. Every input keeps a persistent visible label; a placeholder alone is insufficient. Focus is visible, errors have explicit text in addition to color, and disabled values remain readable. Loading is not success; valid empty is not a failure fallback.

## 3C.10 Navigation Components

The system preserves the Phase 2C six-area staff IA:

- Overview
- Conversations → Escalations
- Business → Customers, Orders, Products, Inventory
- Knowledge → Documents
- Analytics → Forecasts
- Administration → Integrations, Settings, Audit, Agent Runs

Reusable parts are Primary Item, Nested Item, Expanded/Collapsed disclosure, Business Context, Breadcrumb/Return Context, Account/Session and Contextual/Restricted Link. Customer Web Chat is separate. Role-visible navigation helps discovery but never replaces backend business/resource/action authorization; Agent Runs remains restricted/contextual.

## 3C.11 Conversation / AI Components

The family includes Conversation List Item, Message Row, Composer, Customer Context, Order Context, Active Handler, Agent Status, Human Status, Handoff Event, Business Action Proposal, Business Action Result, Execution Summary, Escalation State and Delivery State. AI and Human handling are visibly distinct; Previous Handler is not Current Handler. A handoff carries verified context, **not permissions**. Proposal, Executing and Confirmed Result remain different states. Message transport does not alter the business-effect receipt. No hidden chain-of-thought or raw internal reasoning is exposed.

## 3C.12 Business Entity Components

The family includes Customer Summary, Product Summary, Inventory Status, Order Summary, Order State, Reservation State, Order Delivery Status, Message Delivery Status, Freshness and E02 Restricted. Product existence is not inventory availability. Order State is not Reservation State; an order may exist when reservation failed. Order Delivery and Message Delivery are distinct. Dependency Unavailable is not Zero Stock; Known Failure is not `OUTCOME_UNKNOWN`. Each consequential fact retains its own source/time and authorized recovery context.

## 3C.13 Escalation Components

The family includes Queue Item, Reason, Confirmed Facts, Uncertain Effect, Constraints, Next Safe Step, Human Decision Panel, Reconciliation Warning, Resume/Revalidation, Stale Context, Authorization Changed and E02 Restricted. The Phase 3B decision scan order remains **why automation stopped → confirmed facts → uncertain effect → constraints → next safe step → human decision**. `OUTCOME_UNKNOWN` requires reconciliation, never blind mutation replay. M12 durable Resume is **TARGET UX only**: human decision → fresh authorization/state/revision revalidation → controlled resume request. A human decision does not bypass E02 or transfer permissions.

## 3C.14 Analytics / Data Components

The family includes Analytics KPI, Period Selector, Freshness, Completeness, Historical Chart, Data Table, Valid Empty, Incomplete, Stale, Dependency Unavailable and Permission Denied. Analytics shows **observed historical ACTUAL** data only, with period, unit, source, completeness and freshness context. Unavailable or missing observations are not sales = 0; a missing interval is a visible gap/explicit unavailable treatment. Incomplete and stale are distinct. Analytics can request Forecasts but does not itself contain a predicted series.

## 3C.15 Forecast Components

The family includes Request Summary, Target, Cutoff, Horizon, Actual Series, Predicted Series, Actual vs Predicted Chart, Provenance, Limitations, Result, `MODEL_NOT_READY`, Insufficient History, Unsupported Horizon, Model Unavailable, Timeout, Incomplete History and Permission Denied. **ACTUAL** is a solid historical series; **CUTOFF** is the last observed boundary; **PREDICTED** is a dashed future series. Labels and line style reinforce color. The ready-state composition is **TARGET PRODUCT UX**, conditional on eligibility, validated execution and real provenance. Current M13 engineering truth remains `MODEL_NOT_READY`: no prediction, fake run or zero forecast is shown.

## 3C.16 Customer Web Chat Components

The separate customer family includes Customer Message, Business Reply, Composer, Clarification Request, Confirmation Request, Processing, Confirmed Result, Known Failure, Waiting Human, Confirmation Pending and Delivery Failure. Authorization uses the contextual **Confirm order** action with **Change details** secondary, not a generic “Confirm.” Known reservation failure says the order already exists and discourages placing the same order again. Confirmation Pending explains an unconfirmed result in plain language and discourages duplicate submission. Processing does not invent a required CTA. A delivery failure can coexist with a confirmed reservation; retry communication only.

Customer-visible frames avoid `ToolCall`, Agent Run, LangGraph, `OUTCOME_UNKNOWN`, M12, E02, internal confidence and technical handoff details. Staff semantics remain intact behind simpler customer wording.

## 3C.17 Accessibility

The design target is **WCAG 2.2 AA-level**, not formal conformance or certification. Use readable contrast, persistent form labels, visible keyboard focus, explanatory status/error text, non-color-only state and chart cues, legible disabled states, and reasonable action/touch sizes. The structural validator checks presence and selected text conventions; manual accessibility and interaction testing remain necessary.

## 3C.18 Localization / Responsive Resilience

Allow English, Russian and Kazakh labels to expand and wrap instead of shrinking critical typography. Staff UI is desktop-primary; Web Chat is mobile-important with narrow compositions and stacked actions. Full responsive screens, exact breakpoints, translation quality and formal localization QA are later work. Actual and Predicted remain distinguishable in grayscale or when color cannot be perceived.

## 3C.19 Usage Examples

Six approved **component-sized compositions**, not full application screens, demonstrate interoperability:

1. Order Created + Reservation Failed: two independent known facts; inspect current inventory and choose authorized recovery.
2. `OUTCOME_UNKNOWN` + Reconciliation: possible commit and missing confirmation; reconcile before mutation retry.
3. Confirmed Business Effect + Message Delivery Failed: reservation stays confirmed; retry communication, not `reserve_inventory`.
4. Actual + Cutoff + Predicted: solid observed history, explicit boundary, dashed future target UX—not a current forecast.
5. `MODEL_NOT_READY` versus TARGET Forecast: current no-prediction capability state beside a conditional target composition.
6. Customer Confirmation: narrow order summary with contextual **Confirm order** primary and **Change details** secondary.

## 3C.20 Figma Implementation

The canonical Figma file is **Diplom — Multi-Agent Platform UX/UI** (`OFXTN83nFl3RqukrEYQrFy`), page **`03C — Design System`**. The local development plugin at `design/figma-plugins/figma-phase3c-plugin/` wrote the editable Phase 3C sections to the real file; Figma MCP was not required for Phase 3C execution. The `03A — Low-Fi Wireframes` and `03B — UX Review & Revisions` baselines remained protected. A temporary duplicate of sections 11 and 12 was resolved by content-signature analysis: the approved canonical frames stayed active, and older frames were renamed as archives without deleting a section or its descendants.

## 3C.21 Final Validation

The owner-reported final local-plugin result after duplicate cleanup is **49/49 PASS**. All 17 canonical sections passed: `00 — Design Direction`, `01 — Foundations`, `02 — Color System`, `03 — Typography`, `04 — Spacing / Sizing / Layout`, `05 — Semantic States`, `06 — Core Components`, `07 — Navigation Components`, `08 — Conversation / AI Components`, `09 — Business Entity Components`, `10 — Escalation Components`, `11 — Analytics / Data Components`, `12 — Forecast Components`, `13 — Customer Web Chat Components`, `14 — Accessibility / Localization`, `15 — Usage Examples`, and `16 — Validation`. The required component checks, color variables, typography styles, spacing, radius, borders and semantic text distinctions also passed. Manual visual review occurred throughout Phase 3C. This structural result confirms presence/organization and selected semantic markers; it is **not** aesthetic, usability, localization or formal accessibility certification.

## 3C.22 Remaining Design Questions

These constraints are not Phase 3C failures: M08 live-provider/channel acceptance remains incomplete; M12 durable Resume remains TARGET-only; E02 `update_order` restriction needs business-policy resolution; M13 validated forecast artifact remains not ready; exact numeric freshness rules are backend/domain decisions. Full responsive screen behavior, formal EN/RU/KZ QA and an accessibility audit/certification remain later work. No current screen should imply that these capabilities are already live.

## 3C.23 Inputs for Phase 3D

Phase 3D is **NOT STARTED**. It will combine approved Phase 3B layouts with this approved Phase 3C Design System to create high-fidelity P0 screens for Conversations, Escalations, Orders, Customer Web Chat, Analytics and Forecasts. It must reuse the system rather than inventing a new style per screen, and must not reinterpret the six-area IA, safe flows, permission boundaries or current-vs-target capability states. No high-fidelity screen or application code was created in this documentation close-out.

## 3C.24 Phase 3C Summary

**COMPLETE:** Calm Operational SaaS direction, light-theme semantic foundations, state and component families, navigation, staff/customer language, accessibility/localization design targets, six usage compositions, manual visual review and final **49/49 structural PASS**. `03A`/`03B` remain unchanged. The remaining product/engineering and formal QA questions carry forward explicitly; Phase 3D remains **NOT STARTED**.
