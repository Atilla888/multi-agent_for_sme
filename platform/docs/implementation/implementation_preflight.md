# Implementation preflight

Recorded: 2026-09-29 (Asia/Qyzylorda). Scope: fresh repository only.

| Check | Observed result | Status |
|---|---|---|
| OS | Microsoft Windows 10.0.26200.9457, reported by `cmd /c ver`; CIM query was access-denied | EXECUTED |
| Git | 2.53.0.windows.2; repository was absent and is now initialized at this root | EXECUTED |
| Python | CPython 3.10.7 only | BLOCKED for backend host-runtime evidence |
| Docker CLI | 29.7.2 | EXECUTED |
| Docker daemon | initially unavailable; later reached with `docker info`, ServerVersion 29.7.2 | PASSED (runtime recheck) |
| Docker Compose | v5.5.0 | EXECUTED |
| Node | v24.12.0 | EXECUTED |
| npm | 11.6.2 via `npm.cmd`; PowerShell wrapper blocked by local execution policy | EXECUTED |

Backend Python is bound to 3.12 in its container. Host Python 3.10 is used only for
standard-library verification/static compilation and is not compatibility evidence.

