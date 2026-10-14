# P5F - Backend Contract Audit

**Status:** COMPLETE

**Audit type:** read-only backend, schema, and test evidence review

**Frontend integration decision:** typed deterministic fixtures behind interface-ready adapters; no fake API

## Executive finding

The platform implements private Analytics tool contracts for `get_sales_report` and `forecast_sales`, but exposes no authenticated staff-facing Analytics or Forecasts HTTP endpoint. The public FastAPI application currently contains only `/health/live` and `/health/ready`.

P5F therefore must not invent `/api/analytics`, `/api/forecasts`, or a Next.js proxy. It may demonstrate the approved UI with clearly labelled local fixtures. Forecasts must mirror the current boundary: `forecast_sales` fails with `DEPENDENCY_UNAVAILABLE` and detail `MODEL_NOT_READY`, and creates no ForecastRun.

## Audited evidence

- `platform/services/backend/src/platform_backend/tools/contracts.py`
- `platform/services/backend/src/platform_backend/tools/executor.py`
- `platform/services/backend/src/platform_backend/tools/ports.py`
- `platform/services/backend/src/platform_backend/application/queries.py`
- `platform/services/backend/src/platform_backend/repositories/postgres.py`
- `platform/services/backend/src/platform_backend/api/app.py`
- M04 execution report and deviations record
- tool contract, authorization, and integration tests
- frozen physical schema ForecastRun fields

No platform file was changed by this audit.

## `get_sales_report` contract

The strict input is:

- `from_at`: timezone-aware datetime;
- `to_at`: timezone-aware datetime, later than `from_at`;
- `granularity`: `DAY | WEEK | MONTH`;
- `target_definition`: `CONFIRMED_ORDER_UNITS | CONFIRMED_ORDER_VALUE`;
- optional `product_id`: UUID.

The implemented result contains:

- `series[]` with `period`, `currency`, and string `value`;
- `target_definition`;
- `included_statuses: [CONFIRMED]`;
- `event_timestamp: orders.created_at`;
- `cutoff`;
- `as_of`;
- `granularity`;
- `currency_scope: PER_CURRENCY`;
- optional `product_id`.

The report is Owner-authorized and business-scoped. Product scope is checked. Cross-currency totals are intentionally not invented. `CONFIRMED_ORDER_VALUE` is confirmed-order value, not recognized revenue. The repository groups confirmed orders using the business time zone.

## `forecast_sales` contract and current behavior

The strict input is:

- `as_of`: timezone-aware datetime;
- `horizon`: positive integer limited by configured maximum;
- `granularity`: `DAY | WEEK | MONTH`;
- `target_definition`: `CONFIRMED_ORDER_UNITS | CONFIRMED_ORDER_VALUE`;
- optional `product_id`: UUID.

The executor checks Owner authorization and scope. Its current default `NoArtifactForecastService` raises:

- error code: `DEPENDENCY_UNAVAILABLE`;
- safe message: validated forecast model is not ready;
- detail: `MODEL_NOT_READY`.

The contract test proves this state produces no ForecastRun. There is no validated artifact, prediction series, uncertainty interval, confidence, accuracy, model version, data version, or run reference available to the frontend.

## Public API surface

The FastAPI application exposes only:

- `/health/live`;
- `/health/ready`.

No public authenticated route exists for:

- requesting a sales report;
- listing Analytics results;
- requesting a forecast;
- checking forecast readiness;
- listing or opening ForecastRuns;
- obtaining current user/business/effective-capability data.

Internal tool execution is not a browser API.

## Capability matrix

| Capability | Design need | Internal contract | Public endpoint | Auth | P5F mode |
|---|---|---|---|---|---|
| Historical confirmed-order units | Yes | Implemented by `get_sales_report` | No | Owner/business | LOCAL UI FIXTURE ONLY |
| Historical confirmed-order value | Yes | Implemented by `get_sales_report`, per currency | No | Owner/business | LOCAL UI FIXTURE ONLY |
| DAY/WEEK/MONTH granularity | Yes | Strict allowlist | No | Owner/business | LOCAL UI FIXTURE ONLY |
| Period/product scope | Yes | Strict input and product access check | No | Owner/business | LOCAL UI FIXTURE ONLY |
| Source/cutoff/as-of metadata | Yes | Returned internally | No | Owner/business | LOCAL UI FIXTURE ONLY |
| Completeness/freshness classification | Yes | UX requirement; no public DTO/policy | No | Owner/business | LOCAL UI FIXTURE ONLY, explicitly demonstrative |
| Request historical report | Yes | Internal tool only | No | Owner/business | UNAVAILABLE as live integration |
| Forecast readiness | Yes | Current `MODEL_NOT_READY` failure | No | Owner/business | LOCAL CURRENT-STATE REPRESENTATION |
| Request forecast | Future target | Internal contract, no artifact | No | Owner/business | UNAVAILABLE |
| Forecast result/series | Future target | No current result | No | Owner/business | UNAVAILABLE |
| ForecastRun detail | Future conditional | Schema exists; no run created | No | Owner/business | UNAVAILABLE |
| Session/business capabilities | Yes | Internal policy/membership | No | Authenticated membership | UNAVAILABLE |

## Metric and data-model decision

P5F will support only:

1. **Confirmed order units** - `CONFIRMED_ORDER_UNITS`; unit `units`; confirmed orders only.
2. **Confirmed order value** - `CONFIRMED_ORDER_VALUE`; monetary value grouped per currency; never labelled revenue.

No average order value, customer count, inventory metric, percentage change, forecast accuracy, or causal KPI is added because the tool contract does not supply it.

The view model preserves `period`, `value | null`, `currency`, metric definition, granularity, included statuses, event timestamp, cutoff, observed time, currency scope, source label, completeness, and freshness. `null` means missing/unavailable and is never converted to zero.

## Fixture and adapter decision

P5F will use:

- deterministic North Shop example records;
- an explicit fixture banner;
- a typed `AnalyticsDataAdapter` and `ForecastDataAdapter` boundary;
- `publicEndpoint: null` for absent integrations;
- no `fetch`, route handler, server action, or artificial request delay;
- the same series object for metric summary, chart, and table.

Fixtures are demonstrative UI data, not backend results. Only Analytics has numeric fixtures. Forecast fixtures contain readiness/status copy and no predicted values.

## Authorization and failure boundary

- Owner/backend authorization remains authoritative; a visible page or `A. Owner` fixture label grants nothing.
- Restricted Analytics and Forecast states withhold protected values.
- Valid empty is different from dependency unavailable.
- Incomplete history uses a gap, not zero.
- Stale data remains historical and is clearly labelled stale.
- `MODEL_NOT_READY` is a capability/readiness state, not a zero forecast and not a transient timeout.
- A future ambiguous ForecastRun persistence outcome must not create a phantom run link or trigger blind replay.

## Required future public contracts

Live integration requires:

1. authenticated business-scoped Analytics request/result DTOs;
2. approved completeness and freshness policy fields;
3. safe per-currency aggregation behavior;
4. current session, business, role, and effective capability data;
5. forecast eligibility/readiness DTOs;
6. a validated artifact and real forecast execution contract;
7. prediction/provenance/uncertainty DTOs with explicit actual/cutoff/predicted semantics;
8. persisted ForecastRun list/detail only after successful real execution;
9. stable typed failure and timeout responses;
10. reconciliation semantics for any ambiguous run persistence outcome.

## Audit conclusion

The private contracts are sufficient to constrain metrics, granularity, authorization, labels, and negative states. They are not a public frontend API. P5F is approved only for typed fixture mode on Analytics and a truthful current `MODEL_NOT_READY` representation on Forecasts, with all integration-dependent actions unavailable.
