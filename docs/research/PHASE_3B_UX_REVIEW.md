# Phase 3B — UX Review and Low-Fi Refinement

## 3B.0 Scope and Source Authority

Phase 3B reviewed and refined the six P0 low-fidelity areas from [Phase 3A](PHASE_3A_LOW_FI_WIREFRAMES.md): Conversations, Escalations, Orders, Customer Web Chat, Analytics and Forecasts. The approved [Phase 2C information architecture](PHASE_2C_INFORMATION_ARCHITECTURE.md), [Phase 2D behavioral flows](PHASE_2D_CORE_USER_FLOWS.md), [Phase 2E functional inventory](PHASE_2E_FINAL_SCREEN_INVENTORY.md) and [Phase 2B UX validation](PHASE_2B_UX_VALIDATION.md) were inputs, not objects of revision. `FINAL_MASTER_DEVELOPMENT_SAFE.pdf` remains the higher technical and engineering-status authority. No Phase 2 function, route relationship, agent/tool permission or implementation status is redefined here.

The canonical design artifact is [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy) (key `OFXTN83nFl3RqukrEYQrFy`). Page `03A — Low-Fi Wireframes` remained the approved, unchanged baseline; revisions were made on `03B — UX Review & Revisions`, with a safety backup. After the Figma MCP quota was exhausted, a **local Figma Desktop development plugin** supported controlled 03B generation and structural inspection. Its generated structures were subsequently reviewed and refined manually in the real file.

The owner-provided final validation report records **17/17 structural checks PASS** and **6/6 scenario walkthroughs present**. This checks named structures and labels only. The separate owner-reported manual visual and semantic review supports the UX close-out; neither a node count nor the plugin validator alone proves usability. This document records that review and does not claim that a working frontend, live channel, M12 resume or M13 forecast model was built.

## 3B.1 Review Method

Review proceeded screen by screen across the six P0 areas, then through six cross-screen scenarios. Each pass checked normal, pending, known-failure, uncertain-effect, stale, unavailable and recovery paths where relevant. Manual canvas inspection identified hierarchy and copy problems; the appropriate low-fi variants were refined and visually checked again. A final structural plugin validation checked the presence of agreed frames/states. Semantic acceptance came from manual review, not from automated naming checks. No Phase 3C styling decisions were made.

## 3B.2 Review Criteria

The review used: scannable information hierarchy; manageable cognitive load; visible system state and current owner; clear next safe action; nearby verified customer/business context; prevention of duplicate or unauthorized actions; recoverable error and uncertainty paths; cross-screen consistency; clear AI-versus-human responsibility; and exact separation of proposals, trusted business effects and communication delivery. These are low-fi interaction criteria, not final color, typography or component specifications.

## 3B.3 Conversations Review

The earlier Phase 3B revision retained the selected Phase 3A model: **Conversation List + Conversation Workspace + persistent Context Panel**. The panel keeps relevant customer, order/reservation, inventory and source context near the active thread instead of requiring repeated tab/drawer switching. Current Sales/Support/Human handler, handoff, business-action result and escalation relationship remain visible. `OUTCOME_UNKNOWN` is not treated as success or failure; a failed customer-message delivery does not reverse a confirmed business effect. Conversations was not rebuilt from scratch during the later local-plugin work.

## 3B.4 Escalations Review

Escalations remains a nested **Queue + Decision Context** under Conversations. The queue is for triage—waiting assignment, assigned, awaiting decision, reconciliation and TARGET M12 resume-pending cases—rather than full investigation. Decision Context was made scannable in this order: **WHY AUTOMATION STOPPED → CONFIRMED FACTS → UNCERTAIN EFFECT → CONSTRAINTS → NEXT SAFE STEP → HUMAN DECISION**. Known failed/blocked work is shown when applicable, not inserted as an empty category. The operator can distinguish verified effects from an uncertain reservation and see the proposed safe next step.

For `OUTCOME_UNKNOWN`, a mutation may already have committed, confirmation is unavailable, reconciliation of authoritative state is required, and blind retry is prohibited. Human controls name their object: approve/reject a **proposed continuation**, request clarification, request controlled resume after revalidation, or close. M12 durable resume is **TARGET UX only**: human decision → revalidation of rights/state/effect → controlled resume request; it is not automatic mutation replay. E02 is a distinct `update_order` restriction, not the cause of an uncertain `reserve_inventory` outcome; no successful E02 mutation is depicted.

## 3B.5 Orders Review

Order State and Reservation State are separate blocks and separate business facts. A created Order can coexist with confirmed reservation, **known failed reservation**, or reservation `OUTCOME_UNKNOWN`; there is no generic success label that hides a partial result. For known failure, inventory is **not reserved**: review current inventory and choose an authorized recovery path. Reconciliation is not required merely because the failure is known. For `OUTCOME_UNKNOWN`, the effect may have committed: reconcile authoritative state first and never blindly repeat `reserve_inventory`.

Needs Human Attention, stale/conflicting and E02-restricted update states remain separate. A stale proposal needs refreshed facts and a new authorized decision. E02 `update_order` remains restricted pending policy resolution. Confirmed reservation plus failed customer notification is a **delivery problem**, not a reason to repeat the confirmed reservation.

## 3B.6 Customer Web Chat Review

Web Chat remains a separate customer-facing channel surface without staff navigation or internal run/tool/audit terminology. The reviewed variants are Initial, Active, Clarification Requested, Confirmation Required, Processing, Confirmed Result, Known Failure, Waiting for Human, Confirmation Pending, and Delivery/Connection Failure. The purchase confirmation action says **Confirm order**, naming the business action; **Change details** remains available. Processing says the result will appear in the conversation and does not imply the chat must remain open.

The known reservation-failure message says the Order already exists but the item was not reserved, warns against placing the same order again, and offers a customer-friendly next step. Confirmation Pending explains that the result cannot yet be confirmed and asks the customer not to submit the same request again; it does not expose the internal `OUTCOME_UNKNOWN` label. Human waiting and delivery failure are understandable to the customer. A failed update delivery does not erase a confirmed reservation or invite a duplicate purchase.

## 3B.7 Analytics Review

Analytics is **observed/historical** business data only: metric and period selection, KPI summary, historical chart and detail placeholders, completeness, freshness, and navigation to Forecasts. The reviewed states are Loading, Valid Result, Valid Empty, Incomplete Data, Stale Data, Dependency Unavailable and Permission Denied. A valid empty query differs from an unavailable source; **DATA UNAVAILABLE is not SALES = 0** and is not rendered as a zero-value chart. Partial and stale data carry explicit caveats rather than silently becoming complete/current totals. Predictions do not appear inside historical results.

## 3B.8 Forecasts Review

Forecasts is a separate nested Analytics destination. Its target-ready structure labels historical **ACTUAL** and future **PREDICTED** values separately and includes target, cutoff, horizon, provenance and limitations. The ready frame is explicitly **TARGET PRODUCT UX**. The current engineering state is **`MODEL_NOT_READY`**: no prediction has been produced, no zero forecast or valid-empty forecast is implied, and no fictitious ForecastRun is claimed. Additional reviewed states are Insufficient History, Unsupported Horizon, Model Unavailable, Timeout, Incomplete History and Permission Denied.

## 3B.9 Cross-Screen Navigation Review

Contextual relationships were preserved conceptually: Conversation → Order; Order → Conversation; Conversation → Escalation; Escalation → Conversation and Order; and Analytics → Forecasts. Authorized case/run references may provide deeper evidence without becoming normal customer navigation. These are low-fi links/labels and do not create P1/P2 destination screens. A reference or visible route never grants permission; the destination must recheck scope and current facts.

## 3B.10 Failure / Recovery Review

| Condition | What is known | Safe next action |
| --- | --- | --- |
| Known business failure | Trusted result establishes that the requested effect failed (for example, no reservation). | Review current facts and choose an authorized recovery; do not call it success or require unknown-effect reconciliation by default. |
| `OUTCOME_UNKNOWN` | Mutation may have committed, but confirmation is unavailable. | Keep status pending, reconcile authoritative effect using the operation context, and block blind write replay. |
| Dependency unavailable | Required source/capability cannot supply a trustworthy result. | Explain unavailability and retry only when safe or route to support; never show valid empty/zero as a substitute. |
| Stale/conflicting | A previously observed version may no longer be current. | Refresh and re-evaluate before a consequential action or human decision. |
| Delivery failure | Customer communication failed or is unconfirmed; the business effect has its own status. | Retry communication/contact only; preserve any confirmed Order/reservation. |
| `MODEL_NOT_READY` | No validated forecast artifact/result exists. | Show no prediction; historical Analytics remains separately available. |

## 3B.11 State Consistency Review

Across screens, an AI proposal, an admitted attempt, a confirmed Order, a confirmed reservation, and a delivered message are different facts. `create_order` **does not equal** `reserve_inventory`. A known failed reservation is not an uncertain effect. `OUTCOME_UNKNOWN` always means possible commit, confirmation unavailable, reconciliation needed and no blind retry; customer language explains the pending result without leaking technical labels. A confirmed business effect remains confirmed when outbound delivery fails. Observed actuals are never relabelled as predictions. E02 restriction and M12/M13 target-versus-current limits are consistently identified.

## 3B.12 Role Review

The **Customer** receives plain-language request, confirmation, result, human-wait and delivery states in Web Chat, not staff trace or navigation. The **Operator** uses Conversations/Orders/Escalations to see verified context, current owner, allowed decision and safe recovery. The **Business Owner** uses permissioned historical Analytics and distinct Forecasts/readiness. Administration and technical evidence are referenced only when the relevant role has permission. Visibility or a hidden/visible control is never a substitute for server-side business, resource, action and current-policy authorization; Support → Sales handoff does not transfer rights.

## 3B.13 Device / Language Risks

The reviewed staff wireframes remain desktop-primary; dense decision/context blocks may need responsive prioritization later. Customer Web Chat is mobile-important. Russian, English and Kazakh label expansion may change wrapping and status-card density, and should be tested in later design work. These are recorded risks, **not** completed responsive layouts, localization, or accessibility acceptance tests.

## 3B.14 Findings Register

The following **11 substantive findings** were reported and resolved during Phase 3B. Severity describes UX risk in the reviewed low-fi artifact, not a new engineering incident classification.

| ID | Screen | Severity | Issue | Resolution | Status |
| --- | --- | --- | --- | --- | --- |
| B-01 | P0 detail views | MAJOR | Earlier detail content was clipped. | Revised low-fi grouping/bounds and manually reviewed visibility. | FIXED |
| B-02 | Cross-screen states | MAJOR | State descriptions were ambiguous. | Made known, pending, uncertain, restricted and delivery outcomes explicit. | FIXED |
| B-03 | Orders | CRITICAL | Order creation could be conflated with reservation success. | Separate Order State and Reservation State with partial outcomes. | FIXED |
| B-04 | Escalations / recovery | CRITICAL | Resume/retry wording could imply an unsafe repeated mutation. | TARGET M12 revalidation and no-replay path; reconciliation before unknown-effect retry. | FIXED |
| B-05 | Escalation Decision Context | MAJOR | Reason, facts, uncertainty and safe step lacked a clear scan hierarchy. | Ordered, explicitly titled decision blocks. | FIXED |
| B-06 | Escalations | MAJOR | E02 restriction appeared conflated with uncertain reservation. | Separate E02 `update_order` treatment from reservation `OUTCOME_UNKNOWN`. | FIXED |
| B-07 | Escalation decisions | MAJOR | Generic Approve/Reject/Clarify labels hid the decision object. | Contextual proposed-continuation, clarification, resume-request and close labels. | FIXED |
| B-08 | Orders | MAJOR | Known reservation failure resembled unknown-effect reconciliation. | Known failure now leads to current-inventory review and authorized recovery; uncertainty alone leads to reconciliation. | FIXED |
| B-09 | Web Chat confirmation | MAJOR | Generic Confirm did not name the authorized business action. | Changed primary action to Confirm order. | FIXED |
| B-10 | Web Chat known failure | MAJOR | A customer might repeat an already-created order after reservation failed. | Explicitly warn not to place the same order again. | FIXED |
| B-11 | Web Chat processing | MINOR | Keep Chat Open implied processing depended on an open window. | Removed that CTA; show neutral in-conversation update wording. | FIXED |

## 3B.15 Revisions Applied

Durable revisions are the preserved three-pane Conversations model; queue-versus-decision Escalations with explicit hierarchy; independently stated Order/reservation results; customer-safe confirmation and pending language; historical-only Analytics; distinct target/current Forecasts; and consistent recovery language for known failure, unknown effect, stale data and delivery failure. Low-fi native editable frames, text, simple strokes and grayscale were retained. This summary intentionally omits incidental spacing and alignment changes.

## 3B.16 Scenario Walkthrough Results

| Scenario | Reviewed path and decisive guard | Result |
| --- | --- | --- |
| 1 — Product Availability | Customer → Conversation → Sales → product lookup → inventory check → availability confirmed; no claim before verification. | PASS |
| 2 — Purchase + Successful Reservation | Customer confirmation → `create_order` → Order exists → `reserve_inventory` → reservation confirmed → customer result; effects remain separate. | PASS |
| 3 — Purchase + Reservation Failure | Order creation succeeds → Order exists → reservation fails → partial outcome → current-fact review/authorized recovery or human attention. | PASS |
| 4 — Support → Sales Handoff | Support → verified context → Sales-required mutation → handoff → Sales continues using its own authorization; no permission transfer. | PASS |
| 5 — `OUTCOME_UNKNOWN` → Escalation | Mutation attempt → missing confirmation → no blind retry → reconciliation → escalation → human decision → revalidation. | PASS |
| 6 — Analytics → Forecast | Owner → historical Analytics → actuals → forecast request → current `MODEL_NOT_READY`; TARGET available path keeps Actual and Predicted separate. | PASS |

## 3B.17 Final Validation

The owner-provided final plugin report for `03B — UX Review & Revisions` records **17/17 structural checks PASS**, including the six P0 areas, `OUTCOME_UNKNOWN`, `MODEL_NOT_READY`, E02, Order/Reservation separation and Scenarios 1–6; **6/6 walkthroughs are present**. Structural validation checks presence/naming and expected labels, not whether a person understands the workflow. Manual visual and semantic review was also performed and accepted by the owner before this documentation close-out. No independent Figma edit or re-run of the validator occurred while writing this report.

## 3B.18 Remaining Open Questions

These are implementation/business-policy or later-design dependencies, **not failed Phase 3B UX checks**: M12 durable replay-safe Human Resume is target-only; E02 `update_order` editable-field/transition policy remains restricted; M13 has no forecast artifact (`MODEL_NOT_READY`); M08 live-provider specialist acceptance remains PARTIAL/BLOCKED and live channel adapters are not evidenced; reconciliation ownership/SLA and exact stock/report freshness thresholds need domain/backend decisions; and detailed responsive behavior, language expansion and formal accessibility acceptance remain for later design validation. Phase 3B closure does not promote any of these to implemented capability.

## 3B.19 Inputs for Phase 3C

Later design-system work must differentiate the semantic states **success, pending, warning, error, `OUTCOME_UNKNOWN`, stale, restricted, waiting human, `MODEL_NOT_READY`, and dependency unavailable** without relying only on color. Recurrent component families to evaluate are navigation, status blocks, conversation items, context summaries, order/reservation states, escalation cards, action buttons, analytics summaries, chart/table regions and forecast-result states. These are **inputs**, not selected colors, fonts, spacing values, tokens, production components or a started Phase 3C.

## 3B.20 Phase 3B Summary

**Phase 3B — UX Review and Low-Fi Refinement is COMPLETE** in its six-P0-area scope: the owner-reported manual visual/semantic review is complete, six scenario walkthroughs passed, and final structural validation returned 17/17 PASS. The 03A baseline remained unchanged and reviewed revisions live in 03B. This design-review completion does not mean Phase 3C, a high-fidelity prototype, a working frontend or the unstarted engineering milestones are complete.
