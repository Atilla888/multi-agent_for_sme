# Phase 3E — Interactive Prototype

## 3E.0 Scope and Source Authority

Phase 3E is **COMPLETE** as an interactive Figma design prototype. The canonical file is [Diplom — Multi-Agent Platform UX/UI](https://www.figma.com/design/OFXTN83nFl3RqukrEYQrFy) (key `OFXTN83nFl3RqukrEYQrFy`); the prototype is on `03E — Interactive Prototype`. The owner-provided final real-Figma validation reports **8/8 flows PASS**, source-page protection PASS, visual-source preservation PASS, zero broken/prohibited destinations and **Overall PASS**. The owner also manually reviewed every generated flow. This close-out records those results; it did not re-run Figma validation or edit the file.

The consolidated `FINAL_MASTER_DEVELOPMENT_SAFE.pdf` governs architecture and actual engineering status. [Phase 2D](PHASE_2D_CORE_USER_FLOWS.md) governs behavioral contracts; [Phase 2E](PHASE_2E_FINAL_SCREEN_INVENTORY.md) governs screen functions; [Phase 3B](PHASE_3B_UX_REVIEW.md) governs reviewed UX semantics; [Phase 3C](PHASE_3C_DESIGN_SYSTEM.md) governs the visual system; and [Phase 3D](PHASE_3D_HIGH_FIDELITY.md) supplies the approved high-fidelity visual source. The eight prototype scenarios demonstrate selected paths from that larger design scope; they do not replace all ten Phase 2D behavioral flows or imply that their backend is operational.

## 3E.1 Prototype Strategy

`03D — High-Fidelity Screens` remains the canonical approved visual source. `03E` contains fresh copies of the relevant 03D states, prototype links and external explanatory annotations. Phase 3E introduces no feature redesign and no invented product screen where an approved 03D state already exists. The prototype demonstrates state transitions and safe interpretation, not live business execution.

## 3E.2 Source Protection

`03A — Low-Fi Wireframes`, `03B — UX Review & Revisions`, `03C — Design System` and `03D — High-Fidelity Screens` were protected, source-only inputs. Phase 3E writes were restricted to `03E — Interactive Prototype`; the owner-provided source-page protection and visual-source preservation gates both passed. The 03D-derived product frames retained their approved appearance while prototype-specific scaffolding stayed on the 03E board.

## 3E.3 Prototype Controls vs Product Controls

An existing, visible, approved product action is a **PRODUCT CONTROL** and may carry a prototype reaction when that action actually advances the depicted task. Examples are **Open Order** in Flows 2–3, **Open Escalation** in Flow 5 and **Confirm order** in Flow 8. By contrast, a system event, scenario event, future capability or demonstration-only progression uses a visibly separate, neutral **PROTOTYPE CONTROL** outside the product frame. It must not masquerade as an application CTA or invisible hotspot. Flow 1's external continuation replaced an ambiguous reaction on an already-selected conversation row. External START/STEP/END annotations explain the demonstration without changing product copy.

Prototype reactions show navigation between prepared states; neither kind of control by itself proves backend authorization, tool execution, data freshness or delivery. Every real action would still require trusted, current-scope checks.

## 3E.4 Flow 1 — Product Availability

**Default / Active → external prototype continuation → Support Active.** STEP 1 states that the Customer asks about product availability; STEP 2 identifies Support's use of verified Product + Inventory context, and the second frame is explicitly the END state. The continuation is a visible prototype-board control, not an interaction on `Conversation row / 1` and not an invisible hotspot. Product existence **does not equal** inventory availability. An observed inventory reading **does not promise live stock** or a reservation; freshness and source authority still matter.

## 3E.5 Flow 2 — Purchase Success

**Awaiting Customer Confirmation → external customer-confirmation-received progression → Processing → external business-result-confirmed progression → Confirmed Business Result → Open Order PRODUCT CONTROL → Reservation Confirmed.** The customer authorizes the proposed order before execution; Processing is not a confirmed result. The Order's existence and the inventory reservation are separate trusted effects, and both must be confirmed before the combined result is claimed. Message delivery is a separate communication outcome, not proof of either business effect.

## 3E.6 Flow 3 — Reservation Failure

**Known Failure → Open Order PRODUCT CONTROL → Reservation Failed → safe recovery context.** The Order may exist while reservation is known to have failed. This is a **known non-reservation**, not `OUTCOME_UNKNOWN`: review current inventory and choose a newly authorized recovery action. There is no default unknown-effect reconciliation, automatic retry or replay of the failed attempt. Order State remains distinct from Reservation State.

## 3E.7 Flow 4 — Support → Sales Handoff

**Support Active → prototype handoff progression → Handoff → prototype continuation → Sales Active.** Both progressions are external prototype controls. Support is the previous handler; Sales is the next/current handler. Verified case context is carried forward, but the handoff **does not transfer permissions**. Any subsequent Sales proposal needs independent authorization against current principal, business scope, state and policy; E02 cannot be bypassed by changing specialists.

## 3E.8 Flow 5 — OUTCOME_UNKNOWN → Escalation

**Conversation `OUTCOME_UNKNOWN` → Open Escalation PRODUCT CONTROL → Reconciliation Required → Human Review.** Confirmed facts are separated from an uncertain effect: a mutation may have committed although confirmation is unavailable. The path requires authoritative-state reconciliation before any new mutation, prohibits blind retry and automatic replay, and does not assert success or rollback. A known failure and E02 policy restriction are different states. Durable M12 Resume is outside this flow.

## 3E.9 Flow 6 — Human Decision / Resume TARGET

**Awaiting Decision → Human Decision → Revalidation Gate → Controlled Resume request → Resume Pending — TARGET M12.** The target state is prominently labelled **TARGET M12 — NOT CURRENTLY IMPLEMENTED**. A human decision is not mutation execution; revalidation is not replay; a controlled request is not a successful resumed effect. Before any future resume, the principal, business scope, authorization, business state, revision/staleness and relevant facts must be checked afresh. Any `OUTCOME_UNKNOWN` effect must already be reconciled. No mutation is replayed and the E02 restriction is not bypassed. This illustrates intended UX, not implemented durable M12 behavior.

## 3E.10 Flow 7 — Analytics → Forecasts

The **CURRENT** path is **Analytics Valid → Open Forecasts → `MODEL_NOT_READY` → return to Analytics**. Analytics contains observed/historical results. The current Forecasts state produces no prediction because M13 has no validated artifact. A separate, **non-interactive TARGET PRODUCT UX** specimen shows TARGET Ready; there is no current `MODEL_NOT_READY` → TARGET Ready operational route.

In the target specimen, **ACTUAL** is a solid historical series, **CUTOFF** marks the last observed boundary, and **PREDICTED** is a dashed future series. Labels, position and line style distinguish actual from prediction beyond color. The specimen does not claim a trained model, valid ForecastRun or live numerical forecast.

## 3E.11 Flow 8 — Customer Web Chat

The primary customer path is **Confirmation Required → Confirm order PRODUCT CONTROL → Processing → Confirmed Result**. The contextual action explicitly authorizes the business request; Processing alone is not confirmation. A separate recovery branch is **Confirmed Result → external Message Delivery Failure progression → Retry message → the existing Confirmed Result**. Retrying the message is communication-only: it does not repeat Order creation or inventory reservation, and a failed message cannot undo the confirmed business result.

The Web Chat remains a customer-only, plain-language surface. It does not expose staff navigation or internal labels such as `ToolCall`, Agent Run, E02 or `OUTCOME_UNKNOWN`; its visible wording does not invite duplicate ordering.

## 3E.12 Semantic Safety Rules

The prototype preserves these independent meanings across screens and transitions:

| Distinction | Required interpretation |
| --- | --- |
| Proposal ≠ execution; Processing ≠ confirmed | A suggested or in-flight action cannot be presented as a trusted completed effect. |
| Order State ≠ Reservation State | An Order can exist without a confirmed inventory hold. |
| Known Failure ≠ `OUTCOME_UNKNOWN` | Known failure supports current-fact review and a new authorized recovery; possible commit requires reconciliation first. |
| `OUTCOME_UNKNOWN` → reconciliation | Inspect authoritative effect evidence; no blind mutation retry, automatic replay or invented rollback. |
| Handoff ≠ permission transfer | Current principal, business/resource/action and policy checks remain independent. |
| Human decision ≠ mutation execution; revalidation ≠ replay | M12's target request cannot bypass fresh checks, E02 or effect reconciliation. |
| Order Delivery ≠ Message Delivery | Fulfillment/logistics and customer communication are different outcomes. |
| Message Delivery Failure ≠ Business Action Failure | Retry communication only; never replay a confirmed Order or reservation. |
| Analytics ≠ Forecasts; ACTUAL ≠ PREDICTED | Observed history is separate from forecast output; target chart uses a cutoff and non-color-only series cues. |
| `MODEL_NOT_READY` ≠ TARGET Ready | Current M13 readiness is not an illustrative future result. |
| TARGET M12 ≠ current capability | Resume Pending is a future UX specimen, not a working durable Resume. |

Visible prototype links do not replace backend authorization or prove live execution.

## 3E.13 Current vs TARGET Boundaries

The two explicit target-only areas are **M12 durable Human Resume** and **M13 Forecast TARGET Ready**. Current evidence does not include durable replay-safe M12 resume, a validated M13 ModelArtifact or a produced forecast. Flow 6 ends in a target Resume Pending specimen; Flow 7 keeps current `MODEL_NOT_READY` separate from a non-interactive TARGET Ready specimen. These are design demonstrations only and may become operational only after their own engineering and validation gates.

## 3E.14 Runtime / Plugin Implementation

The local development plugin is `design/figma-plugins/figma-phase3e-plugin/`. It offers **Inspect 03D Sources**, **Inspect Prototype API**, individual **Build Flow 1–8** actions, **Validate Prototype** and **Copy Validation Report**. Builders use exact 03D source names, create fresh clones on 03E, stage the new flow, validate before swap, replace only explicitly owned generated content and roll back on failure. Ambiguous or manual older prototype content is archived rather than silently destroyed. The plugin has no Figma MCP dependency and uses neither fabricated plugin IDs nor private plugin data for ownership.

Figma prototype reactions were writable and used. The formal `flowStartingPoints` property was read-only in the available Plugin API, so visible external START annotations identify flow entry points on the board; formal Figma starting points can be added manually if desired. **Prototype API: PARTIAL** describes that authoring limitation, not a product limitation or broken reaction. Inspect and Validate are read-only.

## 3E.15 Manual Visual Review

The owner reports manual visual review after real Figma generation for **all eight flows**, separate from the automated validator. The review confirmed: Flow 1's external continuation instead of an ambiguous selected-row click; Flow 2's confirmation-before-processing and external system-result progression with product Open Order; Flow 3's known-failure recovery without reconciliation or automatic retry; Flow 4's changed handler without permission transfer; Flow 5's unknown-effect reconciliation and no blind retry; Flow 6's prominent TARGET M12 and visible Revalidation Gate without replay; Flow 7's separated CURRENT/TARGET and non-interactive TARGET Ready; and Flow 8's **Confirm order**, effect-versus-delivery separation and communication-only **Retry message**. This is owner-reported visual acceptance, not a formal usability study.

## 3E.16 Final Prototype Validation

The owner-provided final aggregate result from the real Figma file is:

| Gate | Result |
| --- | --- |
| 03D source inspection | PASS |
| Prototype API | PARTIAL — reactions writable; formal flow starting points read-only |
| Principles / Validation sections | PASS |
| Flow 1 — Product Availability | PASS |
| Flow 2 — Purchase Success | PASS |
| Flow 3 — Reservation Failure | PASS |
| Flow 4 — Support → Sales Handoff | PASS |
| Flow 5 — `OUTCOME_UNKNOWN` → Escalation | PASS |
| Flow 6 — Human Decision / Resume TARGET | PASS |
| Flow 7 — Analytics → Forecasts | PASS |
| Flow 8 — Customer Web Chat | PASS |
| Source-page protection | PASS |
| Visual-source preservation | PASS |
| Broken/prohibited destinations | **0** |
| **Overall** | **PASS — 8/8 flows** |

The gates support prototype structure, interaction wiring, selected semantic-safety checks and source preservation. They do **not** establish backend execution, production readiness, live channel acceptance or formal usability, accessibility or localization certification. The PARTIAL API finding does not invalidate working reactions or the Overall PASS.

## 3E.17 Remaining Limitations

These are subsequent engineering, product or QA dependencies, **not Phase 3E validation failures**: M08 live-provider/channel acceptance remains incomplete; M12 durable Resume is target-only; E02 `update_order` business-policy restriction remains unresolved; M13 has no validated forecast artifact; formal Figma flow starting points require manual setup if desired; complete responsive staff QA, formal EN/RU/KZ localization QA and formal accessibility audit/certification remain future work. Figma navigation does not prove a backend runtime, real channel delivery or policy enforcement.

## 3E.18 Inputs for Phase 3F

Phase 3F — Final `DESIGN.md` is **NOT STARTED**. Its input is the approved Phase 2D/2E behavior and inventory, Phase 3B reviewed semantics, Phase 3C system, Phase 3D high-fi source and this eight-flow Phase 3E prototype with its owner-reported Overall PASS and manual review. A future final design close-out should preserve current-versus-target labels, source authority, permission and effect boundaries, and evidence limits; it must not promote prototype reactions to implemented application capability. This report does not perform Phase 3F.

## 3E.19 Phase 3E Summary

**COMPLETE:** eight interactive scenarios on `03E — Interactive Prototype` were manually reviewed and passed final real-Figma aggregate validation, with protected 03A–03D sources, preserved 03D-derived visuals and zero broken/prohibited destinations. Product controls were used for existing approved actions; external prototype controls and annotations were used for scenario/system/target-only progression. `OUTCOME_UNKNOWN` reconciliation, no blind replay, separate Order/reservation/delivery truths and M12/M13 target boundaries remain explicit. This is completion of the Phase 3E design-prototype scope only.
