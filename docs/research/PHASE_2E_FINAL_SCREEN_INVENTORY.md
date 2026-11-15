# Phase 2E — Final Screen Inventory

## 2E.0 Scope and Source Authority

This is the **final functional screen inventory for Phase 3A**, not an implemented UI, visual design, route implementation or usability result. Primary authority is the [final consolidated master PDF](../../research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf), especially FR-01–FR-11 (physical pp. 32–34), D03–D11, security (p. 106), frontend contract (pp. 115–116) and current evidence (pp. 301–303). The [Phase 2D flows](PHASE_2D_CORE_USER_FLOWS.md) govern behavior; the [Phase 2C IA](PHASE_2C_INFORMATION_ARCHITECTURE.md) governs placement/navigation; [Phase 2B validation](PHASE_2B_UX_VALIDATION.md) governs actor, requirement and state coverage. [Competitor research](UX_COMPETITOR_ANALYSIS.md) is secondary interaction evidence; [DESIGN](../DESIGN.md) is a working summary. Older proposals cannot override the master or completed phases.

The fifteen master staff families are specified in §§2E.3–2E.17; Web Chat is the separate customer surface in §2E.18. List/detail or queue/detail views are **within their family**, not new primary families. Conceptual Phase 2C routes are references, not frozen URL syntax. No Business Brain, Orchestrator, Tool Executor, experimental-mode, agent-roster or reconciliation page is introduced. This specification freezes screen responsibility, data, actions, semantic states and cross-links; it does not freeze colors, typography, spacing, dimensions, component styling or layout. Current evidence: no working frontend or live channels; E02 `update_order` mutation denied; M12 durable resume not built; M13 forecast artifact absent and `forecast_sales` returns `MODEL_NOT_READY`.

## 2E.1 Screen Specification Principles

1. A screen presents only the active business's authorized facts. A visible route/CTA never grants permission; every read and write is rechecked server-side at resource/action time.
2. The browser owns selection and unsent drafts; the backend owns business effects, permissions and pending operations. A tool proposal, tool attempt, accepted command, confirmed effect and delivered message are different facts.
3. Every family must support loading, valid empty where meaningful, success, known failure, denied/inaccessible, dependency failure, stale and pending states. `OUTCOME_UNKNOWN` is required only where a mutation or linked mutation can be uncertain; “N/A” below gives a reason.
4. Required information names business/system concepts, not invented database columns. Source, observed time, version and completeness appear where they affect trust or a decision; no numerical freshness TTL is invented.
5. Each family has **one primary action category per current task state**; secondary actions may be available. Action categories are functional, not final button copy or visual hierarchy.
6. Staff sees concise authorized agent/tool evidence appropriate to the task; detailed traces are restricted to Agent Runs. Customers never receive tool schemas, hidden chain-of-thought, raw prompts, secrets or broad staff context.
7. The first Phase 3A wireframes must include failure, denial, stale, pending, reconciliation and delivery states alongside happy paths. The UI semantics here are design-only until implemented and tested.

**Unchanged agent/tool boundary:** Sales may propose `find_product`, `check_inventory`, `find_customer`, `get_order`, `create_order`, `update_order`, `reserve_inventory`; Support may propose `check_inventory`, `find_customer`, `get_order`, `get_delivery_status`; Analytics may propose `get_sales_report`, `forecast_sales`. These are the exact ten unique canonical business tools. The trusted executor still checks principal, business, resource, state and policy; E02 `update_order` mutation currently remains denied. Staff workflow APIs for documents, decisions, settings and integrations are not new agent tools.

## 2E.2 Global Application Shell Requirements

The staff shell exposes the **current business/tenant scope**, effective role/capabilities, page/context title, and Phase 2C's role-filtered primary navigation: Overview, Conversations, Business, Knowledge, Analytics, Administration. Nested destinations remain as approved. Authentication is outside the shell; Web Chat has its own customer context. The shell must support a safe return to the originating case/record/filter, distinguish unsent drafts from delivered messages, and show global notifications only for actionable scoped events (for example assigned escalation or confirmed operation status), not as a replacement for the source screen.

On session expiry, protect content, request reauthentication and return to a permitted destination without replaying a write. During route loading, do not expose prior-screen data as if it belongs to the new resource. On business switch, clear prior-tenant query caches, subscriptions, selected records, previews and sensitive drafts **before** new business data renders; an unsent draft remains isolated to its original scope. A deep link resolves scope through the backend and may be denied. The exact tenant-switch control, shell placement and notification appearance are intentionally not specified. Keyboard navigation, semantic labels, focus restoration and non-color-only state text are functional acceptance needs (master p. 115).

## 2E.3 Authentication

### Screen: Authentication

#### Classification

AUTHENTICATION; outside staff primary navigation. The Keycloak-hosted portion may supply the actual sign-in UI.

#### Primary actor(s)

Owner, Operator, Platform Administrator.

#### Secondary actor(s)

Identity provider and backend session/scope resolver (systems, not UI users).

#### Purpose

Establish a verified staff identity and active authorized business scope before protected work.

#### User questions answered

“Am I signed in?” “Which business may I access?” “Why did my session end?”

#### Entry points

Sign-in, expired session, protected deep link or business-scope revalidation.

#### Exit / contextual navigation

Return only to an authorized intended destination; otherwise role-appropriate landing. No automatic write replay.

#### Phase 2D flows using this screen

Gate for Flows 01–10 on staff surfaces; not Customer Web Chat authentication.

#### Required data

Session/authentication state, permitted business memberships, effective role/capabilities and safe return reference; never raw token values.

#### Primary task

Authenticate or reauthenticate and enter a permitted business context.

#### Primary action(s)

AUTHENTICATE / REAUTHENTICATE; select a permitted business scope only when needed.

#### Secondary action(s)

Cancel safe return or seek access help; no account-management feature is invented.

#### Read-only information

Current safe identity/scope and reason for expiry/denial, without disclosing foreign resources.

#### Functional components

Session gate, business context indicator, safe error/denial message and return-context resolver.

#### AI / agent visibility

NONE; agent work cannot establish staff identity.

#### Tool visibility

NONE; login is not an agent-tool operation.

#### Required states

Unauthenticated, authenticating, authenticated/scoped, expired, forbidden, IdP unavailable.

#### Loading state

Identity/session verification in progress; protected content remains hidden.

#### Empty state

No permitted business membership: explicit no-access outcome, not an empty workspace.

#### Success state

Trusted principal and active scope confirmed; safe destination loaded.

#### Known failure state

Invalid credentials/token or rejected scope; retry through approved identity flow.

#### Authorization state

Valid login without resource membership remains forbidden; foreign record existence is not revealed.

#### Dependency failure state

Keycloak/JWKS/session service unavailable; fail closed with retry guidance.

#### Stale state

Expired/revoked session or changed membership requires revalidation before action.

#### Pending state

Authentication callback or scope resolution pending; no business result implied.

#### OUTCOME_UNKNOWN behavior

N/A for login itself: it performs no business mutation. If reauth interrupted a write, preserve that write's separate unknown/pending state and do not replay it.

#### Human escalation behavior

Access dispute goes to authorized access administration, never a bypass of backend policy.

#### Permissions / access notes

Keycloak identity plus backend membership/resource checks; Customer Web Chat uses a separate server-bound channel identity.

#### Freshness requirements

Recheck session, membership and active business on protected navigation/action; no fixed refresh interval asserted.

#### Related requirements

FR-01; master security/frontend pp. 106, 115–116.

#### Related tools

None of the ten agent tools.

#### Related agents

None.

#### UX risks

Treating login as universal authorization, leaking a foreign record via return URL, or replaying a write after reauth.

#### Blockers / unresolved questions

Exact IdP-hosted versus app-owned sign-in composition and staff business-selection policy need implementation-level agreement; no visual form is frozen.

## 2E.4 Overview

### Screen: Overview

#### Classification

PRIMARY WORKSPACE; role-scoped orientation, not a second Analytics screen.

#### Primary actor(s)

Business Owner.

#### Secondary actor(s)

Operator only if a workload-specific Overview is explicitly granted; Administrator does not inherit Owner data.

#### Purpose

Show authorized work that needs attention and direct the user to authoritative destinations.

#### User questions answered

“What needs attention now?” “Where can I inspect the underlying report, order or case?”

#### Entry points

Role-visible top-level Overview or safe landing after staff authentication.

#### Exit / contextual navigation

Analytics/Forecasts, Conversations/Escalations and authorized Orders; links retain business scope and return context.

#### Phase 2D flows using this screen

Flows 02, 07 and 08; Flow 06 only through an authorized pending-work summary.

#### Required data

Active business, defined observed business summaries, pending/assigned work counts or status where authorized, source/period/freshness and forecast readiness—not invented revenue formulas.

#### Primary task

Choose the next actionable destination from a truthful summary.

#### Primary action(s)

NAVIGATE to the selected authoritative task/report.

#### Secondary action(s)

Change supported period/scope filter or refresh a summary.

#### Read-only information

Scoped high-level summaries and attention indicators; full report/decision belongs in Analytics/Escalations.

#### Functional components

Business context, attention summary, metric summary, freshness/provenance, contextual link and shared state messages.

#### AI / agent visibility

SUMMARY only if a scoped case/forecast availability needs explanation; no agent-control console.

#### Tool visibility

BUSINESS RESULT ONLY; no raw report tool/operation trace on the overview.

#### Required states

Current, valid no activity, partial/stale, pending work, source unavailable, access restricted.

#### Loading state

Summary data loading with no prior-business figures shown as current.

#### Empty state

Valid no matching work/data for selected scope/period, distinguished from outage.

#### Success state

Defined summary with source, period and direct link to detail.

#### Known failure state

Invalid period/filter or unsupported summary type; retain a correctable selection.

#### Authorization state

Omit unauthorized cards and deny protected deep links server-side; Operator variant must not expose Owner-only aggregates.

#### Dependency failure state

Affected summary unavailable; do not fill with zero or previous tenant's value.

#### Stale state

Show observed time and require refresh before using a summary to justify an action.

#### Pending state

Show pending case/order/forecast availability as pending, not completed.

#### OUTCOME_UNKNOWN behavior

Only a linked status summary may indicate reconciliation needed; detailed effect and safe next step live in Order/Conversation/Escalation.

#### Human escalation behavior

Link an authorized attention item to Escalations; do not decide from Overview.

#### Permissions / access notes

Role- and business-scoped aggregation; Administrator has no default Owner overview.

#### Freshness requirements

Each summary states its observation/period; a changed business invalidates all prior cards.

#### Related requirements

FR-01, FR-04, FR-09, FR-10; master frontend p. 115.

#### Related tools

`get_sales_report` may indirectly underpin a defined actual summary; `forecast_sales` is not silently invoked to fill a card.

#### Related agents

Analytics indirectly for owner report status; Sales/Support only through authorized case status.

#### UX risks

Duplicate Analytics dashboard, undefined KPI, owner/operator data leakage or a pending effect presented as success.

#### Blockers / unresolved questions

Approved metric formulas and whether Operators receive a workload-only Overview remain open.

## 2E.5 Conversations

### Screen: Conversations

#### Classification

PRIMARY WORKSPACE with a scoped collection and directly linkable conversation detail.

#### Primary actor(s)

Human Operator.

#### Secondary actor(s)

Authorized Owner case viewer; Customer is on a separate channel, not this staff screen.

#### Purpose

Triage and handle customer requests while seeing verified context, current owner and truthful action/communication outcomes.

#### User questions answered

“Which case needs my response?” “Who is handling it?” “What was verified, changed or left pending?”

#### Entry points

Top-level Conversations queue, assigned case link, Escalation, Customer/Order or permitted Agent Run.

#### Exit / contextual navigation

Customers, Orders, Products/Inventory, nested Escalations, contextual Agent Run and cited Document; return to same case/filter/draft.

#### Phase 2D flows using this screen

Flows 01–06 and case-specific delivery impact from Flow 10.

#### Required data

Scoped conversation list/status/channel/assignee, messages and delivery status, verified Customer/Order/Product/Inventory references, evidence/source time, agent/human owner, handoff history, business-action statuses and related escalation/run IDs.

#### Primary task

Resolve or safely advance one assigned customer conversation.

#### Primary action(s)

SEND MESSAGE when Operator owns the case; otherwise TAKE OVER or NAVIGATE to required Escalation according to current state/policy—not simultaneous competing write controls.

#### Secondary action(s)

Search/filter/select case; inspect authorized records/source/run; request clarification; open escalation; preserve an unsent draft.

#### Read-only information

Trusted action result, source, observed time, current agent, handoff reason, prior attempts and separate outbound message status.

#### Functional components

Conversation list/thread/composer, customer/order/product/inventory summaries, active-agent and handoff events, evidence/tool-result summary, pending/reconciliation warning and delivery status.

#### AI / agent visibility

SUMMARY: named current/previous specialist, handoff reason, waiting/paused/finished state and grounded outcome; no hidden reasoning.

#### Tool visibility

STAFF SUMMARY: permitted operation name/category, proposed/admitted/result and safe evidence reference; detailed authorized trace lives in Agent Runs.

#### Required states

Unassigned/assigned, AI active, human-owned, clarification, handoff, waiting human, confirmed effect, partial effect, `OUTCOME_UNKNOWN`, delivery pending/failed, closed.

#### Loading state

Queue/detail loading preserves selection context but does not display a previous case as the newly selected one.

#### Empty state

Valid no conversations for scope/filter; distinct from inbox dependency failure.

#### Success state

Grounded answer or confirmed exact business effect shown with separate message-delivery status.

#### Known failure state

Known rejected tool/business action or failed send is labelled by type; draft/reply can be corrected without replaying a committed business action.

#### Authorization state

Case/customer/order access rechecked; inaccessible protected records yield privacy-safe denial and no leaked preview.

#### Dependency failure state

Channel, record or agent source unavailable is shown as unavailable/pending, not “no messages” or “no order.”

#### Stale state

Record previews show observation/version; consequential action requires current authoritative fetch.

#### Pending state

Receipt, agent processing, human assignment, business write and delivery are labelled separately.

#### OUTCOME_UNKNOWN behavior

Show the affected operation as possible commit, disable blind repeat, link to Order/Agent Run and reconciliation-needed Escalation.

#### Human escalation behavior

Case shows reason/assignee/status and links to nested Escalation detail; takeover pauses AI reply ownership under policy, not executor guards.

#### Permissions / access notes

Operator case assignment and business/record scope govern actions; owner/admin visibility is explicitly granted, never inferred from role title.

#### Freshness requirements

Message, Order, stock and delivery evidence show separate times; refresh linked facts after navigation or handoff.

#### Related requirements

FR-01–FR-08 and FR-10 where relevant; D03/D05/D11, master frontend pp. 115–116.

#### Related tools

Indirect Sales `find_product`, `check_inventory`, `find_customer`, `get_order`, `create_order`, `update_order` (E02 denied), `reserve_inventory`; Support `check_inventory`, `find_customer`, `get_order`, `get_delivery_status`.

#### Related agents

Sales and Support; Analytics is not a customer-case specialist by default.

#### UX risks

Proposed action mistaken for committed effect, delivery failure triggering duplicate mutation, leaked protected context, or handoff losing ownership.

#### Blockers / unresolved questions

Live channels/M08, exact takeover/assignment policy, E02 and reconciliation contract remain unresolved.

## 2E.6 Escalations

### Screen: Escalations

#### Classification

OPERATIONS QUEUE: dedicated queue and case detail **nested under Conversations**.

#### Primary actor(s)

Assigned or authorized Human Operator.

#### Secondary actor(s)

Owner/Admin only with explicit case-level access; no default platform-admin business access.

#### Purpose

Make stopped/uncertain work findable, reviewable and safely decidable without losing prior effects.

#### User questions answered

“Why did automation stop?” “What is already confirmed or unknown?” “Which decision is allowed now?”

#### Entry points

Conversations → Escalations queue, case status, permitted Order/Agent Run link or scoped notification.

#### Exit / contextual navigation

Return to same Conversation/queue filter; inspect Customer/Order/Agent Run/Audit event if granted, then revalidate case revision.

#### Phase 2D flows using this screen

Flows 01–06; Flow 09 only for an authorized source-processing/publication incident.

#### Required data

Queue case ID, reason, assignment/status, waiting age where available, affected business object, verified facts and provenance, completed/failed/pending/unknown operations, current permissions/policy, requested decision, revision and audit refs.

#### Primary task

Review one escalation and choose an allowed safe disposition.

#### Primary action(s)

APPROVE only where policy permits, REJECT, REQUEST CLARIFICATION, RESUME safely or CLOSE; one context-dependent decision category at a time, guarded by current case state.

#### Secondary action(s)

Search/filter/assign eligible cases; inspect linked evidence and return; no generic retry button.

#### Read-only information

Handoff summary, trusted effects, unknown-effect guard, previous decisions, next owner, revision and source times.

#### Functional components

Escalation queue item/context, evidence timeline, human decision form, resume guard, reconciliation warning and contextual links.

#### AI / agent visibility

SUMMARY: paused specialist, handoff reason, remaining task and bounded status; no chain-of-thought.

#### Tool visibility

STAFF SUMMARY of prior attempts/results and effect refs; Agent Runs provides DETAILED AUTHORIZED TRACE when granted.

#### Required states

Unassigned, assigned, waiting decision, clarification, approved/rejected/closed, stale, permission changed, resume pending/blocked, `OUTCOME_UNKNOWN`/reconciliation.

#### Loading state

Queue/detail and current decision eligibility loading; no actionable decision until rights/revision verified.

#### Empty state

No eligible cases for filter/business, distinct from assignment/dependency outage.

#### Success state

Decision durably recorded and next state truthfully shown; business success only after a separately trusted effect.

#### Known failure state

Invalid/stale/duplicate decision, policy denial or known resume failure, with a safe refresh or reassignment path.

#### Authorization state

Assignment, role, tenant and current policy checked at submit; denial hides foreign case details.

#### Dependency failure state

Decision/resume service unavailable leaves case pending with no success claim.

#### Stale state

Changed case/business revision forces reload and new review before decision or resume.

#### Pending state

Waiting assignment, human response, clarification, reconciliation or resumed work remain separate.

#### OUTCOME_UNKNOWN behavior

Show possible committed effect and operation ref; block approve/resume/retry of that mutation until authoritative reconciliation.

#### Human escalation behavior

This is the human work surface: approve/reject/clarify/close or safe resume only after backend rechecks rights, policy, versions and budget. M12 durable resume remains design-only.

#### Permissions / access notes

Operator must be authorized for case/business and decision; E02 denial is not overridable by a human click.

#### Freshness requirements

Reload current evidence and expected revision after returning from any linked record; show case age without inventing SLA.

#### Related requirements

FR-01, FR-03, FR-04, FR-07, FR-08, FR-10; D11/V04.

#### Related tools

No new agent tool; resumed specialist remains limited to its existing allowlist and trusted executor.

#### Related agents

Sales or Support may be paused/resumed; Analytics escalation only where an authorized analytics incident requires a person.

#### UX risks

Approval mistaken for effect, stale decision submission, duplicate resume, or unknown write replay.

#### Blockers / unresolved questions

M12 implementation, operator assignment/SLA, allowed decision policy and reconciliation readiness.

## 2E.7 Customers

### Screen: Customers

#### Classification

ENTITY LIST and ENTITY DETAIL within Business → Customers; concise case preview is not a third route.

#### Primary actor(s)

Authorized Operator.

#### Secondary actor(s)

Owner with business-record grant.

#### Purpose

Verify a Customer's scoped identity and relationships without duplicating conversation or order workspaces.

#### User questions answered

“Is this the right Customer?” “Which permitted conversations and Orders relate to them?”

#### Entry points

Business → Customers list/search; Conversation, Order or Escalation link.

#### Exit / contextual navigation

Permitted Conversations and Orders; return to originating case/filter with identity context.

#### Phase 2D flows using this screen

Flows 01–06 as identity/context support.

#### Required data

Business-scoped Customer identity and verification state, permitted channel identity links, recent conversation/Order references, relevant history and provenance—not unrestricted PII.

#### Primary task

Find and inspect the verified Customer record needed for a current case.

#### Primary action(s)

SEARCH/FILTER in list; NAVIGATE to authorized Customer detail.

#### Secondary action(s)

Open related case/Order; return to original work context.

#### Read-only information

Identity linkage/verification, scoped relationship summaries and observed time; full dialogue/order action lives elsewhere.

#### Functional components

Scoped entity search/list, Customer summary/detail, identity/permission status, related-record links and provenance.

#### AI / agent visibility

NONE in list; SUMMARY of case link only if it explains a verified identity association.

#### Tool visibility

BUSINESS RESULT ONLY for authorized `find_customer` outcome; no raw lookup arguments/trace.

#### Required states

Matched, multiple/verification needed, valid no match, inaccessible, stale link, source unavailable.

#### Loading state

List/detail lookup pending; prior Customer detail is not displayed as the new selection.

#### Empty state

Valid no Customer matches within permitted scope; distinct from forbidden or outage.

#### Success state

Verified scoped identity and permitted relationships with links to authoritative detail.

#### Known failure state

Ambiguous identity or invalid search/reference prompts refinement; no protected Order data is exposed.

#### Authorization state

Customer and linked Order access checked separately; no foreign existence disclosure.

#### Dependency failure state

Identity/record source unavailable; no “not found” conclusion.

#### Stale state

Identity link or relationship changed; refresh before disclosure/decision.

#### Pending state

Verification or linkage unresolved; case may wait for clarification.

#### OUTCOME_UNKNOWN behavior

N/A to this read-only family; related Order possible-commit status appears by link without being relabelled.

#### Human escalation behavior

Ambiguous/disputed identity routes through the existing case/Escalation; Customer detail does not authorize an Order change.

#### Permissions / access notes

Business scope, Customer ownership and per-record grant; channel identifier alone is not proof of identity.

#### Freshness requirements

Show verification/relationship observed time where consequential; revalidate on deep link.

#### Related requirements

FR-01, FR-04, FR-06, FR-07; master security p. 106.

#### Related tools

`find_customer` indirectly, within Sales/Support permissions.

#### Related agents

Sales and Support indirectly; no agent controls this staff record view.

#### UX risks

Cross-business leak, unverified identity presented as proven, or duplicated Order/Conversation controls.

#### Blockers / unresolved questions

Exact customer-linking/verification policy and PII visibility by role need approval.

## 2E.8 Orders

### Screen: Orders

#### Classification

ENTITY LIST and authoritative ENTITY DETAIL within Business → Orders.

#### Primary actor(s)

Authorized Operator.

#### Secondary actor(s)

Owner with business-record grant.

#### Purpose

Show the true Order and separate reservation/operation outcomes, including partial and uncertain cases.

#### User questions answered

“Does the Order exist?” “Was stock reserved?” “Which operation is still pending or unknown?”

#### Entry points

Business → Orders list/search; Conversation, Customer, Escalation, Agent Run or authorized report drilldown.

#### Exit / contextual navigation

Customer, Product, Inventory, originating Conversation/Escalation, permitted Agent Run/Audit event; return to same Order/version.

#### Phase 2D flows using this screen

Flows 02–06 and authorized drilldown from Flow 07.

#### Required data

Scoped Order identity, Customer link, items/quantities, approved domain state/version, `create_order` operation evidence, **separate** reservation state/ref, known failure/unknown status, provenance and timestamps.

#### Primary task

Inspect current Order and reservation truth before responding or deciding.

#### Primary action(s)

SEARCH/FILTER in list; NAVIGATE to detail. A business mutation CTA appears only if an independently approved contract permits it; current E02 `update_order` is not enabled.

#### Secondary action(s)

Inspect linked Customer/Product/Inventory/case/run/audit; refresh current state or route unresolved work to Escalations.

#### Read-only information

Created Order, reservation receipt or failure, version, operation history and delivery-status reference if available; no invented payment/refund lifecycle.

#### Functional components

Order list/detail, distinct Order/reservation status group, operation/evidence timeline, stale warning, reconciliation warning and contextual links.

#### AI / agent visibility

SUMMARY of Sales/Support involvement only when linked to an Order case; Order truth comes from domain state.

#### Tool visibility

STAFF SUMMARY of `create_order` versus `reserve_inventory` result and `update_order` policy denial; detailed trace via authorized Agent Run.

#### Required states

Order exists, reservation pending/confirmed/rejected/failed, NEEDS_ATTENTION where approved, stale/conflict, operation pending, `OUTCOME_UNKNOWN`, inaccessible.

#### Loading state

List/detail loading; no optimistic “created/reserved” status before trusted result.

#### Empty state

Valid no Orders for authorized filter; distinct from inaccessible specific Order.

#### Success state

Exact confirmed Order and, independently, confirmed reservation status with separate evidence.

#### Known failure state

Known create rejection or known reserve shortage/failure; a created but unreserved Order stays visible as partial.

#### Authorization state

Backend verifies business/Customer/Order scope for detail and any operation; foreign ID yields safe inaccessible result.

#### Dependency failure state

Order/Inventory source unavailable; do not infer absent Order or released reservation.

#### Stale state

Version/stock conflict requires refetch and new review before any supported mutation.

#### Pending state

Order-create, reservation, reconciliation and outbound communication pending are separate states.

#### OUTCOME_UNKNOWN behavior

Identify which operation may have committed; lock duplicate write, show reconciliation owner/ref and do not claim either success or rollback.

#### Human escalation behavior

Partial/unknown/denied change links to case/Escalation with known effects and unresolved operation; no hidden compensation or E02 bypass.

#### Permissions / access notes

Record ownership, agent allowlist, current policy and executor checks remain authoritative; staff viewing an Order does not gain an edit right.

#### Freshness requirements

Show Order version and observed time; refresh before consequential decision and after returning from Inventory/case.

#### Related requirements

FR-01, FR-03, FR-04, FR-06, FR-07, FR-10; D04/V04 and E02.

#### Related tools

`get_order`, `create_order`, `reserve_inventory`; `update_order` exists in registry but current E02 mutation is policy-denied. `check_inventory` is supporting evidence.

#### Related agents

Sales for permitted write proposals; Support for read-only Order help.

#### UX risks

Order existence mistaken for stock hold, duplicate mutation after timeout, phantom refund/update action or status derived from an undelivered reply.

#### Blockers / unresolved questions

E02 policy, partial-order recovery, unknown-effect reconciliation and exact approved Order lifecycle/field definitions.

## 2E.9 Products

### Screen: Products

#### Classification

ENTITY LIST and ENTITY DETAIL within Business → Products.

#### Primary actor(s)

Authorized Operator.

#### Secondary actor(s)

Owner with catalog access.

#### Purpose

Expose authoritative catalog identity and product/variant facts without implying availability.

#### User questions answered

“Which product/variant matches?” “What are its current catalog facts?” “Where is its stock status?”

#### Entry points

Business → Products list/search; Conversation, Order or Inventory link.

#### Exit / contextual navigation

Inventory detail/status, related authorized Orders and originating case; preserve selected product context.

#### Phase 2D flows using this screen

Flows 01 and 02; Flow 05 only through an authorized sales-context link.

#### Required data

Scoped product/variant identifier, description and approved price/source/version where available, relation to inventory and cited Order items; no stock value inferred from catalog presence.

#### Primary task

Identify a product/variant reliably for a customer question or purchase.

#### Primary action(s)

SEARCH/FILTER product list; NAVIGATE to matching detail.

#### Secondary action(s)

Open current Inventory, related Order or return to Conversation.

#### Read-only information

Catalog facts with source/version and separate link to operational stock.

#### Functional components

Scoped entity search, Product summary/detail, match/variant clarification, provenance and Inventory link.

#### AI / agent visibility

NONE in list; case-linked Sales summary only if relevant to a specific product choice.

#### Tool visibility

BUSINESS RESULT ONLY for indirect `find_product`; no agent invocation control.

#### Required states

One match, ambiguous/multiple, valid no match, stale catalog fact, denied, catalog source unavailable.

#### Loading state

Search/detail loading without treating old results as current for new query.

#### Empty state

Valid no product match; offer query refinement, not an outage conclusion.

#### Success state

Identified product and variant facts with source; stock remains a separate inquiry.

#### Known failure state

Invalid filter or unsupported variant; prompt correction.

#### Authorization state

Only scoped catalog records; a foreign/private product detail is inaccessible.

#### Dependency failure state

Catalog lookup unavailable; do not show “product absent.”

#### Stale state

Price/catalog version old; require refresh before quote confirmation.

#### Pending state

Clarification or refresh pending; no order/reservation implied.

#### OUTCOME_UNKNOWN behavior

N/A to read-only catalog; linked purchase status belongs to Orders/Conversation.

#### Human escalation behavior

Conflicting catalog/price evidence can be routed through the case; Product detail offers no unsupported write.

#### Permissions / access notes

Tenant/record scope applies to search and deep links; operator visibility does not imply catalog-edit authority.

#### Freshness requirements

Show source/version/observed time for price and variant facts; refresh before purchase.

#### Related requirements

FR-01, FR-04, FR-06, FR-07; D04.

#### Related tools

`find_product`; `check_inventory` only through separately authorized stock lookup.

#### Related agents

Sales indirectly.

#### UX risks

Catalog existence or description treated as current stock, ambiguous SKU chosen silently or stale price treated as offer.

#### Blockers / unresolved questions

Approved price/version/variant semantics and catalog editing scope are not fixed by 2E.

## 2E.10 Inventory

### Screen: Inventory

#### Classification

ENTITY LIST/OVERVIEW and item-scoped ENTITY DETAIL within Business → Inventory.

#### Primary actor(s)

Authorized Operator.

#### Secondary actor(s)

Owner with inventory access.

#### Purpose

Show observed operational stock and separate reservation evidence for a product/variant.

#### User questions answered

“What stock was observed, when?” “Is there a confirmed reservation?” “Must availability be revalidated?”

#### Entry points

Business → Inventory list/search; Product, Order or Conversation stock link.

#### Exit / contextual navigation

Product/variant, Order reservation and originating case; return with item reference, not stale permission.

#### Phase 2D flows using this screen

Flows 01, 02 and 05.

#### Required data

Business/item/variant scope, known quantity including zero, source/version/observed time, reservation result/ref where relevant and conflicting/unavailable markers.

#### Primary task

Verify current enough stock/hold evidence for a response or decision.

#### Primary action(s)

SEARCH/FILTER item list; NAVIGATE/REFRESH the item stock context.

#### Secondary action(s)

Open Product, affected Order/operation or return to case.

#### Read-only information

Observed stock and separate confirmed hold status; RAG descriptions are not inventory truth.

#### Functional components

Scoped stock list/detail, Inventory Status, freshness/provenance, reservation reference and stale/conflict warning.

#### AI / agent visibility

NONE; availability is a trusted business fact, not model confidence.

#### Tool visibility

BUSINESS RESULT ONLY for `check_inventory`; reservation operation summary may link to Order/Agent Run.

#### Required states

Known positive quantity, known zero, stale, conflicting/revalidation needed, unavailable source, denied, reservation pending/confirmed/failed/unknown where linked.

#### Loading state

Stock lookup pending; previous quantity not shown as current for a newly selected item.

#### Empty state

No matching inventory record is distinct from a known zero quantity.

#### Success state

Known scoped quantity and observation time; a hold is shown only with its own confirmed receipt.

#### Known failure state

Invalid item reference or known insufficient stock; no reservation claim.

#### Authorization state

Tenant/product scope checked for record and linked hold; inaccessible item not disclosed.

#### Dependency failure state

Inventory source unavailable; state is unknown, not zero.

#### Stale state

Observed quantity is labelled stale; refresh/current version needed before reserve decision.

#### Pending state

Refresh or linked reservation underway; quantity observation is not a hold.

#### OUTCOME_UNKNOWN behavior

For a linked `reserve_inventory` attempt, show possible hold and reconciliation link; no blind retry or optimistic stock decrement.

#### Human escalation behavior

Stock conflict/unknown reservation links to Order/Conversation/Escalation for authorized handling.

#### Permissions / access notes

Business/resource scope and trusted executor own stock reads/reservations; this view does not grant a write.

#### Freshness requirements

Always show observed time/version when stock informs purchase; no invented numeric TTL.

#### Related requirements

FR-01, FR-04, FR-06, FR-07; D04/V04.

#### Related tools

`check_inventory` and linked `reserve_inventory` result, not a new inventory tool.

#### Related agents

Sales for purchase and Support for read-only stock checks.

#### UX risks

Zero conflated with source failure, observed availability mistaken for a reservation, or stale quantity used for write.

#### Blockers / unresolved questions

Stock freshness policy and partial/unknown reservation recovery contract.

## 2E.11 Knowledge / Documents

### Screen: Knowledge / Documents

#### Classification

DOCUMENT COLLECTION and DOCUMENT DETAIL/VERSION CONTEXT under the UI area **Knowledge**; master family **Documents**.

#### Primary actor(s)

Authorized Owner/source publisher.

#### Secondary actor(s)

Admin with explicit delegated document permission; Operator may inspect a permitted citation but not manage sources by default.

#### Purpose

Manage scoped source versions so only validated, published, permitted knowledge can support agent answers.

#### User questions answered

“Which version is active?” “Did processing succeed?” “Can this source be published or revoked safely?”

#### Entry points

Knowledge navigation, document list, or permitted citation from Conversation/Agent Run.

#### Exit / contextual navigation

Return to source collection/filter or citing case/run; authorized Audit event for publication/revocation.

#### Phase 2D flows using this screen

Flow 09; indirect evidence for Flows 03/05.

#### Required data

Business/document/version identity, source title/type, processing and embedding status, current publication pointer, publisher/time, ACL/revocation status, safe citation locator and errors; never object secrets.

#### Primary task

Inspect or advance one knowledge version through its authorized lifecycle.

#### Primary action(s)

UPLOAD when adding a source; PUBLISH a READY version or REVOKE an active version only in eligible states, each with explicit version-aware confirmation.

#### Secondary action(s)

Search/filter sources, inspect versions/processing evidence, compare publication status, return to citation.

#### Read-only information

Version timeline, source provenance, current/retired eligibility and processing diagnostics.

#### Functional components

Document collection/item, version status/timeline, publication status/confirmation, evidence reference, safe error and stale/conflict warning.

#### AI / agent visibility

SUMMARY of where an active source was cited, if authorized; no agent configuration or raw Brain console.

#### Tool visibility

NONE for canonical agent business tools. Staff upload/publish/revoke are administrative workflow operations, not an eleventh agent tool.

#### Required states

Uploading, processing, failed, READY/unpublished, published/current, superseded, revoked/retired, permission denied, publication conflict.

#### Loading state

Collection/version load and processing state pending; previous active version remains identified.

#### Empty state

No sources or no versions in authorized scope, distinct from object/index outage.

#### Success state

Validated READY version explicitly published via current-pointer check; retrieval eligibility confirmed separately from upload.

#### Known failure state

Rejected file, parser/embedding failure or stale compare-and-swap; failed V2 does not replace active V1.

#### Authorization state

Read, upload, publish and revoke rights may differ; a citation deep link rechecks ACL/tenant.

#### Dependency failure state

Object/index/processing service unavailable; no READY or published claim without confirmation.

#### Stale state

Active pointer/version changed; refresh before publishing or revoking.

#### Pending state

Upload/process/validation or publication confirmation pending; READY is not published.

#### OUTCOME_UNKNOWN behavior

If a publication/revocation acknowledgement is ambiguous, show current-pointer verification pending and block duplicate transition until checked; do not claim a new active version.

#### Human escalation behavior

Persistent processing, ACL or publication conflict goes to authorized source administrator; no auto-publish of failed content.

#### Permissions / access notes

Business scope, document ACL and publisher role checked on each transition; retrieved document text cannot override policy.

#### Freshness requirements

Show processing time, version/current-pointer time and citation publication status; revocation must invalidate subsequent retrieval.

#### Related requirements

FR-01, FR-03, FR-06, FR-07; D06/D09.

#### Related tools

No canonical agent management tool; RAG retrieval is Business Brain infrastructure, not an added tool.

#### Related agents

Sales/Support may consume authorized published evidence indirectly; Analytics only when relevant and permitted.

#### UX risks

READY mistaken for published, failed version replacing active one, secret locator leak or revoked text appearing current.

#### Blockers / unresolved questions

Accepted file/size policy (current M07 parser supports text/plain UTF-8 only), publishing role and revocation latency.

## 2E.12 Analytics

### Screen: Analytics

#### Classification

ANALYTICS PRIMARY WORKSPACE for observed historical business reports; Forecasts remains a nested separate family.

#### Primary actor(s)

Business Owner.

#### Secondary actor(s)

Staff only with explicit analytics grant; Operator does not inherit Owner aggregates.

#### Purpose

Answer authorized historical sales questions with defined period, metric, completeness and provenance.

#### User questions answered

“What happened in the chosen period?” “How complete/current is this report?” “Can I inspect its source?”

#### Entry points

Top-level Analytics, Overview summary, or safe return from Forecasts.

#### Exit / contextual navigation

Nested Forecasts; authorized supporting Orders/report provenance; return with selected period/metric.

#### Phase 2D flows using this screen

Flow 07; historical context linked from Flow 08.

#### Required data

Business scope, metric definition/unit, period/time zone, supported granularity, actual report values, source/snapshot time, data coverage/completeness and limitations.

#### Primary task

Request and interpret a grounded historical sales report.

#### Primary action(s)

REQUEST REPORT for the chosen valid metric/period.

#### Secondary action(s)

Change filters, inspect source/underlying authorized record, navigate to Forecasts.

#### Read-only information

Observed values, period, source, freshness and descriptive interpretation; no unsupported causal claim.

#### Functional components

Report filter, actual-result view, metric summary, completeness/provenance and state messages.

#### AI / agent visibility

SUMMARY: Analytics Agent may explain grounded result and limits; not a SQL console or model-training UI.

#### Tool visibility

BUSINESS RESULT ONLY for `get_sales_report`, with source and coverage; detailed trace only by special authorization.

#### Required states

Unrequested, loading, actual report ready, valid empty, incomplete/stale, invalid input, denied, dependency unavailable.

#### Loading state

Requested report pending; prior period's values remain clearly labelled as prior, never a new result.

#### Empty state

Valid no qualifying data is not zero sales from an outage and not a failed report.

#### Success state

Actual data with metric, period, unit, source, coverage and caveats.

#### Known failure state

Invalid period/metric or report rejection; correct inputs without inventing values.

#### Authorization state

Owner/business analytics rights checked by backend for report and drilldown separately.

#### Dependency failure state

Report service/source unavailable; keep filters and no replacement zero.

#### Stale state

Snapshot age/partial interval visible; refresh before drawing current operational conclusion.

#### Pending state

Report generation/request pending; no actual values claimed yet.

#### OUTCOME_UNKNOWN behavior

N/A to this read-only report request; a supporting Order's uncertain mutation remains on its own screen.

#### Human escalation behavior

Data-quality discrepancy may be referred to authorized staff; no human-created metric substituted for trusted report.

#### Permissions / access notes

Owner-focused aggregate scope; no Customer-channel access or arbitrary LLM SQL.

#### Freshness requirements

Always state report snapshot/period/completeness; no invented freshness threshold.

#### Related requirements

FR-01, FR-06, FR-07, FR-09; D10 and master frontend pp. 115–116.

#### Related tools

`get_sales_report`; `forecast_sales` belongs to Forecasts.

#### Related agents

Analytics Agent.

#### UX risks

Valid empty conflated with outage, fabricated causal explanation, Owner aggregate leak or forecast blended with actuals.

#### Blockers / unresolved questions

Approved metric formulas, comparison periods and data-completeness policy.

## 2E.13 Forecasts

### Screen: Forecasts

#### Classification

ANALYTICS SECONDARY WORKSPACE nested under Analytics; a detail exists only for a real ForecastRun.

#### Primary actor(s)

Business Owner.

#### Secondary actor(s)

Explicitly authorized analytics staff only.

#### Purpose

Request and inspect a prediction separately from historical actuals, or truthfully show that no model is ready.

#### User questions answered

“What target/horizon was predicted?” “Which data/model produced it?” “Is forecasting currently available?”

#### Entry points

Analytics → Forecasts nested navigation or scoped Overview/Analytics link.

#### Exit / contextual navigation

Historical Analytics for actual comparison; valid ForecastRun detail only after one exists; return with target/horizon.

#### Phase 2D flows using this screen

Flow 08, with Flow 07 as observed-data comparison context.

#### Required data

Business, target/unit, cutoff, horizon, observed historical series where allowed, predicted series/uncertainty when real, model/data version/provenance, ForecastRun ref if persisted, readiness and quality limitations.

#### Primary task

Determine readiness and, when genuinely supported, request an authorized forecast.

#### Primary action(s)

REQUEST FORECAST only when model/data/parameters are eligible; in current `MODEL_NOT_READY` state, NAVIGATE to historical Analytics is the safe active category.

#### Secondary action(s)

Adjust target/horizon, inspect valid provenance/run, compare with actual report.

#### Read-only information

Explicit actual versus predicted labels, cutoff, model/data status and uncertainty; no fabricated ForecastRun.

#### Functional components

Forecast request, readiness state, forecast result, actual-vs-predicted distinction and provenance/limitation information.

#### AI / agent visibility

SUMMARY: Analytics Agent may explain model output/status; it never trains or invents the model in this screen.

#### Tool visibility

BUSINESS RESULT ONLY for `forecast_sales` (currently `MODEL_NOT_READY`), with typed failure/provenance; no raw model internals.

#### Required states

Ready/eligible (future conditional), processing, actual prediction result, `MODEL_NOT_READY` (current), insufficient history, unsupported horizon, model unavailable, timeout, permission failure.

#### Loading state

Eligibility/inference pending; no prior prediction presented as new.

#### Empty state

No prior ForecastRuns is distinct from unavailable model; no phantom detail link.

#### Success state

Only a real validated result shows predicted values, target/cutoff/horizon, uncertainty, model/data versions and run ref.

#### Known failure state

Unsupported input, insufficient history or typed model rejection with corrective guidance.

#### Authorization state

Owner/business forecast right and underlying data scope checked; denied result exposes no model/customer data.

#### Dependency failure state

Model/inference service unavailable or timed out; no numeric substitute.

#### Stale state

Older model/data/cutoff marked; a new request uses current eligible data/artifact.

#### Pending state

Forecast generation/request pending when implemented; current missing-artifact result is `MODEL_NOT_READY`, not indefinite loading.

#### OUTCOME_UNKNOWN behavior

N/A to business mutation: a forecast is analytical output, not Order/Inventory effect. Ambiguous ForecastRun persistence must not create a fabricated link or duplicate result claim.

#### Human escalation behavior

Model/data-quality issue becomes authorized analytics/operations work, not a person inventing predictions.

#### Permissions / access notes

Nested route does not inherit permission from Analytics alone; backend checks forecast capability and data.

#### Freshness requirements

State cutoff, source data interval and model/data versions; no numerical TTL or confidence calibration invented.

#### Related requirements

FR-01, FR-06, FR-07, FR-09; D10, M13.

#### Related tools

`forecast_sales`; `get_sales_report` supports separate actual comparison only.

#### Related agents

Analytics Agent.

#### UX risks

Historical report relabelled prediction, missing artifact hidden by synthetic chart, missing uncertainty or phantom ForecastRun.

#### Blockers / unresolved questions

M13 artifact/training gate, approved target/horizon, uncertainty and readiness thresholds.

## 2E.14 Agent Runs

### Screen: Agent Runs

#### Classification

TRACE / OPERATIONS: restricted Administration index for Admin/ops and contextual run detail from a permitted case.

#### Primary actor(s)

Authorized technical/operations Administrator for index; Operator for a linked permitted run detail.

#### Secondary actor(s)

Owner or researcher only with explicit run-level grant; no default SME “AI dashboard.”

#### Purpose

Explain one execution lifecycle and its proposals, handoffs, tool observations and final status without exposing hidden reasoning.

#### User questions answered

“Which specialist handled this?” “What was attempted versus confirmed?” “Why did the run stop or escalate?”

#### Entry points

Case/Order/Escalation contextual run link; restricted Administration utility index.

#### Exit / contextual navigation

Originating Conversation/Escalation/Order, permitted source citation and distinct Audit event; preserve event position and return path.

#### Phase 2D flows using this screen

Flows 01–10 contextually, only where a run exists and actor is authorized.

#### Required data

Run/correlation ID, current/final state, specialist sequence and handoffs, safe reason codes, tool proposal/admission/attempt/result, evidence refs, escalation, operation/delivery refs and latency/cost only with authorized provenance.

#### Primary task

Inspect the cause and trusted outcome of a scoped agent execution.

#### Primary action(s)

NAVIGATE/INSPECT a linked run event; SEARCH/FILTER only for authorized restricted index.

#### Secondary action(s)

Open related case, operation, citation or Audit event where granted.

#### Read-only information

Execution chronology and redacted evidence, not arbitrary prompts, secrets, chain-of-thought or an editable agent policy.

#### Functional components

Run list/detail, tool/evidence timeline, handoff event, execution status, provenance, access guard and Audit link.

#### AI / agent visibility

DETAILED authorized lifecycle/status/reason codes; **never** hidden chain-of-thought.

#### Tool visibility

DETAILED AUTHORIZED TRACE of canonical tool name, safe arguments summary, authorization/attempt/result and effect ref; not credentials.

#### Required states

Proposed, admitted/rejected, executing, completed, known failed, waiting human, unknown/reconciling, trace delayed/incomplete, denied.

#### Loading state

Run/event loading; no prior run trace shown as newly selected run.

#### Empty state

Valid no runs for restricted filter; a missing or inaccessible linked run is a distinct safe result.

#### Success state

Chronology distinguishes attempt, trusted ToolResult, durable effect and outbound delivery.

#### Known failure state

Run/tool known failure with reason code and linked safe next owner.

#### Authorization state

Case/run/resource and trace-field access are checked; Admin platform role does not imply business-data access.

#### Dependency failure state

Trace source unavailable/incomplete is labelled, not filled with model explanation.

#### Stale state

Run still advancing or trace snapshot older; refresh before final conclusion.

#### Pending state

Executing, waiting human, delivery pending or reconciliation pending shown distinctly.

#### OUTCOME_UNKNOWN behavior

Show possible-commit ToolCall observation and authoritative operation/reconciliation link; do not translate unknown into failed/succeeded.

#### Human escalation behavior

Link to existing Escalation and paused state; no direct unsafe resume from trace.

#### Permissions / access notes

Restricted index, case-linked Operator detail and redacted fields; FR-11 mode metadata only for authorized research trace, never a production switch.

#### Freshness requirements

Event times/order and current run status; distinguish observed from estimated latency/cost.

#### Related requirements

FR-01, FR-03, FR-05, FR-07, FR-08, FR-10; FR-11 metadata only in controlled research context.

#### Related tools

Trace may show exactly the ten canonical tools, limited by the run's specialist and effective policy; it offers no tool-execution CTA.

#### Related agents

Sales, Support, Analytics; Orchestrator is internal and has no own page.

#### UX risks

Attempt mistaken for effect, private prompt/PII leak, unauthorized cross-tenant run browsing or technical trace mistaken for durable audit.

#### Blockers / unresolved questions

Exact redaction grants, run retention, cost provenance and research-role access policy.

## 2E.15 Integrations

### Screen: Integrations

#### Classification

ADMINISTRATION list/detail within Administration → Integrations.

#### Primary actor(s)

Platform Administrator with assigned provider/business scope.

#### Secondary actor(s)

Owner only with explicit tenant integration-management grant.

#### Purpose

Show and safely manage supported channel/provider configuration and true operating mode/health.

#### User questions answered

“Is this channel configured, validated and active?” “Is it LIVE, MOCK or SANDBOX?” “What is failing?”

#### Entry points

Administration → Integrations; permissioned provider-health link from a delivery-affected case.

#### Exit / contextual navigation

Settings/Audit and affected Conversation if separately authorized; return to provider context without secrets.

#### Phase 2D flows using this screen

Flow 10 and provider diagnosis from Flow 04.

#### Required data

Instagram, WhatsApp, Telegram and Web Chat integration identities; business/provider scope, LIVE/MOCK/SANDBOX mode, configured/validated/active status, capabilities, last health/validation time, redacted failure class and delivery impact.

#### Primary task

Inspect provider readiness and perform a supported authorized configuration/validation step.

#### Primary action(s)

CONFIGURE INTEGRATION or VALIDATE/ACTIVATE only for a supported eligible connection; otherwise NAVIGATE to health/detail.

#### Secondary action(s)

Inspect history/affected case, refresh status, view Audit event if granted.

#### Read-only information

Mode, last check, validated capabilities, activation/degraded state and safe error; browser never receives stored secret values.

#### Functional components

Integration list/status, masked configuration input, validation/activation status, health/freshness, safe error and Audit link.

#### AI / agent visibility

NONE; an agent cannot declare a provider live or handle credentials.

#### Tool visibility

NONE for canonical agent tools; administrative API operations are not added to the ten-tool registry.

#### Required states

Unconfigured, configuration pending, validated, active LIVE, MOCK, SANDBOX, degraded/unavailable, invalid credentials, unsupported, denied, activation uncertain.

#### Loading state

Provider state loading; previous validation is not a new LIVE check.

#### Empty state

No configured connection for a target channel, not “channel live.”

#### Success state

Explicit confirmed configuration/validation/activation with mode, capability and check time.

#### Known failure state

Invalid credential, unsupported capability or known activation rejection; do not echo secret.

#### Authorization state

Admin assignment/business grant checked separately; Owner configuration is conditional, not default.

#### Dependency failure state

Provider/check unavailable or degraded; dependent flows receive truthful availability status.

#### Stale state

Last health check old; no current LIVE inference from stale evidence.

#### Pending state

Validation/activation pending; no live traffic claim until confirmed.

#### OUTCOME_UNKNOWN behavior

Ambiguous activation result requires provider/config reconciliation before repeat; it is not a confirmed live connection.

#### Human escalation behavior

Persistent provider/credential issue routes to authorized operations owner; customer-facing case displays service impact only.

#### Permissions / access notes

Secrets stay server-side; browser sees masked entry and redacted outcome. No live adapter is claimed by this specification.

#### Freshness requirements

Show last validation/health observation; no invented freshness SLA.

#### Related requirements

FR-01, FR-02, FR-03; D03 and master frontend p. 116.

#### Related tools

No canonical agent tool; delivery provider operations are separate infrastructure.

#### Related agents

Sales/Support only consume approved availability indirectly.

#### UX risks

Configured mistaken for LIVE, MOCK/SANDBOX mistaken for real channel, secrets exposed or delivery failure interpreted as reversed Order effect.

#### Blockers / unresolved questions

M08/live-channel adapters, supported activation contract, credential authority and health freshness policy.

## 2E.16 Settings

### Screen: Settings

#### Classification

ADMINISTRATION for supported access and application/business configuration only; not a generic feature drawer.

#### Primary actor(s)

Platform Administrator within assigned scope.

#### Secondary actor(s)

Owner for explicitly delegated tenant settings; Operator generally no access.

#### Purpose

Inspect effective access and change only approved configuration through validated, auditable controls.

#### User questions answered

“Which setting or permission is effective?” “May I change it for this business?” “Was the change confirmed?”

#### Entry points

Administration → Settings or permitted access/configuration link.

#### Exit / contextual navigation

Integrations for provider settings, Audit for a confirmed change, or safe return to previous admin context.

#### Phase 2D flows using this screen

Indirect support for Flows 09 and 10; authentication/access guard across Flows 01–10.

#### Required data

Active scope, effective grants/memberships and explicitly approved business/application setting definitions, version, editor rights and audit reference; no invented billing/themes/agent-marketplace settings.

#### Primary task

Review or update one supported, authorized configuration value.

#### Primary action(s)

CONFIGURE APPROVED SETTING only where an implemented contract and policy exist; otherwise INSPECT effective access.

#### Secondary action(s)

Open provider integration or Audit event; cancel unsaved change.

#### Read-only information

Effective rights, current approved values/version and source of policy; no raw tokens or secrets.

#### Functional components

Scoped setting group, effective-permission summary, version-aware confirmation, safe denial/stale state and Audit link.

#### AI / agent visibility

NONE; agent policy is not arbitrarily editable here.

#### Tool visibility

NONE for canonical agent tools; staff configuration API is distinct.

#### Required states

Authorized read, editable approved setting, read-only/unsupported, unsaved, saving, confirmed, conflict/stale, denied, dependency unavailable.

#### Loading state

Current setting/access data loading; no stale previous-business values presented.

#### Empty state

No configurable setting in granted scope, not a prompt to invent a new group.

#### Success state

Backend-confirmed versioned change or clear read-only effective state.

#### Known failure state

Validation/policy rejection with correction guidance; previous confirmed value remains authoritative.

#### Authorization state

Each group/action uses backend capability and tenant checks; Admin is not every tenant's Owner.

#### Dependency failure state

Configuration/identity service unavailable; no optimistic saved message.

#### Stale state

Changed setting/version requires refresh and re-review before save.

#### Pending state

Save or permission update pending; not yet effective.

#### OUTCOME_UNKNOWN behavior

Ambiguous configuration acknowledgement prompts authoritative value/audit reread before retry; do not claim saved.

#### Human escalation behavior

Access disputes or unsupported policy changes go to authorized administrator/owner approval process, not agent bypass.

#### Permissions / access notes

Only frozen or separately approved controls may be actionable; no unrestricted tool/agent role editor is introduced.

#### Freshness requirements

Show effective version/observation time; revalidate before writing and after business switch.

#### Related requirements

FR-01, FR-03 and supporting FR-06 policy visibility; master security pp. 106–108.

#### Related tools

None of the ten canonical agent tools.

#### Related agents

None directly; agent permissions remain enforced by trusted backend policy.

#### UX risks

Settings as garbage drawer, UI visibility confused with authorization, unapproved policy editor or optimistic false save.

#### Blockers / unresolved questions

Exact approved editable settings, responsible role and tenant-vs-platform scope need separate contract approval.

## 2E.17 Audit

### Screen: Audit

#### Classification

TRACE / OPERATIONS restricted Administration event list and event detail; distinct from Agent Runs.

#### Primary actor(s)

Authorized Platform Administrator/operations reviewer.

#### Secondary actor(s)

Operator for a specifically granted linked event; Owner only with explicit audit right.

#### Purpose

Provide durable, redacted evidence of consequential actions, refusals and security decisions.

#### User questions answered

“Who did what, to which permitted resource, when, and with which trusted result?”

#### Entry points

Administration → Audit index or authorized event link from Order, Escalation, Agent Run, Document or Integration.

#### Exit / contextual navigation

Return to filtered index or permitted originating case/run/resource; deep links recheck event scope.

#### Phase 2D flows using this screen

Flows 02, 05, 06, 09 and 10 indirectly; other flows only where an auditable event exists.

#### Required data

Event/correlation/operation IDs, actor and scope, action/effect or security decision, resource ref, result/reason code, timestamp, source run/case ref and redacted provenance.

#### Primary task

Find and verify a consequential event or denial in authorized scope.

#### Primary action(s)

SEARCH/FILTER event list; INSPECT permitted event detail.

#### Secondary action(s)

Open linked Agent Run or business resource where separately granted; return to prior filter.

#### Read-only information

Durable event evidence, not editable decision, raw secret, private prompt, unrestricted PII or hidden reasoning.

#### Functional components

Audit event list/detail, scoped filter, correlation link, effect/result distinction, redaction/permission state and provenance.

#### AI / agent visibility

SUMMARY of named specialist when an event concerns it; no full thought process.

#### Tool visibility

DETAILED AUTHORIZED TRACE of durable tool/effect event reference and outcome, not raw sensitive arguments; attempts remain in Agent Runs.

#### Required states

Recorded, rejected/denied, unknown/reconciled where applicable, delayed/incomplete, no event, inaccessible, source unavailable.

#### Loading state

Event query/detail loading; old event is not displayed as newly selected.

#### Empty state

No matching events in authorized filter; not proof an unrelated action never happened.

#### Success state

Scoped event with actor, action, result, resource, time and correlation/run reference.

#### Known failure state

Event records a known denied/failed operation with explicit result; audit lookup failure is separately labelled.

#### Authorization state

Audit index and each event/resource link restricted; foreign-event existence concealed.

#### Dependency failure state

Audit service unavailable; no false “no events” or success claim for unverified critical effect.

#### Stale state

Delayed event indexing/replication labelled if applicable; authoritative effect source rechecked for consequential decision.

#### Pending state

Event emission/visibility may be pending; action status not inferred from absence.

#### OUTCOME_UNKNOWN behavior

Show recorded uncertainty/reconciliation event only if evidenced; never infer committed or rolled-back effect from a missing log.

#### Human escalation behavior

Audit provides evidence for existing case/Escalation; no direct resume or policy override.

#### Permissions / access notes

Backend field-level redaction and scope checks; Admin role alone does not grant all business-resource details.

#### Freshness requirements

UTC event instant, recording/observation lag where relevant and correlation order; no invented retention period.

#### Related requirements

FR-01, FR-03, FR-07, FR-10; master failure/observability pp. 110–112.

#### Related tools

May reference any of the ten canonical tools as event evidence; invokes none.

#### Related agents

Sales, Support, Analytics only as recorded actor context.

#### UX risks

Run attempt conflated with durable effect, private data exposed, missing event taken as proof of no action, or direct audit link bypassing scope.

#### Blockers / unresolved questions

Field-level redaction, event-retention and permitted linked-Operator access need finalized policy.

## 2E.18 Customer Web Chat

### Screen: Customer Web Chat

#### Classification

CUSTOMER SURFACE, separate from the fifteen staff families and their primary navigation.

#### Primary actor(s)

Customer.

#### Secondary actor(s)

None in this UI; Operator handles the linked staff Conversation, Channel Provider is a system.

#### Purpose

Let a customer submit a request, clarify/confirm when needed and receive a truthful business or pending outcome.

#### User questions answered

“Was my message received?” “What is known about my product/order?” “Is a person needed or is an action still being checked?”

#### Entry points

Business website/widget or server-bound Web Chat session; not staff authentication/nav.

#### Exit / contextual navigation

Within the customer thread/authorized result only; no links to staff Runs, Audit or CRM. Staff linkage is server-side.

#### Phase 2D flows using this screen

Flows 01–06; Flow 04 delivery status and Flow 06 human pending communication are explicit.

#### Required data

Scoped customer session, own messages/replies, safe product/order facts after verification, clarification/quote/confirmation context, action outcome, pending/human status and connection/delivery feedback.

#### Primary task

Send a request or respond to the current clarification/confirmation safely.

#### Primary action(s)

SEND MESSAGE; CONFIRM BUSINESS ACTION only after item/quantity/terms are explicit and current.

#### Secondary action(s)

Clarify requested details, review own visible outcome or reconnect; no staff/agent configuration.

#### Read-only information

Own thread, grounded answer, exact confirmed Order/reservation distinction and truthful pending status; no internal tool schema or confidence.

#### Functional components

Customer thread/composer, clarification/confirmation, Product/Order/Inventory result summary, pending/human message, safe error and connection/delivery state.

#### AI / agent visibility

SUMMARY only when useful to explain transfer to a person or delay; no specialist trace or hidden reasoning.

#### Tool visibility

BUSINESS RESULT ONLY, filtered for Customer; no raw ToolCall/schema, audit ID or internal operation trace.

#### Required states

Ready, sending/received/processing, clarification, awaiting confirmation, confirmed result, partial Order/reservation, human pending, unknown/reconciling, denied, connection/delivery failed.

#### Loading state

Session/thread or reply loading; no composed answer claimed delivered.

#### Empty state

New valid session with no messages; not a missing-order conclusion.

#### Success state

Grounded response or exact trusted business effect communicated, with separate reply-delivery acknowledgement where observable.

#### Known failure state

Invalid input, known business rejection or failed send; guide correction without repeating a business write.

#### Authorization state

Server-bound channel identity and Customer/Order ownership checks; order number/phone alone is insufficient.

#### Dependency failure state

Channel/backend/status source unavailable; do not fabricate answer or “not found.”

#### Stale state

Quote/stock/order observation expired or changed; require refresh/reconfirmation before purchase.

#### Pending state

Message receipt, processing, human review, business effect and outbound reply delivery are separately described.

#### OUTCOME_UNKNOWN behavior

State that the action is being checked, not successful/failed; prevent duplicate confirmation and offer a safe follow-up status.

#### Human escalation behavior

Show pending human review or clarification without internal queue/assignee details or completion promise.

#### Permissions / access notes

Customer sees only own permitted facts; no Keycloak staff role, Agent Runs, Audit, raw credentials or cross-customer context.

#### Freshness requirements

Qualify observed stock/delivery status and revalidate quote before write; no numeric TTL asserted.

#### Related requirements

FR-01 (customer identity boundary), FR-02, FR-04–FR-08, FR-10; D03/D04/D05/D11.

#### Related tools

Sales/Support tools affect results indirectly under their exact allowlists; `update_order` E02 remains denied.

#### Related agents

Sales and Support; Analytics is not customer-facing by default.

#### UX risks

Message receipt mistaken for completed order, protected data leak, silent handoff, unknown write repeated or delivery failure presented as cancelled effect.

#### Blockers / unresolved questions

No working Web Chat/live channel adapter is evidenced; exact customer session verification and channel-delivery contract require implementation.

## 2E.19 Shared Functional Components

The following **29 functional components** are reusable behavior contracts for Phase 3A, not visual components or a design system. “Actions” means allowed intent only; every mutating action is rechecked by the backend. Screen abbreviations use their canonical family names; WC = Customer Web Chat. Each row defines purpose, using screens, necessary data, actions and semantic states.

| Category / component | Purpose | Screens using it | Data | Actions | States |
| --- | --- | --- | --- | --- | --- |
| Navigation / Primary Navigation | Find approved role-visible areas | Staff shell | Active role, permitted areas | NAVIGATE | Available, hidden, loading, denied on deep link |
| Navigation / Business Context Indicator | Prevent tenant confusion | All staff screens | Active business, membership | Inspect/change scope if permitted | Current, switching, denied, expired |
| Navigation / Return Context | Restore originating task safely | Staff detail screens | Scoped source ref, filter, draft state | RETURN | Valid, stale, inaccessible |
| Navigation / Page Context | Name current entity/task | All staff screens | Family, entity ref, scope | NAVIGATE | Loading, current, inaccessible |
| Conversation / Conversation List | Find work | Conversations | Case/channel/owner/status | SEARCH/FILTER, SELECT | Loading, valid empty, active, unavailable |
| Conversation / Conversation Thread | Read own/assigned dialogue | Conversations, WC | Messages, direction, delivery | INSPECT | Loading, current, pending, delivery failed |
| Conversation / Message Composer | Send a scoped message | Conversations, WC | Draft, case/session, ownership | SEND MESSAGE | Draft, sending, delivered, failed, denied |
| Conversation / Customer Context Summary | Show verified adjacent identity | Conversations, Escalations | Customer ref, verification, provenance | OPEN CUSTOMER | Verified, ambiguous, stale, denied |
| Conversation / Order Context Summary | Show linked Order/hold separately | Conversations, Customers, Escalations, WC | Order/ref, reservation result | OPEN ORDER / VIEW RESULT | Created, reserved, partial, unknown, denied |
| AI / Active Agent Status | Identify current responsibility | Conversations, Agent Runs, Escalations | Specialist, owner, run state | INSPECT RUN | Active, paused, waiting human, done |
| AI / Handoff Event | Preserve transfer meaning | Conversations, Agent Runs, Escalations | From/to, reason, verified facts | INSPECT | Requested, accepted, blocked, escalated |
| AI / Business Action Proposal | Separate intent from effect | Conversations, Escalations, WC | Proposed operation, required confirmation | CONFIRM if eligible | Proposed, awaiting, denied, expired |
| AI / Tool Result Summary | Expose trusted result safely | Conversations, Orders, Agent Runs | Tool/result/effect ref, source | INSPECT | Confirmed, rejected, failed, unknown |
| AI / Execution Status / Run Link | Open authorized detail | Conversations, Escalations, Orders, Agent Runs | Run ID, lifecycle status | OPEN RUN | Executing, complete, waiting, denied |
| Business / Customer Summary | Verify scoped relationship | Customers, Conversations, Escalations | Identity, related refs | OPEN DETAIL | Matched, ambiguous, inaccessible |
| Business / Order and Reservation Status | Prevent collapsed purchase state | Orders, Conversations, Escalations, WC | Order effect, reserve effect, refs | OPEN ORDER / FOLLOW UP | Separate confirmed, partial, pending, unknown |
| Business / Product Summary | Identify catalog item | Products, Conversations, Orders, WC | Product/variant/price source | OPEN PRODUCT | Match, multiple, no match, stale |
| Business / Inventory Status | Show operational stock | Inventory, Products, Conversations, Orders, WC | Quantity, version, observed time, hold ref | OPEN INVENTORY / REFRESH | Positive, zero, stale, unavailable, unknown hold |
| Escalation / Queue Item | Prioritize human work | Escalations, Conversations | Case, reason, assignee, age/status | OPEN / ASSIGN if permitted | Unassigned, assigned, waiting, closed |
| Escalation / Context Packet | Preserve decision evidence | Escalations, Agent Runs | Facts, sources, effects, constraints | INSPECT EVIDENCE | Current, stale, conflicting, incomplete |
| Escalation / Human Decision Form | Submit one eligible decision | Escalations | Allowed choices, revision, actor | APPROVE/REJECT/CLARIFY/CLOSE | Ready, submitting, saved, stale, denied |
| Escalation / Resume and Reconciliation Guard | Prevent unsafe repeat | Escalations, Orders, Conversations, Agent Runs | Operation key, known/unknown effect, revision | RESUME only if safe / INSPECT | Blocked, reconciling, safe, duplicate |
| Knowledge / Document Item and Version Status | Track source lifecycle | Documents | Document/version, process, ACL | OPEN / UPLOAD | Uploading, processing, READY, failed, revoked |
| Knowledge / Publication Status and Evidence Reference | Show active source and citation | Documents, Conversations, Agent Runs | Current pointer, source/version/locator | PUBLISH/REVOKE if eligible; OPEN SOURCE | Unpublished, current, superseded, conflict |
| Analytics / Metric and Report Result | Show observed business data | Overview, Analytics | Defined metric, period, actuals, coverage | REQUEST REPORT / INSPECT | Loading, ready, valid empty, partial, unavailable |
| Analytics / Forecast Result and Actual Distinction | Show prediction separately | Forecasts, Analytics link | Target, cutoff, horizon, predicted/actual, model | REQUEST FORECAST / COMPARE | `MODEL_NOT_READY`, processing, ready, insufficient |
| Analytics / Provenance and Limitation | Qualify result | Analytics, Forecasts, Overview | Source/model/data version, time, caveat | INSPECT SOURCE | Current, stale, incomplete, unavailable |
| System / State and Permission Panel | Consistent safe feedback | All 16 surfaces | State class, safe reason, next step | RETRY only when safe / REAUTH | Loading, empty, denied, stale, dependency fail, pending |
| System / Delivery and Outcome Status | Separate message from effect | Conversations, WC, Orders, Agent Runs | Effect ref/status, message attempt/status | FOLLOW UP / resend message only | Effect confirmed/unknown; delivery sent/failed |

The table does **not** introduce extra tools. Staff upload/configuration/decision APIs are distinct from the canonical agent-tool registry. Status components present text/state semantics and must support keyboard/assistive technology; exact form, styling, placement and responsive composition are Phase 3A/3C decisions.

## 2E.20 Cross-Screen State Rules

| State | Shared functional rule | Screens most affected |
| --- | --- | --- |
| Loading | Keep old scope/result clearly separate; never show stale defaults as a new result. | All screens. |
| Valid empty | A completed authorized query found no items/data; distinct from zero stock, missing resource, denied and outage. | Lists, Analytics, Documents, Agent Runs, Audit. |
| Authentication/session expired | Hide protected content; reauthenticate and restore only safe navigation context, never replay a write. | Staff shell and all protected screens. |
| Permission denied / inaccessible | Do not reveal foreign resource existence or details; backend remains authority even when nav link is visible. | All protected screens and customer Order replies. |
| Dependency failure | Identify unavailable source/capability; do not convert it to valid empty or fabricated fact. | Conversations, Inventory, Analytics, Forecasts, Integrations. |
| Stale/conflict | Show version/observed time and refresh; require new review before mutation or human decision. | Orders, Inventory, Escalations, Documents, Settings. |
| Pending | Receipt, processing, effect, human review and delivery are distinct; none alone means completion. | Conversations, Escalations, Orders, WC. |
| `OUTCOME_UNKNOWN` | Possible commit; show reconciliation-needed state, operation ref for staff and no blind replay or success/failure claim. | Orders, Conversations, Escalations, Agent Runs; publication/activation where applicable. |
| Reconciliation | Use authoritative effect evidence and idempotency reference; while unresolved, keep write locked and human owner visible. | Orders, Escalations, Agent Runs, WC status. |
| Delivery failed | Retry only outbound communication; do not undo/repeat a confirmed business effect. | Conversations, WC, Agent Runs; Integrations health. |
| `MODEL_NOT_READY` | No numerical prediction or phantom ForecastRun; historical Analytics remains usable independently. | Forecasts, Analytics link, Overview availability. |
| Knowledge READY/unpublished | Processed source is not active; failed V2 leaves published V1. | Documents, cited evidence. |
| LIVE/MOCK/SANDBOX | Connection mode and health are explicit; configured or validated is not proof of live external delivery. | Integrations, case delivery context. |

**Primary CTA model.** Each screen/task state has one dominant functional intent: Authentication—AUTHENTICATE; Overview—NAVIGATE; Conversations—SEND MESSAGE when human-owned, otherwise TAKE OVER/OPEN ESCALATION as permitted; Escalations—one allowed DECISION; Customers/Products/Inventory/Orders—SEARCH/FILTER in list and INSPECT in detail; Documents—UPLOAD or eligible PUBLISH/REVOKE by lifecycle state; Analytics—REQUEST REPORT; Forecasts—REQUEST FORECAST only when ready; Agent Runs/Audit—INSPECT; Integrations—CONFIGURE/VALIDATE when supported; Settings—CONFIGURE APPROVED SETTING; Web Chat—SEND MESSAGE or explicit CONFIRM BUSINESS ACTION. Disabled/absent actions must explain policy/readiness, not imply backend permission. CTA labels and visual emphasis are not frozen.

**Cross-screen continuity.** Conversation ↔ Customer/Order/Product/Inventory retains scoped case and return filter; Escalation ↔ Conversation/Order/Run retains decision revision and refreshes on return; Run ↔ Audit distinguishes execution attempt from durable event; Analytics ↔ Forecasts preserves metric/period while labelling observed versus predicted; citation ↔ Document checks active version/ACL; affected case ↔ Integration checks admin permission. A browser URL/reference is never authorization. Business switching clears prior-tenant data/subscriptions/drafts before new content renders.

## 2E.21 Permission / Role Matrix

This matrix describes default **UI discoverability**, not a grant. `PRIMARY` = normal task destination, `SECONDARY` = visible supporting destination when granted, `CONTEXTUAL` = only a scoped link/explicit grant, `NO NORMAL ACCESS` = absent by default. Every request still needs backend business, resource, action and current-policy checks.

| Screen | Customer | Owner | Operator | Platform Admin | Notes |
| --- | --- | --- | --- | --- | --- |
| Authentication | NO NORMAL ACCESS | PRIMARY | PRIMARY | PRIMARY | Customer Web Chat session is separate; staff IdP is Keycloak. |
| Overview | NO NORMAL ACCESS | PRIMARY | CONTEXTUAL | NO NORMAL ACCESS | Operator workload-only variant requires approval; Admin is not Owner. |
| Conversations | NO NORMAL ACCESS | CONTEXTUAL | PRIMARY | NO NORMAL ACCESS | Owner case viewing requires explicit grant. |
| Escalations | NO NORMAL ACCESS | CONTEXTUAL | PRIMARY | NO NORMAL ACCESS | Decision requires assignment/current policy. |
| Customers | NO NORMAL ACCESS | SECONDARY | PRIMARY | NO NORMAL ACCESS | Per-record/tenant scope applies. |
| Orders | NO NORMAL ACCESS | SECONDARY | PRIMARY | NO NORMAL ACCESS | Viewing does not enable E02 mutation. |
| Products | NO NORMAL ACCESS | SECONDARY | PRIMARY | NO NORMAL ACCESS | Catalog read under business grant. |
| Inventory | NO NORMAL ACCESS | SECONDARY | PRIMARY | NO NORMAL ACCESS | Stock read and reservation evidence remain distinct. |
| Knowledge / Documents | NO NORMAL ACCESS | SECONDARY | CONTEXTUAL | CONTEXTUAL | Owner publisher only if granted; Operator citation read ≠ publish. |
| Analytics | NO NORMAL ACCESS | PRIMARY | NO NORMAL ACCESS | NO NORMAL ACCESS | Other analytics roles require explicit grant. |
| Forecasts | NO NORMAL ACCESS | PRIMARY | NO NORMAL ACCESS | NO NORMAL ACCESS | Nested under Analytics, separate forecast capability. |
| Agent Runs | NO NORMAL ACCESS | CONTEXTUAL | CONTEXTUAL | SECONDARY | Restricted index Admin/ops; Operator linked case detail only. |
| Integrations | NO NORMAL ACCESS | CONTEXTUAL | NO NORMAL ACCESS | PRIMARY | Owner configuration conditional; secrets server-side. |
| Settings | NO NORMAL ACCESS | CONTEXTUAL | NO NORMAL ACCESS | PRIMARY | Only approved settings. |
| Audit | NO NORMAL ACCESS | CONTEXTUAL | CONTEXTUAL | PRIMARY | Operator only granted linked event; Admin scope limited. |
| Customer Web Chat | PRIMARY | NO NORMAL ACCESS | NO NORMAL ACCESS | NO NORMAL ACCESS | No staff nav/Keycloak role. |

## 2E.22 Screen → Flow Coverage Matrix

Flow numbers refer to [Phase 2D](PHASE_2D_CORE_USER_FLOWS.md): 01 availability, 02 purchase/reserve, 03 order support, 04 delivery, 05 handoff, 06 human escalation, 07 historical analytics, 08 forecast, 09 knowledge, 10 integrations. An indirect/guard screen is not an extra step forced into every journey.

| Screen | Phase 2D Flows | Main Purpose in Flow | Critical States |
| --- | --- | --- | --- |
| Authentication | 01–10 (staff gate) | Establish staff scope on protected branch | Signed out, expired, denied, IdP unavailable |
| Overview | 02, 07, 08; 06 attention link | Orient Owner to pending work and report destination | Current/stale summary, pending, valid empty |
| Conversations | 01–06; 10 delivery impact | Handle customer case, ownership, action and reply | Clarify, handoff, partial effect, unknown, delivery failed |
| Escalations | 01–06; 09 incident conditional | Human queue/detail and safe disposition | Unassigned, decision, stale, resume blocked, reconciliation |
| Customers | 01–06 | Verify Customer/Order association | Matched, ambiguous, inaccessible, stale |
| Orders | 02–06; 07 drilldown | Authoritative Order and separate reservation | Created, unreserved, confirmed hold, unknown, E02 denied |
| Products | 01, 02; 05 contextual | Catalog/variant identity | Match, no match, multiple, stale |
| Inventory | 01, 02, 05 | Observed stock and hold evidence | Positive, zero, unavailable, stale, unknown hold |
| Knowledge / Documents | 09; 03/05 citation | Process/publish/revoke knowledge | Processing, READY/unpublished, active, failed, revoked |
| Analytics | 07; 08 actual context | Grounded historical report | Ready, valid empty, partial, unavailable |
| Forecasts | 08; 07 link | Prediction/readiness separate from actuals | `MODEL_NOT_READY`, insufficient, processing, real result |
| Agent Runs | 01–10 contextual | Explain specialist/tool lifecycle | Attempt, denied, confirmed, waiting, unknown |
| Integrations | 10; 04 diagnosis | Provider configuration and channel health | LIVE/MOCK/SANDBOX, pending, degraded |
| Settings | 09, 10 indirect; 01–10 access context | Effective approved configuration | Read-only/allowed, saved, conflict, denied |
| Audit | 02, 05, 06, 09, 10 indirect | Durable action/security evidence | Recorded, rejected, delayed, unknown event |
| Customer Web Chat | 01–06 | Customer request, clarification and truthful outcome | Processing, confirmed/partial, human pending, unknown, delivery failed |

All ten flows have an entry, task surface and outcome surface; no flow requires a new primary family. Native Instagram/WhatsApp/Telegram clients remain external provider UIs, while the platform's channel state is represented in Integrations and staff Conversations.

## 2E.23 Screen → Requirement Traceability

Only current master FR-01–FR-11 identifiers are used below. FR-11 is research-run architecture switching: it is **not** a normal production screen or browser/chat control; authorized run metadata may show its mode/version when a controlled research run exists.

| Screen | FR | Why |
| --- | --- | --- |
| Authentication | FR-01 | Verified staff identity, membership and safe scope. |
| Overview | FR-01, FR-04, FR-09, FR-10 | Scoped attention, report and pending-work links. |
| Conversations | FR-01–FR-08, FR-10 | Customer processing, routing/handoff, trusted result, human status. |
| Escalations | FR-01, FR-03, FR-04, FR-07, FR-08, FR-10 | Durable reason/evidence, current decision and safe resume intent. |
| Customers | FR-01, FR-04, FR-06, FR-07 | Protected identity and structured Customer facts. |
| Orders | FR-01, FR-03, FR-04, FR-06, FR-07, FR-10 | Order/reservation effects and partial/unknown case evidence. |
| Products | FR-01, FR-04, FR-06, FR-07 | Grounded catalog selection under scope. |
| Inventory | FR-01, FR-04, FR-06, FR-07 | Structured stock truth, distinct reservation. |
| Knowledge / Documents | FR-01, FR-03, FR-06, FR-07 | Versioned, scoped retrieval source publication and evidence. |
| Analytics | FR-01, FR-06, FR-07, FR-09 | Authorized historical actuals and forecasting context. |
| Forecasts | FR-01, FR-06, FR-07, FR-09 | Separate prediction path and model-readiness outcome. |
| Agent Runs | FR-01, FR-03, FR-05, FR-07, FR-08, FR-10; FR-11 metadata only | Execution trace, routing, attempts and authorized controlled-run mode. |
| Integrations | FR-01, FR-02, FR-03 | Scoped provider configuration/ingress/delivery health evidence. |
| Settings | FR-01, FR-03, FR-06 | Effective access and only approved policy/configuration. |
| Audit | FR-01, FR-03, FR-07, FR-10 | Durable action/denial/escalation evidence. |
| Customer Web Chat | FR-01 (identity boundary), FR-02, FR-04–FR-08, FR-10 | Customer-facing request/clarification/grounded effect/handoff status. |

## 2E.24 Screen Priority for Wireframing

Priority reflects the ten Phase 2D flows and ability to validate their central distinctions; it is **wireframing order**, not implementation status or permission to start Phase 3A now. All sixteen surfaces remain functionally specified.

| Screen | Priority | Evidence-based reason |
| --- | --- | --- |
| Conversations | P0 — CORE WIREFRAME | Central staff entry for six customer flows, handoff and effect/delivery distinction. |
| Escalations | P0 — CORE WIREFRAME | Required human/unknown-effect path, nested queue and safe decision detail. |
| Orders | P0 — CORE WIREFRAME | Purchase partial success and `create_order` ≠ `reserve_inventory` are critical trust test. |
| Analytics | P0 — CORE WIREFRAME | Owner's grounded historical report is a core value path, distinct from prediction. |
| Forecasts | P0 — CORE WIREFRAME | Scientific/product forecast distinction and present `MODEL_NOT_READY` need early validation. |
| Customer Web Chat | P0 — CORE WIREFRAME | Customer entry/outcome for six flows and separate channel-vs-staff boundary. |
| Authentication | P1 — SUPPORTING WIREFRAME | Essential staff gate but Keycloak may own sign-in; validate scope/denial/return states after central work. |
| Overview | P1 — SUPPORTING WIREFRAME | Owner orientation depends on defined Analytics/work destinations. |
| Customers | P1 — SUPPORTING WIREFRAME | Needed for identity/context drilldown after conversation workflow. |
| Products | P1 — SUPPORTING WIREFRAME | Supports availability/purchase with catalog-versus-stock separation. |
| Inventory | P1 — SUPPORTING WIREFRAME | Required stock/hold freshness detail after Order/Products core. |
| Knowledge / Documents | P1 — SUPPORTING WIREFRAME | Publication lifecycle is essential but secondary to customer/order core. |
| Integrations | P1 — SUPPORTING WIREFRAME | Live/non-live channel truth affects customer flows; administrative interaction can follow core. |
| Agent Runs | P2 — SECONDARY / ADMIN / TRACE | Restricted investigation depth; case summary must work first. |
| Settings | P2 — SECONDARY / ADMIN / TRACE | Only approved configuration, exact editable groups unresolved. |
| Audit | P2 — SECONDARY / ADMIN / TRACE | Restricted durable evidence; run/order relationships can be validated first. |

## 2E.25 Phase 3A Wireframe Inputs

These are **input cards**, not drawn wireframes, page layouts or component styling. All P0 cards include the unhappy path, not only a success panel.

| SCREEN | Primary actor | Primary job | Entry point | Must-show information | Primary action | Secondary actions | Mandatory components | Critical states | Cross-links | Flow examples |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Conversations | Operator | Advance one customer case truthfully | Queue or assigned case | Channel/thread, verified Customer/Order context, owner/agent, action vs delivery status | SEND MESSAGE when human-owned; TAKE OVER/OPEN ESCALATION when eligible | Search/filter, inspect evidence/record/run, clarify | List, thread, composer, context, agent/handoff status, tool result, delivery/pending | Clarify, handoff, partial/unknown effect, denied, send failure, stale | Customer, Order, Product/Inventory, Escalation, Run, Document | 01 availability, 02 purchase, 05 handoff |
| Escalations | Operator | Decide or safely defer a stopped case | Nested queue/case link | Reason, assignment/age, verified facts, committed/failed/unknown operations, revision, allowed decisions | One permitted DECISION or safe RESUME | Assign/filter, inspect case/Order/Run, clarify | Queue, context packet, decision form, resume/reconciliation guard | Unassigned, stale, denied, unknown, resume blocked, saved | Conversation, Order, Run, Audit | 06 safe resume, 02 partial/unknown |
| Orders | Operator | Inspect exact Order and hold outcome | Business list or case link | Order existence/version, items, separate reservation result, operation refs | SEARCH/FILTER or INSPECT; no enabled E02 update | Open Customer/Inventory/case/run, refresh | Order/reservation status, evidence, stale/unknown warning | Created/unreserved, confirmed, shortage, stale, `OUTCOME_UNKNOWN`, denied | Customer, Product, Inventory, Conversation, Escalation, Run | 02 purchase, 03 support, 05 handoff |
| Analytics | Owner | Obtain observed sales report | Analytics nav/Overview | Metric/period/unit, actual values, coverage, source/freshness | REQUEST REPORT | Filter, inspect provenance, open Forecasts | Report filter/result, metric and provenance/limitation | Valid empty, partial/stale, invalid input, unavailable, denied | Overview, Forecasts, authorized Order | 07 owner analytics |
| Forecasts | Owner | Determine readiness and inspect real prediction | Nested Analytics link | Target/cutoff/horizon, model/data readiness, actual/predicted separation, provenance | REQUEST FORECAST only when eligible; otherwise open actual report | Change inputs, compare history, inspect real run | Readiness, forecast result, actual-vs-predicted, limitation | Current `MODEL_NOT_READY`, insufficient history, unsupported horizon, timeout, denied, real result | Analytics, valid ForecastRun | 08 forecast request |
| Customer Web Chat | Customer | Ask, clarify/confirm and receive truthful outcome | Business widget/session | Own thread, receipt, quote/confirmation, exact effect/pending/human/delivery status | SEND MESSAGE or explicit CONFIRM BUSINESS ACTION | Clarify, review own result, reconnect | Thread/composer, confirmation, result and pending/error state | Processing, denied/verification, partial purchase, unknown, human pending, delivery failure | Server-linked staff Conversation only; no staff route | 01 availability, 02 purchase, 04 delivery, 06 escalation |

## 2E.26 Remaining Blockers / Open Questions

| ID | Boundary still open | Consequence for wireframes / later implementation |
| --- | --- | --- |
| O2E-01 — E02 | `update_order` mutation has no approved editable-field/transition policy and remains denied. | Show restricted/human path; no enabled successful update, release, refund or compensation control. |
| O2E-02 — M12 | Durable, replay-safe human resume not implemented; assignment/SLA and decision contract need approval. | Draw intended queue/decision/blocked states, not a claim that RESUME works today. |
| O2E-03 — M13 | No validated forecast artifact/ForecastRun; target/horizon/readiness and uncertainty policy unfinished. | Wireframe `MODEL_NOT_READY` as current truth; real result only conditional. |
| O2E-04 — live channels/M08 | No working frontend/live Telegram/Web Chat/Meta adapters; four-channel status contract exists. | Integrations must show mode/health honestly; Web Chat is specified, not live. |
| O2E-05 — reconciliation | M03/M04 have unknown-effect evidence but no automatic reconciler or final UX SLA/owner contract. | Keep write locked and status pending; do not invent backend recovery behavior. |
| O2E-06 — freshness | Stock, quote, report, provider and case freshness thresholds/wording not approved. | Show observed time/version and need for refresh, not arbitrary TTL. |
| O2E-07 — knowledge | M07 parser is text/plain UTF-8 only; file limits, publisher role and revocation latency need approval. | Do not depict rich-format ingestion as available; retain READY/published distinction. |
| O2E-08 — settings/access | Exact editable settings, Owner/Admin delegation, Operator Overview and trace/audit field visibility unresolved. | Keep controls conditional and permission-gated; no agent-policy editor. |
| O2E-09 — analytics | Metric formulas/completeness, forecast target/horizon and causal-interpretation rules need business approval. | Label actual reports and forecast separately; no made-up KPI or prediction. |
| O2E-10 — validation | Device/language priorities, accessibility conformance target and actual usability evidence are not established. | Phase 3A tests these assumptions; this inventory does not imply a validated layout. |

## 2E.27 Final Screen Inventory Summary

The functional inventory freezes **15 master staff screen families plus separate Customer Web Chat**. It preserves Phase 2C's six-area, role-filtered IA and Phase 2D's ten flows. List/detail and queue/detail responsibilities stay within the relevant family. Twenty-nine shared functional components cover shell, conversation, AI/result, business entities, escalation, knowledge, analytics and system state; no new agent or eleventh business tool is added.

P0 first-wireframe inputs are Conversations, Escalations, Orders, Analytics, Forecasts and Customer Web Chat. P1 covers Authentication, Overview, Customers, Products, Inventory, Knowledge/Documents and Integrations. P2 covers restricted Agent Runs, Settings and Audit. The priority does not declare any screen implemented.

Every future wireframe must keep known business effects, AI/workflow state and outbound delivery separate; distinguish valid empty from outage, stale from current, actual from predicted, READY from published, and LIVE from MOCK/SANDBOX. `OUTCOME_UNKNOWN` requires reconciliation before replay; `MODEL_NOT_READY` requires no forecast number. E02, M12, M13, live channels, reconciliation, freshness and related policy gaps remain open. No wireframe, Figma artifact, visual token or application code is produced by Phase 2E.
