# P5B — Design System Implementation

## 1. Scope

P5B implements the reusable visual and interaction primitives required by later frontend screens. It refines the P5A foundation without completing Conversations or any other business screen, connecting a backend, changing authentication, fabricating business data, or modifying Figma.

## 2. Authorities

Implementation was derived from `docs/DESIGN.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, both P5A records, `design/README.md`, the approved Phase 3C/3D reports, and local Phase 3C/3D plugin source evidence. The selected direction remains **Calm Operational SaaS**, primary light. `03C — Design System` is the component/token authority and `03D — High-Fidelity Screens` is the visual reference. The pre-implementation extraction is recorded in `P5B_DESIGN_SYSTEM_AUDIT.md`.

## 3. Design Token Mapping

`frontend/src/styles/globals.css` now maps the approved primitive palette to purpose-based aliases for surfaces, text, borders, actions, focus, disabled presentation, every approved status family, and ACTUAL/PREDICTED chart roles. Existing P5A aliases remain as compatibility mappings. Values are centralized; component rules consume semantic or primitive variables rather than scattered raw colors.

The approved 4-point spacing set (4/8/12/16/24/32/48), 4/6/8/pill radii, 40 px staff control baseline, and 44 px touch target are represented. Base surfaces are border-led with no shadow. A minimal existing 1 px floating shadow remains an explicitly inferred treatment because exact shadow values are not frozen.

## 4. Typography

The approved hierarchy is implemented: Page Title 28/36 Bold, Section Heading 20/28 Semi Bold, Card Heading 16/24 Semi Bold, Body and Body Strong 14/22, Small 13/20, Caption and Label 12/18, and Metric 24/32. Inter remains first in the documented system-font stack; no font binary was downloaded or committed. A separate mono/data style was not specified and was not invented.

## 5. Component Inventory

The exact implementation/test status is maintained in `P5B_COMPONENT_MATRIX.md`. Implemented generic primitives are:

- Button and IconButton;
- Input, SearchInput, Textarea, native Select, Checkbox, and shared Field behavior;
- Badge, StatusBadge, StateNotice, and named critical-state wrappers;
- EmptyState and labelled LoadingState/skeleton;
- Card composition, Separator, Avatar, and ContextHelper;
- accessible Tabs and localizable Pagination presentation;
- semantic Table foundation;
- deliberate `components/ui` exports.

Existing shell/navigation primitives received token alignment only. Dialog, Drawer, Popover, and Tooltip were not implemented because no approved core contract exists and P5B does not need an overlay dependency.

## 6. Component APIs

Components use strict TypeScript, small composable props, native HTML attributes, and native elements. Business rules and screen-specific labels are absent. IconButton requires an accessible name. Fields share label/help/error association. Table requires a localized name for its scroll region. Pagination accepts localized navigation and page labels. No new runtime or development dependency was added.

## 7. Interaction States

Actions account for default, hover, pressed, focus-visible, disabled, and loading. Fields account for default, hover/focus, invalid, disabled, read-only, required, and native filled state. Tabs expose selected and disabled behavior with Arrow Left/Right, Home, and End index logic. Checkbox, current page, status markers, and tab selection use structure/text in addition to color. Motion is optional and disabled under `prefers-reduced-motion`.

## 8. Semantic Product States

The P5A taxonomy remains explicit rather than collapsing into a generic error. Every state has a label, structural marker, tone, and guidance. Known Failure, Permission Denied, Not Configured, Restricted/E02, Waiting Human, Dependency Unavailable, delivery failure, `OUTCOME_UNKNOWN`, and `MODEL_NOT_READY` remain distinct.

`OUTCOME_UNKNOWN` states that the effect may have committed and requires authoritative-state reconciliation before any mutation retry. It receives the distinct violet unknown treatment and no automatic Retry action.

`MODEL_NOT_READY` states that no validated forecast artifact/prediction exists and no result was produced. It does not show zero, empty results, fabricated forecast data, or a generic failure.

E02 remains a restricted/policy-blocked state. Disabled or hidden frontend controls are not represented as backend authorization.

## 9. Accessibility

The implementation targets WCAG 2.2 AA-level design quality without claiming certification. It uses native buttons, inputs, textarea, select, checkbox, table, headings, navigation, and separators; visible 2 px focus with separation; label/error associations; accessible names; status text plus non-color markers; keyboard tab behavior; and reduced-motion handling. A browser-based assistive-technology and contrast audit remains later formal QA.

## 10. Responsive Behavior

Components are fluid and avoid fixed text widths. Buttons/cards/actions wrap; fields use full available width; tabs and tables use controlled horizontal overflow; pagination wraps; state notices stack at narrow width; and the existing staff-shell breakpoints remain intact. Staff remains desktop-primary and customer surfaces retain the 44 px mobile-important target.

## 11. Localization Resilience

Reusable labels and content wrap for EN/RU/KZ and approximately 30–50% expansion. Search controls anchor their clear action to the control rather than label height. Pagination labels are injectable. No truncation-only treatment or English-only fixed component width was introduced. Full localization infrastructure and translated product copy remain later work.

## 12. Testing

Vitest contract coverage verifies actions/loading/names, field association and invalid/read-only/disabled behavior, Search/Checkbox semantics, state distinctions, absence of an automatic unknown-state retry, tabs roles and key-index behavior, semantic table structure, bounded/localized pagination, card composition, helpers, semantic tokens, typography, focus, and reduced-motion CSS. Existing P5A navigation, API, auth, and state tests remain unchanged.

Final result: **5 test files, 32 tests passed**.

## 13. Validation

| Gate | Result |
| --- | --- |
| `npm ci` baseline | PASS; synchronized lockfile used, no dependency changes |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm test` | PASS — 32/32 |
| `npm run build` | PASS — Next.js 16.4.0, 19 static pages plus dynamic detail routes |
| Production route smoke | PASS — 21/21 URLs returned HTTP 200 after redirects |
| `npm audit --omit=dev` | PASS — 0 production vulnerabilities |
| Visual/source review | PASS — aligned with approved 03C system; no pixel-perfect claim |

## 14. Known Gaps

- Exact floating/modal shadow metrics, full responsive breakpoints, animation timing, and a redistributable Inter asset are not specified.
- Dialog/Drawer/Popover/Tooltip contracts are not approved and remain intentionally absent.
- No permanent showcase route or full business screen was added.
- Browser/assistive-technology, formal contrast, localization, and visual-regression testing remain later QA.
- Real backend, Keycloak session, M08 provider, M12 durable resume, and M13 forecast integration remain outside P5B.

## 15. P5B Verdict

**COMPLETE.** The approved reusable design-system foundation is typed, accessible by contract, tested, production-built, route-smoke validated, dependency-audited, and contained to frontend/P5B documentation scope. Platform code/tests/migrations and design/Figma sources are unchanged.

## 16. P5C Readiness

**P5C READY / NOT STARTED.** The next separately authorized step should open a PR from `frontend/p5-design-system` to `main`. After review/merge, P5C may implement the approved Conversations P0 vertical slice only after confirming backend and Keycloak/session contracts. P5C was not started here.
