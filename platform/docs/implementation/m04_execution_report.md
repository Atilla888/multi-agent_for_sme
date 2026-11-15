# M04 — Ten frozen business tools execution report

Checkpoint: 2026-09-29. Runtime: Python 3.12.12, PostgreSQL 17.8/pgvector 0.8.1, Docker Engine 29.7.2, Compose 5.5.0. All tests used the local Compose database; no LLM or agent component was executed.

## Implementation and status by frozen tool

`services/backend/src/platform_backend/tools/{contracts,cursor,executor,ports}.py` provides exactly ten strict Pydantic input contracts, a typed `ToolResult`, the specialist allowlist, a tenant/filter-bound HMAC product cursor, and delivery/forecast ports. `application/{orders,queries,evidence}.py` supplies effects, reads and durable evidence. Tool arguments cannot override the trusted principal, business, agent, run, policy or operation key.

| Tool | Executed behavior / exact status |
|---|---|
| `find_product` | PASSED — bounded tenant search, empty page and signed cursor/tamper rejection. |
| `check_inventory` | PASSED — authoritative read with quantity/version/observation; no reservation effect. |
| `find_customer` | PASSED — minimal Q01-protected customer projection. |
| `get_order` | PASSED — protected object projection; UUID alone grants nothing. |
| `create_order` | PASSED — atomic authoritative-price snapshot, result/audit and idempotent replay. |
| `update_order` | Contract/authorization/rejection PASSED; **mutation branch BLOCKED_BY_APPROVED_POLICY** because no approved editable-field allowlist exists. No fabricated update/release/refund/cancel effect. |
| `reserve_inventory` | PASSED — separate all-or-nothing reservation with version/quantity checks and durable result. |
| `get_delivery_status` | PASSED — no reference is explicit no data; missing adapter, adapter outage and timeout are typed distinct failures. No order-status inference. |
| `get_sales_report` | PASSED — Owner-only, deterministic `CONFIRMED_ORDER_UNITS`/`CONFIRMED_ORDER_VALUE` by currency; never labelled revenue. |
| `forecast_sales` | Contract/boundary PASSED; before validated artifact returns `DEPENDENCY_UNAVAILABLE` with `MODEL_NOT_READY`. No prediction or ForecastRun fabricated. |

Sales has seven, Support four and Analytics two approved tool permissions; overlap is intentional. The executor checks the active run's agent role, then strict schema, then principal/resource policy, and persists `ToolCall` and `AuditLog` for terminal invocations. Rejected specialist invocations were tested for each of the ten names, with no business effect and durable rejection evidence. Writes use canonical SHA-256 payload hashing with tenant/actor/tool scope. Same-key same-payload success replays; changed payload conflicts; uncertain effect is marked `UNKNOWN` when the database is available, and same-key retry returns `OUTCOME_UNKNOWN` pending reconciliation. No blind automatic retry/new effect occurs.

## Executed evidence

Final command:

```text
docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q --tb=line -p no:cacheprovider tests/unit tests/integration tests/security tests/contract
```

`tests/contract/test_tools.py`: **23 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED** PostgreSQL-backed cases; final combined run: **60/0/0/0**. Evidence includes all ten registered schemas rejecting extra protected fields; success for supported reads/writes/report; replay; rejected unsupported patch; no-artifact forecast with zero ForecastRuns; timeout/dependency outcomes; ten per-tool forbidden-agent/audit negatives; and expired-context pre-admission audit. `tests/integration/test_acceptance_core.py` separately passed both the positive non-LLM chain and the foreign-tenant/forbidden-agent/no-effect chain; these two are counted only in the combined total. Formatter, linter and mypy passed on the final image (details in M03 report).

## Limits and gate

`update_order` cannot safely mutate until the owner approves an explicit E02 editable-field/transition policy. Live delivery-provider integration and forecast model execution belong to later approved scope. The delivery and forecast ports fail truthfully today. No eleventh business tool, LLM, agent runtime, RAG or synthetic model artifact was added. No approved-domain deviation was made. **M04: PASSED for the executable frozen tool boundary, with the update-order mutation branch explicitly BLOCKED_BY_APPROVED_POLICY.**
