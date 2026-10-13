# M01 formal revalidation

## 1. Milestone purpose

Revalidate the local repository/Compose runtime foundation: isolated startup, service health, provisioning, private object storage and restart persistence.

## 2. Authoritative source

SAFE master Appendix I, S031 `m01_execution_report.md`, S039 `milestone_status.md`, `implementation_architecture_map.md`, and the frozen P3 definition/test manifests.

## 3. Historical status

PASSED for the original local-development scope; not accepted as current evidence until this P3 run.

## 4. Reconstructed implementation involved

`infra/compose/compose.yaml`, backend/migration Dockerfile targets, health endpoints, PostgreSQL/pgvector, Redis, MinIO provisioning/policy, Keycloak and the migration chain.

## 5. Acceptance criteria

Compose resolves; isolated services become healthy; setup/migration jobs exit 0; backend reports live/ready at revision 0005; bucket creation is idempotent and anonymous access is private; stop/start restores health and persisted migration/pgvector state. Local development only—no production HA claim.

## 6. Commands

- `docker info --format '{{.ServerVersion}}'`
- `docker compose --project-name diploma-p3 ... config --quiet`
- `docker compose --project-name diploma-p3 ... up --build --wait --detach`
- backend `/health/live` and `/health/ready`
- rerun `object-init`; `mc anonymous get local/sme-private-objects`
- project-specific `stop` then `up --wait --detach`
- M02 foundation regression: the frozen 15-case schema/RLS/tenant suite

## 7. Observed result

Docker server 29.7.2 and Compose v5.5.0. All six ordinary services became healthy; migration and four object-provisioning jobs exited 0. Backend returned `alive`, `ready`, revision `0005_embedding_provenance`. Provisioning reran successfully and bucket permission was `private`. Clean stop/start returned all services to healthy. Revision 0005 and pgvector 0.8.1 remained available. Foundation regression: **15 passed**.

## 8. Failures/skips

No platform or test failure; zero skips. A post-restart read-only Python probe first failed before execution because the operator shell command had malformed quoting; the unchanged probe was retried with parameterized SQL and succeeded. It did not exercise platform code and is retained in P3 test-results evidence.

## 9. Limitations

Local development topology only. No production HA, TLS/public ingress, feature API or live customer channel is claimed.

## 10. Verdict

**M01: PASS.**
