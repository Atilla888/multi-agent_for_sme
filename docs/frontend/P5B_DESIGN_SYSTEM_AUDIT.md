# P5B — Design System Audit

## Scope and authority

This audit extracts the reusable frontend visual system before P5B implementation. Its authority order is:

1. `docs/DESIGN.md` and the approved Phase 3C report;
2. the local Phase 3C `tokens.ts`, `constants.ts`, `usage.ts`, and core builders as the exact generated-system specification;
3. Phase 3D high-fidelity evidence for component reuse and operational density;
4. P5A frontend tokens/components as the implementation baseline to refine rather than replace.

The selected direction is **Calm Operational SaaS**, primary light: restrained, business-first, moderately dense, and explicit about fact, owner, state, and safe next step. Figma remains the visual authority and was not modified.

Classification:

- **CONFIRMED** — exact value or contract is recorded in DESIGN/Phase 3C/plugin sources.
- **INFERRED FROM APPROVED VISUALS** — minimal implementation choice follows approved specimens but has no exact frozen value.
- **NOT SPECIFIED** — no approved exact contract; P5B must not fabricate one.

## Semantic color tokens

All values below are **CONFIRMED** by `figma-phase3c-plugin/src/tokens.ts`.

| Semantic role | Primitive | Value |
| --- | --- | --- |
| surface/default | white | `#FFFFFF` |
| surface/subtle | neutral50 | `#F8FAFC` |
| surface/elevated | white | `#FFFFFF` |
| surface/selected | blue50 | `#EFF6FF` |
| text/primary | neutral900 | `#0F172A` |
| text/secondary, text/muted | neutral600 | `#475569` |
| text/inverse | white | `#FFFFFF` |
| border/default | neutral200 | `#E2E8F0` |
| border/strong | neutral400 | `#94A3B8` |
| border/interactive | navy600 | `#174A7E` |
| action/primary | navy700 | `#123D69` |
| action/secondary | neutral100 | `#F1F5F9` |
| action/destructive | red700 | `#B91C1C` |
| focus/ring | blue700 | `#1D4ED8` |
| status/success + background | green700 / green50 | `#047857` / `#ECFDF5` |
| status/pending + background | blue700 / blue50 | `#1D4ED8` / `#EFF6FF` |
| status/warning, stale + background | amber800 / amber50 | `#92400E` / `#FFFBEB` |
| status/error + background | red700 / red50 | `#B91C1C` / `#FEF2F2` |
| status/unknown + background | violet700 / violet50 | `#6D28D9` / `#F5F3FF` |
| status/restricted + background | neutral800 / neutral100 | `#1E293B` / `#F1F5F9` |
| status/waiting-human + background | indigo700 / indigo50 | `#4338CA` / `#EEF2FF` |
| status/dependency, model-not-ready + background | neutral600 / neutral100 | `#475569` / `#F1F5F9` |
| status/info + background | teal700 / neutral50 | `#0F766E` / `#F8FAFC` |
| chart/actual, predicted, grid | navy700 / violet700 / neutral200 | `#123D69` / `#6D28D9` / `#E2E8F0` |

Purpose aliases such as frontend `--background`, `--surface`, `--foreground`, and `--primary` may point to these exact roles. Disabled background/foreground are **INFERRED FROM APPROVED VISUALS** as `surface/subtle` plus `text/secondary`; Phase 3C does not define independent disabled-color variables. Hover/pressed colors are **NOT SPECIFIED** as separate values; the approved button specimens use state opacity (0.88 hover, 0.75 pressed).

## Typography hierarchy

**CONFIRMED:** Inter Regular, Medium, Semi Bold, and Bold with system fallback when no approved redistributable webfont exists.

| Style | Size / line height | Weight |
| --- | --- | --- |
| Page Title | 28 / 36 px | Bold |
| Section Heading | 20 / 28 px | Semi Bold |
| Card Heading | 16 / 24 px | Semi Bold |
| Body | 14 / 22 px | Regular |
| Body Strong | 14 / 22 px | Semi Bold |
| Small | 13 / 20 px | Regular |
| Caption | 12 / 18 px | Regular |
| Label | 12 / 18 px | Semi Bold |
| Metric | 24 / 32 px | Semi Bold |

A separate mono/data typography style is **NOT SPECIFIED**. P5B will not add one. Critical content wraps instead of shrinking below the approved hierarchy.

## Spacing, sizing, radius, and density

- **CONFIRMED spacing:** 4, 8, 12, 16, 24, 32, 48 px on a 4-point base.
- **CONFIRMED radii:** small 4 px, control 6 px, card 8 px, pill 999 px.
- **CONFIRMED staff density:** moderately dense, 40–44 px rows; desktop controls 36–40 px.
- **CONFIRMED customer sizing:** mobile-important controls use 44 px touch-target examples.
- **CONFIRMED card spacing:** 16 or 24 px padding depending on composition.
- Component-specific widths are **NOT SPECIFIED** as production constants. Components must be fluid and wrap.

## Borders and elevation

- **CONFIRMED:** default subtle divider, stronger interactive border, and borders/dividers before shadow.
- **CONFIRMED conceptual elevation:** base = none; floating = subtle shadow plus border; modal = moderate shadow plus scrim.
- Exact floating/modal shadow offsets, blur, spread, opacity, and scrim opacity are **NOT SPECIFIED**.
- Existing P5A `0 1px 2px` card shadow is **INFERRED FROM APPROVED VISUALS** as a minimal floating treatment; base cards remain border-led.

## Focus treatment

- **CONFIRMED:** visible 2 px `focus/ring` plus neutral separation; focus is not color-only and must not rely on hover.
- A 2 px outline offset is **INFERRED FROM APPROVED VISUALS** as the browser implementation of neutral separation.

## Interaction states

- **CONFIRMED button:** Default, Hover, Pressed, Focus, Disabled, Loading across Primary, Secondary, Ghost, and Destructive emphasis.
- **CONFIRMED field:** Default, Focused, Filled, Error, Disabled, Read-only; persistent label and explicit error/helper copy.
- **CONFIRMED selection controls:** selected/checked state plus text/structure, not color alone.
- **CONFIRMED tabs:** selected tab and labelled panel; route navigation must remain links rather than tabs.
- Exact animation durations/easings are **NOT SPECIFIED**. P5B uses no required animation and respects `prefers-reduced-motion`.

## Layout primitives

- **CONFIRMED:** Card/Panel, Divider, Empty State, Loading/Skeleton, Context Helper, Breadcrumb/Return Context, and semantic Table/Data Table foundation.
- **CONFIRMED:** staff is desktop-primary; customer chat is mobile-important; labels/actions wrap or stack.
- **INFERRED FROM APPROVED VISUALS:** existing P5A 900 px shell stacking and 560 px narrow treatment remain implementation breakpoints because exact production breakpoints are not frozen.
- Dialog, Drawer/Sheet, Popover, and Tooltip component contracts are **NOT SPECIFIED** in the approved core inventory. P5B does not implement them or add a primitive library.

## Status semantics

The following are **CONFIRMED** distinct meanings, not aliases for a generic error:

- Loading — no result yet.
- Valid Empty — authorized query succeeded with no records.
- Success — general operation completed, not automatically a business effect.
- Confirmed — trusted evidence confirms the named business effect.
- Pending / Processing — waiting versus actively working; neither implies completion.
- Known Failure — known non-effect; review current facts and choose authorized recovery.
- Permission Denied — current principal lacks access; protected values remain hidden.
- Unavailable / Not Configured — capability/source absence with truthful recovery.
- Restricted — policy blocks an action, including E02; not permission denial.
- Waiting Human — human owns the next decision; no permission transfer.
- `OUTCOME_UNKNOWN` — possible commit, unavailable confirmation, authoritative reconciliation required, no blind mutation retry.
- `MODEL_NOT_READY` — no validated M13 artifact and no prediction; not zero, empty, or server failure.
- Stale/Conflict, Dependency Unavailable, Message Delivery Failed, and TARGET-only remain separate.

State presentation combines label, structural marker, explanation, and safe next step. Color alone is never sufficient.

## Documented component families

All families are **CONFIRMED**:

- Core: Button, Icon Button, Input, Textarea, Search Input, Select, Checkbox, Tabs, Badge/Status Badge, State Banner, Card/Panel, Divider, Avatar, Empty State, Loading/Skeleton, Pagination, Context Helper.
- Navigation: Primary/Nested item, disclosure, Business Context, Breadcrumb/Return Context, Account/Session, Restricted Link.
- Conversation/AI, Business Entity, Escalation, Analytics/Data, Forecast, and Customer Web Chat domain families.

P5B implements generic reusable foundations. Domain families remain later screen-composition work unless an existing P5A semantic-state primitive already justifies a generic representation.

## Responsive and localization constraints

- **CONFIRMED:** EN/RU/KZ, 30–50% label expansion, wrapping/stacking rather than critical truncation.
- **CONFIRMED:** staff desktop-primary; Web Chat mobile-important; 44 px customer controls.
- **CONFIRMED:** status and chart meaning survives grayscale through label, line style, position, and structure.
- Exact full-screen breakpoints, translated strings, locale routing, and formal language QA are **NOT SPECIFIED / later work**.

## Current and target capability states

- **CONFIRMED current:** M08 PARTIAL / BLOCKED / DEFERRED; never present provider/channel capability as live.
- **CONFIRMED current:** E02 `update_order` restriction; no enabled success action.
- **CONFIRMED target only:** M12 durable Resume is NOT STARTED; no live resume control.
- **CONFIRMED current:** M13 NOT STARTED and `MODEL_NOT_READY`; no predicted series or fabricated ForecastRun.
- **CONFIRMED security boundary:** component visibility, disabled state, and hidden actions never replace backend authorization.

## Audit verdict

**PASS — implementation inputs are sufficient for P5B generic primitives.** Exact token/type/spacing/radius/state contracts exist. Dialog/Drawer/Popover, exact production breakpoints, animation timing, full icon assets, and exact modal shadows are not specified and are intentionally excluded rather than invented.
