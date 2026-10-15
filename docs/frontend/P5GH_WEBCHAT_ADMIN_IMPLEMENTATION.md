# P5G/H — Web Chat + Administration

**Status:** COMPLETE

**Branch:** `frontend/p5-webchat-admin`

## Scope

P5G/H implements the separate Customer Web Chat surface at `/chat` and the four staff Administration families at `/integrations`, `/settings`, `/audit`, and `/agent-runs`. It does not add public APIs, provider transport, persistence, mutations, authentication shortcuts, durable Resume, or backend behavior.

## Authorities

Implementation followed `docs/DESIGN.md`, the Phase 2E screen inventory, approved Phase 3C/3D/3E records and surviving plugin sources, then the existing P5A–P5F frontend conventions. `PRD.md`, `ARCHITECTURE.md`, `RULES.md`, `TASKS.md`, and `MEMORY.md` constrained capability and evidence claims. No authority or design source was changed.

## Design Audit

A pre-implementation design audit came first. Customer Web Chat remains outside the staff shell. Administration reuses the existing shell and Calm Operational SaaS system. Audit remains restricted/permissioned and Agent Runs contextual/restricted.

## Backend Contract Audit

A pre-implementation contract audit came first. The public backend still exposes only health endpoints. Internal persistence and domain types are not browser APIs, so all five screen families use deterministic local fixtures behind explicit adapter contracts with `publicEndpoint: null`.

## Capability Matrix

| Surface | Read presentation | Live read | Mutation / transport | Current truthful mode |
|---|---|---|---|---|
| Customer Web Chat | Typed fixture states | No public session/history API | Send, confirm, change and retry unavailable | `LOCAL UI FIXTURE ONLY` / `NOT_CONFIGURED` |
| Integrations | Typed fixture channel cards | No public integration API | Configure and validate unavailable | Deferred / Not configured |
| Settings | Typed read-only fixture fields | No public settings API | Save unavailable | Read-only contract boundary |
| Audit | Redacted authorized fixture specimen | No public audit API | No edit/delete | Restricted / permissioned |
| Agent Runs | Safe authorized fixture summary | No public run API | No Resume/replay | Contextual / restricted |

## Customer Web Chat

The customer route now has its own responsive shell, business identity, message timeline, actor labels, status detail, state-specific cards and an unavailable composer. Reviewable states cover initial, active, clarification, confirmation, processing, confirmed result, known reservation failure, waiting human, confirmation pending, message delivery failure, loading and dependency unavailable.

Confirmation explicitly says `Confirm order`. Known reservation failure says that the Order exists, the item was not reserved, and the same order should not be placed again. Confirmation Pending uses plain-language uncertainty and prevents duplicate submission. Delivery failure preserves the confirmed business result and limits recovery to the message. Customer output contains no ToolCall, Agent Run, LangGraph, `OUTCOME_UNKNOWN`, E02, M12, hidden reasoning or staff trace.

## Integrations

Instagram, WhatsApp, Telegram and Web Chat are presented as deterministic fixtures with separate readiness, operating-mode, capability and last-verification facts. No provider is claimed Connected, Healthy or Live. Configure and Validate controls are visibly unavailable, and missing M08 acceptance is explicit.

## Settings

Settings presents read-only synthetic business context, effective-access concepts and capability boundaries. Every field is disabled, the unavailable Save action explains that no write endpoint exists, E02 cannot be enabled here, and M12 is shown only as TARGET / NOT STARTED.

## Audit

The default route fails closed with a permission-denied state. The explicit fixture variant demonstrates independently authorized, redacted event search, rows and selected detail without secrets, private prompts, hidden reasoning or inaccessible-event disclosure. Valid empty, loading and dependency unavailable remain distinct.

## Agent Runs

The default route fails closed. The explicit fixture variant shows only safe run ownership, handler, stop state, provider metadata and a lifecycle chain: `MODEL PROPOSES → EXECUTOR AUTHORIZES → DOMAIN ENFORCES`. Tool arguments, secrets and chain-of-thought are withheld. Waiting Human has no Resume action; M12 remains a future revalidation-dependent target.

## Data / Fixture Strategy

Feature-local TypeScript models, adapter interfaces and deterministic fixture adapters isolate display data from routes and components. The adapters perform no `fetch`, server action, WebSocket, artificial delay or optimistic mutation. Synthetic North Shop records are labelled `LOCAL UI FIXTURE ONLY` and are never represented as backend truth.

## M08 Boundary

M08 remains **PARTIAL / BLOCKED / DEFERRED**. Web Chat transport and all four provider channels remain unaccepted for live use. Development fixture metadata does not complete provider acceptance.

## M12 Boundary

M12 remains **TARGET / NOT STARTED**. No Resume, replay or continuation mutation is implemented. Waiting-human presentation does not imply durable continuation.

## Security / Sensitive Data

Customer and staff shells remain separate. Restricted screens fail closed, frontend visibility does not grant access, and fixtures contain no credential, token, secret, raw prompt, chain-of-thought or unrestricted argument. Model proposals remain distinct from trusted executor authorization and domain effects.

## Accessibility

The implementation uses semantic headings, landmarks, lists, forms, labels, table structures and native disabled controls. Statuses include text and symbols rather than color alone. Existing focus tokens and 44 px mobile action targets are preserved. This is implementation evidence toward the WCAG 2.2 AA-level design target, not formal certification.

## Responsive

Customer Web Chat uses a bounded desktop column and a full-width mobile composition. At the mobile breakpoint, message cards wrap, fact rows become single-column, and actions stack. Administration retains the responsive shared shell; cards and list/detail regions collapse, while wide tables remain locally scrollable.

## Localization

Flexible grids, wrapping, `min-width: 0`, stacked mobile rows and non-truncated semantic labels support longer EN/RU/KZ-like content. Final translations and formal localization QA remain outside P5G/H.

## Tests

P5G/H adds 35 component/adapter tests: 11 for Web Chat and 24 for Administration. The full frontend result is **128/128 PASS across 19 files**. Lint, TypeScript, production build and production dependency audit pass; `npm audit --omit=dev` reports **0 vulnerabilities**. Production route-smoke checks pass **14/14** across default, fixture, restricted, safety and unavailable routes.

## Visual Validation

Headless Microsoft Edge screenshots were reviewed from the production build at 1440 px desktop, the active ≤560 px breakpoint, and an exact 390 px viewport through Chromium DevTools mobile emulation. At 390 px, `window.innerWidth`, document scroll width and body scroll width were all exactly `390`, proving no document-level horizontal overflow. Web Chat confirmation, known failure, confirmation pending, delivery failure and unavailable behavior were reviewed. Integrations, Settings, Audit fixture/restricted and Agent Runs fixture/restricted were reviewed. Layout, hierarchy, wrapping, disabled actions, local table overflow and safety copy passed. This is deliberate visual QA, not formal usability or localization certification.

## Known Gaps

- No authenticated principal/business/session API exists for these routes.
- No customer chat transport, receipt, confirmation or retry contract exists.
- No integration/settings/audit/agent-run public DTO or endpoint exists.
- M08 live-provider acceptance, M12 durable Resume and M13 forecasting remain incomplete as previously recorded.
- Formal assistive-technology, cross-browser, localization and user testing remain future gates.

## P5G/H Verdict

**COMPLETE.** The five approved screen families are implemented with truthful capability boundaries, typed deterministic fixtures, no fake API or business action, 128/128 tests, successful production build, 14/14 route smoke, zero production vulnerabilities and deliberate desktop/mobile visual review. E02 remains active; M08, M12 and M13 statuses are unchanged.

## P5I Readiness

P5I may begin only as a separately authorized integration/closure stage. It must start from approved authenticated public contracts and cannot reinterpret internal repositories or fixture adapters as live APIs. The recommended immediate next action is review and merge of `frontend/p5-webchat-admin` into canonical `main`; P5I was not started here.
