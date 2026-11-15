# M03 — Domain / Repository Layer execution report

Checkpoint: 2026-09-29, local Windows/PowerShell host with Docker Desktop; Python 3.12.12 test image, PostgreSQL 17.8, pgvector 0.8.1, Alembic `0004_staff_identity_lookup`. Scope was the approved sanitized `implementation_handoff/` contracts only.

## Implementation

- Framework-independent values/errors/context and passive approved-resource references: `services/backend/src/platform_backend/domain/{models,errors,context,references}.py`.
- Short tenant-bound transactions and explicit tenant predicates: `services/backend/src/platform_backend/repositories/postgres.py`. Runtime connection sets the tenant GUC transaction-locally. No unrestricted UUID-only order query is exposed.
- Authorized read/report services: `application/queries.py`; atomic order creation and pooled reservation: `application/orders.py`; durable operation admission/result/failure/unknown/replay: `application/evidence.py`.
- Approved physical schema was not redesigned. The only new migration, `0004_staff_identity_lookup.py`, supports M05 staff identity and retains runtime least privilege.

Creation snapshots the authoritative product price under product row locks, writes order/lines/result/audit atomically, and does not reserve stock. Reservation locks the order/inventory, rechecks versions and available quantity, then writes all lines and status in one transaction. A shortage leaves stock unchanged, marks the order `NEEDS_ATTENTION`, and creates an escalation. `CREATED`/`CONFIRMED` are operational states, not payment or recognized revenue. Decimal values reject floats, precision loss, non-finite and negative money; no Payment/Refund/Cancellation/Shipment entity was added.

## Executed evidence

Command (inside the `db-tests` image):

```text
docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q --tb=line -p no:cacheprovider tests/unit tests/integration tests/security tests/contract
```

Final combined run: **60 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**. M03-specific `tests/integration/test_domain_core.py`: **9 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**; the two additional cross-milestone acceptance tests passed separately and are counted once in the combined total. Eight of the nine M03-specific cases use real PostgreSQL; the Decimal value test is pure domain. The real-DB cases cover tenant and missing-resource reads, stale quote/idempotency conflict, atomic create and audit, concurrent last-unit protection, all-line shortage rollback, explicit transaction rollback, and durable unknown/reconciliation-required state. The positive integrated path in `tests/integration/test_acceptance_core.py` proved find → inventory read → create → reserve → DB/operation/audit inspection without an LLM.

Live database inspection: `SELECT version_num FROM alembic_version` returned `0004_staff_identity_lookup`; `SHOW server_version` returned `17.8 (Debian 17.8-1.pgdg12+1)`; `pg_extension` returned vector `0.8.1`; public base-table count was 26. M01/M02 regression cases passed in the same final run.

Quality checks on the final image: `ruff check --no-cache services/backend/src tests` passed; `ruff format --check --no-cache services/backend/src tests` reported 43 files already formatted; `mypy --no-incremental services/backend/src` reported no issues in 32 files.

## Limits and gate

Document/conversation/forecast references are typed but do not implement M06/M07/M13 retrieval, orchestration, or training. A durable `UNKNOWN` operation requires controlled reconciliation before reuse; no automated reconciler was added. The approved E02 order-edit field policy remains unresolved and affects only `update_order` (see M04). No M03 domain-semantic deviation was made. **M03: PASSED** on executed scope.
