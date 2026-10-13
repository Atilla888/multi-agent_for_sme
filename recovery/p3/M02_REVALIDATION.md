# M02 formal revalidation

## 1. Milestone purpose

Revalidate real PostgreSQL/pgvector migrations, constraints, least privilege, forced tenant RLS and connection-pool isolation.

## 2. Authoritative source

SAFE master Appendix I, S032 `m02_execution_report.md`, S039, the approved hash-pinned physical schema and frozen P3 manifests.

## 3. Historical status

PASSED in the original environment.

## 4. Reconstructed implementation involved

Alembic 0001–0005, the exact physical SQL, tenant GUC handling, PostgreSQL repository/bootstrap and RLS policies.

## 5. Acceptance criteria

Fresh 0001→0005 upgrade; a single expected head; pgvector/schema constraints; runtime role without owner/bypass privileges; forced RLS; foreign/missing tenant rejection; cross-tenant FK/constraint negatives; transaction-local context reset through pool reuse. Destructive downgrade is not required or claimed.

## 6. Exact test command

`pytest -q --tb=line -p no:cacheprovider tests/unit/test_tenant_contract.py tests/integration/test_schema.py tests/security/test_rls.py` inside the `diploma-p3` db-tests image on fresh project volumes.

## 7. Observed result

Migration logs show 0001, 0002, 0003, 0004 and 0005 applied in order. `alembic heads` and `current` both reported `0005_embedding_provenance (head)`. PostgreSQL probe reported pgvector 0.8.1. **15 passed in 0.82s.** Negative RLS, privilege, missing-context, foreign-tenant, cross-tenant and pool-reuse cases passed.

## 8. Failures/skips

0 failed, 0 skipped.

## 9. Limitations

No destructive downgrade was executed. This is an isolated local test database, not user or production data.

## 10. Verdict

**M02: PASS.**
