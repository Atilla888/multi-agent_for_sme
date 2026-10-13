# P5C — Conversations + Escalations

Date: 2026-10-14
Branch: `frontend/p5-conversations`

## 1. Scope

P5C replaces the placeholders at `/conversations`, `/conversations/[id]`, and `/escalations`
with the first high-fidelity product vertical slice. No other product family, backend service,
migration, Figma artifact, or research authority was modified.

## 2. Design Authorities

Implementation follows `docs/DESIGN.md`, the P5A/P5B frontend contracts, and the recoverable
Phase 3C/3D/3E local Figma-plugin artifacts. The design-to-code workflow was applied
authority-first: approved layout, semantics, and existing tokens/components were mapped to the
native Next.js project rather than copied as absolute-positioned canvas output.

## 3. Backend Contract Audit

The backend exposes only the health routes publicly. Conversations, messages, context, agent
outcomes, runs, and escalations have internal domain/persistence contracts but no staff-facing
FastAPI routes. The complete evidence matrix is in `P5C_BACKEND_CONTRACT_AUDIT.md`.

## 4. Capability Matrix

- health: LIVE-CONTRACT-READY;
- internal conversation/context/outcome shapes: READ-ONLY CONTRACT;
- product screens and scenario content: LOCAL UI FIXTURE ONLY;
- live session/channel delivery and escalation commands: UNAVAILABLE;
- Human Decision / durable Resume: TARGET-ONLY.

## 5. Conversations Architecture

The route renders a desktop-primary three-pane workspace: accessible conversation list,
selected message workspace, and persistent verified-context panel. Selection is represented by
real `/conversations/[id]` links. Deterministic validation query parameters expose loading,
empty, restricted, M08-unavailable, handoff, known-failure, OUTCOME_UNKNOWN, and message-delivery
failure states for review without creating server endpoints.

Messages identify Customer, Human Operator, Sales Agent, Support Agent, Analytics Agent, or
System in the view-model contract. The Adaptive Orchestrator is never rendered as a fourth agent.

## 6. Escalations Architecture

The Escalations route composes a queue with the approved Decision Context hierarchy:
Why automation stopped, Confirmed facts, Uncertain effect, Constraints, Next safe step, and
Human decision. WAITING_HUMAN, OUTCOME_UNKNOWN, known failure, E02 restricted, resolved history,
and M12 TARGET states are deterministic read-only scenarios. Queue selection uses URL query
links and never becomes a generic helpdesk ticket model.

## 7. Data / Fixture Strategy

Typed view models live in feature modules. Deterministic fixtures live only in named `fixtures/`
directories and are exposed by explicit fixture adapters. They never import the API client,
never make a network request, and are visibly labelled `LOCAL UI FIXTURE ONLY` in the UI.

## 8. M08 Boundary

M08 remains PARTIAL / BLOCKED / DEFERRED. Channel names are labelled demonstration context,
the composer is disabled, and no message is claimed live or delivered. Message-delivery failure
is separate from business-effect status.

## 9. M12 Boundary

Durable Human Resume remains TARGET / NOT STARTED. The target view states the missing backend
call/persistence/transition and presents only a disabled `Request controlled Resume · TARGET`
button. No fake success or replay exists.

## 10. OUTCOME_UNKNOWN Safety

The state explicitly says that a mutation may have committed, confirmation is unavailable,
authoritative reconciliation is required, and blind mutation retry is unsafe. There is no Retry
transaction, Repeat order, or equivalent action. Known failure uses current-fact review and an
authorized recovery path instead.

## 11. Accessibility

The implementation uses semantic main/aside/nav/section/article structures, labelled searches,
keyboard-reachable links, `aria-current` selected state, explicit actor names, text plus status
markers, logical headings, native disabled controls, and the existing P5B visible focus rules.
No unnecessary ARIA chat role was added.

## 12. Responsive Behavior

Desktop preserves the approved three-pane proportions. Medium layouts retain list/workspace and
move context below. Narrow layouts place the selected workspace before the list and context, use
single-column decision cards, and compact the shared shell into a horizontal six-area navigation
row. The Customer Web Chat design was not changed.

## 13. Localization Resilience

Grid tracks use flexible `minmax` sizing, controls wrap, status labels may wrap, and narrow
breakpoints become single-column. The review considered 30–50% longer EN/RU/KZ labels without
adding a translation system or English-specific fixed control widths.

## 14. Testing

P5C adds behavioral tests for list/routing selection, fixture parsing, actor identity, empty and
loading states, M08 unavailable state, disabled send, Support-to-Sales handoff, message-delivery
separation, WAITING_HUMAN, OUTCOME_UNKNOWN safety, known failure, E02, and disabled M12 TARGET
Resume. Fixture tests are not represented as backend integration tests.

## 15. Visual Validation

Headless Edge screenshots were deliberately inspected at 1440×1100 for the selected handoff
conversation and OUTCOME_UNKNOWN escalation and at 390×1000 for the narrow conversation state.
The first review exposed a stale `.next` CSS cache and a shell that consumed the narrow viewport;
the generated cache was safely rebuilt and the shell navigation was compacted. Final review
checks cover overflow, alignment, spacing, wrapping, state ambiguity, focus foundations, and
Design System reuse. Temporary screenshots are not repository evidence and are removed before
commit.

## 16. Known Gaps

- no authenticated current-principal/business integration;
- no public conversation, message, or escalation API;
- no live unread synchronization or channel delivery;
- no current handoff orchestration command;
- no reconciliation command;
- no durable M12 Resume;
- exact responsive breakpoints were not specified by design authority.

## 17. P5C Verdict

**COMPLETE for the authorized truthful frontend scope.** The vertical slice is high-fidelity and
fully testable, but intentionally uses isolated development fixtures wherever the public backend
contract is absent.

## 18. P5D Readiness

P5D is READY / NOT STARTED. Recommended next: open and review a PR from
`frontend/p5-conversations` to `main`; after merge, authorize P5D as a separate product-screen
phase with a fresh contract audit. Do not treat P5C fixtures as backend integration evidence.
