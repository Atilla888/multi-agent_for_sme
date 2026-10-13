# M04 formal revalidation

## 1. Milestone purpose

Revalidate the exact ten-tool registry, strict trusted execution boundary, permissions, typed outcomes, durable evidence and safety semantics.

## 2. Authoritative source

SAFE master Appendix I, S034 `m04_execution_report.md`, S029 deviations, S039, and the frozen P3 manifests.

## 3. Historical status

PASSED with the approved E02 limitation.

## 4. Reconstructed implementation involved

Tool contracts/cursor/executor/ports plus order/query/evidence services and server-owned `ExecutionContext`.

## 5. Acceptance criteria

Exactly `find_product`, `check_inventory`, `find_customer`, `get_order`, `create_order`, `update_order`, `reserve_inventory`, `get_delivery_status`, `get_sales_report`, `forecast_sales`; strict input schemas; specialist/principal/resource admission; typed delivery and dependency failures; replay-safe idempotency; `OUTCOME_UNKNOWN` reconciliation/no blind retry; no business-status inference from delivery; `MODEL_NOT_READY` without an M13 artifact.

## 6. Exact tests/commands

- Independent: `pytest ... tests/contract/test_tools.py`
- Shared positive/negative acceptance: `tests/integration/test_acceptance_core.py`

## 7. Observed result

Independent suite: **23 passed in 3.85s**. Shared acceptance: **2 passed in 1.05s**. All ten forbidden-specialist parameter cases produced durable rejection/no effect. Delivery failure stayed distinct from order status. Unknown effect required reconciliation. Forecast created no run and returned the truthful unavailable state.

## 8. Failures/skips

0 failed, 0 skipped.

## 9. Approved limitation

E02 is preserved exactly: `update_order` contract/admission/rejection is validated, while mutation remains `BLOCKED_BY_APPROVED_POLICY`. No editable-field/transition policy, release, refund or cancellation behavior was invented.

## 10. Verdict

**M04: PASS WITH APPROVED LIMITATION — E02.**
