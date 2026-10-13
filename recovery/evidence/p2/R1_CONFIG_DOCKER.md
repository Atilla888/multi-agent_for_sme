# R1 — configuration and Docker evidence

Documentation first: project `pyproject.toml`, M01/M07 execution reports, `infrastructure/settings.py`, the surviving Compose substitutions, and the development-safe master were consulted. No old `.env` or provider credential was read or restored.

| Artifact / command | Observed result | Exit / conclusion |
| --- | --- | --- |
| `requirements-m01-m07.lock` from successful JSONL 4699 output | 67 pinned packages; all 11 direct dependencies in `pyproject.toml` match by name/version | Recovery check 0; session-output text, not freshly solved lock |
| Dockerfile from JSONL 4773 + exact successful patch 4991 | 50 lines; each local `COPY` source exists, including hash-pinned physical SQL and M07 lock | Extraction/check 0 |
| Compose from JSONL 4699 + exact successful patches 5654/5751 | YAML parses; 13 services; every secret-key environment value is a variable interpolation, not a literal credential | Extraction/check 0 |
| MinIO policy from static safe segment of successful patch 3320 + exact patches 3391/3537 | JSON parses | Extraction/check 0 |
| `.env.example` | New documentation-guided template with 14 required Compose variables and unmistakable `CHANGE_ME_*` credential placeholders | Variable coverage check 0; not a recovered original template |
| `docker compose --env-file .env.example -f infra/compose/compose.yaml config --quiet` (from `platform/`) | No output | Exit 0; structural Compose validation only, no container started and no volume changed |

No real `.env`, provider/API key or secret bundle exists in the repository. Compose config PASS does not prove images build, services run, database migrations work, or M01–M07 pass. Those require P3 revalidation after P2 reconstruction.
