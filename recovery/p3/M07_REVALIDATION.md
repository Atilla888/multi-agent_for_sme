# M07 formal revalidation

## 1. Milestone purpose

Revalidate the private document/RAG lifecycle across MinIO, PostgreSQL/pgvector, local embeddings, publication, ACL retrieval and revocation.

## 2. Authoritative source

SAFE master Appendix I, S037 `m07_execution_report.md`, S039, benchmark-isolation evidence and frozen P3 manifests.

## 3. Historical status

PASSED in the original environment.

## 4. Reconstructed implementation involved

Knowledge contracts, processing, embedding, storage, repository and service; MinIO policy/provisioning; migration 0005; read-only M06 provider integration.

## 5. Acceptance criteria

Private staged objects; strict text/plain UTF-8 parser; deterministic chunks/locators; verified local 384D embedding path; hash/shape/revision checks; pgvector provenance; no partial publication; explicit Owner-only READY/CLEAN CAS publication; current-version/tenant/ACL filtering before ranking and return; revocation; typed object/DB/embedding failures; malicious instructions remain data and cannot override structured state/policy.

## 6. Exact test command

`pytest ... tests/unit/test_knowledge_processing.py tests/integration/test_knowledge.py tests/integration/test_knowledge_real_model.py` on fresh PostgreSQL/MinIO volumes with the bundled offline model.

## 7. Observed result

**35 passed in 7.60s**: 13 expanded processing/embedding unit cases, 21 PostgreSQL/MinIO/pgvector integration cases and one offline real-model diagnostic. Anonymous read, tenant/ACL, forged role, invalid upload, hash tamper, outage, incomplete metadata, failed V2, malicious-text and empty-query negative paths passed.

## 8. Failures/skips

0 failed, 0 skipped. No external model/provider call or private research oracle was used.

## 9. Limitations

Parser scope remains text/plain UTF-8. No PDF/Office/HTML ingestion, external fetch, production retrieval-quality or research-performance claim.

## 10. Verdict

**M07: PASS.**
