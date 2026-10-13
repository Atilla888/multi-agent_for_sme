# Phase 2C — Information Architecture

## 2C.0 Scope and Inputs

This document decides the **functional information architecture (IA)** for the retail/e-commerce MVP: product areas, navigation, conceptual routes, screen relationships and contextual surfaces. It does not specify layouts, visual styling, frontend code, detailed interaction flows or a final Phase 2E screen count. Primary authority is [FINAL_MASTER_DEVELOPMENT_SAFE.pdf](../../research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), especially D01 p. 16, FR-01–FR-11 pp. 32–34, D03 p. 46, D04 p. 118, D05 p. 60, D06 p. 67, D07/V03 pp. 78–82, D09 p. 73, D10 p. 103, D11/V04 pp. 110–114, frontend register/behavior pp. 115–116, and implementation evidence pp. 301–303. Page numbers are physical PDF pages. The [Phase 2B validation](PHASE_2B_UX_VALIDATION.md) supplies the 39-row actor/use-case mapping, fifteen-family screen register, semantic states and overlap analysis. [Competitor research](UX_COMPETITOR_ANALYSIS.md) supplies secondary interaction references only; it cannot override the master or Phase 2B.

**Status boundary:** this IA is a Phase 2C design decision for subsequent detailed-flow testing, **not** evidence of a working frontend or approved visual design. M01–M07 passed scoped engineering gates (M04 with E02 `update_order` mutation denial); M08 is partial/blocked; M09–M13, durable M12 resume, trained M13 forecast artifact, working frontend, and live channel integrations are not evidenced. Pilot/Final/Phase 5B have not run. `MODEL_NOT_READY` is a real current forecast contract result; no predicted view may fabricate data. The routes below are conceptual product locations and do not grant permissions or freeze Next.js file syntax. Backend authorization remains decisive.

**Decision convention:** “top-level” means a role-visible primary product area, not a universal menu shown to every role. “Nested” means one level within that area. A route may be deep-linked without a primary-nav link. The master screen register is authoritative for *capability coverage*, while Phase 2C chooses how to present it; the older seven-surface research proposal is not the governing inventory. Phase 2D will validate detailed flow sequences, and Phase 2E will finalize route/screen contracts.

## 2C.1 Information Architecture Principles

1. **Organize by user task, not architecture layer.** People seek a conversation, order, stock fact, document or forecast—not L3, LangGraph, a ContextBundle or Tool Executor. Internal components appear only through relevant results and status.
2. **Keep the live case as an anchor.** A move from a conversation to a customer, order, agent run or escalation must preserve the business scope, case reference and a safe return path. Contextual summaries should link to authoritative detail rather than duplicate whole records.
3. **Make AI legible without making the product a debugger.** Show responsible Sales/Support/Analytics role, handoff, proposal/result and escalation near the task; reserve full run chronology and audit for permissioned drill-down.
4. **Separate business truth from execution evidence.** An Order is a domain entity; ToolCall is an attempt; Audit is a durable record. `create_order` success does not imply `reserve_inventory` success. Neither proposal nor message delivery confirms a business effect.
5. **Preserve semantic differences.** Actual report vs forecast; valid empty vs outage; known failure vs `OUTCOME_UNKNOWN`; human-waiting vs completed; provider delivery failure vs business write failure must remain distinct across locations.
6. **Be role-aware but never rely on hiding links for security.** Owner, Operator and Administrator have different task maps. A role-visible route still requires backend scope, resource and state checks; Administrator is not automatically Owner of every tenant.
7. **Keep the MVP shallow and searchable.** Six coherent staff product areas, generally area → list/workspace → detail. Avoid a general CRM pipeline, agent marketplace, workflow builder or architecture-control menu without an accepted MVP use case.
8. **Keep customer and staff contexts separate.** Native messaging clients and Web Chat are customer-channel surfaces; they are not reduced versions of the staff dashboard.

## 2C.2 User Contexts

| UX context | Actor and primary job | Entry/relationship to other contexts | Boundary |
| --- | --- | --- | --- |
| **Customer channel experience** | Customer asks, clarifies, confirms and receives truthful outcome through Instagram, WhatsApp, Telegram or Web Chat. | A received message creates/continues a scoped Conversation for staff; Web Chat is a separate frontend surface. | No staff navigation, raw run trace, private cross-customer records or admin controls. Channel Provider is an external system actor, not a dashboard user. |
| **Business/operations dashboard** | Operator manages conversations/escalations and authorized records; Owner views authorized overview, business records, knowledge and analytics. | Shared business scope and permissioned deep links join Conversation ↔ Customer/Order/Product/Inventory. | Owner and Operator need not see the same area or data. Backend controls all access. |
| **Administration** | Platform Administrator, or explicitly authorized Owner, manages connection/access/application configuration. | Settings/Integrations and restricted audit/trace links connect to affected cases when permitted. | Admin does not automatically inherit Owner business-data rights; secrets are not returned to browser. |
| **Technical/trace views** | Authorized Operator investigates a linked case; Admin/ops investigates runs, effects and security events. | Agent Runs, Audit and operation refs are reached mainly from a case or restricted admin utility index. | No raw hidden reasoning, credentials or broad PII; research mode switching is not normal production navigation. |

Contexts overlap through **references**, not a single universal screen. A Customer sees a concise status in the channel; an Operator sees more case context; an Administrator may inspect redacted technical evidence only with appropriate scope. D03 (master p. 46) keeps receipt, processing, business effect and outbound delivery distinct across those views.

## 2C.3 Screen-Family Classification

The table classifies **all fifteen** master frontend families. “Recommended presentation” names the default discovery pattern; individual families can also have linked detail routes or contextual summaries specified later. The UI label may differ from the master technical family while preserving its capability.

| Screen Family | Primary Actor | Product Role | IA Classification | Recommended Presentation | Reason |
| --- | --- | --- | --- | --- | --- |
| Authentication | Staff users | Establish session and business scope | AUTHENTICATION | DETAIL ROUTE | Entry/reauthentication, outside primary product navigation (FR-01). |
| Overview | Owner; Operator if authorized | Scoped orientation, not exhaustive reporting | PRIMARY WORKSPACE | TOP-LEVEL NAVIGATION | Owner's fast answer to “what needs attention?”; links to task destinations. |
| Conversations | Operator | Customer-work operating center | PRIMARY WORKSPACE | TOP-LEVEL NAVIGATION | Frequent triage, reply, AI/human ownership and case status (FR-04/08/10). |
| Customers | Operator; authorized Owner | Identity and customer record | SECONDARY WORKSPACE | NESTED NAVIGATION | Business record list/detail; preview from conversation is contextual only. |
| Orders | Operator; authorized Owner | Authoritative order and reservation status | SECONDARY WORKSPACE | NESTED NAVIGATION | Distinct domain record with its own list/detail and partial-effect state. |
| Products | Operator; authorized Owner | Catalog facts | SECONDARY WORKSPACE | NESTED NAVIGATION | Business record list/detail linked to stock; not a new agent. |
| Inventory | Operator; authorized Owner | Observed stock and reservation evidence | SECONDARY WORKSPACE | NESTED NAVIGATION | Separate authoritative stock view, tied to product but not collapsed into catalog. |
| Analytics | Owner; explicitly authorized staff | Observed business reports | PRIMARY WORKSPACE | TOP-LEVEL NAVIGATION | Owner goal requires direct findability; actual measures are distinct from predictions. |
| Forecasts | Owner | Predicted outcomes and limitations | SECONDARY WORKSPACE | NESTED NAVIGATION | Dedicated deep-linkable view **within Analytics**, not a second top-level item. |
| Documents | Authorized Owner/Admin | Manage published business knowledge | PRIMARY WORKSPACE | TOP-LEVEL NAVIGATION | UI label **Knowledge**; distinct source-lifecycle work, not the entire Business Brain. |
| Agent Runs | Operator via case; Admin/ops via index | Execution lifecycle and handoff trace | OPERATIONS / TRACE | NESTED NAVIGATION | Restricted admin utility index; case links go directly to run detail. Not a main Operator item. |
| Escalations | Assigned Operator | Prioritize human work and decide/resume | SECONDARY WORKSPACE | NESTED NAVIGATION | Dedicated queue nested under Conversations; detail links back to case. |
| Settings | Administrator; Owner only if granted | Effective access/approved app settings | ADMINISTRATION | NESTED NAVIGATION | Infrequent and permissioned; not business records. |
| Integrations | Administrator; Owner only if granted | Channel connection status/configuration | ADMINISTRATION | NESTED NAVIGATION | External provider configuration, separate from case-level delivery. |
| Audit | Administrator/ops; linked Operator events if granted | Durable effect/security evidence | OPERATIONS / TRACE | NESTED NAVIGATION | Restricted Administration utility, not interchangeable with Agent Runs. |

Customer Web Chat is an **additional channel surface**, not a sixteenth master staff screen family. System-only concepts do not acquire rows merely because they exist in D02/D06/D07.

## 2C.4 Product Area Grouping

The working hypothesis in the brief was tested against Phase 2B tasks and the master rather than adopted wholesale:

| Candidate grouping | Decision | Reason |
| --- | --- | --- |
| **Overview** | Keep as role-scoped top-level area. | Owner orientation and task links differ from deep report analysis; Operator variant is a work summary only if authorized. |
| **Conversations + Escalations** | Keep one top-level Conversations area with a distinct nested escalation queue. | Escalation is a specialized human-work state of a case; a separate top-level “AI Operations” would hide it from frequent Operator work. |
| **Business: Customers, Orders, Products, Inventory** | Keep one top-level Business area with four nested record destinations. | Shared retail entity context; individual authoritative detail screens remain distinct. “Business” is broad but the four concrete children immediately define it. |
| **Documents/Knowledge** | Keep one top-level Knowledge area; technical family remains Documents. | Publication/version/ACL work is distinct from transactional records and from platform settings. The label refers only to managed sources, not all seven Brain parts. |
| **Analytics + Forecasts** | Keep one top-level Analytics area with separate actual-report and forecast routes. | Owner goal is coherent; predicted values need their own semantics and `MODEL_NOT_READY` state, not a competing primary area. |
| **Settings + Integrations + Audit; restricted Agent Runs index** | Keep one role-scoped Administration area. | Technical/connection/access tasks are lower frequency and restricted. Agent Runs remains contextually reachable from a case; Audit remains separate evidence. |

**Why not “AI Operations” at top level?** The Operator's job is a conversation or escalation, not operating a model framework. Agent state belongs near the case; detailed runs are a drill-down. **Why not merge Knowledge into Business?** That would save one primary link but bury a source-publication workflow whose audience and lifecycle differ from records; it risks treating a document as an order fact. **Why not make every master family top-level?** Fifteen primary items would obscure daily work. The six selected areas are the smallest set found that keeps the knowledge workflow discoverable without turning internal architecture into navigation.

## 2C.5 Primary Navigation Proposal

**Version A — recommended Phase 2C MVP IA:** six role-visible staff product areas. This is the chosen navigation architecture for Phase 2D/2E validation, not a claim of user-tested usability or implementation.

| Top-level area / UI label | Primary user | Expected frequency | Contains | Why top-level |
| --- | --- | --- | --- | --- |
| **Overview** | Owner; optional Operator work summary | Daily/orientation | Scoped signals and deep links, not full reports | Quick starting point for owner questions; no need to hunt through records. |
| **Conversations** | Operator | Continuous/daily | Inbox/workspace, nested Escalations queue, case-linked activity | Central customer operation and human ownership task. |
| **Business** | Operator; authorized Owner | Daily/as needed | Customers, Orders, Products, Inventory | Four related authoritative retail records under one understandable heading. |
| **Knowledge** | Authorized Owner/Admin | Event-driven | Documents/source versions, publication/revocation | Distinct business-knowledge maintenance; not a “Business Brain” console. |
| **Analytics** | Owner | Daily/weekly | Actual reports and nested Forecasts | Direct owner value; actual/predicted are separately labelled within one area. |
| **Administration** | Platform Administrator; authorized Owner subset | Setup/incident-driven | Integrations, Settings, Audit, restricted Run index | Keeps technical controls and evidence away from normal Operator navigation. |

The primary set is **role-filtered**: an Operator may see mainly Overview (if useful), Conversations and Business; an Administrator may see only Administration and expressly granted areas. Authentication and Customer Web Chat sit outside this navigation. In a real unresolved trade-off, a five-area alternative could nest Knowledge under Business; it is **not selected** because source publication deserves discoverability and must not appear to be the same kind of authoritative record as an Order. No cosmetic variants are proposed.

## 2C.6 Route Hierarchy

Conceptual route names below aid traceability. They do not prescribe a Next.js filesystem, URL ID format or authorization policy. “Direct?” distinguishes primary/nested discovery from contextual deep-linking. Page depth is generally area → list/workspace → detail. The static escalation path must be distinguished from a conversation ID in any future router.

| Conceptual route | Purpose | Main actor | Parent/area | Master family | Direct navigation expected? |
| --- | --- | --- | --- | --- | --- |
| `/auth` | Staff sign-in/reauth/scope entry (possibly IdP-hosted) | Staff | Outside staff areas | Authentication | Entry only; no sidebar. |
| `/overview` | Role-scoped orientation | Owner; optional Operator | Overview | Overview | Yes, if role-visible. |
| `/conversations` | Queue and customer-work workspace | Operator | Conversations | Conversations | Yes. |
| `/conversations/:conversationId` | One dialogue and linked context | Operator | Conversations | Conversations | Yes from queue/deep link; not a separate nav item. |
| `/conversations/escalations` | Prioritized human-work queue; includes reconciliation filter | Operator | Conversations | Escalations | Yes, nested. |
| `/conversations/escalations/:escalationId` | Decision/assignment/resume detail | Assigned Operator | Conversations → Escalations | Escalations | From queue/case/deep link. |
| `/business/customers` | Customer list/search | Authorized Operator/Owner | Business | Customers | Yes, nested. |
| `/business/customers/:customerId` | Customer identity/relationships | Authorized Operator/Owner | Business → Customers | Customers | From list/case/order. |
| `/business/orders` | Order list/search | Authorized Operator/Owner | Business | Orders | Yes, nested. |
| `/business/orders/:orderId` | Authoritative order + separate reservation status | Authorized Operator/Owner | Business → Orders | Orders | From list/case/customer. |
| `/business/products` | Catalog list/search | Authorized Operator/Owner | Business | Products | Yes, nested. |
| `/business/products/:productId` | Product/variant facts | Authorized Operator/Owner | Business → Products | Products | From list/case/order. |
| `/business/inventory` | Stock list/search or scoped availability | Authorized Operator/Owner | Business | Inventory | Yes, nested. |
| `/business/inventory/:recordId` | Stock/version/hold evidence for an item | Authorized Operator/Owner | Business → Inventory | Inventory | From list/product/case/order; conceptual ID only. |
| `/knowledge` | Document/knowledge-source list | Authorized Owner/Admin | Knowledge | Documents | Yes, if role-visible. |
| `/knowledge/:documentId` | Source, versions, ACL, publication history | Authorized Owner/Admin | Knowledge → source | Documents | From list/evidence link. |
| `/analytics` | Actual business reports | Owner | Analytics | Analytics | Yes. |
| `/analytics/forecasts` | Forecast requests/results or `MODEL_NOT_READY` | Owner | Analytics → Forecasts | Forecasts | Yes, nested. |
| `/analytics/forecasts/:forecastRunId` | One valid ForecastRun and provenance, if it exists | Owner | Analytics → Forecasts | Forecasts | From forecast list/result only. |
| `/agent-runs` | Restricted run index/filter | Admin/ops | Administration utility | Agent Runs | Nested admin utility only; not Operator primary nav. |
| `/agent-runs/:runId` | One lifecycle, tools and handoffs | Authorized Operator/Admin | Linked case or admin utility | Agent Runs | Contextual link/direct authorized deep link. |
| `/admin/integrations` | External channel connection status | Admin; authorized Owner | Administration | Integrations | Yes, nested. |
| `/admin/settings` | Approved access/application settings | Admin; authorized Owner subset | Administration | Settings | Yes, nested. |
| `/admin/audit` | Restricted durable event index | Admin/ops | Administration | Audit | Yes, nested. |
| `/admin/audit/:eventId` | Redacted audit-event detail | Admin/ops; linked Operator if explicitly granted | Administration → Audit | Audit | From index/linked event; permission-scoped. |
| `/chat` *(separate customer surface)* | Customer Web Chat conversation | Customer | Customer channel, **not staff app** | Additional channel surface | Via business site/widget/session, not staff nav. |

A permissioned link to a route is never proof that its record is accessible. If an IdP or host assigns different physical paths, preserve these **relationships** rather than literal spelling. Long-lived links should encode or resolve business scope on the trusted backend; client-supplied tenant IDs cannot authorize access.

## 2C.7 Role-Based Navigation

The following are **default presentation policies**, subject to exact backend grants. `Visible` means discoverable in that role's normal workflow; `Conditional` requires explicit membership/capability; `Contextual` means reachable from a permitted case but absent from primary nav. All routes still need server-side authorization, and a foreign record should not be revealed by an access-denied page.

**Business Owner**

| Area/surface | Default IA visibility | Reason / boundary |
| --- | --- | --- |
| Overview, Analytics → Forecasts | Visible | Owner orientation, actuals and predicted results. |
| Business records | Conditional | Only owned/authorized business data; not arbitrary cross-tenant records. |
| Knowledge | Conditional/typically visible for authorized publisher | Source management per D09; publication requires current policy/version. |
| Conversations → Escalations | Conditional | Owner is not automatically an assigned Operator. |
| Administration → Integrations/Settings | Conditional | Only tenant-approved configuration; platform administration is separate. |
| Agent Runs / Audit | Contextual or absent | No default technical-console access; only expressly granted evidence. |

**Human Operator**

| Area/surface | Default IA visibility | Reason / boundary |
| --- | --- | --- |
| Conversations → Escalations | Visible | Primary queue, case work, assigned human decisions. |
| Business → Customers/Orders/Products/Inventory | Visible where work assignment grants scope | Authorized facts for service; protected record access still checked. |
| Overview | Conditional | A workload summary may help, but must not expose Owner-only sales measures. |
| Knowledge | Contextual read-only evidence; management conditional | Policy source can be cited without publication rights. |
| Analytics → Forecasts | Absent unless explicitly granted | Owner aggregates/predictions are not inherent Operator permissions. |
| Agent Runs | Contextual detail from a permitted case | Show reason/status/attempts, not general cross-business run index. |
| Administration/Audit | Absent; linked audit event only if granted | Operator cannot manage platform or browse unrestricted security logs. |

**Platform Administrator**

| Area/surface | Default IA visibility | Reason / boundary |
| --- | --- | --- |
| Administration → Integrations/Settings/Audit | Visible within assigned platform scope | Connection/access/evidence tasks; browser sees no secrets. |
| Agent Runs index/detail | Conditional restricted utility | Technical investigation where assigned, redacted by scope. |
| Knowledge | Conditional | Only if explicitly delegated source administration. |
| Overview, Conversations, Business, Analytics | Absent unless separate business role granted | Admin is **not** automatically Owner/Operator of every tenant (master p. 106). |

Customer has **no staff navigation**; Channel Provider has **no human UI**. Authentication is an entry/reauth surface for staff, not a product area. If a person holds multiple authorized roles, navigation may combine permitted destinations **within the active business scope**, not union privileges across unrelated businesses. Switching businesses clears prior-scope data and subscriptions before new data renders (master p. 115).

## 2C.8 Conversations / Escalations Boundary

**Decision: hybrid within one primary area.** Conversations is the live customer-work area. Escalations is a **dedicated, nested queue and detail route** under Conversations, not merely a transient filter and not a second top-level “AI Operations” area. A conversation may have no escalation; an escalation always links to the affected conversation/run or controlled operational context. The queue supports assignment and prioritization; detail supports reason, verified facts, completed/unknown effects, allowed decision, revision-aware resume and closure. The conversation retains a concise “waiting human / assigned / reconciling” status plus a deep link; it does not duplicate the entire decision form.

Why a distinct nested queue: an Operator must find waiting cases even when no specific conversation is open, and an unassigned case must not disappear inside a thread. Why keep it under Conversations: the task originates in customer work; the Operator needs immediate return to dialogue and customer/order context. D11 (master p. 111) governs the safe decision/resume semantics, while M12 remains design-only. `OUTCOME_UNKNOWN` cases appear as **reconciliation-needed** in this queue or linked case status, with operation reference and safe pending state. No standalone top-level Reconciliation area is justified in the MVP.

## 2C.9 Agent Runs / Audit Boundary

**Agent Runs = execution lifecycle.** It answers who/what handled one request: active/previous specialist, handoff, tool proposals/results, evidence references, waiting/terminal state and bounded operational metadata. An Operator usually opens a permitted run **from a Conversation or Escalation**; the Administrator/ops may have a restricted run index. No raw hidden chain-of-thought is shown.

**Audit = durable evidence.** It answers what consequential effect or security decision was recorded: actor, time, resource, operation/event reference, result and redacted reason. Audit belongs as a restricted **Administration** destination and may be deep-linked from a run or order when role grants permit. A ToolCall attempt does not become an Order; a run trace does not substitute for a committed audit/domain event. The two families remain separate routes with cross-links, not merged into an “AI Activity” page. Owner has neither direct technical area by default; Operator gets linked run detail and only specifically granted audit events. This matches FR-03/07 and master pp. 32, 110–112.

## 2C.10 Analytics / Forecasts Boundary

**Decision: both routes under one top-level Analytics area.** `/analytics` shows **actual** historical business measures with definition, period, completeness and freshness. `/analytics/forecasts` is a distinct nested destination for **predicted** values, target, cutoff, horizon, model/data provenance and `MODEL_NOT_READY`/insufficient-history cases. A valid ForecastRun may have a detail route; no phantom detail link appears when M13 artifact is absent. Overview may link to a report or forecast availability but must not reproduce every metric or blur observed and predicted values. This keeps the Owner's insight tasks together without turning “Forecasts” into a redundant top-level area (D10 p. 103; frontend pp. 115–116).

## 2C.11 Business Brain Representation

Business Brain is the seven-part scoped context system in D06 (master p. 67), **not** the Documents area or a vector database. Its parts appear where they help the current task, with permission and provenance.

| Business Brain Part | Primary UX Representation | Secondary Representation |
| --- | --- | --- |
| Request | Current customer request/clarification in Conversation or customer channel | Agent Run event summary when authorized. |
| Conversation | Dialogue history and ownership in Conversations | Escalation context packet; derived summary labelled as such. |
| Structured facts | Authoritative Customers, Orders, Products, Inventory, Analytics | Permission-scoped case summary with source/version/freshness. |
| Retrieved knowledge | Published source/version in Knowledge (technical Documents) | Cited policy/FAQ evidence in Conversation, Agent Run or Escalation. |
| Runtime state | Agent Runs lifecycle and Conversations status | Escalation decision/pending operation detail. |
| Rules | Relevant restriction/reason beside an action or denial | Authorized Settings/domain-policy view only if a configuration function exists. |
| Permissions | Effective access in Authentication/Settings and guarded actions | Contextual denial/explanation without foreign-resource leakage. |

**Decision:** no top-level “Business Brain” navigation item and no default giant Brain page. A shared context abstraction does not mean all seven categories must be displayed simultaneously. The top-level **Knowledge** label refers narrowly to managed documents/policies/FAQ, not to the whole Brain. Operational Order/Inventory truth remains in structured business data; RAG text cannot authorize a write. This preserves both discoverability and authority boundaries.

## 2C.12 Customer Channel Information Architecture

Customer interaction is a **separate channel context**. Native Instagram/WhatsApp/Telegram clients provide their own conversation shell; the platform controls the content and truthful status of messages within provider constraints. Web Chat is a separate customer frontend surface (`/chat` conceptually), not a staff-dashboard screen or sidebar destination. Its minimal structure is one scoped conversation/thread, message composer, clarification/confirmation step, and result/pending/escalation states. It needs no product-area navigation, customer CRM, raw tool trace or settings console.

A channel message is linked server-side to a staff Conversation and, when needed, an Agent Run/Order/Escalation. The customer sees only permitted product/order facts, an explicit distinction between confirmed order and confirmed reservation, and truthful pending status. The Operator sees the richer case context; a Channel Provider remains an external integration actor. D03 (p. 46) separates event receipt, processing, business effect and outbound delivery. A failed reply delivery must be visible to staff without rerunning a committed order action. Web Chat session identity is not a Keycloak staff login, and an order ID or phone number alone is not proof of ownership (master p. 106).

## 2C.13 Detail Views, Tabs, Panels and Drawers

**General rule:** a dedicated detail route supports a full, directly linkable, permission-scoped record or decision; a contextual panel/drawer gives a short preview without forcing the user to abandon a live case. The preview links to the authoritative detail and must show its freshness. A tab separates related views within one entity or area; an inline event/status explains a local transition. A modal is reserved for a bounded confirmation/decision, not a replacement for an entire workflow. These are container classifications, **not layouts or visual styling**.

| Entity / activity | List or workspace | Detail route | Contextual representation | Decision rationale |
| --- | --- | --- | --- | --- |
| Customer | Business → Customers list | `/business/customers/:customerId` | Scoped identity/order summary panel from Conversation | Full relationship and verification history need depth; operator sees only relevant facts in the case. |
| Order | Business → Orders list | `/business/orders/:orderId` | Order summary/operation status from Conversation or Customer | Order and reservation are distinct trusted effects; detail is authoritative, preview remains concise. |
| Product | Business → Products list | `/business/products/:productId` | Product/variant summary from Conversation or Order | Catalog detail is reusable; avoid copying product records into every thread. |
| Inventory | Business → Inventory list | `/business/inventory/:recordId` if accepted data contract supports it | Freshness/availability inline from Product/Order/Conversation | Stock has separate authority/version; a detail route must not imply available quantity is a reservation. |
| Conversation | Conversations queue/workspace | `/conversations/:conversationId` | Status/owner summary in Escalation, Customer or Order | It is the operational anchor; a full case is more than a preview. |
| Agent Run | Restricted utility index for Admin/ops | `/agent-runs/:runId` | Current role and key event inline in Conversation; trace preview drawer as needed | Lifecycle detail is permissioned drill-down, not primary Operator navigation. |
| Escalation | Nested queue in Conversations | `/conversations/escalations/:escalationId` | Waiting/assigned/reconciling inline on Conversation | Decision and safe resume need full context; queue enables prioritization. |
| Forecast Run | Nested Forecasts list/results | `/analytics/forecasts/:forecastRunId` only for a real run | Availability/summary from Analytics/Overview | Provenance and horizon deserve deep link; `MODEL_NOT_READY` is an area state, not a fake run. |
| Document | Knowledge source list | `/knowledge/:documentId` | Source/version reference drawer from evidence | Publication/version/ACL management belongs in detail, while a cited source can be inspected without losing the case. |

**Tabs and bounded overlays.** Analytics may use actual-report versus Forecasts nested destinations with clear labels, not a single blended chart. An Order detail may separate state/history/reservation evidence in tabs **only if Phase 2D finds it helps**; all remain under one authoritative order. A Document detail may use versions/publication history tabs. A ToolResult or evidence citation can open a read-only drawer/inspect view from Conversation, Agent Run or Order. A short customer/order preview can be a panel; opening full detail uses a route. A purchase confirmation may use a modal or channel confirmation step; it must show the intended item/quantity/version and cannot silently execute a write. An escalation decision must be made from its full detail context; a final confirmation modal may guard the consequential submit, but a detached modal alone is insufficient. Handoff and tool events are inline in the case/run chronology with detail on demand. `OUTCOME_UNKNOWN` is an inline pending state and detail drawer linked to Escalation/Order/Agent Run, **not** a one-click retry dialog.

**Overview boundary.** Overview answers “what needs my attention?” and “where do I go next?” using only authorized, defined summaries and links. The Owner may see scoped actual-business summaries and forecast availability; the Operator, if given Overview, sees workload/assigned cases rather than Owner-only revenue. Detailed reports stay in Analytics, decisions in Escalations, records in Business. Administrator lands in Administration rather than inheriting an Owner dashboard. No all-in-one metric wall is specified.

**Settings vs Integrations.** Integrations covers external channel/system connection state, LIVE/MOCK/SANDBOX status, and safe provider diagnostics; it does not show credentials to the browser. Settings covers effective access and specifically approved business/application configuration; it is not a generic place to invent editable agent policies. Audit is durable evidence, not configuration. These three are adjacent under Administration for the appropriate role, but each retains its own contract. Knowledge publication is not buried there because it is business-source maintenance, and an Admin needs explicit delegation to edit it.

## 2C.14 Cross-Navigation and Context Preservation

Deep links carry **references to authorized facts**, not copied records or authority. The destination refetches current server-scoped state and may deny access. The source keeps a return path where useful; a stale or changed record must not be presented as if it were the preview the user just saw.

| From | To | Why / carried context | Return behavior |
| --- | --- | --- | --- |
| Conversation | Customer detail | Verify identity and relationships; carry case ref | Return to same thread/queue and draft. |
| Conversation | Order detail | Inspect actual order, separate hold state and operation refs | Return to case; refresh status on return. |
| Conversation | Product/Inventory | Verify item/stock and observed time | Return to case with selected product ref. |
| Conversation | Agent Run | Inspect active/previous specialist and trusted tool sequence | Return to same case position. |
| Conversation | Escalation detail | Make/inspect human decision for this case | Return to thread with updated owner/state. |
| Escalation detail | Conversation | Read full dialogue without losing decision context | Return to assigned case/queue filter. |
| Escalation detail | Agent Run / Order | Check prior attempts, committed or unknown effects | Return to decision; require fresh revision before submit. |
| Agent Run | Conversation | Restore customer context behind execution | Return to run event position when permitted. |
| Agent Run | Audit event / ToolResult detail | Verify effect/security decision by ref | Return to run chronology; no raw hidden reasoning. |
| Order | Customer / Product / Inventory | Inspect related authoritative entity | Return to order/version and refresh if changed. |
| Order | Conversation / Agent Run | Explain how this order/hold arose | Return to order, with current effect status. |
| Forecasts | Actual report / ForecastRun | Compare observed source with prediction provenance | Return to target/horizon selection; no blending of series. |
| Knowledge evidence | Document/version | Verify cited policy source/publication | Return to citing case/run; revoked source stays marked. |
| Integrations | Affected Conversation, if authorized | Diagnose case-specific delivery versus channel health | Return to provider health without replaying business action. |

**Preserved within one business:** active business label/scope, queue and filters, selected conversation, unsent draft, originating entity and return destination should survive ordinary same-scope navigation where safe. A deep link opened in a new session must still revalidate rights and data freshness. A draft is local client state, not a confirmed outbound message; explicit unsent status prevents false delivery claims. An Escalation decision form must reload its current revision after returning from another route.

**Business/tenant switch:** show the active business context in the staff shell and on consequential detail/decision surfaces. Switching scope must clear prior-tenant fetched data, subscriptions, selection and sensitive previews **before** showing the new business (master p. 115). An unsent draft should prompt a save/discard/cancel choice or remain isolated to its original scope; it must never be carried into another tenant's composer. Return links and stored filters are scoped to their business and cannot grant access by URL alone. The exact selector placement is deferred to later design; no elaborate multi-tenant switcher is invented here.

## 2C.15 Route and Surface Matrix

This is the main Phase 2C coverage table. It contains **all fifteen master screen families** plus the separate customer Web Chat surface. “Frequency” is a task-based expectation, **not measured usage**; later UX validation can revise it. Route spelling is conceptual. Phase 2B references point to [screen-family validation](PHASE_2B_UX_VALIDATION.md#2b3-screen-register-validation) and [flow/overlap analysis](PHASE_2B_UX_VALIDATION.md#2b12-end-to-end-flow-validation).

| Product Area | Screen / Surface | Presentation Type | Primary Actor | Parent | Entry Point | Contextual Links | Frequency | Phase 2B Justification |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Outside staff nav | Authentication | Entry/detail route | Staff | Session/IdP | Sign-in, expiry, protected deep link | Return to authorized destination after reauth; no write replay | Session-driven | FR-01 and business scope; §2B.3. |
| Overview | Overview | Top-level role-scoped route | Owner; optional Operator | Staff shell | Primary nav/landing | Analytics, Conversations/Escalations, Business records | Daily orientation | Defined measures or workload, not full data wall; §2B.3. |
| Conversations | Conversations | Top-level queue + detail route | Operator | Staff shell | Primary nav/assigned case | Customer, Order, Product/Inventory, Run, Escalation | Continuous | Customer processing and ownership; §2B.3/2B.4. |
| Conversations | Escalations | Nested queue + detail route | Assigned Operator | Conversations | Nested nav, case status/deep link | Conversation, Agent Run, Order, Audit event if granted | Event-driven/urgent | Durable human decision/resume; §2B.3/2B.6. |
| Business | Customers | Nested list + detail route; case panel | Authorized Operator/Owner | Business | Nested nav or Conversation link | Conversations, Orders | Daily/as needed | Protected identity and relationships; §2B.3. |
| Business | Orders | Nested list + detail route; case summary | Authorized Operator/Owner | Business | Nested nav or case/customer link | Customer, Product, Inventory, Agent Run | Daily/as needed | Order and reservation are separate effects; §2B.3/2B.12. |
| Business | Products | Nested list + detail route; case summary | Authorized Operator/Owner | Business | Nested nav or inquiry/order link | Inventory, Orders | Daily/as needed | Catalog facts and ambiguous matches; §2B.3. |
| Business | Inventory | Nested list/detail; freshness status in context | Authorized Operator/Owner | Business | Nested nav or Product/case link | Product, Order, Conversation | Daily/as needed | Availability ≠ reservation; §2B.3/2B.12. |
| Knowledge | Documents *(UI label: Knowledge sources)* | Top-level area → source list/detail | Authorized Owner/Admin | Knowledge | Primary nav if granted; evidence link | Cited Conversation/Run, source version | Event-driven | Publication/ACL/version lifecycle; §2B.3/2B.12. |
| Analytics | Analytics | Top-level actual-report route | Owner | Staff shell | Primary nav/Overview link | Forecasts, source report/provenance | Daily/weekly | Actual measure, period/completeness; §2B.3/2B.5. |
| Analytics | Forecasts | Nested route + valid run detail | Owner | Analytics | Nested nav or report link | Actual report, ForecastRun | Periodic | Predicted ≠ actual; `MODEL_NOT_READY`; §2B.3/2B.5. |
| Administration utility | Agent Runs | Restricted index + contextual detail route | Admin/ops; linked Operator | Administration utility or case | Admin nested utility; case deep link | Conversation, Escalation, ToolResult, Audit event | Incident/case-driven | Lifecycle/handoff/attempt trace; §2B.3/2B.8. |
| Administration | Settings | Nested route | Admin; authorized Owner subset | Administration | Nested nav | Effective scope, Integrations/Audit as permitted | Setup/event-driven | Approved access/config only; §2B.3/2B.7. |
| Administration | Integrations | Nested route | Admin; authorized Owner subset | Administration | Nested nav | Affected case/delivery status if authorized | Setup/incident-driven | Provider state, not per-case effect; §2B.3/2B.7. |
| Administration | Audit | Restricted nested index/detail route | Admin/ops; linked Operator event if granted | Administration | Nested nav or event deep link | Agent Run, Order, Escalation | Incident/review-driven | Durable action/security evidence; §2B.3/2B.14. |
| **Separate customer context** | **Web Chat** *(not a master staff family)* | Customer conversation surface | Customer | Business site/channel | Widget/session, not staff nav | Server-linked staff Conversation only | Per customer request | Phase 2B identified channel UI gap; §2B.4/2B.14. |

`OUTCOME_UNKNOWN`/reconciliation is intentionally **not a seventeenth product area**: it is a state/filter in Escalations, an effect status in Order/Conversation and an evidence event in Agent Runs/Audit. Research architecture mode switching likewise has no normal production route; FR-11 belongs to controlled runner/ops tooling outside the MVP staff menu.

## 2C.16 Minimal MVP IA

This is the selected **six-area staff IA**, not a wireframe or a promise that all areas appear for every role. Nested routes and contextual detail preserve the fifteen master families without fifteen top-level links.

```text
Staff application (active business scope; role-filtered)
├── Overview
├── Conversations
│   ├── Conversation queue → Conversation detail
│   └── Escalations queue → Escalation detail (incl. reconciliation-needed)
├── Business
│   ├── Customers → Customer detail
│   ├── Orders → Order detail (separate reservation effect)
│   ├── Products → Product detail
│   └── Inventory → Stock/hold detail or scoped view
├── Knowledge (technical family: Documents)
│   └── Knowledge sources → Document/version detail
├── Analytics
│   ├── Actual reports
│   └── Forecasts → ForecastRun detail if one exists
└── Administration (only if granted)
    ├── Integrations
    ├── Settings
    ├── Audit → Audit event detail
    └── Agent Runs index (restricted utility)

Contextual, not primary navigation: Agent Run detail; ToolResult/evidence drawer;
case-linked Customer/Order/Product previews; handoff, pending and delivery events.
Outside staff IA: Authentication entry/reauthentication.

Customer channel context
├── Instagram / WhatsApp / Telegram: native provider conversation
└── Web Chat: scoped thread, clarification/confirmation, result/pending state
```

No separate Orchestrator, LangGraph, Tool Executor, Business Brain, Redis, pgvector, MinIO, PrincipalContext, ContextBundle or research-mode item is added to primary navigation. The six areas are a product organization decision, not additional architectural layers.

## 2C.17 Future Expansion Boundary

Future capabilities can attach to existing areas **only after separate product decisions**: more channels under Integrations and Conversations; new permitted retail records under Business; additional published source types under Knowledge; validated additional reports/models under Analytics; additional specialist roles surfaced in case/run status without automatically creating an agent marketplace; new technical evidence under restricted Administration. Payments, recommendations, anomaly analytics, full CRM pipelines, workflow builders and new agents are **not** added to the MVP navigation by this extensibility note. A new top-level area would require a distinct user goal and frequency that cannot be served by existing groups.

## 2C.18 Inputs for Phase 2D

Phase 2D should test these detailed **user flows** against the chosen routes and contextual links. This list names entry/main/likely terminal surfaces but does **not** diagram the flows or decide final component behavior.

| Flow to detail in Phase 2D | Entry surface | Main screens / contextual surfaces | Likely terminal surface/state |
| --- | --- | --- | --- |
| Product availability | Customer channel/Web Chat; staff Conversations | Conversation, Product/Inventory summaries and linked detail | Grounded channel reply or clarification/unavailable state. |
| Purchase + reservation | Customer channel/Web Chat | Conversation, product/stock, Order detail, separate tool-result refs | Confirmed order **and** hold; or partial/unknown state with safe follow-up. |
| Order support | Channel → Conversations | Customer/Order context, policy evidence | Grounded reply or Escalation. |
| Delivery status | Channel → Conversations | Order context, delivery-source status | Known delivery answer or source-unavailable/pending state. |
| Support → Sales handoff | Conversation | Handoff event, Agent Run detail, Order/Inventory context | Sales-permitted result or E02-denied Escalation. |
| Human escalation / safe resume | Conversations → Escalations queue | Escalation detail, Conversation, Run/Order/unknown-effect evidence | Authorized resumed case, closed case, or waiting/reconciling state. |
| Owner sales analytics | Overview/Analytics | Actual report, source/completeness | Defined actual result or valid empty/dependency failure. |
| Forecast request | Analytics → Forecasts | Forecast request/result, actual source, ForecastRun if real | Qualified forecast or `MODEL_NOT_READY`/insufficient data. |
| Knowledge/document management | Knowledge | Source list, Document/version detail, publication state | Published current source, failed stage or revoked source. |
| Integration administration | Administration → Integrations | Provider status, permitted settings, linked delivery case if needed | Valid LIVE/MOCK/SANDBOX status or diagnostic/pending state. |

## 2C.19 Open Questions

1. Which exact memberships grant Owner/Operator/Admin visibility for Business records, Knowledge publication, linked Agent Runs and Audit events? The IA defaults do not create permissions.
2. Does an Operator need a separate Overview at all, or is Conversations the better landing for that role? The area remains for Owner regardless.
3. What source types and publication rights will be exposed in Knowledge? M07 currently proves only `text/plain` UTF-8 ingestion.
4. Which approved settings are user-editable versus external/ops-managed? Do not invent agent configuration controls from the presence of Settings.
5. What business measure and forecast target/horizon will define Overview, Analytics and Forecasts content? `MODEL_NOT_READY` remains truthful today.
6. When an `OUTCOME_UNKNOWN` effect is detected, who may inspect the operation reference and what reconciliation action, if any, is safely available to an Operator versus Admin? No blind retry.
7. What exact escalation decision types and ownership rules will M12 support once implemented, and what happens when no Operator is available?
8. How should short customer/order/stock previews and deeper details be prioritized on the target devices/languages? Phase 3 wireframes must test this; Phase 2C does not set panel geometry.
9. Are Agent Runs sufficiently discoverable for authorized technical staff as an Administration utility while remaining contextual for Operators? Validate with Phase 2D incident scenarios.
10. Which provider-specific message/confirmation/pending affordances can Web Chat control, and which native channel clients constrain? Live adapters are not yet evidenced.

## 2C.20 Phase 2C Decision Summary

- **Six role-visible staff product areas:** Overview, Conversations, Business, Knowledge, Analytics, Administration. Authentication is outside the product menu; Web Chat is a separate customer surface.
- **Fifteen master screen families preserved:** four retail record families nest under Business; Documents is exposed as Knowledge; Forecasts nests under Analytics; Escalations nests under Conversations; Agent Runs and Audit remain distinct restricted evidence families.
- **Conversations ↔ Escalations:** dedicated queue/detail **within** Conversations, with case links and reconciliation-needed state; no second top-level AI Operations/Reconciliation area.
- **Agent Runs ↔ Audit:** execution lifecycle versus durable effect/security evidence; run detail is mainly contextual, restricted run index and Audit are admin/ops utilities.
- **Analytics ↔ Forecasts:** separate actual and predicted routes within one Analytics area; `MODEL_NOT_READY` has no invented ForecastRun.
- **Business Brain:** seven task-relevant projections across existing surfaces, not a Brain page or synonym for Knowledge/RAG. Orchestrator/executor/infrastructure likewise remain system-only.
- **Truthful action states:** proposal, order creation, reservation, `OUTCOME_UNKNOWN`, reconciliation and outbound delivery failure retain different homes and meanings. Backend authorization and fresh tenant scope govern every destination.

Phase 2D must now test the ten flows in §2C.18. Phase 2E will finalize screen/route specifications after those flows. No application code, wireframe, Figma, visual palette or typography is produced by this IA decision.
