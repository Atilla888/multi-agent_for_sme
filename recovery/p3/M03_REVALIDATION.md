# M03 formal revalidation

## 1. Milestone purpose

Revalidate tenant-scoped domain/repository behavior, transactional order creation/reservation, concurrency, audit, idempotency and durable unknown outcome.

## 2. Authoritative source

SAFE master Appendix I, S033 `m03_execution_report.md`, S039, and the frozen P3 manifests.

## 3. Historical status

PASSED in the original environment.

## 4. Reconstructed implementation involved

Domain values/errors/context, PostgreSQL repository, order/query/evidence application services and their migration-backed tables.

## 5. Acceptance criteria

Tenant-scoped reads; exact Decimal validation; authoritative-price atomic create; auditable/idempotent effects; stale quote/payload rejection; last-unit concurrency protection; all-lines reservation atomicity; rollback; durable `UNKNOWN` with reconciliation required before reuse.

## 6. Exact tests/commands

- Independent: `pytest ... tests/integration/test_domain_core.py`
- Shared acceptance on a separate fresh reset: `pytest ... tests/integration/test_acceptance_core.py`

## 7. Observed result

Independent M03 suite: **9 passed in 1.47s**. Shared positive find→check→create→reserve persistence/evidence and negative foreign-resource/forbidden-agent/no-effect paths: **2 passed in 1.05s**.

## 8. Failures/skips

0 failed, 0 skipped.

## 9. Limitations

No automatic unknown-effect reconciler or M12 durable resume is claimed.

## 10. Verdict

**M03: PASS.**
