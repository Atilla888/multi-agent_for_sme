# Design Specification

## 1. Purpose and authority

This is the **approved UX/UI contract** for the retail/e-commerce frontend. It consolidates the completed design phases 2A–3E. The current design file is [Diplom — Multi-Agent Platform UI (Lab 3)](https://www.figma.com/design/W6XefZbbmZq1YZltBfsry7) (`W6XefZbbmZq1YZltBfsry7`); see §29 for its pages, breakpoints and flows. The design phases 3A–3E were done in the earlier file `OFXTN83nFl3RqukrEYQrFy`, where the pages named below live. The Figma files still define screen structure, flows and interaction semantics (`03D`, `03E`, Lab 3); the visual layer (colour, type, components) is now the system in §6. Figma links demonstrate a design, **not** a running backend.

The [consolidated master PDF](../research/master/release/FINAL_MASTER_DEVELOPMENT_SAFE.pdf) is authoritative for architecture, tool contracts and current engineering evidence. [PRD](PRD.md), [Architecture](ARCHITECTURE.md) and [Rules](RULES.md) supply product/engineering context where consistent with that newer master. For UX, the approved [IA](research/PHASE_2C_INFORMATION_ARCHITECTURE.md), [flows](research/PHASE_2D_CORE_USER_FLOWS.md), [screen inventory](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md), [reviewed UX](research/PHASE_3B_UX_REVIEW.md), [Design System](research/PHASE_3C_DESIGN_SYSTEM.md), [high-fi](research/PHASE_3D_HIGH_FIDELITY.md) and [prototype](research/PHASE_3E_INTERACTIVE_PROTOTYPE.md) govern their respective decisions. Earlier [competitor research](research/UX_COMPETITOR_ANALYSIS.md), [Phase 2B validation](research/PHASE_2B_UX_VALIDATION.md) and [low-fi alternatives](research/PHASE_3A_LOW_FI_WIREFRAMES.md) are evidence, not competing navigation or style specifications. Exact route syntax, data DTOs and breakpoint values are not frozen here; do not invent them from mockups.

**Coverage boundary:** 15 approved staff screen families plus separate Customer Web Chat. `03D` supplies full high-fi references for only six P0 families and the Shared Staff Shell. For the other families, implement the approved Phase 2E function/state contract with the same Phase 3C system and shell; absence of a 03D composition is not permission to invent a second visual language. The frontend in `frontend/` implements this contract; formal usability, accessibility and localization QA is still pending.

## 2. Product UX principles

- Use the approved **Calm Operational SaaS** direction: business-first, trustworthy, restrained, moderately dense, with AI visible but secondary to verified outcomes. Semantic clarity outranks decoration or optimistic animation.
- Display sourced, authorized business facts close to the decision. Keep proposal, attempt, confirmed effect, human ownership and outbound delivery as different facts.
- Provide one contextually dominant action per task state and an explicit safe next step for denial, uncertainty, staleness and failure. Do not imply an action succeeded because a request was submitted.
- Show source, observed time, version, completeness or limitations wherever they change the decision. Retrieved prose and model text do not replace authoritative operational data.
- Preserve customer/staff separation and scope. No UI visibility, deep link, model suggestion or human click grants backend permission.

## 3. Actors and user surfaces

The external actors are **Customer, Business Owner, Human Operator, Platform Administrator** and **Channel Provider**. Channel Provider is an external system actor, not a dashboard user. The three bounded specialist agents are **Sales, Support and Analytics**; their active/previous ownership and outcomes may be shown to authorized staff. **Adaptive Orchestrator** is internal, not a user actor or normal page. Business Brain, LangGraph, Tool Executor and research-mode switching also have no normal product destination. The master fixes ten business tools; staff workflow APIs are not additional agent tools.

There are two distinct frontend surfaces:

| Surface | Audience and purpose | Boundary |
| --- | --- | --- |
| **Staff Workspace** | Role-scoped Owner/Operator/Admin task and record work, using the shared shell. | Can show concise authorized agent/effect evidence; protected detail needs fresh backend authorization. |
| **Customer Web Chat** | Customer request, clarification, explicit confirmation and truthful result/pending communication. | No staff shell, staff routes, raw tools/runs/audit, hidden reasoning or cross-customer data. Native provider clients remain external UIs. |

Authentication/reauthentication is **outside** the staff menu; Keycloak may own its sign-in UI. It must establish verified session and active business scope, handle expiry/denial/IdP unavailability and return only to an authorized destination **without replaying a write**. Overview is a role-scoped orientation page, not a second Analytics screen: show defined, sourced attention/observed summaries and link to authoritative work; an Operator workload variant requires an explicit grant, and Admin does not inherit Owner data.

## 4. Information architecture and coverage

The staff workspace has **exactly six top-level role-visible areas**. Role-visible does not mean every role sees every area:

```text
Overview
Conversations
└─ Escalations (queue → decision detail)
Business
├─ Customers
├─ Orders
├─ Products
└─ Inventory
Knowledge
└─ Documents (source list → version/detail)
Analytics
└─ Forecasts (real run detail only if one exists)
Administration
├─ Integrations
├─ Settings
├─ Audit (restricted/permissioned)
└─ Agent Runs (restricted/contextual)
```

These destinations, plus Authentication outside the menu, cover the 15 staff screen families. Customer Web Chat is an additional customer surface, not a seventh staff area. Escalations is nested within Conversations; Forecasts is nested within Analytics. Knowledge means managed Documents, **not** the entire seven-part Business Brain. There is no top-level Reconciliation, AI Agents, Orchestrator or developer-console area. Conceptual list/detail and queue/detail locations are approved, but physical URLs remain an implementation choice. See the [Phase 2C IA](research/PHASE_2C_INFORMATION_ARCHITECTURE.md) and [Phase 2E inventory](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md) for full family contracts.

| Design coverage | Families |
| --- | --- |
| **P0 with approved 03D high-fi** | Conversations, Escalations, Orders, Analytics, Forecasts, Customer Web Chat; plus Shared Staff Shell. |
| **Approved IA/inventory, without equivalent 03D P0 high-fi** | Authentication, Overview, Customers, Products, Inventory, Documents/Knowledge, Integrations, Settings, Audit, Agent Runs. |

## 5. Shared Staff Shell

Use the approved desktop-reference shell for all staff families: sidebar with six role-visible areas and approved nesting; **one** business switch/context control in the sidebar; a distinct header **current business indicator**; page title/breadcrumb and safe return context; account/session area; and main content region. Conversations is active in the 03D shell specimen, not globally active on every page. Audit must look restricted/permissioned and Agent Runs contextual/restricted, not like universal Operator destinations or merely Disabled. A visible link never grants access.

On session expiry, protect content and reauthenticate without resubmitting commands. On a business switch, clear prior-business fetched data, subscriptions, selection and sensitive previews **before** new-scope content appears; isolate unsent drafts to their original scope. On a deep link, refetch and authorize the destination and show a privacy-safe denial if needed. Preserve same-business queue/filter, case and safe return context; revalidate facts and revisions before consequential action. The shell and overview do not create a universal access model.

## 6. Visual system

The app's visual layer was redesigned in November 2026 so it reads as a calm, well-made product rather than a template: **light mode takes the warmth of folk (a human CRM), dark mode the precision of Linear**, one design that follows the operating system (pinnable with `data-theme`). The tokens live in `frontend/src/styles/globals.css`; every component reads them.

- **Colour.** The chrome is neutral. Light: content `#ffffff`, sidebar `#f7f6f3`, hairlines `#ebe9e4`, text `#1c1b19`. Dark: content `#101113`, sidebar `#0b0c0d`, hairlines `#212226`, text `#e4e5e7`. The primary button is near-black in light and near-white in dark. Colour appears only in person avatars, the orange workspace mark, small status icons with their words, and chart data. No violet, no gradients, no translucent blur, no coloured shadows. Every text token passes WCAG AA on every surface it sits on in both themes (checked by tests).
- **Type.** Geist at a 13 px base for dense UI, Geist Mono for order numbers, IDs, counts and times; weights 400 / 500 / 600; sentence case.
- **Status marks.** A small line icon plus words in the tone colour, never a filled pill. Shapes differ wherever meanings differ: "Needs checking" (outcome unknown) is a dashed circle with a question mark, "Failed" a crossed circle, "Needs a person" a person in a circle. A list row may show the icon alone; its label stays available to screen readers.
- **People and agents.** People get initials on one of six muted colours picked from their name; AI agents get a neutral mark and are never colour-coded.
- **Structure.** Hairlines instead of shadows; 4 px tags, 6 px controls, 8 px panels; no cards inside cards. Lists are Linear-style rows. Detail pages and the Inbox put facts in a details panel on the right. A product rule is one quiet line (`.rule-note`) beside what it qualifies; decorative explanation is not shown.
- **Motion.** 120–180 ms ease-out on hover and press; nothing bounces or moves on scroll; reduced motion is honoured.

The semantic distinctions in §7 are unchanged: only how each state is drawn changed, not what it means.

## 7. Semantic state model and effect truth

Map backend state to explicit user-facing meaning and safe action; never infer state from a timeout, model sentence, spinner or color alone. Every family needs loading, success/valid-empty where meaningful, denied, unavailable, stale and pending handling; not every family has a mutating `OUTCOME_UNKNOWN` state.

| State | Binding frontend meaning |
| --- | --- |
| **Success** | A general UI/request operation completed; **not automatically** a committed business effect. |
| **Confirmed** | Trusted evidence confirms the **named** business effect; Order creation, reservation and message delivery have separate receipts. |
| **Pending** | Awaiting a specific result, confirmation, human decision or delivery; show what is pending and who/what owns the next step. |
| **Processing** | Work is active; no completion claim or fabricated customer CTA. |
| **Known Failure** | Trusted result establishes non-completion of the named effect; inspect current facts and choose a new authorized recovery. No unknown-effect reconciliation by default. |
| **`OUTCOME_UNKNOWN`** | A mutation may have committed, confirmation is unavailable; display confirmed facts separately, preserve operation context, require authoritative reconciliation and block blind write replay. Never call it ordinary Failed or Success. |
| **Stale / Conflict** | A previous observation/revision may be unsafe; label it, refresh and re-evaluate before mutation or human decision. |
| **Restricted** | Policy/capability blocks the action, including E02 `update_order`; do not offer an enabled success path. |
| **Permission Denied** | Current principal lacks access; hide protected values and avoid revealing whether a foreign record exists. |
| **Waiting Human** | Automation stopped and a human decision/assignment is pending; not a completed result or a permission transfer. |
| **Dependency Unavailable** | A source cannot supply a trustworthy result; never substitute a zero, no-match or valid-empty result. |
| **`MODEL_NOT_READY`** | No validated forecast artifact/result; no predicted series, zero forecast or fictitious ForecastRun. |
| **Message Delivery Failed** | Customer communication failed or is unconfirmed; a previously confirmed business effect remains confirmed. Retry communication only. |
| **Valid Empty** | An authorized successful query returned no records in the selected scope/period; not a dependency outage, missing observation or fabricated zero. |

The five distinct facts are **request receipt → proposal → authorized attempt → trusted business effect → outbound delivery**. The frontend MUST show only the state supported by the strongest applicable evidence. **Order Delivery** is fulfillment/logistics status from `get_delivery_status`; **Message Delivery** is communication transport to the customer. Neither rewrites Order or Reservation State. Product existence does not establish inventory availability; a stock observation is not a reservation or a live-stock promise.

### `OUTCOME_UNKNOWN` implementation rule

When a mutating result is uncertain, display the **known committed facts** and the **uncertain effect** as separate fields, with an operator-safe operation/case reference and reconciliation-needed status. Preserve contextual links to Order, Conversation, Escalation and permitted Agent Run evidence. Do not infer rollback from missing acknowledgement; do not display Success or ordinary Failed; do not provide a blind mutation Retry. Keep the effect pending until authoritative reconciliation classifies it. Customer copy may explain that the result is being checked without exposing the technical label.

## 8. Conversations — P0 high-fi

Use **Conversation List + Workspace + Persistent Context Panel**. The list supports scoped search/filter and ownership/status; the workspace holds thread, composer, current handler and event/result chronology; the persistent panel keeps verified Customer, Order State, Reservation State, Product/Inventory source/freshness, handoff, escalation and safe linked evidence near the decision. Show current versus previous Sales/Support/Human handler and preserve case/filter/unsent draft context. The primary action depends on ownership: send when human-owned; otherwise permitted takeover, clarification or escalation—not simultaneous competing writes. Detailed traces remain in restricted Agent Runs.

Approved 03D variants: **Default / Active; Support Active; Sales Active; Support → Sales Handoff; Human Takeover; Waiting Human / Escalation; Awaiting Customer Confirmation; Processing / Executing; Confirmed Business Result; Known Failure; `OUTCOME_UNKNOWN`; Dependency Unavailable; Message Delivery Failure After Confirmed Effect**. Handoff retains verified context but no permissions. A failed outbound reply does not undo a confirmed reservation. See [Phase 3D §3D.4](research/PHASE_3D_HIGH_FIDELITY.md#3d4-conversations).

## 9. Escalations — P0 high-fi

Keep a dedicated **Queue + Decision Context** nested under Conversations. Queue handles triage, ownership and status; detail scans in this exact hierarchy: **WHY AUTOMATION STOPPED → CONFIRMED FACTS → UNCERTAIN EFFECT → CONSTRAINTS → NEXT SAFE STEP → HUMAN DECISION**. Show assignment, related case/Order, operation refs, source/revision, permissible decision and next owner. Decisions are contextual and authorized; a detached Approve button is insufficient.

Approved variants: **Waiting Assignment; Awaiting Decision; `OUTCOME_UNKNOWN` / Reconciliation Required; Stale Context; Authorization Changed; E02 Restricted; Resume Pending — TARGET M12; Resolved / Closed**. **Resolved ≠ Closed**; E02 policy restriction ≠ possible commit. For `OUTCOME_UNKNOWN`, reconcile authoritative state before any new mutation and provide no blind retry. M12 is target-only: human decision → fresh revalidation → controlled Resume request, not implemented durable replay. A stale decision must refetch current revision and require review.

## 10. Customers — approved non-P0 family

Provide Business → Customers scoped list/search and detail plus a concise case preview; this family has **no equivalent 03D P0 high-fi composition**. Display only verified Customer identity/linkage, permitted channel identities, related Conversations/Orders and provenance needed for the task. Multiple/ambiguous matches require verification; valid no-match, stale link, inaccessible record and source unavailable have different feedback. List action is search/filter; detail opens permitted relationships and returns to the originating case/filter. Do not leak unrestricted PII or treat a phone/reference as proof of ownership. Use Phase 3C Business Entity/core components and the [Phase 2E contract](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e7-customers).

## 11. Orders — P0 high-fi

Use **Orders List + Order Detail**. Detail MUST show **Order State and Reservation State separately**, with scoped Customer/items, version, observed time, separate `create_order` and `reserve_inventory` results/refs, related Conversation/Escalation and authorized evidence links. Approved variants: **Mixed List; Reservation Confirmed; Reservation Failed; `OUTCOME_UNKNOWN`; Needs Human Attention; Stale / Conflict; E02 Restricted**.

A created Order can coexist with failed or uncertain reservation. **Known Reservation Failed** means no hold: review current inventory and choose a newly authorized recovery; do not demand unknown-effect reconciliation. **`OUTCOME_UNKNOWN`** means the reservation may have committed: reconcile before retry, with no blind `reserve_inventory` replay. Stale/conflicting facts require refresh/revalidation. E02 `update_order` remains restricted; do not invent refund, release, cancellation or compensation controls. Unavailable inventory is not zero stock. A confirmed effect remains confirmed even if its notification fails. Order Delivery and Message Delivery remain separate.

## 12. Products — approved non-P0 family

Provide Business → Products scoped list/search and detail with product/variant identity, approved catalog facts/price, source/version and links to current Inventory and related permitted Orders. This family has **no equivalent 03D P0 high-fi composition**. Distinguish one match, ambiguous/multiple matches, valid no-match, stale catalog fact, denied and source unavailable. Catalog existence or description MUST NOT imply available stock or a reservation. Use Phase 3C Product Summary, provenance and core search/navigation treatment; follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e9-products).

## 13. Inventory — approved non-P0 family

Provide Business → Inventory scoped list/overview and item detail with observed quantity (including a genuine zero), source, observed time/version, freshness/conflict and separate reservation evidence/ref. This family has **no equivalent 03D P0 high-fi composition**. Search/inspect/refresh are the safe default actions; do not infer a live stock guarantee from a past observation. Known zero ≠ source unavailable; product existence ≠ stock availability; observed stock ≠ confirmed hold. Stale/conflicting results require revalidation before a consequential claim. Link to Product, affected Order and originating Conversation with scoped return context. Follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e10-inventory).

## 14. Analytics — P0 high-fi

Analytics is **observed/historical ACTUAL** data only. Show authorized business, defined metric/unit, period/time zone, source, completeness, freshness, historical chart/table and contextual Forecasts link. Approved variants: **Valid; Valid Empty; Incomplete; Stale; Dependency Unavailable; Permission Denied**. A missing interval is a gap, **not zero**; incomplete is not a complete total; valid empty is not outage. Stale history may remain visible only with a clear stale label; denial withholds protected values. Never insert future PREDICTED values or unsupported causal claims into this view. Request report only for a valid authorized scope/period.

## 15. Forecasts — P0 high-fi

Forecasts is a separate nested Analytics destination. Current engineering truth is **`MODEL_NOT_READY`**: no validated M13 artifact, produced prediction, zero-valued forecast or fictitious ForecastRun. Approved variants: **TARGET Ready; `MODEL_NOT_READY`; Insufficient History; Incomplete History; Unsupported Horizon; Model Unavailable; Timeout; Permission Denied**. `MODEL_NOT_READY` (artifact absent) ≠ Model Unavailable (service failure), insufficient history ≠ incomplete history. Request Forecast becomes actionable only after an eligible model/data/parameter and backend contract exist; current safe path returns to historical Analytics.

The illustrative **TARGET PRODUCT UX** result shows target/unit, horizon, source/model/data provenance, uncertainty/limitations, **solid historical ACTUAL → CUTOFF at last observed value → dashed future PREDICTED**. Labels and line styles—not color alone—must make the distinction. A ForecastRun detail exists only for a real persisted run. Never synthesize predictions in the browser or convert an actual series into forecast data.

## 16. Documents / Knowledge — approved non-P0 family

Knowledge manages **Documents**, not the whole Business Brain. Provide source list and version/detail, processing state, publication/current pointer, permission/ACL, provenance and a safe citation return path; there is **no equivalent 03D P0 high-fi composition**. Keep **READY/unpublished ≠ published/current**. An eligible authorized publisher may upload, publish a READY version or revoke using version-aware confirmation; a failed new version must not displace an active earlier one. Revoked/superseded content must not appear as current retrieval evidence. An Operator may inspect a permitted citation without acquiring publication rights. Current M07 parser evidence covers only `text/plain` UTF-8; do not depict PDF/Office/HTML ingestion as live. Use [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e11-knowledge--documents).

## 17. Integrations — approved non-P0 family

Provide scoped Administration list/detail and permissioned provider health for Instagram, WhatsApp, Telegram and Web Chat; there is **no equivalent 03D P0 high-fi composition**. Distinguish configured, validated and active; show **LIVE / MOCK / SANDBOX** mode explicitly and never label a configured row as a live accepted channel. Show last health/validation time, safe error/delivery impact and only supported authorized Configure/Validate/Activate actions. Secret values must never reach the browser. A linked case delivery problem differs from provider-wide health, and navigation back to the case must not replay a business effect. M08 live-provider acceptance remains incomplete. Follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e15-integrations).

## 18. Settings — approved non-P0 family

Provide only effective access and **explicitly approved** business/application settings, with business scope, current value/version, edit right and audit reference; there is **no equivalent 03D P0 high-fi composition**. Show read-only/unsupported, unsaved, saving, confirmed, stale/conflict, denied and dependency-unavailable distinctly. An enabled Configure action requires an actual backend setting contract and policy. Do not invent a general agent-policy editor, billing/theme system or privileged override. Keep secrets/tokens out of client responses. An Admin does not inherit Owner data access. Follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e16-settings).

## 19. Audit — approved non-P0 family

Audit is a **restricted, permissioned Administration** event list/detail, not a universal Operator destination and not Agent Runs; there is **no equivalent 03D P0 high-fi composition**. Show only authorized, redacted durable evidence: actor, scope, resource, action/security decision, trusted effect/result, time, correlation/operation ref and provenance. Support search/filter and permitted contextual return. A linked Operator event needs explicit grant; deep links reauthorize. No edit/delete UI, raw secrets, hidden reasoning or unrestricted PII. Recorded, rejected, unknown/reconciled, delayed/incomplete, valid no-event, inaccessible and source-unavailable are distinct. Follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e17-audit).

## 20. Agent Runs — approved non-P0 family

Agent Runs is a **restricted/contextual** execution-lifecycle view: an Admin/ops index if granted, and case-linked detail for an authorized Operator. It has **no equivalent 03D P0 high-fi composition**. Show specialist sequence, previous/current handler, proposal/admission/attempt/result, handoff, stop reason, escalation and safe operation/effect refs. Distinguish proposed, rejected, executing, completed, known failed, waiting human, `OUTCOME_UNKNOWN`/reconciling, delayed/incomplete trace and denied. Show no hidden chain-of-thought, raw secrets or unrestricted arguments. **Run = execution attempt/lifecycle; Audit = durable action/security evidence.** Cross-link only under independent permission. Follow [Phase 2E](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md#2e14-agent-runs).

## 21. Customer Web Chat — P0 high-fi

Use the separate mobile-important customer surface with own thread/composer, clarification, scoped product/order facts after verification, explicit authorization and plain-language result/pending/delivery feedback. No staff shell or staff destinations. Approved variants: **Initial; Active; Clarification; Confirmation Required; Processing; Confirmed Result; Known Failure; Waiting Human; Confirmation Pending; Message Delivery Failure**. The primary confirmation action is **Confirm order**, with **Change details** secondary, and must name the requested business action. Processing promises an update without implying the customer must keep the chat open or inventing a CTA.

Known reservation failure says the Order already exists but inventory was not reserved, discourages placing the same order again and offers help with the next step. Confirmation Pending explains uncertainty and asks the customer not to resubmit the same request. Message Delivery Failure is communication-only; **Retry message** cannot repeat Order or reservation. Customer-facing copy MUST NOT expose `ToolCall`, Agent Run, LangGraph, `OUTCOME_UNKNOWN`, M12, E02, internal confidence or technical handoff details. Backend identity/ownership checks still gate private order facts.

## 22. Cross-screen navigation and scope

Use contextual links for **Conversation → Customer/Order/Product/Inventory/Escalation/authorized Agent Run; Order → Conversation/Customer/Product/Inventory/authorized run; Escalation → Conversation/Order/authorized Agent Run; authorized Run ↔ Audit event; Analytics ↔ Forecasts; cited evidence → permitted Document/version**. Preserve same-business origin, queue/filter, selected record and safe return path; refetch destination state, revision and permission. A preview or URL is never authorization. Do not add a global destination outside the six-area IA. `OUTCOME_UNKNOWN` is a case/effect/reconciliation state linked through existing destinations, not a new top-level page.

## 23. Prototype-validated flows and control boundary

The owner-reported [Phase 3E validation](research/PHASE_3E_INTERACTIVE_PROTOTYPE.md) is **8/8 flows PASS; Overall PASS**, with manual visual review of all eight, source-page protection PASS, visual-source preservation PASS and **0 broken/prohibited destinations**. The compact interaction handoff is:

| Flow | Start → key transition → end | Critical invariant |
| --- | --- | --- |
| 1 Product Availability | Conversation Default / Active → external scenario continuation → Support Active **END**. | Verified Product + Inventory; product exists ≠ available stock; observed stock ≠ live-stock promise. |
| 2 Purchase Success | Awaiting Customer Confirmation → confirmation event → Processing → trusted-result event → Confirmed Business Result → **Open Order** → Reservation Confirmed. | Proposal/Processing ≠ execution/confirmation; Order ≠ Reservation; delivery is separate. |
| 3 Reservation Failure | Known Failure → **Open Order** → Reservation Failed → safe recovery context. | Known non-reservation ≠ `OUTCOME_UNKNOWN`; inspect current facts and choose a new authorized action, no automatic retry. |
| 4 Support → Sales Handoff | Support Active → Handoff → Sales Active. | Previous/current ownership and verified context; no permission transfer. |
| 5 `OUTCOME_UNKNOWN` → Escalation | Conversation unknown effect → **Open Escalation** → Reconciliation Required → Human Review. | Possible commit; authoritative reconciliation before mutation, no blind replay; E02/known failure distinct. |
| 6 Human Decision / Resume TARGET | Awaiting Decision → Human Decision → Revalidation Gate → controlled request → Resume Pending **TARGET M12**. | Decision ≠ mutation; fresh checks ≠ replay; no current durable Resume or E02 bypass. |
| 7 Analytics → Forecasts | Analytics Valid → Open Forecasts → current `MODEL_NOT_READY` → return to Analytics; separate non-interactive TARGET Ready specimen. | Actual ≠ predicted; no current path from not-ready to target forecast. |
| 8 Customer Web Chat | Confirmation Required → **Confirm order** → Processing → Confirmed Result; separate confirmed-result → Message Delivery Failure → **Retry message** → existing confirmed result. | Retry communication only, never Order/reservation; customer-only language. |

**PRODUCT CONTROL** means an approved visible action inside a product frame, such as Open Order, Open Escalation or Confirm order. **PROTOTYPE CONTROL** means a visibly external, neutral Figma-board control/annotation for system events, scenario steps or future capability. The frontend MUST implement real product actions through actual authorized contracts and MUST NOT recreate prototype controls or invisible hotspots as application UI. A Figma reaction is navigation evidence, not business execution. The available plugin API supported reactions but not writing formal flow starting points; external START annotations identify prototype entries. This is an authoring limitation, not a product feature.

## 24. CURRENT vs TARGET capability matrix

| Capability | Current evidence/status | Frontend rule |
| --- | --- | --- |
| M01–M07 core engineering | Passed scoped gates in the master; M04 has E02 limitation. | Do not infer a working frontend/channel from backend gates. |
| M08 live provider/specialist acceptance | **PARTIAL / BLOCKED**; scripted cases passed but required live gate did not. | Do not label target channels or agent paths as live accepted. Show actual mode/health. |
| E02 `update_order` mutation policy | **CURRENT RESTRICTION**; no approved field/transition allowlist. | Show restricted/human path, not a successful edit/refund/release/compensation control. |
| M12 durable Human Resume | **TARGET; NOT IMPLEMENTED.** | Do not enable 03E's Resume Pending specimen as a live action. Future path: decision → fresh revalidation → controlled request, never replay. |
| M13 validated forecast artifact | **NOT READY**; current `forecast_sales` result is `MODEL_NOT_READY`. | Show no prediction or fictitious run. TARGET Ready is illustrative, non-interactive in current prototype. |
| Frontend and live customer channels | All staff screens and the Web Chat surface are implemented in `frontend/`; WhatsApp is connected as a demo channel only. | Label each screen's data as live or sample; never present an unconnected channel as live. |

Current statuses derive from the master engineering snapshot, not from the visual completeness of `03D` or `03E`. A future implemented capability needs its own backend/product acceptance evidence before its TARGET UI becomes CURRENT.

## 25. Accessibility and localization

The approved design targets **WCAG 2.2 AA-level**, **not certification**. Use semantic controls, keyboard access and restored focus, persistent form labels, visible focus, readable disabled/error text, non-color-only statuses/charts, reasonable touch targets and explicit recovery wording. The 03C Web Chat examples use **44 px** touch-target guidance; this is not a frozen production breakpoint. Staff UI is desktop-primary; Web Chat is mobile-important. Allow EN/RU/KZ script and label expansion/wrapping; the Phase 3C localization sample allows **30–50% label growth** without truncating critical text. Validate actual translations, assistive technology and device layouts in later QA. The interface now ships in English, Russian and Kazakh (Cyrillic) with a language switch and a System / Light / Dark switch; record content is shown as entered. Text is kept per screen area in `frontend/src/i18n/messages/`, and the Russian and Kazakh copy still needs a native speaker's review. Phase 3C/3D structural checks and Phase 3E prototype validation are not formal accessibility, responsive or localization acceptance.

## 26. Frontend implementation contract and safety invariants

The trust boundary is **MODEL PROPOSES → EXECUTOR AUTHORIZES → DOMAIN ENFORCES → DATABASE PERSISTS**. The frontend displays trusted outcomes; it never substitutes for any of these layers. The following are binding for Phase 4:

- Frontend **MUST** take identity, active business, resource/action permission, versions, operation outcome and delivery status from trusted backend contracts. It **MAY** hide inaccessible links for discovery, but hiding/visibility **MUST NOT** replace backend authorization; every deep link and action is rechecked.
- Frontend **MUST NOT** infer business truth from model prose, a submitted request, a loading state, a timeout, a prototype reaction or an optimistic toast. Proposal **≠** execution; Processing **≠** Confirmed.
- Frontend **MUST** show Order State **separately** from Reservation State and Order Delivery **separately** from Message Delivery. A delivery failure **MUST NOT** downgrade, undo or replay a confirmed business effect.
- Frontend **MUST** keep Known Failure distinct from `OUTCOME_UNKNOWN`. For a known non-effect, show current-fact review/new authorized recovery; for possible commit, show uncertainty and confirmed facts separately, preserve operation/case links, route to authoritative reconciliation and **MUST NOT** show ordinary Failed, Success or a blind mutation Retry.
- Frontend **MUST NOT** turn dependency unavailability, missing observations or partial history into zero, valid empty or a complete total; stale data **MUST** be labelled stale and revalidated before consequential use.
- Frontend **MUST NOT** treat Support → Sales handoff as permission transfer, a human decision as mutation execution, or revalidation as replay. Any future M12 path rechecks principal, business scope, authorization, business state, revision/staleness, relevant facts and previously uncertain effects; E02 is not bypassed.
- Frontend **MUST** keep Analytics observed/historical and Forecasts predicted/future. ACTUAL **≠** PREDICTED; `MODEL_NOT_READY` **≠** a zero forecast, valid-empty forecast or TARGET Ready. It **MUST NOT** fabricate model values/runs or display TARGET-only capability as CURRENT.
- Frontend **MUST** keep customer copy plain-language and scoped; it **MUST NOT** expose internal tool/run/runtime labels or protected evidence in Web Chat. Customer order/identity data needs backend verification.
- Frontend **MUST** clear previous-business data/subscriptions and isolate drafts on a business switch; it **MUST NOT** replay writes after navigation, reauthentication, duplicate click or a message-delivery retry.

## 27. Known limitations and open constraints

M08 live-provider/channel acceptance remains incomplete; E02 policy remains restricted; M12 durable replay-safe Resume is TARGET only; M13 has no validated model artifact. Exact numeric stock/report/provider freshness thresholds, supported order-change policy, detailed human decision/assignment rules and forecast target/horizon/quality limits remain backend/domain or product decisions. M07's proven knowledge parser scope is text/plain UTF-8 only. Complete responsive staff layouts, formal EN/RU/KZ QA, formal accessibility audit and actual usability evaluation remain future work. These are **not** failures of the completed Figma design phases, and no screen may imply they are already solved.

## 28. Figma and design references

The pages below are in the earlier phase 3A–3E file (`OFXTN83nFl3RqukrEYQrFy`). The current lab 3 file is described in §29. Since the November 2026 redesign these files define structure and interaction only; for colour, type and components follow §6.

| Figma page | Role in implementation |
| --- | --- |
| `03A — Low-Fi Wireframes` | Historical structural baseline and alternative rationale. |
| `03B — UX Review & Revisions` | Reviewed low-fi interaction semantics. |
| `03C — Design System` | **Authoritative visual tokens/components** and usage examples. |
| `03D — High-Fidelity Screens` | **Authoritative P0 full-screen visual source**: Shared Shell plus six P0 families. |
| `03E — Interactive Prototype` | **Validated scenario/interaction semantics** from preserved 03D copies; external demonstration controls are not product UI. |

For detailed evidence and variants, use [Phase 2E screen contracts](research/PHASE_2E_FINAL_SCREEN_INVENTORY.md), [Phase 3C components](research/PHASE_3C_DESIGN_SYSTEM.md), [Phase 3D high-fi validation](research/PHASE_3D_HIGH_FIDELITY.md) and [Phase 3E prototype validation](research/PHASE_3E_INTERACTIVE_PROTOTYPE.md). Implement visuals from 03C/03D and interaction truth from 03E plus trusted backend contracts. Phase 4 remains **READY / NOT STARTED** until separately authorized and accepted.

## 29. Lab 3 clickable prototype (responsive, mock data)

> The app no longer follows this prototype's visual style (dark sidebar, Inter, blue accent); it keeps its screens, breakpoints and flows. See §6 for the current visual system.

The lab 3 UX/UI deliverable is the Figma file [Diplom — Multi-Agent Platform UI (Lab 3)](https://www.figma.com/design/W6XefZbbmZq1YZltBfsry7) (`W6XefZbbmZq1YZltBfsry7`). It is a self-contained demonstration built on the decisions in §§3–23. All data in it is mock data for a sample store, "Ayala Outdoor" (Almaty, prices in ₸). It does not change the status of any capability in §24.

| Figma page | Contents |
| --- | --- |
| `01 — Design System` | Color, spacing and radius variables; text styles (Inter); components: Button (Primary/Secondary/Ghost/Danger × Default/Hover), Badge (status and agent tones), NavItem (Default/Hover/Active), Search input, 26 outline icons. |
| `02 — Screens & Prototype` | 10 screens × 3 breakpoints = 30 frames, connected by 215 click links (Smart Animate, 300 ms). |
| `03 — Sitemap & User Flows` | Personas, sitemap (designed vs planned screens) and four step-by-step user flows. |

**Screens:** Sign in · Overview · Conversations (list, thread, context panel) · Escalations (queue + decision detail) · Orders · Order detail (order state separate from reservation state) · Analytics (actual data, gaps not shown as zero) · Forecasts (`MODEL_NOT_READY` with an illustration-only preview) · Customer Web Chat · Web Chat after order confirmation.

**Responsive breakpoints:**

| Breakpoint | Layout |
| --- | --- |
| Desktop 1440 × 1024 | Dark 240 px sidebar with labels and business switch; header with search; 4-column KPI grid; 3-pane Conversations; full tables. |
| Tablet 834 × 1194 | 76 px icon rail; 2-column grids; Conversations shows list + thread with a context summary; tables hide secondary columns. |
| Mobile 390 × 844 | Top bar + bottom tab bar (Home, Chats, Orders, Analytics, More); single column; tables become cards; full-screen customer chat. |

**Interaction:** buttons and sidebar items animate on hover (While hovering → Hover variant, Smart Animate 150 ms). Content areas scroll inside fixed device frames. The prototype has five starting points: staff workspace on Desktop, Tablet and Mobile, and Customer Web Chat on Desktop and Mobile. To present, open page 02, press Play and pick a flow.

**User flows demonstrated:**
1. Operator resolves an uncertain reservation: Sign in → Overview → "Needs attention" → Escalation ESC-2041 → human decision → Order detail.
2. Purchase handled by agents: Conversations → Support → Sales handoff → confirmation card → Order created → Order detail.
3. Customer buys in Web Chat: product question → in-stock product card → Confirm order → Order confirmed.
4. Owner checks sales: Analytics → Open forecasts → model not ready → back to Analytics.
