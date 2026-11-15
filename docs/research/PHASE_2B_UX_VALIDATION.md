# Phase 2B — Master Documentation / UML → UX Validation

## 2B.0 Scope and Source Authority

This is a **functional UX validation**, not a visual specification, information architecture, route plan, or claim that a frontend exists. Primary authority: [FINAL_MASTER_DEVELOPMENT_SAFE.pdf](../../research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf) (final release, 30 September 2026), especially pp. 16 (D01), 32–34 (FR-01–FR-11), 41 (D02), 46 (D03), 59–63 (agent roles/D05), 67 (D06), 73 (D09), 78–82 (tool registry/D07/V03), 103 (D10), 110–116 (failure, D11/V04, frontend), 118 (D04), and 301–303 (implementation/research evidence). Page numbers here mean physical PDF pages. The master and its **current** D01–D13/V01–V07 views outrank legacy UML and the older working Markdown. [Competitor UX research](UX_COMPETITOR_ANALYSIS.md) is secondary evidence for presentation patterns only; it does not define our requirements. The six core documents remain working context but are not silently reconciled here.

**Evidence boundary:** M01–M07 passed scoped engineering gates (M04 retains E02 `update_order` mutation denial); M08 is PARTIAL/BLOCKED because the latest required live-provider gate failed five cases despite 142 scripted passes; M09–M13, working frontend, live customer-channel integrations, durable M12 human resume, and trained M13 forecast artifact are not evidenced. Pilot, Final, and Phase 5B have not run; no comparative TSR/FER or architecture winner exists (master pp. 301–303). The UI behaviors below are **requirements/design implications**, not implemented screens. `forecast_sales` currently has an implemented contract that truthfully returns `MODEL_NOT_READY`; no forecast plot should be populated from invented values.

**Interpretation rule:** a screen *family* in the master is a functional coverage unit, not proof of a standalone page or sidebar item. Customer channel UI and staff dashboard UI are distinct. Staff APIs used by a human are **not** extra agent tools. “Visible” always means permission-scoped, concise evidence and outcome—not raw prompts, hidden chain-of-thought, credentials, or unrestricted business records. UX must never make a model proposal look like a committed effect. Phase 2C will decide navigation and placement.

**Older-document discrepancies affecting UX interpretation:** [PRD.md](../PRD.md#3-users-and-actors) lists the orchestrator as an actor and omits Channel Provider; D01 makes the orchestrator internal and the provider external. [PRD.md](../PRD.md#4-core-concepts) and [ARCHITECTURE.md](../ARCHITECTURE.md#7-tool-execution-and-data) retained approximate 7–10-tool language; D07/V03 freezes ten names and agent admissions. The architecture's seven-row responsibility table is not the six master macro-layers. [DESIGN.md](../DESIGN.md#14-screen-specifications) and the prior research report propose seven preliminary surfaces; the master now provides fifteen screen families. Earlier statements that no application capability was implemented were historically about the `Diplom` folder, not the newer project-wide engineering snapshot. These conflicts are **recorded, not repaired**, in PRD/ARCHITECTURE/RULES by this task.

## 2B.1 Actor → Capability Matrix

The five external actors follow D01 (master p. 16). “Surface” names a functional touchpoint, not a route decision. A Customer uses Instagram, WhatsApp, Telegram, or Web Chat; staff work through a separate authorized frontend.

| Actor | Capability / Use Case | User Goal | Required UX Surface | Primary Interaction | Notes |
| --- | --- | --- | --- | --- | --- |
| Customer | Send request | Start a service conversation | Channel thread/Web Chat | Send message | Provider receipt is not business completion; D03. |
| Customer | Product/catalog inquiry | Find a suitable item | Channel thread/Web Chat | Ask/choose item | Sales uses `find_product`; ambiguous matches require clarification. |
| Customer | Inventory inquiry | Know current availability | Channel thread/Web Chat | Ask variant/quantity | Sales uses `check_inventory`; show freshness/unknown truthfully. |
| Customer | Purchase | Confirm order and reservation status | Channel thread/Web Chat | Confirm quote/quantity | `create_order` and `reserve_inventory` are separate; D04. |
| Customer | Order inquiry | See own order state | Channel thread/Web Chat | Supply/verify permitted reference | Protected `get_order`, not an unrestricted lookup. |
| Customer | Delivery inquiry | Know delivery status | Channel thread/Web Chat | Ask for status | Support may use `get_delivery_status`; unavailable feed ≠ delivered. |
| Customer | Supported change/exchange request | Resolve a changed need safely | Channel thread/Web Chat | State request/confirm details | Support reads; Sales alone may propose permitted write; E02 mutation remains denied. |
| Customer | Clarification | Resolve missing/ambiguous input | Channel thread/Web Chat | Provide missing detail | No write before required confirmation. |
| Customer | Receive result | Understand what actually happened | Channel thread/Web Chat | Read response/status | Separate reply delivery from business effect. |
| Customer | Escalation/pending notification | Know a human or reconciliation is needed | Channel thread/Web Chat | Receive truthful status | Do not reveal internal identifiers or promise completion. |
| Business Owner | Business overview | Orient to authorized operations | Overview | Select scope/period | Values must be defined and fresh; no invented revenue. |
| Business Owner | Request sales report | See actual business measure | Analytics | Set measure/period; request report | Analytics may propose `get_sales_report`. |
| Business Owner | Inspect report | Compare actual values | Analytics | Filter/read source and coverage | Empty data ≠ outage or zero sales. |
| Business Owner | Request forecast | Inspect future estimate | Forecasts | Set target/horizon; request | Analytics may propose `forecast_sales`; currently `MODEL_NOT_READY`. |
| Business Owner | Understand forecast limits | Avoid treating prediction as fact | Forecasts | Inspect cutoff/model/data provenance | Actual vs predicted and unavailable intervals must differ. |
| Business Owner | Manage business knowledge, if authorized | Publish/revoke controlled source | Documents | Review version/publish/revoke | Owner authorization and publication CAS apply; D09. |
| Human Operator | See assigned escalation | Find work needing human action | Escalations/Conversations | Open/claim authorized case | Unassigned case stays pending; D11. |
| Human Operator | Understand stop reason | Know why automation paused | Escalation detail/Agent Runs | Read reason and restrictions | No hidden chain-of-thought. |
| Human Operator | Inspect verified facts | Avoid redoing safe checks | Conversation/record context | Open scoped evidence | Distinguish current structured fact from derived summary/RAG. |
| Human Operator | Inspect completed actions | Know irreversible effects | Orders/Agent Runs/Audit | Inspect operation refs | A committed order may exist without reservation. |
| Human Operator | Inspect unknown/pending action | Avoid duplicate mutation | Escalations/operation detail | Open reconciliation status | `OUTCOME_UNKNOWN` is neither rollback nor success. |
| Human Operator | Decide, where permitted | Approve/reject/clarify | Escalation detail | Submit authorized decision | Decision set depends on current policy and assignment. |
| Human Operator | Safely resume | Continue supported work | Escalation detail | Request resume with revision | Backend rechecks rights, state and budget; M12 design-only. |
| Human Operator | Close case | End human work accurately | Escalation detail | Close with disposition | No closure while unresolved effect is falsely declared complete. |
| Platform Administrator | Authenticate/manage access | Control staff/business permissions | Authentication/Settings | Sign in; inspect/update permitted access | Administrator is not automatically every tenant's Owner; FR-01. |
| Platform Administrator | Integrations | See/configure channel availability | Integrations | Test/manage permitted connection | LIVE/MOCK/SANDBOX; no browser credential disclosure. |
| Platform Administrator | Configuration | Maintain allowed operational settings | Settings | Review/save permitted policy/config | No unbounded model/role privilege switch. |
| Platform Administrator | Technical audit | Investigate failures/security decisions | Audit/Agent Runs | Filter correlation/event | Privacy-scoped, distinct lifecycle vs durable audit. |
| Channel Provider | Deliver inbound event / accept outbound delivery | Exchange channel messages with platform | **External system; no normal user UI** | Signed webhook/API exchange | Integrations may show provider connection/delivery state to admin; D03. |

## 2B.2 Requirement → UX Visibility Matrix

Master pp. 32–34 define these identifiers. A system requirement can have visible outcomes without acquiring its own page.

| Requirement | Meaning | User-visible? | Actor | UX Surface | Required Feedback |
| --- | --- | --- | --- | --- | --- |
| FR-01 | Authentication / authorization | Direct + indirect | Staff; protected Customer | Authentication, protected records, denied state | Signed in/scope, session expiry, forbidden/not accessible without leaking foreign existence. |
| FR-02 | Channel ingestion | Mostly system-only; admin-visible integration health | Customer, Provider, Admin | Channel thread, Integrations | Receipt vs processing vs outbound delivery failure; never raw webhook internals. |
| FR-03 | Audit and logging | Indirect + authorized staff direct | Operator, Admin | Agent Runs, Audit, action detail | Correlation, meaningful events, actor/effect; no secrets or hidden reasoning. |
| FR-04 | Customer request processing | Direct | Customer, Operator | Channel thread, Conversations | Grounded answer, clarification, pending/escalated, not found vs dependency failure. |
| FR-05 | Adaptive routing | Indirect | Operator; Customer only relevant status | Conversations, Agent Runs | Active agent, change/handoff reason/status; **no Orchestrator page**. |
| FR-06 | Business Brain | Indirect/contextual + Documents management | Operator, Owner, Admin | Context beside conversation; records; Documents; Agent Runs | Structured fact vs retrieved knowledge vs rule/state/permission, source/freshness/conflict. |
| FR-07 | Trusted tool execution | Direct outcome + ops trace | Customer, Operator, Admin | Channel result; Conversations; Orders; Agent Runs; Audit | Proposal ≠ accepted ≠ committed; rejection/failure/`OUTCOME_UNKNOWN`/confirmed effect. |
| FR-08 | Dynamic specialist handoff | Direct status + staff detail | Customer, Operator | Channel message, Conversations, Agent Runs | Previous/current specialist, goal, transferred verified facts, unresolved work. |
| FR-09 | Sales forecasting | Direct | Owner | Analytics, Forecasts | Actual vs predicted, target/cutoff/horizon/provenance; `MODEL_NOT_READY` if unavailable. |
| FR-10 | Human escalation | Direct | Customer, Operator | Channel status, Escalations, Conversations | Waiting human, assignee, reason, decision, safe resume/closure status. |
| FR-11 | Experimental architecture switching | **Research/runner-only**, not normal production control | Authorized researcher/ops only | Research tooling/controlled run metadata, not customer or owner dashboard | Mode/version visible in authorized trace; chat content cannot switch modes or weaken security. |

## 2B.3 Screen Register Validation

All fifteen families are retained from the master frontend register (pp. 115–116). The status below classifies **functional role**, not implementation completion or navigation placement. `REQUIRED BY MASTER` means the family needs UX coverage; `SUPPORTING`, `ADMINISTRATION`, and `RESEARCH/OPS` qualify its audience/use. “Action” is an intended UI interaction through scoped backend contracts, not a new business tool. Use-case names are descriptive; they are not invented UC identifiers.

### Screen: Authentication

- **Status:** REQUIRED BY MASTER; SUPPORTING.
- **Primary actor(s):** Owner, Operator, Administrator. Customer Web Chat uses its channel-bound session, not a staff role.
- **Purpose / source justification:** Establish staff identity and business scope; master FR-01, pp. 32, 106, 115.
- **Related requirement(s) / use case(s):** FR-01; staff sign-in, session renewal, scope selection.
- **Required data / user actions:** Session state, allowed memberships/capabilities; sign in, select permitted business, reauthenticate.
- **Required visible states:** Loading, authenticated, expired, denied, unavailable identity provider, business-scope change. Reauth must not replay an earlier write.
- **Relevant tools / agents:** None; backend authentication is not a business tool. **Expose AI state? No.**
- **Questions remaining:** Exact IdP-hosted vs app-hosted entry and recovery copy; device/language requirements.

### Screen: Overview

- **Status:** REQUIRED BY MASTER; SUPPORTING.
- **Primary actor(s):** Owner; authorized Operator if a task-oriented summary is justified.
- **Purpose / source justification:** Orient to scoped operations without conflating business, AI and delivery metrics; master p. 115, FR-04/09.
- **Related requirement(s) / use case(s):** FR-04, FR-09; owner business overview.
- **Required data / user actions:** Defined measures, period, freshness, pending work counts if authorized; choose period/open source view.
- **Required visible states:** Loading, valid empty, stale, partial sources, dependency failure, restricted metric. **Relevant tools / agents:** Report via Analytics/`get_sales_report` where appropriate; not a new overview tool. **Expose AI state? Context-dependent**, only aggregate operational status if useful.
- **Questions remaining:** Which measures and alerts truly belong here versus Analytics/Escalations?

### Screen: Conversations

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Operator; Admin only within authorized support scope. Customer has a separate channel UX.
- **Purpose / source justification:** Triage and continue customer requests; D03, FR-04/05/08/10, master pp. 46, 115.
- **Related requirement(s) / use case(s):** Product/order/delivery inquiry, handoff, takeover, response delivery.
- **Required data / user actions:** Scoped message list/thread, channel, identity, current owner/agent, context/evidence and response state; open, filter, reply, claim/take over, inspect context.
- **Required visible states:** Unread, active, clarification, pending tool, AI/human handoff, waiting human, confirmed result, send/delivery failure, empty/loading/denied/stale.
- **Relevant tools / agents:** Display outcomes of all task-relevant tools; Sales/Support and, for owner requests, Analytics. **Expose AI state? Yes**, concise current/previous responsibility.
- **Questions remaining:** Which context and action details remain inline versus open detail surfaces?

### Screen: Customers

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Authorized Operator/Owner.
- **Purpose / source justification:** Inspect customer identity and allowed relationships; FR-01/06/07, D01/D08A.
- **Related requirement(s) / use case(s):** Verify customer before protected order disclosure; inspect customer context.
- **Required data / user actions:** Scoped customer identity/linking evidence, permitted contact/order references, observed time; search/open authorized record.
- **Required visible states:** Match/ambiguous/no match, not accessible, loading, stale; do not reveal foreign record existence.
- **Relevant tools / agents:** `find_customer` via Sales/Support; human record APIs are separate. **Expose AI state? Context-dependent**, if linked to active case.
- **Questions remaining:** Which identity-linking actions are allowed in MVP and by whom?

### Screen: Orders

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Authorized Operator/Owner.
- **Purpose / source justification:** Show authoritative order and separate reservation effect; D04, FR-07, master p. 118.
- **Related requirement(s) / use case(s):** Order status, purchase, supported change/exchange, partial outcome.
- **Required data / user actions:** Order ID/state/version, items, authorized customer, operation refs, reservation state; inspect, request only policy-permitted human action.
- **Required visible states:** Created without hold, reserved, rejected, stale, failed, `OUTCOME_UNKNOWN`, reconciliation, not accessible. No generic “completed” for order-only success.
- **Relevant tools / agents:** Sales `get_order`, `create_order`, `update_order`, `reserve_inventory`; Support read `get_order`. **Expose AI state? Context-dependent**, via linked run/event.
- **Questions remaining:** Exact business statuses and approved E02 editable transitions remain owner decisions; do not expose denied mutation as functional CTA.

### Screen: Products

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Authorized Operator/Owner.
- **Purpose / source justification:** Show catalog facts for product selection; D04, FR-04/06.
- **Related requirement(s) / use case(s):** Product search, quote preparation.
- **Required data / user actions:** Product identity, variants, authoritative price/source/version; search/filter/open product.
- **Required visible states:** Found, multiple matches, no match, stale price, loading, denied, dependency failure.
- **Relevant tools / agents:** Sales `find_product`. **Expose AI state? Context-dependent**, if shown from a conversation.
- **Questions remaining:** Which catalog edits, if any, belong to this screen versus separate administration?

### Screen: Inventory

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Authorized Operator/Owner.
- **Purpose / source justification:** Distinguish observed stock from successful reservation; D04, FR-04/07.
- **Related requirement(s) / use case(s):** Availability, purchase, exchange stock check.
- **Required data / user actions:** Item/variant, availability, version and observed time, reservation references; inspect/refresh.
- **Required visible states:** Available, unavailable, stale, dependency failure, pending reservation, reserved, shortage, unknown reservation outcome.
- **Relevant tools / agents:** Sales/Support `check_inventory`; Sales `reserve_inventory`. **Expose AI state? Context-dependent.**
- **Questions remaining:** Which stock dimensions/location scopes are in the accepted MVP?

### Screen: Analytics

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Owner; staff only with explicit authorization.
- **Purpose / source justification:** Show actual historical business measures; FR-09 and Analytics role, master pp. 63, 115–116.
- **Related requirement(s) / use case(s):** Sales report, business comparison.
- **Required data / user actions:** Defined metric, period, granularity, completeness, source and observed time; request/filter/export only if permitted.
- **Required visible states:** Loading, actual result, valid empty, incomplete data, stale, denied, dependency failure; empty ≠ zero sales during outage.
- **Relevant tools / agents:** Analytics `get_sales_report`. **Expose AI state? Context-dependent**, for an agent-generated report.
- **Questions remaining:** Agreed measures, currency, granularity and report permissions.

### Screen: Forecasts

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Owner.
- **Purpose / source justification:** Separate predicted values from actual history; D10, FR-09, master pp. 103, 115–116.
- **Related requirement(s) / use case(s):** Request/inspect sales forecast and limitations.
- **Required data / user actions:** Target, cutoff, horizon, model/data versions, ForecastRun reference when one exists, observed vs predicted series; request/view forecast.
- **Required visible states:** Loading, `MODEL_NOT_READY`, insufficient history, unavailable intervals, prediction with limitations, stale/failed/denied. No fabricated forecast today.
- **Relevant tools / agents:** Analytics `forecast_sales`. **Expose AI state? Context-dependent**, show Analytics processing/outcome when invoked.
- **Questions remaining:** Target/horizon and chart/detail split after valid forecast data exists.

### Screen: Documents

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Authorized Owner/Admin; Operator only if policy permits.
- **Purpose / source justification:** Manage private business knowledge and publication; D09, FR-06, master p. 73.
- **Related requirement(s) / use case(s):** Upload, validate, publish, revoke, inspect source.
- **Required data / user actions:** Document/version, processing status, current pointer, ACL, provenance; upload supported type, review, publish/revoke with version guard.
- **Required visible states:** Uploading, quarantined/processing, failed, staged, READY, published/current, revoked, stale version, denied. Current implemented parser scope is `text/plain` UTF-8 only.
- **Relevant tools / agents:** No new business tool; knowledge provider feeds Business Brain. **Expose AI state? No**, except documented use/impact references.
- **Questions remaining:** Which MIME types will be accepted in the eventual UI beyond the validated development parser?

### Screen: Agent Runs

- **Status:** REQUIRED BY MASTER; RESEARCH/OPS for deep trace, operator-facing for case explanation.
- **Primary actor(s):** Authorized Operator/Admin/research staff, not Customer.
- **Purpose / source justification:** Inspect one execution lifecycle and handoffs; FR-03/05/07/08, master pp. 110–115.
- **Related requirement(s) / use case(s):** Investigate routing, tool attempt, handoff, escalation, final result.
- **Required data / user actions:** Correlation/run ID, current/previous specialist, event sequence, tool/result refs, evidence refs, terminal/pending state, bounded latency/cost metadata; open/filter trace.
- **Required visible states:** Active, completed, clarification, rejected, known failure, unknown effect, waiting human, resumed, delivery failed; redact sensitive data.
- **Relevant tools / agents:** Shows all three agent roles and ten-tool calls as authorized; does not execute tools. **Expose AI state? Yes.**
- **Questions remaining:** Operator summary versus technical detail permissions and retention.

### Screen: Escalations

- **Status:** REQUIRED BY MASTER.
- **Primary actor(s):** Assigned/authorized Operator; Admin only within policy.
- **Purpose / source justification:** Durable human decision and safe continuation; D11, FR-10, master p. 111.
- **Related requirement(s) / use case(s):** Claim, inspect, approve/reject/clarify where allowed, safe resume, close.
- **Required data / user actions:** Reason, assignment, conversation, verified facts, committed operation IDs, pending effects, restrictions, revision/allowed decisions; claim/decide/resume/close.
- **Required visible states:** New/unassigned, waiting human, assigned, decision pending, stale revision, denied, reconciliating, resumed, closed, unknown effect. No blind retry.
- **Relevant tools / agents:** Shows linked run/tool outcomes; staff decision through backend, not an eleventh tool. **Expose AI state? Yes**, paused/resumed/terminal.
- **Questions remaining:** Exact approval types and who can take each decision; M12 is not implemented.

### Screen: Settings

- **Status:** REQUIRED BY MASTER; ADMINISTRATION.
- **Primary actor(s):** Platform Administrator; limited Owner settings if explicitly granted.
- **Purpose / source justification:** Display/manage approved configuration and permissions; FR-01, master pp. 106, 115.
- **Related requirement(s) / use case(s):** Scope/role/configuration administration.
- **Required data / user actions:** Effective membership, allowed capabilities, policy/config version; review/edit only authorized fields.
- **Required visible states:** Saved, validation rejected, stale version, denied, loading/dependency failure.
- **Relevant tools / agents:** None automatically; settings do not grant agent tools. **Expose AI state? Context-dependent** for permitted agent configuration/status only.
- **Questions remaining:** Which settings are editable in MVP and which remain external/ops-managed?

### Screen: Integrations

- **Status:** REQUIRED BY MASTER; ADMINISTRATION.
- **Primary actor(s):** Platform Administrator or authorized Owner.
- **Purpose / source justification:** Expose four channel connection/deployment states; FR-02, D03, master pp. 46, 116.
- **Related requirement(s) / use case(s):** Connect/inspect provider, diagnose inbound or delivery problems.
- **Required data / user actions:** Provider/channel, LIVE/MOCK/SANDBOX, last health/event and safe error, authorized setup fields; view/test/reconnect through backend.
- **Required visible states:** Not configured, mock/sandbox, live, pending, expired/denied, inbound failure, outbound delivery failure. No credentials shown back to browser.
- **Relevant tools / agents:** Channel adapters, not canonical business tools. **Expose AI state? No.**
- **Questions remaining:** Which channel integrations can be live in MVP and which remain labelled mock/sandbox?

### Screen: Audit

- **Status:** REQUIRED BY MASTER; ADMINISTRATION / RESEARCH/OPS with strict access.
- **Primary actor(s):** Authorized Admin, possibly Operator for linked case events.
- **Purpose / source justification:** Inspect durable consequential action and security-decision records, distinct from one Agent Run; FR-03/07, master pp. 32, 110–112.
- **Related requirement(s) / use case(s):** Confirm effect, investigate denial/incident, correlate operation.
- **Required data / user actions:** Actor, scope, time, event/operation/correlation reference, decision/outcome and redacted reason; filter/open authorized event.
- **Required visible states:** Recorded, denied, failed, unknown/reconciled, loading, empty, access denied, retention-limited.
- **Relevant tools / agents:** All consequential tool effects and security decisions can be referenced; no tool execution from audit. **Expose AI state? Context-dependent** as event metadata, not a live control.
- **Questions remaining:** Exact role grants, retention, export and incident-review workflow.

## 2B.4 Customer Interaction UX Requirements

Customer-visible interaction occurs in Instagram, WhatsApp, Telegram, or Web Chat; the platform cannot prescribe the native provider UI. Web Chat is a customer-channel surface, **not** an owner/operator dashboard. Staff Conversations may show the same case with richer, permission-scoped context. D03 (p. 46) separates authenticated provider ingress, durable receipt, processing, business effects and outbound delivery. Therefore “message received”, “action completed”, and “reply delivered” are distinct claims. A delivery failure must not rerun `create_order` or `reserve_inventory`.

The customer sees a grounded item/availability answer, an explicit choice when multiple products match, a clarification request when identity/variant/quantity is uncertain, a confirmation request before supported purchase writes, and a truthful pending/escalation message for blocked work. Order details require identity/ownership verification; an inaccessible order cannot leak its existence. The staff view may additionally show agent identity, fact provenance, current order/stock versions, tool and delivery events, and escalation controls. Do not expose private evidence or run internals to a customer.

| Customer message situation | Customer-visible result | Staff-visible additional facts |
| --- | --- | --- |
| Product found and current stock known | Item/variant and qualified availability with observed time where meaningful | Sales active; `find_product`/`check_inventory` outcomes and source freshness. |
| Multiple products, no match, or missing variant | Clarifying choices or truthful no match | Search parameters, candidate ambiguity, next requested detail. |
| Stock lookup unavailable/stale | Availability not confirmed; safe follow-up | Dependency/freshness reason; no implied reservation. |
| Order created, reservation confirmed | Distinct confirmed order and reservation status | Two operation refs/effects, order/inventory versions. |
| Order created, reservation failed/shortage | State that order exists but stock is **not** reserved; pending staff handling if needed | CREATED/NEEDS_ATTENTION or actual supported state; failure/shortage and no invented refund. |
| Reservation `OUTCOME_UNKNOWN` | Order creation may be confirmed, reservation is **pending verification**; no retry instruction | Operation key/ref, reconciliation/assigned human state; no success or rollback claim. |
| Escalated or outbound delivery failed | Pending human review if deliverable; do not imply message was received when delivery failed | Waiting/assignment vs delivery-attempt status. |

## 2B.5 Business Owner UX Requirements

Owner scope is enforced by backend identity and business membership, not frontend hiding. Overview and Analytics need explicitly named measure, period, granularity, currency/scope if applicable, completeness and observed time. The Owner may request `get_sales_report` through Analytics; the response may describe actuals but must not invent a causal explanation for a decrease. Valid empty, delayed data and dependency outage need different text and states.

Forecasts require target, cutoff, horizon, ForecastRun reference when a run exists, model/data version and limitations. Actuals and predictions must be distinguishable in labels and accessible text, not just styling. D10 (p. 103) allows `MODEL_NOT_READY`; because M13 has not produced a trained/validated artifact, the present truthful contract result is unavailable rather than a plotted forecast. Authorized Owner knowledge management is covered by Documents, with staged version, explicit publication, current pointer and revocation. The Owner is not automatically entitled to administrator-only technical settings.

## 2B.6 Human Operator UX Requirements

The operator needs a scoped queue, case reason, customer/conversation reference, verified facts with provenance, completed operation IDs, pending/unknown effects, relevant policy and remaining task. The UI should make “AI active”, “AI stopped/waiting human”, “human owns case”, “safe resume requested”, and “closed” intelligible without a raw runtime console. For an escalation, show only decisions currently permitted by policy and assignment. D11 (p. 111) requires durable WAITING_HUMAN, checked assignment, single-use revision/operation key, fresh authorization and state before resume. A stale decision must reload and require review. Reauthentication or repeated button press cannot automatically replay a business write.

M12 durable resume is **design-only** in the current engineering evidence. Phase 2B describes its needed UX, not a claim that an operator can already use it. An `OUTCOME_UNKNOWN` operation must go through reconciliation before a new write or completion claim; a simple “Retry” CTA is unsafe. Operator actions use staff backend APIs and the same domain/security boundaries, not privileged direct database access or new AI business tools.

## 2B.7 Platform Administrator UX Requirements

The Administrator can inspect effective role/business scope, permitted configuration, integration health and redacted audit evidence. A Platform Administrator is **not** automatically Owner of every tenant (master p. 106). Settings and Integrations must be permission-scoped; channel status should identify LIVE/MOCK/SANDBOX (p. 116) and keep secrets out of browser responses. The admin may see technical reason codes/correlation IDs according to access but not raw tokens, private prompts or hidden chain-of-thought. The Channel Provider appears only as an integration/delivery dependency, never as a dashboard login role.

## 2B.8 Agent and Orchestration Visibility

Exactly three core specialists are visible by role and current responsibility: Sales, Support and Analytics. D05 (p. 60) makes a Support → Sales handoff a scoped transfer of goal, verified evidence, completed refs, pending work and limits; it does **not** transfer permissions. The receiving Sales agent refreshes facts/permissions. The customer needs a concise progress/clarification/human-pending status, not a full agent trace. The operator may see from-agent, to-agent, reason, task goal, evidence refs, actions already executed, outstanding fields and current owner. Candidate placements for Phase 2C: a concise event in the conversation timeline, active-owner/status near the thread, and full chronology in Agent Runs. These are **placement candidates**, not approved layout.

The Adaptive Orchestrator and LangGraph remain internal. Their user-visible results are current specialist, handoff, routing/stop reason, tool attempt/outcome, escalation and run history. Do not add an Orchestrator page or expose raw graph controls. A research architecture mode (`SINGLE`, `STATIC_MULTI`, `ADAPTIVE_MULTI`) is controlled runner metadata under FR-11, not a chat prompt or ordinary customer/owner toggle. No mode is claimed to outperform another; M09–M11 have not started.

## 2B.9 Tool Execution Visibility

D07/V03 (master pp. 78–82) freeze the registry below. “May propose” is **not** “may execute”; the executor also checks principal, business, resource, current state and policy. A human-facing action UI cannot bypass that boundary.

| Canonical business tool | Agent permitted to propose | UX-visible fact or effect |
| --- | --- | --- |
| `find_product` | Sales | Catalog match/no match/ambiguity and source. |
| `check_inventory` | Sales, Support | Observed stock and freshness, not a hold. |
| `find_customer` | Sales, Support | Protected identity match/ambiguity/denial. |
| `get_order` | Sales, Support | Protected order state and version. |
| `create_order` | Sales | Confirmed order creation **only after** trusted result; no reservation implied. |
| `update_order` | Sales | Proposed/denied/confirmed permitted change; E02 mutation is currently policy-denied. |
| `reserve_inventory` | Sales | Confirmed hold, known shortage/failure, or `OUTCOME_UNKNOWN`. |
| `get_delivery_status` | Support | Delivery status/source or feed unavailable. |
| `get_sales_report` | Analytics | Actual report, measure/period/completeness. |
| `forecast_sales` | Analytics | ForecastRun/provenance if ready; currently `MODEL_NOT_READY`. |

For each consequential call, staff UX should distinguish **proposed → validation/authorization pending → rejected OR accepted/executing → confirmed effect, known failure, or `OUTCOME_UNKNOWN` → reconciliation if needed**. A proposal is not permission, schema validity is not authorization, and a timeout is not proof of rollback. Show an operation reference and exact known effects where authorized; display no blind-repeat mutation control. `create_order` and `reserve_inventory` have separate result events (D04, p. 118). Outbound message delivery has its own status; a failed delivery does not negate an already committed order.

## 2B.10 Business Brain Visibility

D06 (p. 67) specifies a seven-part, scoped ContextBundle. Expose only task-relevant **projections**, not a giant dump or a default standalone Brain page. The strongest-authority source for current Order/Inventory is structured operational data; retrieved text is evidence, never authorization.

| Context part | User-relevant projection | Candidate surface | Critical distinction |
| --- | --- | --- | --- |
| Request | Intent/request summary and missing input | Conversation/Agent Runs | Customer text does not define trusted business scope. |
| Conversation | Relevant message history and derived summary | Conversations/Escalations | Summary is derived, not operational truth. |
| Structured facts | Current customer/order/product/stock/report fact | Customers/Orders/Products/Inventory/Analytics and case context | Show source/version/freshness and rights. |
| Retrieved knowledge | Applicable FAQ/policy citation | Conversation context/Documents/Agent Runs | Published/current/ACL-filtered version; text cannot override rules. |
| Runtime state | Active agent, pending operation, completed refs, escalation | Conversations/Agent Runs/Escalations | Unknown or pending remains explicit after interruption. |
| Rules | Applicable restriction and reason code | Action/decision/permission feedback | Machine-enforced policy outranks document prose. |
| Permissions | Effective allowed action/status | Authentication/Settings/decision surfaces | Trusted backend projection, not model grant. |

Where policy documents conflict, or a source is stale/missing, show uncertainty and safe next step instead of silently selecting a convenient answer. M06 context assembly and M07 scoped text-only knowledge path passed their limited gates; their existence does not imply a working frontend or PDF/Office ingestion (master pp. 301–303).

## 2B.11 State and Failure UX

The state taxonomy below applies across screens and channels. The UI must derive the state from trusted backend contracts; a model-generated sentence cannot promote it to success. Actor-facing wording differs: customers get understandable status, operators/admins can inspect reason and permitted refs.

| State | Required user-facing meaning / safe action |
| --- | --- |
| Loading | Request in progress; do not show stale prior-tenant result as current. |
| Valid empty | Successful query with no records; distinct from source failure or zero-valued measure. |
| Active | Agent/operator currently owns work; show responsible party where relevant. |
| Completed | Terminal workflow result with known outcome; distinguish response delivery from effect. |
| Clarification required | Name missing information; no consequential write yet. |
| Rejected | Validation, policy, permission or state guard prevented effect; correct input or escalate, do not imply retry will work unchanged. |
| Known failure | Operation failed with evidence no effect committed; show bounded recovery path. |
| Dependency failure | Source/provider unavailable; do not invent catalog/stock/delivery/report data. |
| Authorization failure | Access denied/not accessible; do not expose a foreign resource's existence. |
| Stale state | Fact/version changed; reload and re-evaluate before write or human decision. |
| Pending | An accepted operation or delivery has no terminal result yet; show owner and next check. |
| Waiting for human / escalation | Durable case exists or assignment pending; automation stopped; never mark task complete. |
| Confirmed business effect | Trusted executor/domain/database result confirms exact effect; name order vs reservation separately. |
| `OUTCOME_UNKNOWN` | Effect **may** have committed; show pending reconciliation and operation ref, neither success nor rollback; no blind mutation retry (V04, p. 114). |
| Reconciliation | Inspect durable state using trusted operation evidence; if unresolved, maintain human-pending case. |
| Delivery failure | Outbound reply not confirmed; retry **delivery** safely, not the business mutation (D03, p. 46). |
| `MODEL_NOT_READY` | Forecast artifact absent; no graph with invented prediction or implied zero forecast. |

The frontend contract also requires scoped cache clearing on tenant switch, version/observed-time on mutable DTOs, cursor reset when filters change, escaped untrusted text, keyboard/focus/label support, and non-color-only states (master pp. 115–116). These are functional/accessibility constraints, not visual token decisions.

## 2B.12 End-to-End Flow Validation

The following flows test whether a person can understand **who owns the work, which fact is trusted, what effect occurred, and what safe next step remains**. They do not assert that the corresponding frontend or M08–M13 runtime exists. Actor-to-surface mappings are summarized in the comprehensive matrix below.

| Flow / master reference | Required UX sequence and visible result | Critical exception / non-claim |
| --- | --- | --- |
| **A. Product availability** — FR-04, D04 p. 118 | Customer inquiry → Sales identity/status → `find_product` → item/variant disambiguation as needed → `check_inventory` → grounded availability with observed time; staff sees sources and tool outcomes. | Multiple/no matches call for clarification/no-match. Stale or unavailable stock stays unknown; an availability read is not a reservation. |
| **B. Purchase** — D04 p. 118, D07 p. 79 | Item/stock quote → customer confirmation → Sales proposes `create_order` → executor confirms creation → separate `reserve_inventory` → customer and staff see **two** effect statuses. | No confirmation: no write. `create_order` rejected: no order claim. Stock changed: refresh/reconfirm as policy requires. Created + reserved: both confirmed. Created + shortage/known reserve failure: order exists, no hold, human/recovery path. Created + reserve `OUTCOME_UNKNOWN`: order creation may be known, reservation pending reconciliation; neither retry nor rollback claim. |
| **C. Order/delivery support** — FR-01/04/06, Support p. 62 | Customer asks → identity/ownership check → Support `find_customer`/`get_order` as permitted → policy evidence and optionally `get_delivery_status` → answer or escalation. | Foreign/inaccessible order gets privacy-safe denial; ambiguous identity asks for proof; delivery feed outage, old policy or conflict stays explicit; unsupported refund/change cannot be invented. |
| **D. Support → Sales** — D05 p. 60 | Support gathers verified order/policy/stock facts and completed refs → handoff request → Sales receives goal/remaining limits and refreshes scope/state → permitted proposal or escalation. Staff sees from/to, reason, evidence, prior effects and next owner; customer sees a concise transition/status. | Handoff transfers **no** permission. Current E02 `update_order` mutation remains denied; no automatic refund/release. Bounded handoffs avoid loops. |
| **E. Human escalation / safe resume** — D11 p. 111, V04 p. 114 | Trigger (LOW/UNKNOWN confidence, restriction, budget, unsupported action, unknown effect) → durable waiting case → assigned Operator sees reason/facts/effects/allowed decisions → decision with revision → fresh checks → safe resume or close. | M12 resume is not implemented. Stale/duplicate/unauthorized decision is rejected; unknown effect reconciles before any repeat write. An unavailable operator leaves a visible pending state. |
| **F. Owner analytics / forecasting** — D10 p. 103 | Owner sets measure/period → Analytics `get_sales_report` → actual report with scope/completeness; forecast request → `forecast_sales` → predicted result with horizon/cutoff/provenance **only if model ready**. | Current `MODEL_NOT_READY` must appear as unavailable, not zero or predicted data. Do not infer causation from descriptive movement; do not expose owner aggregates to a Customer. |
| **G. Knowledge/document management** — D09 p. 73 | Authorized Owner uploads supported source → processing/READY stage → reviews version/ACL → explicit publication → current version available as evidence; revoke/retire changes visibility. | Failed V2 does not replace V1. Revoked/unpublished source is not usable evidence. M07 validated text/plain UTF-8 only; PDF/Office/HTML UX cannot be presented as currently supported. |

### Comprehensive actor/use-case → UI traceability matrix

`—` in Tool means no canonical agent business tool is called by that UI step; it does **not** name an eleventh tool. Customer rows refer to channel UX; staff rows to authorized frontend surfaces. `Dxx/Vxx` are current master figures with PDF page numbers. This matrix intentionally maps functional surfaces, not navigation routes.

| Actor | Use Case / Capability | Goal | Screen / Surface | UI Action | Required Data | Agent/System | Tool | Visible State | Component | Failure/Exception | Master Reference |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Customer | Send request | Start case | Channel/Web Chat | Send message | Channel session, message ref | Ingress adapter | — | Received/processing | Conversation Thread | Invalid/duplicate event, delivery issue | D03 p. 46; FR-02/04 pp. 32–33 |
| Customer | Product search | Find item | Channel/Web Chat | Ask/choose variant | Catalog match, source | Sales | `find_product` | Match/multiple/no match | Product Summary | Ambiguous or dependency failure | D04 p. 118; FR-04 |
| Customer | Availability | Know stock | Channel/Web Chat | Ask item/quantity | Stock fact, observed time | Sales | `check_inventory` | Known/unknown | Inventory Status | Stale/unavailable source | D04 p. 118; FR-04 |
| Customer | Purchase confirmation | Authorize intended order | Channel/Web Chat | Confirm quote/quantity | Item, price, quantity, quote version | Sales/runtime | — | Awaiting confirmation | Business Action Confirmation | Missing/expired confirmation: no write | D04 p. 118; Sales p. 61 |
| Customer | Purchase — order creation | Know whether order exists | Channel/Web Chat | Receive result | Order ref, trusted creation outcome | Sales/executor | `create_order` | Created/rejected/unknown | Tool Result, Order Summary | Rejection or unknown effect; no false order claim | D04 p. 118; D07 p. 79 |
| Customer | Purchase — reservation | Know whether stock is held | Channel/Web Chat | Receive result | Reservation ref/stock version | Sales/executor | `reserve_inventory` | Reserved/failed/pending reconciliation | Inventory Status, Pending Action | Created order ≠ successful hold; shortage/`OUTCOME_UNKNOWN` | D04 p. 118; V04 p. 114 |
| Customer | Order status | See own order | Channel/Web Chat | Ask/verify reference | Scoped identity and order state | Support | `find_customer`, `get_order` | Verified result/clarify | Order Summary | Foreign/inaccessible order; no existence leak | FR-01 p. 32; Support p. 62 |
| Customer | Delivery status | Know delivery progress | Channel/Web Chat | Ask | Scoped order/delivery source | Support | `get_delivery_status` | Known/unavailable | Order Summary | Feed outage ≠ delivered | Support p. 62; FR-04 |
| Customer | Exchange/order-change request | Get safe resolution | Channel/Web Chat | Describe desired change | Own order, policy, stock, confirmation | Support → Sales | `get_order`, `check_inventory`; Sales may propose `update_order`/`reserve_inventory` | Handoff/pending/denied | Agent Handoff Event, Pending Action | E02 mutation denied; escalate, no refund invention | D05 p. 60; V03 p. 82 |
| Customer | Clarification | Supply missing details | Channel/Web Chat | Answer question | Missing field and permitted context | Current specialist | — | Clarification required | Conversation Thread | No write before confirmed parameters | FR-04 pp. 32–33 |
| Customer | Receive final response | Know actual outcome | Channel/Web Chat | Read message | Trusted effects + delivery status | Runtime/channel adapter | — | Delivered/not delivered | Conversation Thread | Delivery failure does not undo/replay write | D03 p. 46; FR-04 |
| Customer | Escalation notification | Know human review is pending | Channel/Web Chat | Read pending notice | Safe reason/status only | Runtime/operator | — | Waiting human | Pending Action | Unassigned operator or outbound failure | D11 p. 111; FR-10 |
| Business Owner | Overview | Orient to business | Overview | Set period/open measure | Scoped actual measures, freshness | Reporting/Analytics | `get_sales_report` where invoked | Actual/empty/stale | Metric Summary, Provenance Badge | Outage ≠ zero sales | FR-09 p. 33; frontend p. 115 |
| Business Owner | Request sales report | Obtain actuals | Analytics | Select metric/period | Definition, scope, granularity | Analytics | `get_sales_report` | Loading/actual/empty | Report Filter, Actuals View | Missing source/denied | Analytics p. 63; FR-09 |
| Business Owner | Inspect report | Interpret results | Analytics | Read source/completeness | Actual series, period, provenance | Analytics/reporting | — | Observed/partial/stale | Actuals View, Provenance Badge | No causal explanation without evidence | Analytics p. 63; frontend p. 116 |
| Business Owner | Request forecast | Obtain future estimate | Forecasts | Set target/horizon | Historical cutoff, artifact readiness | Analytics | `forecast_sales` | Pending/result/`MODEL_NOT_READY` | Forecast Chart, Error Panel | No trained artifact today | D10 p. 103; status p. 303 |
| Business Owner | Interpret forecast | Distinguish actual/predicted | Forecasts | Inspect legend/limitations | ForecastRun, model/data versions, horizon | Analytics | — | Predicted vs actual | Actual vs Predicted Legend | Insufficient history/unavailable intervals | D10 p. 103; frontend p. 116 |
| Business Owner | Manage knowledge | Keep approved source current | Documents | Upload/review/publish/revoke | Version, ACL, processing/current pointer | Knowledge service | — | Staged/READY/published/revoked | Document Status | Failed V2 does not replace V1; denied | D09 p. 73; FR-06 |
| Human Operator | Escalation queue | Find assigned work | Escalations/Conversations | Filter/claim | Assignment, age, reason | Escalation service | — | New/assigned/waiting | Escalation Card | No operator available remains pending | D11 p. 111; FR-10 |
| Human Operator | Escalation detail | Understand stop | Escalations | Open case | Reason, scope, unresolved task | Escalation service | — | Waiting/decision needed | Escalation Card | Restricted case: deny | D11 p. 111; FR-10 |
| Human Operator | Inspect verified context | Avoid repeated checks | Conversations/record context | Open evidence | Customer/order/stock/policy refs + freshness | Business Brain | — | Verified/stale/conflict | Customer Context Panel, Knowledge Reference | Derived summary not authoritative | D06 p. 67; FR-06 |
| Human Operator | Inspect completed effects | Know what committed | Orders/Agent Runs/Audit | Open operation | Trusted order/hold refs and audit | Executor/domain | — | Confirmed distinct effects | Audit Timeline, Tool Result | No reservation inference from order | D04 p. 118; D07 p. 79 |
| Human Operator | Inspect pending/unknown effect | Avoid duplicate write | Escalations/operation detail | Open reconciliation | Operation key/ref, last evidence | Reconciler/operator | — | `OUTCOME_UNKNOWN`/reconciling | OUTCOME_UNKNOWN Alert | No blind mutation retry or rollback claim | V04 p. 114; FR-07 |
| Human Operator | Approve/reject/clarify | Make authorized decision | Escalations | Submit allowed decision | Assignment, current policy, revision | Escalation service | — | Decision pending/accepted | Escalation Decision Form | Denied/stale revision/duplicate | D11 p. 111; FR-10 |
| Human Operator | Safe resume | Continue only if still valid | Escalations | Request resume | Current rights/state/budget, operation refs | Runtime/backend | — | Resuming/waiting/blocked | Resume Control, Stale Warning | Unknown effect reconciles first; M12 unbuilt | D11 p. 111; status p. 301 |
| Human Operator | Close case | Record final disposition | Escalations | Close | Resolution and known effects | Escalation service | — | Closed | Escalation Card | Unresolved effect must not become success | D11 p. 111; FR-10 |
| Platform Administrator | Integration status | Diagnose channels | Integrations | View/test allowed channel | Provider, LIVE/MOCK/SANDBOX, delivery health | Adapter/backend | — | Live/mock/failed | Integration Status | No credentials in browser | D03 p. 46; frontend p. 116 |
| Platform Administrator | Access/configuration | Maintain permitted settings | Authentication/Settings | Review/save approved field | Effective scope, policy version | Identity/backend | — | Saved/rejected/stale | Permission Panel | Admin not all-tenant Owner | Security p. 106; FR-01 |
| Platform Administrator | Audit investigation | Trace meaningful effects | Audit | Filter/open event | Actor, time, scope, operation/correlation ref | Audit service | — | Recorded/denied/unknown | Audit Timeline | Redacted/no raw secret or thought | FR-03 p. 32; recovery p. 110 |
| Platform Administrator | Technical run inspection | Diagnose lifecycle | Agent Runs | Open filtered run | Status, specialist, tool refs, cost provenance | Runtime/ops | — | Active/terminal/pending | Run Timeline | Missing usage is unknown, not zero | Frontend p. 115; trace p. 112 |
| System-visible operation | Active agent | Show current responsibility | Conversations/Agent Runs | Inspect status | Agent role, run ref | Runtime | — | Active/paused/ended | Agent Status Badge | No false active state after escalation | FR-05 p. 33; D11 p. 111 |
| System-visible operation | Agent handoff | Show transfer | Conversations/Agent Runs | Inspect event | From/to, goal, verified refs, limits | Orchestrator | — | Requested/accepted/escalated | Agent Handoff Event | No privilege transfer; E02 may deny | D05 p. 60; FR-08 |
| System-visible operation | Tool proposal | Distinguish intent from effect | Agent Runs/Conversation context | Inspect proposal | Tool name, safe argument summary | Agent | Task-specific canonical tool | Proposed only | Tool Call Event | Proposal may be denied | D07 p. 79; agent p. 59 |
| System-visible operation | Tool admission/execution | Show trusted boundary | Agent Runs/action detail | Inspect result | Principal/scope result, operation ref | Executor/domain | Task-specific canonical tool | Validating/executing/confirmed | Tool Result | Schema valid ≠ authorized | D07 p. 79; FR-07 |
| System-visible operation | Rejected tool | Explain safe refusal | Agent Runs/case context | Inspect reason | Reason code, no effect evidence | Executor | Task-specific canonical tool | Rejected | Tool Result, Permission Error | Never claim committed action | D07 p. 79; FR-07 |
| System-visible operation | Known failure | Explain bounded recovery | Agent Runs/case context | Read next step | Phase and failure class | Executor/dependency | Task-specific canonical tool | Failed | Dependency Error | Retry only if pre-effect safe | Failure p. 110; V04 p. 114 |
| System-visible operation | Unknown business outcome | Preserve uncertainty | Orders/Escalations/Agent Runs | Open status | Operation ref, possible commit evidence | Executor/reconciler | `create_order`, `update_order`, or `reserve_inventory` | `OUTCOME_UNKNOWN` | OUTCOME_UNKNOWN Alert | No success, rollback, blind retry | V04 p. 114; FR-07 |
| System-visible operation | Reconciliation | Determine actual effect | Operation detail/Escalations | Inspect progress | Durable operation/state evidence | Reconciler/operator | — | Pending/resolved/unresolved | Pending Action | Unresolved remains human-pending | V04 p. 114; D11 p. 111 |
| System-visible operation | Final outcome | Report trusted result | Channel + Conversations/Agent Runs | Read/inspect | Exact effects, delivery receipt | Runtime/channel adapter | — | Completed/partial/pending/delivery failed | Conversation Thread, Tool Result | Response delivery separate from effect | D03 p. 46; FR-04 |

## 2B.13 UI Component Requirements

This is a **functional component inventory**, not a design system. States are semantic contract requirements; there are no colors, typography, dimensions, layout tokens, or component styling here. Screen names are families from §2B.3; a component may also appear in customer Web Chat where allowed.

| Component | Purpose | Actor | Input/data | Possible states | Related screen(s) | Requirement/use case |
| --- | --- | --- | --- | --- | --- | --- |
| Conversation List | Find and triage cases | Operator | Scoped thread summary, assignee, channel | Loading, empty, active, unread, failed | Conversations | FR-04/10; triage |
| Conversation Thread | Show dialogue and delivery | Customer/Operator | Messages, refs, delivery status | Sending, delivered, failed, clarification, pending | Channel, Conversations | FR-02/04; interaction |
| Customer Context Panel | Show verified adjacent facts | Operator | Scoped customer/order/stock/policy refs | Current, stale, denied, conflict | Conversations, Customers, Orders | FR-06; support |
| Customer Identity Summary | Bound protected disclosure | Operator | Identity link/verification state | Verified, ambiguous, inaccessible | Customers, Conversations | FR-01; order inquiry |
| Order Summary | Separate order from hold | Customer/Operator | Order version, state, reservation ref | Created, reserved, needs attention, unknown | Orders, Conversations, Channel | FR-07; purchase |
| Product Summary | Identify item/variant | Customer/Operator | Catalog match, price/source | Found, multiple, absent, stale | Products, Conversations, Channel | FR-04; search |
| Inventory Status | Report observed stock/hold | Customer/Operator | Quantity/variant/version, reservation outcome | Available, unavailable, stale, reserved, unknown | Inventory, Conversations, Channel | FR-04/07; availability |
| Agent Status Badge | Name current responsibility | Operator | Role, run/ownership state | Active, paused, waiting human, terminal | Conversations, Agent Runs | FR-05; routing |
| Agent Handoff Event | Explain specialist transfer | Operator; concise Customer status | From/to, reason, goal, evidence refs | Requested, accepted, failed/escalated | Conversations, Agent Runs | FR-08; D05 |
| Tool Call Event | Show proposal/attempt | Operator/Admin | Canonical name, safe input summary, ref | Proposed, admitted, rejected, executing | Agent Runs, action detail | FR-07; D07 |
| Tool Result | Name trusted result | Operator; filtered Customer result | Effect IDs, status, reason | Confirmed, rejected, failed, unknown | Agent Runs, Orders, Conversations | FR-07; writes |
| Business Action Confirmation | Obtain needed customer/owner consent | Customer/Operator | Quote, item, quantity, version | Awaiting, confirmed, expired, denied | Channel, Conversations, Orders | FR-04/07; purchase |
| Pending Action | Prevent premature completion | Customer/Operator | Owner, next check, operation ref | Pending, waiting human, reconciling, resolved | Conversations, Escalations, Channel | FR-07/10; recovery |
| OUTCOME_UNKNOWN Alert | Warn of possible commit | Operator/Admin; simplified Customer copy | Operation ref, evidence, next safe check | Unknown, reconciling, resolved/unresolved | Orders, Escalations, Agent Runs | FR-07; V04 |
| Escalation Card | Show assigned human work | Operator | Reason, priority, scope, assignee | New, waiting, assigned, closed | Escalations, Conversations | FR-10; D11 |
| Escalation Decision Form | Capture allowed human choice | Operator | Allowed decisions, revision, restrictions | Ready, submitting, stale, denied, saved | Escalations | FR-10; D11 |
| Resume Control | Request fenced continuation | Operator | Current case revision, operation refs | Ready, blocked, resuming, duplicate/stale | Escalations | FR-10; safe resume |
| Knowledge Source Reference | Show policy/document provenance | Operator/Owner | Source, version, publication/ACL | Current, stale, conflict, revoked | Conversations, Documents, Agent Runs | FR-06; D09 |
| Document Status | Manage knowledge lifecycle | Owner/Admin | Document/version/processing/current pointer | Uploading, failed, staged, READY, published, revoked | Documents | FR-06; D09 |
| Report Filter / Actuals View | Define and inspect observed measure | Owner | Measure, scope, period, actual series | Loading, actual, valid empty, stale, failed | Analytics, Overview | FR-09; report |
| Forecast Chart | Show future estimate if ready | Owner | Predicted series, horizon, ForecastRun | Loading, result, `MODEL_NOT_READY`, insufficient data | Forecasts | FR-09; D10 |
| Actual vs Predicted Legend | Prevent factual confusion | Owner | Series kinds, cutoff, uncertainty | Actual, predicted, unavailable interval | Forecasts | FR-09; forecast |
| Provenance / Freshness Badge | Surface authority/time | Staff/Owner | Source, version, observed time | Current, stale, derived, unavailable | Records, Analytics, Conversations | FR-06/09; context |
| Audit Timeline | Reconstruct meaningful effects | Authorized Operator/Admin | Event, actor, time, operation/correlation ID | Recorded, rejected, unknown, reconciled | Audit, Agent Runs | FR-03/07; trace |
| Integration Status | Show provider readiness | Admin | Channel, LIVE/MOCK/SANDBOX, last result | Connected, pending, expired, failed | Integrations | FR-02; D03 |
| Permission Error | Explain safe refusal | Staff/Customer as applicable | Safe reason code, scope | Denied, not accessible, expired | Protected screens, Channel | FR-01/07; access |
| Dependency Error | Distinguish outage from empty | Staff/Customer as applicable | Source, safe retry guidance | Unavailable, rate-limited, recovered | Conversations, Integrations, Analytics | FR-02/04/09; outage |
| Stale State Warning | Require fresh review | Operator/Owner | Expected/actual version, observed time | Stale, refreshing, resolved | Orders, Escalations, Settings | FR-07/10; concurrency |
| Empty State | Show valid absence | Staff/Owner | Query scope/filters | Valid empty, initial/no items | Lists, Analytics, Documents | FR-04/09; no results |
| Loading State | Show ongoing request | All | Operation/route context | Loading, delayed, transitioned | All relevant surfaces | FR-04/07/09/10; waiting |

## 2B.14 Screen Gaps / Redundancies

**Gap result:** no new *staff* screen family is established beyond the master's fifteen. However, the register needs explicit coverage of the **customer Web Chat/channel experience**, plus order-versus-reservation detail, delivery status, and reconciliation states. These can be attached to registered families or channel UI; they are not automatically new pages. The older seven-surface proposal under-specifies Overview, separate Customers/Orders/Products/Inventory, Forecasts, Documents, Agent Runs, Escalations, Integrations and Audit; it must not be used as a final screen count. Conversely, master screen families do not require fifteen sidebar entries.

| Candidate overlap / gap | Evidence | Phase 2C decision to make later |
| --- | --- | --- |
| Conversations ↔ Escalations | Same case, different work ownership/decision state | Queue/filter, detail, linked family, or other placement? |
| Conversations ↔ Agent Runs | Concise live status vs full run chronology | Which event summary is inline, which needs drill-down? |
| Agent Runs ↔ Audit | Execution lifecycle vs durable consequential/security record | How should linked event IDs cross-navigate without duplicating raw logs? |
| Customers ↔ Orders ↔ Products ↔ Inventory | Strong record/task affinity but different data authorities | Which become views/details/tabs versus independent routes? |
| Analytics ↔ Forecasts ↔ Overview | Actual report, predicted result, orientation are semantically distinct | Which surfaces are standalone or embedded, without mixing actual/predicted? |
| Documents ↔ Business Brain | Documents manage unstructured knowledge; Brain is seven-part context | Do not add a giant Brain page solely for architecture symmetry. |
| Integration status ↔ message delivery | Provider health differs from one outbound reply | Where does case-specific delivery failure appear versus admin health? |
| Action/reconciliation detail | Unknown write needs durable operation evidence | Existing Orders/Escalations/Agent Runs/Audit detail or a dedicated detail route? |

**System-only concepts that must not become ordinary product pages by default:**

| Concept | Internal role | Appropriate user-visible representation | Normal standalone UI? |
| --- | --- | --- | --- |
| Adaptive Orchestrator | Routing/control policy | Active specialist, handoff/stop reason, pending state | No. |
| LangGraph | Runtime implementation | Run/handoff outcome only, if relevant | No. |
| Trusted Tool Executor | Authorization/effect boundary | Proposal/result/operation ref and safe reason | No. |
| Redis | Transient state/cache infrastructure | Possibly degraded-service state to staff | No. |
| pgvector | Retrieval infrastructure | Knowledge source/provenance and availability | No. |
| MinIO/S3 | Private object storage | Document version/publication/status | No. |
| PrincipalContext | Trusted identity/scope projection | Effective access/denial where applicable | No. |
| ContextBundle | Seven-part scoped context | Task-relevant facts, knowledge, rules, runtime state | No automatic standalone page. |
| Research architecture mode switching | Controlled experimental variable | Restricted run metadata/runner control outside normal UX | No production customer/owner page. |

## 2B.15 Inputs for Phase 2C

- Treat the master's fifteen screen families as coverage obligations, then decide which are routes, details, tabs, panels, drawers, modals or inline states; a route register is not a sidebar specification.
- Preserve actor separation: customer channel/Web Chat, Operator work, Owner business insights, Administrator configuration, restricted research/ops traces. Channel Provider has no dashboard persona.
- Keep context and trusted effects near the case **enough to avoid losing continuity**, while placing detailed run/audit evidence behind permissioned inspection. The exact placement needs workflow testing.
- Customers, Orders, Products and Inventory have record affinity; Analytics and Forecasts have different epistemic status; Agent Runs and Audit have different time/evidence purposes. These are grouping inputs, not approved navigation.
- Make escalation, `OUTCOME_UNKNOWN` reconciliation and delivery failure discoverable from the affected case. Decide whether each needs a route or a contextual detail state after scenario walkthroughs.
- Test the full purchase/partial-reservation, Support → Sales denial, operator stale-resume, and `MODEL_NOT_READY` paths before reducing screen families or approving navigation.
- Use [SleekFlow/CareHub/respond.io](UX_COMPETITOR_ANALYSIS.md) for conversation-context/human-ownership patterns, Sintra/Vendasta for specialist legibility, and aspanCRM/HighLevel for action feedback **only as secondary UX references**. Do not copy their IA or infer our capabilities from theirs.

## 2B.16 Open UX Questions

1. Which customer-channel capabilities can be shown in native Instagram/WhatsApp/Telegram messages versus the planned Web Chat, given provider constraints and the current absence of live adapters?
2. Which staff roles may view customer/order detail, Agent Runs and Audit, and how will cross-business access denial be worded without leaking existence?
3. Which exact business measures, currencies, report scopes and forecast target/horizon are approved? What is the definition of valid empty versus incomplete data?
4. What purchase confirmation fields and expiry/version rules must the customer see before `create_order` and `reserve_inventory`?
5. What owner-approved E02 `update_order` transitions, if any, will become permitted? Until then, how should denied changes route to human handling?
6. Who can claim, approve, reject, clarify, resume and close each escalation type, and what revision/assignment feedback is required? M12 remains unbuilt.
7. Which reconciliation information can Operators see and act on for `OUTCOME_UNKNOWN`, and which checks are technical/admin-only? No blind retry is allowed.
8. Which document formats and publication/revocation actions will the frontend actually support? M07 currently proves only text/plain UTF-8 parsing.
9. What summary of a run belongs beside the conversation, and what deeper evidence belongs in Agent Runs or Audit? What retention/redaction rules apply?
10. Which of the fifteen families are standalone, grouped, contextual or research-only in the final IA? This is **Phase 2C**, not a Phase 2B decision.
11. Which target languages, devices and accessibility acceptance details govern customer Web Chat and staff workflows?

## 2B.17 Phase 2B Conclusion

The current master yields **five external actors**, **eleven functional requirements**, **fifteen validated screen families**, **three core specialists**, and **exactly ten canonical business tools**. The functional UX contract is not a list of menu items: it is the ability to see authorized, sourced facts; distinguish proposal from trusted effect; distinguish order creation from inventory reservation; understand handoff and human ownership; and preserve known failure, pending delivery, `OUTCOME_UNKNOWN`, reconciliation and `MODEL_NOT_READY` as truthful states. The Adaptive Orchestrator, Business Brain, executor and infrastructure remain internal abstractions with selective task-relevant projections. No hidden chain-of-thought or new agent/tool is required.

**Phase boundary:** the screen-family validation, flow checks, component inventory and comprehensive matrix above provide evidence for Phase 2C information architecture. They do **not** finalize navigation, layouts, wireframes, visual design, Figma or frontend implementation. The engineering and scientific status remains as stated in §2B.0; no UX specification is evidence of a passed M08 gate or a completed experiment.
