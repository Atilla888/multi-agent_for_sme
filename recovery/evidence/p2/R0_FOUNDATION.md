# R0 — foundation evidence (initial pass)

Date: 2026-10-13, branch `reconstruction/p2-platform-completion`. No source file was changed before this check.

| Check / command | Process exit | Observed result | Interpretation |
| --- | ---: | --- | --- |
| `python --version` | 0 | Python 3.10.7 | Below `pyproject.toml` minimum `>=3.11`; not a supported test runtime |
| `py -0p` | 0 | Only Python 3.10 registered | Supported host interpreter unavailable |
| Python `compile()` over every existing `platform/**/*.py` | 0 | 63/63 syntax-valid | Syntax only, not import/runtime success |
| `tomli.loads(platform/pyproject.toml)` | 0 | TOML parsed | Direct dependency declaration readable |
| AST resolution of absolute `platform_backend.*` imports | 0 (diagnostic script) | Six modules missing: Brain contracts/service/sources, Knowledge service, PostgreSQL repository, Tool executor | R0 import graph fails; sources must be restored before collection |
| `docker --version` | 0 with warning | CLI 29.7.2; user Docker config access denied | Container runtime availability not established |

`pytest` collection was not run under Python 3.10 because the project explicitly requires Python 3.11–3.13 and central imports are absent. This is **BLOCKED**, not a passing test result. The package layout and historical pinned direct dependencies were preserved; no new framework or arbitrary dependency was introduced.

Later R0 checks will be appended after evidence-backed module restoration.

## Post-restoration check

After the seven missing backend modules and one M07 test file were restored, 71 platform Python files parsed; adding the P2 static test made 72. AST resolution of all absolute local `platform_backend.*` imports found **zero** unresolved modules. This is source-tree coherence, not a runtime import guarantee.

Targeted M01–M07 `pytest --collect-only` under host Python 3.10 exited 1: one test collected and four collection errors (`datetime.UTC` / `enum.StrEnum`, both introduced in Python 3.11). This is an environment BLOCKER, not a test PASS and not grounds to alter project source or version requirements. Docker API is unavailable because the Docker daemon pipe is missing; a supported container could not be started.
