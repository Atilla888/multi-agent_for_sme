# P5I — Final Capability Matrix

This matrix describes the shipped integration behavior, not planned platform capability. REAL means an authenticated purpose-specific FastAPI read using existing authorization/query contracts. FIXTURE means explicitly labelled deterministic UI-validation data. MIXED below applies to separate routes only; real and fixture records never share a dataset. Integrated screens do not fall back to fixtures after an API failure.

| Screen | DATA MODE | AUTH | ENDPOINT | LIMITATION |
|---|---|---|---|---|
| Current identity/session | REAL | REAL | FastAPI `GET /me`; Next.js `GET /api/auth/session` | One configured business; membership revalidated; display name of business unavailable |
| Overview | UNAVAILABLE | REAL | NONE for dashboard summaries | Existing orientation only; no fabricated attention metrics |
| Conversations | FIXTURE | REAL | NONE | REAL API NOT AVAILABLE YET; no safe staff query/transport contract |
| Escalations | FIXTURE | REAL | NONE | REAL API NOT AVAILABLE YET; decision/resume mutations unavailable |
| Customers | MIXED (separate routes) | REAL | `GET /customers/{UUID}` | Detail REAL; list/search/relationships remain FIXTURE because no list/query contract exists |
| Orders | MIXED (separate routes) | REAL | `GET /orders/{UUID}` | Detail REAL; list FIXTURE; mutation, delivery status and reconciliation APIs absent; E02 active |
| Products | REAL | REAL | `GET /products?q=...`, `GET /products/{UUID}` | Nonempty bounded search; no unrestricted catalog-list semantics invented |
| Inventory | REAL | REAL | `GET /inventory?product_id=...` | Bounded authorized Product selection; observed quantities are not a live-stock promise |
| Documents | FIXTURE | REAL | NONE | No safe administration query; upload/ingestion/publish remain unavailable |
| Analytics | REAL | REAL (OWNER for read) | `GET /analytics/sales` | Confirmed-order units/value only; exact table decimals; separate currencies; no inferred missing-period values |
| Forecasts | UNAVAILABLE / TARGET | REAL | NONE | Current MODEL_NOT_READY; illustrative target specimen remains separate; M13 not started |
| Integrations | FIXTURE / UNAVAILABLE | REAL | NONE | M08 deferred; no live provider status/configuration/activation |
| Settings | FIXTURE | REAL | NONE | Read-only synthetic sections; no write or persistence claim |
| Audit | FIXTURE / RESTRICTED | REAL | NONE | No approved authorized/redacted read contract; default fails closed |
| Agent Runs | FIXTURE / RESTRICTED | REAL | NONE | No safe public trace query; M12 Resume TARGET-only |
| Customer Web Chat | FIXTURE / UNAVAILABLE | NOT REQUIRED for preview | NONE | Separate customer preview; transport/session NOT_CONFIGURED; no send or business mutation |

Every staff route requires the real server AuthAdapter. Existing fixture banners distinguish those records from the authenticated user's live data. A valid staff session does not grant Audit/Agent Runs access or make M08 operational. `P5I_ENABLE_FIXTURE_REVIEW=true` may enable explicitly selected `mode=fixture` specimens for otherwise integrated surfaces; it defaults false and remains separate from real mode.

## Frozen capabilities

- M08: PARTIAL / BLOCKED / DEFERRED.
- M12: TARGET / NOT STARTED; no Resume/replay.
- M13: NOT STARTED; no fabricated forecast.
- E02: active approved limitation; no generic update_order HTTP mutation.
- OUTCOME_UNKNOWN: unchanged reconciliation/no-blind-retry semantics; no new mutation transport.
- Database/schema/migrations and the M01–M07 domain/tool/policy/repository core: unchanged.
