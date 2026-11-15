# P5F — Analytics + Forecasts

**Status:** COMPLETE

**Branch:** `frontend/p5-analytics`

**Integration mode:** typed deterministic Analytics fixtures plus current-state Forecast readiness; no fake API

## Scope

P5F replaces the `/analytics` and `/forecasts` foundation placeholders with approved staff product screens. Analytics provides historical confirmed-order reporting. Forecasts truthfully exposes the current `MODEL_NOT_READY` capability boundary.

Customer Web Chat, Integrations, Settings, Audit, Agent Runs, real Keycloak/session integration, platform code, migrations, Docker, Figma, research dashboards, M13 implementation, and later P5G/H work remain outside this slice.

## Authorities

The implementation follows `docs/DESIGN.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, P5A–P5E frontend records, `design/README.md`, Phase 2D/2E Analytics and Forecasts definitions, Phase 3C components, Phase 3D high-fidelity builders/validators, and Phase 3E Flow 7. Platform tool contracts, query services, repositories, API routes, M04 evidence, and contract tests were inspected read-only.

## Design Audit

The pre-implementation design audit recorded the approved page hierarchy, filters, metric semantics, summary cards, ACTUAL chart/table, source/quality facts, Analytics states, Forecast readiness, current/TARGET separation, accessibility, and responsive rules. It classifies decisions as `CONFIRMED`, `INFERRED FROM APPROVED VISUAL`, or `NOT SPECIFIED`.

No generic dashboard widgets, arbitrary KPI builder, export workflow, SQL/model console, or causal explanation was added.

## Backend Contract Audit

The pre-implementation backend audit confirmed that `get_sales_report` and `forecast_sales` are private trusted tool contracts, not browser APIs. The public FastAPI application exposes health routes only.

`get_sales_report` supports timezone-aware ranges, DAY/WEEK/MONTH granularity, optional product scope, and only `CONFIRMED_ORDER_UNITS` or `CONFIRMED_ORDER_VALUE`. Results are confirmed-order facts grouped per currency. `forecast_sales` currently returns `DEPENDENCY_UNAVAILABLE` with detail `MODEL_NOT_READY`; its contract test proves no ForecastRun is created.

## Capability Matrix

The full matrix is in the backend audit. P5F uses these modes:

| Capability | Mode |
|---|---|
| Historical confirmed-order units/value | LOCAL UI FIXTURE ONLY |
| Period, metric, granularity filters | LOCAL UI FIXTURE ONLY |
| ACTUAL chart/table and safe provenance | LOCAL UI FIXTURE ONLY |
| Live report request | UNAVAILABLE |
| Forecast readiness | MODEL_NOT_READY / local current-state representation |
| Forecast request/result/ForecastRun | UNAVAILABLE |
| Effective session/business permissions | UNAVAILABLE |

## Analytics Metric Model

Only two metric definitions are represented:

1. `CONFIRMED_ORDER_UNITS` — observed confirmed-order units, unit `units`.
2. `CONFIRMED_ORDER_VALUE` — observed confirmed-order value, unit KZT within `PER_CURRENCY`; never labelled revenue.

The typed report preserves period, value-or-null, currency, target definition, DAY/WEEK/MONTH granularity, included `CONFIRMED` statuses, `orders.created_at` event meaning, cutoff, observed time, time zone, currency scope, source, completeness, and freshness. A null observation remains unavailable and is never transformed into zero.

## Analytics UI

`/analytics` provides:

- historical period, metric, and granularity controls using GET query parameters;
- explicit local-fixture and no-server-request labels;
- observed total/subtotal, completeness, and freshness cards;
- a solid, labelled ACTUAL historical chart;
- report definition, business scope, source, cutoff, and time-zone context;
- an underlying table driven by the same typed series;
- loading, valid empty, incomplete, stale, dependency unavailable, and permission-denied/restricted states;
- a separate contextual link to Forecasts.

The summary never introduces average order value, customer count, inventory totals, percentage change, revenue, prediction accuracy, or causal metrics.

## Visualization Strategy

No chart dependency was installed. A small inline SVG is sufficient for the approved bounded historical series. Solid line segments and outlined points mark observed ACTUAL values. Missing observations use a labelled dashed vertical marker and break adjacent line segments.

The SVG has a title and description, a textual legend, and an underlying semantic table. Color is not the only carrier of meaning. On narrow screens the chart remains legible in a locally scrollable named region while the document itself has no horizontal overflow.

## Forecast Boundary

`/forecasts` is nested under Analytics but is not interchangeable with historical reporting. The page exposes current capability facts, an unavailable request action, future eligibility requirements, and a safe link back to Analytics. It performs no backend call and creates no processing or success state.

The future TARGET requirements are clearly marked `TARGET PRODUCT UX · not current`, non-interactive, and contain no example prediction. There is no ForecastRun detail route.

## MODEL_NOT_READY

`MODEL_NOT_READY` is the default and truthful Forecasts state. It is distinct from zero forecast, valid empty, timeout, permission denial, or generic service outage. The page states that no validated artifact, prediction, or run exists.

No forecast line, future value, predicted quantity, revenue, confidence interval, confidence score, accuracy metric, model/data version, generated timestamp, or run identifier is fabricated. M13 remains NOT STARTED.

## Data Strategy

Analytics uses modest deterministic North Shop development data behind `AnalyticsDataAdapter`. Forecasts uses a status-only `ForecastDataAdapter`. Both contract records set `publicEndpoint: null`; neither adapter calls `fetch`, a route handler, a server action, or a fake FastAPI endpoint.

Numeric fixtures exist only for historical Analytics and are visibly labelled `LOCAL UI FIXTURE ONLY`. Forecasts contains no numeric fixture result.

## Accessibility

Filters have labels and descriptions. Buttons and disabled behavior are native. State notices and badges communicate text/markers in addition to color. Metric meanings and units are explicit. The chart has an accessible name/description, text legend, outlined marks, non-color line semantics, and a table alternative. Missing observations are written as `Unavailable` and `Missing observation · not zero`.

This is a WCAG 2.2 AA-level design-quality review target, not certification.

## Responsive

Desktop and normal-laptop layouts retain the approved visual hierarchy. At narrower widths filters, metrics, chart/provenance, and forecast cards stack. An exact 390 px Chromium device-metrics check reported `innerWidth=390`, `documentScrollWidth=390`, and `bodyScrollWidth=390`; only the chart region retains deliberate local horizontal scrolling.

## Localization

Metric names, filter labels, state explanations, card facts, table headers, and `MODEL_NOT_READY` guidance wrap or stack rather than relying on fixed single-line widths. The review considered approximately 30–50% EN/RU/KZ expansion. Full translation infrastructure remains outside P5F.

## Tests

P5F adds 16 focused tests across two files. They cover Analytics rendering, metric cards, period/metric/granularity filtering and allowlists, loading, valid empty, incomplete gap, stale, unavailable, restricted, one-series chart/table consistency, absent fake API, absent unsupported/research metrics, default `MODEL_NOT_READY`, absent forecast visualization/result/run, disabled request, current/TARGET separation, restricted Forecasts, and network-free adapters.

Final result: **14 test files, 93/93 tests PASS**. Lint, strict TypeScript, and production build also pass after a clean `npm ci`.

## Visual Validation

Local production-browser review covered Analytics default, filtered confirmed-order value/month, valid empty, incomplete gap, stale, dependency unavailable, permission denied, Forecasts `MODEL_NOT_READY`, and narrow layouts. Spacing, hierarchy, state clarity, chart/table correspondence, missing-value gap, labels, wrapping, local overflow, and disabled actions passed review.

Production route smoke validated 11 approved Analytics/Forecasts routes and states with HTTP 200 plus expected content: **11/11 PASS**.

## Known Gaps

- No authenticated public Analytics, Forecasts, ForecastRun, session, business, or effective-capability endpoints exist.
- Completeness and freshness policy thresholds require future public contract work.
- Live per-currency reporting, product drilldown, request transport, and error DTO integration remain future work.
- M13 artifact training/validation, inference, prediction/provenance/uncertainty DTOs, and real ForecastRuns remain NOT STARTED.
- Real Keycloak/session/business selection, full localization, formal accessibility audit, and broader browser/device certification remain future work.
- `npm ci` still reports five known high-severity development-tooling advisories; `npm audit --omit=dev` reports zero production vulnerabilities. P5F added no dependency and did not run `npm audit fix`.

## P5F Verdict

**COMPLETE.** Both audits preceded source implementation; the metric model is contract-limited; Analytics is high-fidelity, accessible, responsive, and explicitly fixture-backed; Forecasts defaults to truthful `MODEL_NOT_READY`; no fake API, forecast, experiment output, dependency, backend change, or Figma change was introduced. Clean install, lint, typecheck, 93/93 tests, production build, 11/11 route smoke, production audit, and visual review pass.

## P5G/H Readiness

**P5G/H are READY / NOT STARTED.** Their exact scope must be confirmed from the remaining approved screen families before work begins. P5F should first be reviewed through a pull request from `frontend/p5-analytics` to `main`; this task does not merge the branch or begin P5G/H.
