# P5F - Analytics + Forecasts Design Audit

**Status:** COMPLETE

**Scope:** `/analytics` and `/forecasts`

**Authority:** `docs/DESIGN.md`, Phase 2D/2E UX artifacts, Phase 3C analytics/forecast components, Phase 3D high-fidelity Analytics and Forecasts builders, and Phase 3E Flow 7

## Decision

P5F may implement the approved staff Analytics workspace and its nested Forecasts destination. Analytics is a historical, observed-data surface. Forecasts is a separate capability and must default to the current engineering truth: `MODEL_NOT_READY`.

The implementation must not blend actual and predicted values, imply that an unavailable observation is zero, synthesize a forecast result, or expose a route to a fabricated ForecastRun. Product analytics also remains separate from diploma/research experiment reporting.

## Evidence hierarchy

1. `docs/DESIGN.md` - canonical information architecture, screen semantics, current/target distinction, and visual direction.
2. Phase 2E final screen inventory - actors, data, state, permission, freshness, and failure requirements.
3. Phase 2D UX validation - historical-report and forecast-readiness flows.
4. Phase 3C local design-system implementation - KPI, period, freshness, completeness, data-table, historical-chart, forecast, provenance, and limitation components.
5. Phase 3D local plugin implementation - approved full-screen variants and shared staff shell.
6. Phase 3E Flow 7 - Analytics to current `MODEL_NOT_READY`, safe return to Analytics, and non-interactive TARGET specimen separation.

## Analytics screen contract

| Area | Classification | P5F interpretation |
|---|---|---|
| Analytics top-level destination | CONFIRMED | Render inside the existing staff shell with Analytics active. |
| Forecasts nested destination | CONFIRMED | Link from Analytics, but keep prediction semantics separate. |
| Business scope | CONFIRMED | Show the currently selected synthetic North Shop fixture context. |
| Historical period and time zone | CONFIRMED | A bounded past period and explicit time-zone context are required. |
| Metric selection | CONFIRMED | Only backend-evidenced confirmed-order units and confirmed-order value may be offered. |
| Granularity | CONFIRMED | DAY, WEEK, and MONTH are the only evidenced values. |
| ACTUAL historical visualization | CONFIRMED | Observed data only; label ACTUAL in text, not by color alone. |
| Underlying data table | CONFIRMED | The table and visualization must use the same typed series. |
| Source, cutoff, observed time | CONFIRMED | Show safe report provenance supplied by the view model. |
| Freshness and completeness | CONFIRMED | Show each explicitly; stale and incomplete are not equivalent. |
| Valid result | CONFIRMED | Observed result with metric, unit, scope, period, source, and caveat. |
| Valid empty | CONFIRMED | Successful query with no qualifying records; not outage and not an invented zero. |
| Incomplete | CONFIRMED | Missing interval is a visible gap/Unavailable table cell, never zero. |
| Stale | CONFIRMED | Historical values may remain visible only with a clear stale warning. |
| Dependency unavailable | CONFIRMED | Show no substitute chart or zero result. |
| Permission denied | CONFIRMED | Hide protected values; visible navigation grants no access. |
| Loading | CONFIRMED | No new result is claimed while loading. |
| Filter interaction | CONFIRMED | Deterministic local fixture filtering may demonstrate the approved behavior. |
| Export/download | NOT SPECIFIED | Do not implement. |
| Causal AI explanation | NOT SPECIFIED / unsafe | Do not claim causes from descriptive historical data. |
| Research experiment dashboard | OUT OF SCOPE | Do not display TSR, FER, H0/H1, SINGLE, STATIC, or ADAPTIVE experiment output. |

## Forecast screen contract

| Area | Classification | P5F interpretation |
|---|---|---|
| Current default | CONFIRMED | `MODEL_NOT_READY` is the only current capability state. |
| Numeric prediction | NOT CURRENTLY AVAILABLE | Do not render forecast values, confidence, accuracy, or a predicted line. |
| ForecastRun detail | CONDITIONAL TARGET ONLY | No route or identifier exists unless a real persisted run exists. |
| Request forecast | CONDITIONAL TARGET ONLY | Keep unavailable/disabled in current state; do not simulate submission. |
| Historical context | CONFIRMED | Link back to Analytics; historical ACTUAL remains a separate report. |
| TARGET Ready specimen | CONFIRMED AS DESIGN REFERENCE | May inform structure, but must not be reachable or presented as current output. |
| Actual/predicted differentiation | CONFIRMED FOR FUTURE TARGET | A future real result requires solid ACTUAL, cutoff, dashed PREDICTED, and text labels. |
| Provenance and limitations | CONFIRMED FOR FUTURE TARGET | Only show real model/data/run evidence when it exists. No placeholders posing as data. |
| Insufficient/incomplete history | CONFIRMED CONDITIONAL STATES | Distinct from model readiness, but not the current default. |
| Model unavailable/timeout/denied | CONFIRMED CONDITIONAL STATES | Distinct typed failures; none may produce a numeric substitute. |

## Visualization decision

No chart dependency is required. The current approved Analytics view is a small, bounded ACTUAL series and can be rendered with semantic HTML plus a modest inline SVG. The same typed series will drive an accessible table, textual legend, point labels, and SVG marks. A missing value will break the polyline and render as a labelled gap.

This approach preserves the Calm Operational SaaS direction, avoids an unjustified dependency, supports non-color differentiation, and keeps the table as the authoritative accessible representation. No forecast visualization is rendered while `MODEL_NOT_READY` is current.

## Interaction decisions

- Analytics filters use GET query parameters and deterministic fixtures; they do not claim a server request.
- Metric and granularity values are limited to the backend-evidenced allowlists.
- State query parameters exist only to exercise approved fixture states and visual review.
- Forecasts offers a safe link back to historical Analytics.
- A disabled forecast action explains why no request can run.
- No artificial delay, fake API route, fake mutation, or fabricated success state is permitted.

## Responsive and accessibility decisions

- Desktop follows the approved 03D composition; controls and cards stack at narrower widths.
- At 390 px, core meaning remains in document flow; tables/charts may use named local overflow regions.
- Form controls require labels and descriptions.
- State meaning uses text and marker/icon in addition to color.
- The chart has a concise accessible name and an underlying table with matching values.
- Missing observations use the word `Unavailable` and a visible line gap.
- Focus, link, button, and disabled semantics reuse the P5B components.

## Out of scope

- Backend, schema, migration, Docker, authorization, tool, agent, model-training, and Figma changes.
- Web Chat, Integrations, Settings, Audit, Agent Runs, and real Keycloak/session work.
- M13 implementation, model artifact generation, a real forecast service, or a ForecastRun detail.
- Research/scientific experiment output.
- Download/export, arbitrary metric builder, SQL console, model console, and causal analysis.

## Audit conclusion

The frontend can truthfully implement high-fidelity Analytics with explicitly labelled deterministic ACTUAL fixtures behind an interface-ready adapter. Forecasts must render `MODEL_NOT_READY` without any forecast data. A chart library is not justified for this slice.
