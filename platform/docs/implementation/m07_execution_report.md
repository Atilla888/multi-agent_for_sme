# M07 — RAG ingestion, versioning, retrieval and knowledge evidence

Checkpoint: 2026-09-29 (Asia/Qyzylorda), Python 3.12.12, PostgreSQL 17.8 + pgvector 0.8.1, MinIO `RELEASE.2026-09-22T19-25-18Z`. Scope is M07 only; M08 and later were not started. Authority was the verified sanitized `implementation_handoff/` (manifest SHA-256 `ec0bb056ae16356c1481b5b7a7a441f4ea36d06e263382f75ef9b6c17841a12e`, `SANITIZED_HANDOFF_READY`, owner digest true, zero findings and forbidden matches). No old research repository, Pilot/Final benchmark or private scenario was accessed.

## Implementation and invariants

- `knowledge/contracts.py`: typed `RetrievalRequest`, result/trace, ingestion trace, development limits and differentiated failures. `KnowledgeContextProvider` connects real evidence to M06's read-only seven-part `ContextBundle`; it does not add an agent or tool.
- `knowledge/processing.py`: pure bytes-in/text-out parser abstraction, tested `text/plain` UTF-8 only, strict malformed/control-byte rejection, deterministic 800-character windows with 100-character overlap and line/character locators. These are `DEV_*` values, not research parameters. PDF, office and HTML are unsupported. There is no URL-fetch path and therefore no SSRF fetch surface.
- `knowledge/embedding.py`: explicit provider/model/version/dimension/batch contract, timeout and finite/nonzero/shape checks. The integration path uses local FastEmbed 0.8.1, BAAI/bge-small-en-v1.5 alias, Qdrant quantized ONNX revision `aa8f8b060edb00e03bfdd08813a2949946c8ba55`, 384 dimensions. The image build verifies five model-file SHA-256 hashes and runtime uses `local_files_only=True`; an offline container produced a 384-dimension vector. A deterministic 4D keyword provider is named `FAKE_TEST_ONLY` and is used only for isolated pipeline mechanics, never quality claims.
- `knowledge/storage.py` and Compose: separate MinIO application credential; bucket-scoped GetBucketLocation/GetObject/PutObject policy for the default private development bucket. Original bytes are stored under opaque server-generated `business/{uuid}/DOCUMENT/{object_uuid}/{version_uuid}` keys. A direct anonymous HTTP read was denied (401/403). No permanent/public object URL or user-supplied storage key is exposed.
- `knowledge/repository.py` and `service.py`: Document/ObjectRecord/DocumentVersion/Embedding use the approved physical model. Alembic 0005 only adds nullable embedding provenance columns (locator, chunk hash, chunker version, embedding revision), without changing approved domain semantics. Intake creates a QUARANTINED object and STAGED version; read-back size/hash, parse/chunk/embed and pgvector persistence complete before READY. Failed upload/parse/hash/embed/index cannot change the current publication pointer. Explicit Owner-only publication is a PostgreSQL CAS transaction that checks READY/CLEAN and complete contiguous compatible embedding metadata and writes an audit event. PostgreSQL/MinIO do not share a fictitious global transaction. Revocation atomically clears the pointer and sets `revoked_at`; no retrieval cache exists.
- Retrieval checks actual business membership/identity before embedding, constrains SQL candidate rows by tenant, current published READY version, CLEAN object, ACL and embedding revision/dimension before pgvector ranking, and rechecks current publication/ACL/chunk hash before returning text. Owner can see CUSTOMER/STAFF; Customer and authorized Operator can see CUSTOMER only. Similarity is ranking only, never a permission or operational fact. Evidence includes document/version/chunk IDs, source hash, object reference, locator, parser/chunker/model revision, ACL and content provenance; vector dimension is validated against the indexed version/row. No document text/PII or credentials are written to audit or traces; traces use IDs, hashes, counts and durations.

## Executed acceptance evidence

```text
docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q --tb=line -p no:cacheprovider tests/unit tests/integration tests/security tests/contract
114 passed in 17.63s
```

Distinct M07 cases: **35 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED** (13 pure unit, 22 real-PostgreSQL integration; 15 of those exercise actual MinIO SDK object operations). Full M01–M07 suite: **114 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**. The previous 60 M01–M05 cases and 19 M06 cases remain green; one M02 schema test's expected Alembic head was updated from 0004 to the actually applied 0005 and now also checks the four technical provenance columns. Across the full suite, 90 tests are PostgreSQL-backed. Reruns are not multiplied in these totals.

The 15 MinIO-operation cases are `test_real_minio_pgvector_private_hash_and_provenance`, `test_anonymous_minio_read_denied`, `test_v1_v2_stage_ready_publish_revoke_sequence`, `test_failed_v2_preserves_published_v1`, `test_incomplete_or_unpublished_version_cannot_be_read_or_published`, `test_tenant_and_staff_acl_filter_before_vector_result`, `test_owner_permission_required_for_upload_publish_and_revoke`, `test_parse_failure_does_not_publish_partial_version`, `test_object_hash_tamper_fails_and_keeps_unpublished`, `test_object_read_failure_is_typed_and_keeps_current_version`, `test_embedding_failure_and_dimension_mismatch_fail_closed`, `test_embedding_revision_change_requires_new_version_path`, `test_publication_rejects_incomplete_chunk_metadata`, `test_malicious_document_is_data_only_in_brain`, and `test_local_model_ranks_public_development_refund_example`. Other cases that reject before upload or inject a broken store are not counted as real MinIO-operation tests.

An explicit security-focused integration subset contains **13 collected cases**, included within the 22 integration cases rather than added to the total: anonymous read; failed V2 preserving V1; tenant/STAFF ACL; forged Owner/customer rejection; three invalid-upload parametrizations; oversized upload; malformed parse; hash tamper; read outage preserving V1; incomplete index metadata; and malicious document with unchanged trusted context. The other M07 cases also exercise safety invariants, but this count is deliberately narrow and non-overlapping with no separate test run claim.

The 35 M07 cases cover parser/type/size/empty/malformed controls; deterministic chunks/locators; valid and invalid embedding shapes/provider failures; real MinIO upload/read/privacy/hash tamper; pgvector rows and provenance; unpublished/incomplete versions; V1→V2 stage→READY→explicit publish→revoke; failed V2 retaining V1; tenant A's highly relevant vector excluded while B's own lower-relevance document is returned; same-tenant STAFF ACL; forged Owner/customer write rejection; incomplete metadata and model revision mismatch; database/object upload/read failures (including typed `OBJECT_UNAVAILABLE` while V1 remains current); malicious document remaining only a data string in Business Brain; structured CREATED Order and zero Inventory remaining authoritative; and a small independent public DEVELOPMENT real-model ranking diagnostic (refund document above garden document). This is not evidence of production retrieval quality or thesis performance.

Additional actually executed checks:

```text
alembic -c infra/migrations/alembic.ini current
0005_embedding_provenance (head)

docker run --rm --network none sme-platform-db-tests python -c "...LocalFastEmbed().embed(['refund'])..."
OFFLINE_MODEL_DIM 384

docker compose --env-file .env -f infra/compose/compose.yaml restart postgres minio backend
docker compose --env-file .env -f infra/compose/compose.yaml ps
backend, postgres, minio: healthy

post-restart published PostgreSQL object key + MinIO byte/hash check
PUBLISHED_OBJECT_SURVIVED_RESTART True

post-restart test_schema.py + test_knowledge_real_model.py + test_rls.py
15 passed in 2.05s

ruff check --no-cache services/backend/src tests
All checks passed!
ruff format --check --no-cache services/backend/src tests
59 files already formatted
mypy --no-incremental services/backend/src
Success: no issues found in 43 source files
```

The runtime backend environment check returned `ROOT_MINIO_CREDENTIAL_EXPOSED False`, `MIGRATOR_DATABASE_URL_EXPOSED False`, and `APP_MINIO_CREDENTIAL_CONFIGURED True`. Provisioning jobs, not the backend, hold MinIO root credentials. PostgreSQL runtime RLS regression and role-bypass cases remain in the passing suite; M07 retrieval adds an application-level final ACL/tenant check. The backend and MinIO are on Compose's internal data network, and the bucket has no anonymous read policy.

## Failure history, security review and limits

The first focused M07 run was **20 passed / 10 failed** because MinIO's Python SDK needed `s3:GetBucketLocation`; the bucket-scoped policy was corrected, after which **15 passed / 1 failed** exposed only a test comparison of clock-bearing provenance objects. That assertion now compares immutable rule code/statement. The first full regression was **112 passed / 1 failed** because `test_schema.py` still hard-coded Alembic 0004; after updating its expected head and column assertions, the full suite passed 113/113. One extra read-outage negative test and adapter fallback were then added; the final suite passed 114/114. These interim failures are not counted as final PASSED until their successful rerun. Initial model loading from an internal runtime network failed DNS as expected; a bridge-network retry first failed due to an unwritable HF cache, then succeeded with a writable cache and produced 384 dimensions. Model weights were moved into the build stage, hash-verified and tested offline in runtime.

Security review: uploader must be current DB Owner; Platform Admin/forged role is not Owner. The application credential is separate from root and scoped to the development bucket, but a compromised backend credential would still need defense in depth because its S3 policy covers all `business/*` keys in that one bucket; application DB authorization and opaque keys enforce tenant access. Bucket policy is fixed to `sme-private-objects` for this local profile, so changing bucket requires a matching policy. Parser receives bytes and MIME only, runs as non-root backend code, never executes document content or receives admin credentials; it is not claimed to be an OS-level parser sandbox. Malicious instructions remain untrusted evidence and cannot change role, tenant, tools, policy or Order/Inventory. No arbitrary path, external fetch, public URL, external embedding API, document-body logging or Redis cache exists. No physical deletion/retention period is invented. One-shot Compose provisioning uses environment-provided local development secrets; deployment secret handling beyond this profile is not claimed production-ready.

**M07 status: PASSED** for the executed M07 development contract. M08 remains NOT STARTED / NOT AUTHORIZED.
