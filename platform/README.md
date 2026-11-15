# Backend

FastAPI service with PostgreSQL, Keycloak and MinIO, run with Docker Compose.

## Layout

| Path | Contents |
| --- | --- |
| `services/backend/src/platform_backend/api` | HTTP routes |
| `…/security` | Token validation, staff identity, business membership |
| `…/domain`, `…/application`, `…/repositories` | Domain model, services and data access |
| `…/tools` | The ten business tools and the executor that validates and runs them |
| `…/agents` | Sales, Support and Analytics runtime, prompts, LLM providers (Claude, Gemini, Ollama) |
| `…/brain`, `…/knowledge`, `…/rag` | Business Brain context assembly and document retrieval |
| `…/channels` | WhatsApp webhook and staff inbox |
| `…/demo` | Demo shop seed data |
| `infra/compose` | `compose.yaml` (core stack), `compose.p5i.yaml` (Keycloak sign-in for the frontend), `compose.demo.yaml` (WhatsApp demo) |
| `infra/migrations` | Alembic migrations |
| `implementation_handoff/…/physical_schema.sql` | Approved database schema, applied by the first migration (hash-pinned) |
| `tests` | Unit, integration, security and contract tests |

## Run

```bash
cp .env.example .env          # replace every CHANGE_ME_* value
docker compose -f infra/compose/compose.yaml --env-file .env up -d --wait
curl http://127.0.0.1:8000/health/ready
```

The stack starts PostgreSQL, Redis, MinIO, Keycloak, runs migrations and starts the API on port 8000. For the WhatsApp demo, see [docs/WHATSAPP_DEMO.md](../docs/WHATSAPP_DEMO.md).

## Local Python environment

```bash
python3.12 -m venv .venv && source .venv/bin/activate
pip install -e ".[dev]" -c requirements.lock
```

## Test

```bash
docker compose -f infra/compose/compose.yaml --env-file .env --profile test run --rm db-tests \
  pytest -q tests/unit tests/integration tests/security tests/contract

ruff check . && mypy
```

Tests that call a real LLM are opt-in through the `llm-test` Compose profile and need a provider key.

## Configuration

| Variable | Purpose |
| --- | --- |
| `DEV_LLM_PROVIDER` | `claude` or `gemini` |
| `DEV_LLM_MODEL` | Model name, e.g. `claude-opus-5-5` or `gemini-3.8-flash` |
| `ANTHROPIC_API_KEY` / `GEMINI_API_KEY` | Provider key, read from the environment only |
| `OIDC_*`, `KEYCLOAK_PUBLIC_ORIGIN`, `HTTP_CORS_ORIGINS` | Frontend sign-in |
| `WHATSAPP_*` | WhatsApp demo channel |

All variables are listed in [`.env.example`](.env.example).

## API

- `GET /health/live`, `GET /health/ready`
- `GET /me`, `/products`, `/products/{id}`, `/inventory`, `/customers/{id}`, `/orders/{id}`, `/analytics/sales`, `/conversations`, `/conversations/{id}` — require a staff token
- `POST /webhooks/whatsapp` — WhatsApp Cloud API webhook (signature-checked)

## Safety rules

- Never commit `.env`, `.venv` or provider keys.
- Use isolated Compose project names; don't reuse or delete unrelated volumes.
- Keep exactly ten trusted business tools. An `OUTCOME_UNKNOWN` write is reconciled, never blindly retried. `update_order` stays blocked by policy.
