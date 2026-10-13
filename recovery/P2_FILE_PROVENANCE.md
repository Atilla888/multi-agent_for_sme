# P2 file provenance

Branch `reconstruction/p2-platform-completion`. No restored source is claimed to be a fresh M01–M07 PASS.

| Platform file(s) | Classification | Evidence / limits |
| --- | --- | --- |
| `implementation_handoff/contracts/docs/engineering/physical_schema.sql` | RECOVERED ORIGINAL CONTENT | Successful primary JSONL 1019 full output restored with UTF-8/CRLF; SHA-256 `5535ba8ab12b17eb5192b034c8b6eda840fadd95dc4eb3cee93d3b4b909c6c94` exactly matches Alembic 0001. This is only one file, not the complete handoff. |
| `.gitattributes` | STATUS / EVIDENCE DOCUMENTATION | Existing LF/binary rules retained; narrow `-text` exception preserves exact SQL bytes in Git. Committed blob hash checked against the worktree and Alembic 0001. |
| `requirements-m01-m07.lock` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Successful full output JSONL 4699; 67 pins and all 11 direct dependency versions checked. No fresh resolver run. |
| `infra/compose/compose.yaml` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Full output 4699 plus unique exact successful patches 5654/5751; YAML and 13-service Compose config parse. |
| `infra/minio/app-policy.json` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Non-secret static segment of successful patch 3320 plus exact patches 3391/3537; JSON parses. |
| `services/backend/Dockerfile` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Full output 4773 plus unique exact patch 4991; local COPY sources present. Image not built. |
| `services/backend/src/platform_backend/repositories/postgres.py` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Bounded successful full output 3157 plus unique exact successful patches 3275/3604; SHA-256 `db2a1d7958c4d60716696b66d25231d69c35afdefb7363072df9d033fc221857`. |
| `services/backend/src/platform_backend/brain/contracts.py`, `brain/service.py`, `tools/executor.py` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Three uniquely bounded segments of successful output 4692; SHA-256 respectively `ef58886480879bbc45e004cae2370c224fc2221514125b2c393c8180f260f315`, `957b68e66285faa9e4ef5d73f995239e44d5a15e57cabdd7b510c9ab7b736550`, `04a8956541ba0f441de4e8b95cf6570267c37d0345937835b0810db505b9075a`. |
| `services/backend/src/platform_backend/brain/sources.py` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Uniquely bounded segment of successful output 3157; SHA-256 `246bfb46f50c2e6ed40a14de767535eb1b15eea441d9c121e089a156a2122385`. |
| `services/backend/src/platform_backend/tools/ports.py` | RECOVERED + COMPLETED FROM PARTIAL EVIDENCE | Bounded complete 36-line output 4859; SHA-256 `813535c21904328a20201bfe2c099d559f80a040cb404fe8f1f94264f1ed9ff5`. |
| `.env.example` | DOCUMENTATION-GUIDED RECONSTRUCTION | New safe variable-name/placeholder template from Compose/settings; no historical password or secret restored. |
| `services/backend/src/platform_backend/knowledge/service.py` | DOCUMENTATION-GUIDED RECONSTRUCTION | Exact Add/update prefix through JSONL 3774; later semantic deltas from successful patches 3822/3949/4286 applied manually because historical formatter writes break exact replay. Not claimed byte-identical. |
| `tests/integration/test_knowledge.py` | NEW RECONSTRUCTION TEST | Exact Add/update prefix through JSONL 3802; later successful patch scenarios 3911/4293 manually incorporated. Requires PostgreSQL/MinIO for runtime execution. |
| `tests/reconstruction/test_p2_static.py` | NEW RECONSTRUCTION TEST | P2-only static import, migration/hash, ten-tool/role and no-secret/frontend gates. |
| `platform/README.md`, `platform/RECOVERY_STATUS.md` | STATUS / EVIDENCE DOCUMENTATION | Updated to remove stale statements and state current P2 limitations, not to alter authority. |

Recovery scripts in `recovery/` are one-time fail-closed evidence extractors. They refuse overwrite, check successful command/patch status and non-secret output, and are not platform runtime code. Raw session journals, external staging, old `.env`, INTERNAL master and Figma assets were not copied into this repository.
