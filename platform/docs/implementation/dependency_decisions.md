# M01–M05 dependency decisions

Selected on 2026-09-29 for a conservative Python 3.12 / SQLAlchemy 2.0 baseline. Only
dependencies required by the authorized M01–M05 scope are bound.

| Component | Pin | Rationale |
|---|---:|---|
| Python | 3.12.12 (slim-bookworm image) | Supported runtime above the frozen 3.11 minimum; avoids relying on host 3.10 |
| FastAPI | 0.116.1 | Stable Pydantic-v2 baseline used only for liveness/readiness |
| Pydantic | 2.11.7 | Stable v2 line compatible with the selected FastAPI baseline |
| pydantic-settings | 2.10.1 | Fail-fast environment configuration without custom loaders |
| SQLAlchemy | 2.0.54 | Latest mature 2.0 maintenance line observed; avoids adopting the newer 2.1 API during foundation work |
| Alembic | 1.20.0 | Current stable SQLAlchemy migration tool observed in official package metadata |
| Psycopg | 3.2.10 | Psycopg 3 driver with binary and pool extras; M02 tests target PostgreSQL semantics |
| PostgreSQL (business DB) | 17.8 observed in pgvector image | Verified with `SELECT version()` against the running business database |
| PostgreSQL (Keycloak DB) | 17.6 | Separate identity database image; M05 local OIDC smoke test uses Keycloak's public token/JWKS and test-only admin API |
| pgvector | 0.8.1-pg17 | PostgreSQL 17 image with required vector extension |
| Redis | 8.2.1-alpine | Transient checkpoint/cache service; AOF enabled but never authoritative |
| MinIO | `RELEASE.2026-09-22T19-25-18Z`, Chainguard `latest-dev` pinned to `sha256:c79eec48...33738f` | The former Docker Hub image was removed; this reachable image contains MinIO and `mc` for its readiness check |
| MinIO client | Chainguard `latest` pinned to `sha256:b2bd7824...56dc20f` | Replaces the removed Docker Hub `minio/mc` image for the object-init job |
| Keycloak | 26.3.3 | Live M05 OIDC token/JWKS verification against a temporary test realm; no backend auth routes yet |
| PyJWT with crypto extra | 2.15.0 | M05 RS256 signature, issuer, audience and claim verification |
| cryptography | 50.0.1 | RSA verification backend and synthetic-key security tests |
| Compose | Compose Specification via Docker Compose v5.5.0 | No obsolete schema `version` key; long-form dependency health conditions |

Python dependencies are exact direct pins in `pyproject.toml`; the installed runtime
transitive set is constrained by `requirements-m01-m05.lock`, captured from the executed
Python 3.12 image (`requirements-m01-m02.lock` remains the earlier checkpoint). All Compose
images and the backend base image are pinned by digest.
Package version checks used official PyPI project metadata for
[SQLAlchemy](https://pypi.org/project/SQLAlchemy/),
[Alembic](https://pypi.org/project/alembic/),
[FastAPI](https://pypi.org/project/fastapi/),
[Pydantic](https://pypi.org/project/pydantic/), and
[Psycopg](https://pypi.org/project/psycopg/).

Future libraries (LangGraph, model providers, RAG, forecasting, frontend) are deliberately
not bound during M01–M05.

## M07 additions (2026-09-29)

| Component | Exact pin | Purpose and compatibility/security note |
|---|---:|---|
| MinIO Python SDK | `minio==7.2.20` | Private S3-compatible upload/read with a separate bucket-scoped application credential; no public URL method is exposed. Root credentials remain in one-shot provisioning jobs only. |
| FastEmbed | `fastembed==0.8.1` | Local CPU ONNX embeddings; no document/query text is sent to an external embedding API. The development model alias `BAAI/bge-small-en-v1.5` produces 384 dimensions. |
| Model assets | Qdrant ONNX revision `aa8f8b060edb00e03bfdd08813a2949946c8ba55` | Weights are downloaded at image build, checked against five SHA-256 digests in `infra/model/fastembed-0.8.1-bge-small-en-v1.5.sha256`, copied into runtime/test images, and used with `local_files_only=True`. Builds fail if upstream bytes change. |

`requirements-m01-m07.lock` records the exact installed Python 3.12 runtime/test transitive set; it supersedes M01–M05 constraints for the M07 image without altering the earlier checkpoint lock. `mypy` is configured for the actually executed Python 3.12 runtime because the installed NumPy 2.5 stubs use Python 3.12 syntax; no Python 3.11 execution is claimed. FastEmbed/ONNX increases image and build size. The model is a DEVELOPMENT engineering choice, not a frozen research treatment; quality evidence is limited to a small independent public diagnostic. No LLM SDK, LangGraph, reranker, separate vector database or frontend package was added.

## M08 development-only provider decision (not a Final model freeze)

Google's [Gemini 3.8 Flash model page](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash) identifies stable `gemini-3.8-flash` with function calling, structured outputs and a 1,048,576-token input limit. Its [function-calling documentation](https://ai.google.dev/gemini-api/docs/function-calling) assigns actual function execution to the application, matching the trusted ToolExecutor boundary. This is a DEVELOPMENT choice only; the Final research provider/model remains unfrozen.

The adapter uses the documented Gemini `generateContent` REST API through existing `httpx==0.28.1`, now declared as a direct dependency in `pyproject.toml` and Dockerfile. There is no Google SDK dependency. Python remains 3.12.12 and all other runtime pins remain unchanged. Defaults are `DEV_LLM_PROVIDER=gemini`, `DEV_LLM_MODEL=gemini-3.8-flash`, temperature 0.2, top-p 0.95, max output 1024, request timeout 20 seconds, and one bounded retry for transport/timeout/rate-limit/server failures. The key is read only from `GEMINI_API_KEY` at runtime; it is not stored in the repo. Model seed/deterministic repeatability has not been validated.

The development model was selected from official documentation, not validated against the live provider: a credential-preserving API probe returned HTTP 401. Consequently real-provider M08 acceptance remains BLOCKED. No LangGraph or later-milestone dependency was introduced.

