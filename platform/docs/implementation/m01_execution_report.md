# M01 execution report — repository skeleton and Compose runtime

Executed 2026-09-29 (Asia/Qyzylorda) in the new `platform-implementation` repository only.
The approved handoff verifier returned `SANITIZED_HANDOFF_READY`, owner digest verified, no
findings, with expected manifest SHA-256
`ec0bb056ae16356c1481b5b7a7a441f4ea36d06e263382f75ef9b6c17841a12e`. The old
research repository and private benchmark were not accessed.

## Executed evidence

| Check / command (from repository root unless stated) | Observed result | Final status |
|---|---|---|
| `docker info --format '{{json .ServerVersion}}'` | Exit 0; `"29.7.2"`. This host required approved elevated Docker access; the unprivileged attempt returned permission denied. | PASSED |
| `docker compose version` | Compose v5.5.0. | PASSED |
| `docker compose --env-file .env -f infra/compose/compose.yaml config --quiet` | Exit 0; mandatory local configuration resolved. `.env` is Git-ignored and excluded from image build context; values are not recorded here. | PASSED |
| `docker compose --env-file .env -f infra/compose/compose.yaml up --build --wait -d` | Exit 0 after scoped image/readiness fixes. PostgreSQL, Redis, MinIO, Keycloak DB, Keycloak and backend became healthy; `migration` and `object-init` exited 0. | PASSED |
| PostgreSQL `pg_isready`, Redis PING, MinIO `mc ready local`, Keycloak `/health/ready`, backend `/health/ready` | All Compose health gates healthy. Backend `/health/live` returned `{"status":"alive"}` and `/health/ready` returned `{"status":"ready","migration":"0003_readiness_grant"}`. | PASSED |
| Object-init job and `mc anonymous get local/sme-private-objects` | Bucket exists; anonymous access reported `Access permission for 'local/sme-private-objects' is private`. Rerunning the job exited 0. | PASSED |
| Host port / network inspection | Only backend `127.0.0.1:8000` and Keycloak `127.0.0.1:8080` were published. PostgreSQL, Redis and MinIO had no host bindings; data and identity networks are Compose-internal. | PASSED |
| `docker compose --env-file .env -f infra/compose/compose.yaml stop` then `docker compose --env-file .env -f infra/compose/compose.yaml up --wait -d` | Both exited 0; services returned healthy and one-shot jobs exited 0. PostgreSQL revision and pgvector persisted. Business/customer counts before and after were `38/26` and `38/26`; bucket remained private. | PASSED |
| `docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests` after restart | Exit 0; `15 passed in 0.63s` on the first restart check, `15 passed in 0.67s` on a rebuilt test image, and `15 passed in 0.64s` on the final images. Detailed M02 evidence is in the M02 report. | PASSED |
| Final static/dependency checks in the rebuilt images | `ruff check --no-cache --output-format concise services/backend/src infra/migrations tests`: `All checks passed!`; `python -m pip check`: `No broken requirements found.` Both exited 0. | PASSED |

Earlier static preparation checks also passed: `verify_structure.py` found 41 required
directories after the missing `docs/implementation` directory was created, host-side
`compileall` parsed the Python files, and Compose rendered. Host Python 3.10 is not used as
backend compatibility evidence; backend and test containers run Python 3.12.12.

## Runtime failures diagnosed and corrected within M01/M02

The first Compose start could not pull the removed Docker Hub MinIO server/client tags;
anonymous Quay access was denied. The server and init job now use reachable Chainguard
images pinned by digest. Their actual entrypoints and health/init commands were verified;
the init job has no shell and runs `mc mb --ignore-existing` directly.

The first real migration start failed because SQLAlchemy interpreted `postgresql://` as a
psycopg2 URL; the installed driver is Psycopg 3. Alembic and readiness convert this URL
to `postgresql+psycopg://`. Readiness initially returned 503 because the runtime role
could not read `alembic_version`; migration 0003 grants SELECT on that table only.
No approved physical-schema change was made.

## Boundary and result

This is a local development Compose topology. Keycloak uses `start-dev`; OIDC integration,
HA, TLS/public ingress and later milestones are not claimed. Synthetic PostgreSQL test rows
persist in the development volume and are not research data. No destructive volume reset
was performed.

**Exact M01 status: PASSED.** The daemon, Compose runtime, required service startup,
health gates, private bucket and clean restart were executed successfully.

