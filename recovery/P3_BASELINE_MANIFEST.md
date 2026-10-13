# P3 frozen baseline manifest

Frozen before P3 test execution on 2026-10-13 (Asia/Qyzylorda).

## Identity

| Item | Frozen value |
| --- | --- |
| Baseline commit | `1cd69e33be80c81b9222c9a141393d570e692ec6` |
| P3 branch | `revalidation/p3-m01-m07` |
| Parent P2 branch | `reconstruction/p2-platform-completion` |
| Platform Git tree | `c60d6d56a0e9a7c991b245fd2e7750267a49546b` |
| Test Git tree | `def828324e8eab96b03acc38df05962c48a1e9c1` |
| Backend-source Git tree | `6e8fa41619d222afe4e6b1600401da9eafa48fcd` |
| Infrastructure Git tree | `00604818bc60b15d42947979e3aca84512b3a2db` |

## Environment

| Item | Frozen value |
| --- | --- |
| Python | CPython 3.12.10 from `platform/.venv` |
| pip | 25.0.1 |
| Installed distributions | 71 lines from `pip freeze`; SHA-256 `39c87a516dbbe542717be94427d76fa908c8328012349096f53c954b45a434e9` |
| Docker CLI | 29.7.2, build `a7dcaa6` |
| Docker Compose | v5.5.0 |
| Alembic code head | `0005_embedding_provenance` |
| Platform Python source count | 72, excluding `.venv` |
| Test-module count | 15 |
| Planned isolated Compose project | `diploma-p3` |

The development-safe master used for scope recovery has SHA-256 `7cd44044971efb42451cf236078e8fba8d9ff6abcb264b0c005938204d008d45`. The temporary PDF reader used outside the repository did not alter `platform/.venv`.

## Dependency authorities

| File | SHA-256 |
| --- | --- |
| `platform/pyproject.toml` | `754e7ac60f391e0eb0587e387df04d2170cb196cb76a77deaa88d497d48474e5` |
| `platform/requirements-m01-m02.lock` | `3f4ebd146af2d51e8c2165649f216a78cc103465ae1e8cd2ed3a4ce84469cb85` |
| `platform/requirements-m01-m05.lock` | `ccdf0ab4063ef7e833aefabce7748abc31a4f1aaf3e2aec30f901818a9d5dd58` |
| `platform/requirements-m01-m07.lock` | `270a539467ad2fbbfadeaf722d2277b698d5ea0a5267eafbdf25d57857472e51` |

## Migration hashes

| Revision file | SHA-256 |
| --- | --- |
| `0001_approved_physical_schema.py` | `4fdea1a872030337269ed63d5e89b036a370bbc214074142238257421d3cc84d` |
| `0002_tenant_security.py` | `cd5ae8cbd660f01e9c3433c5eaee966217358f8a1395b272cb0edbb94949b0da` |
| `0003_readiness_revision_grant.py` | `b36102981b8d50d556e5500a799efc723048a7a4979fa9a4577e2cacf8031098` |
| `0004_staff_identity_lookup.py` | `f97360047382a344dc5aa757c95088120171dffcd9d2165e91b8db287b9a45db` |
| `0005_embedding_provenance.py` | `7b9c3ba948c97c209a01d0e20054aee68b9ba76f39268648663b355825221a4f` |

The migration-0001 physical SQL committed SHA-256 is `5535ba8ab12b17eb5192b034c8b6eda840fadd95dc4eb3cee93d3b4b909c6c94`.

## Important configuration hashes

| File | SHA-256 |
| --- | --- |
| `platform/.env.example` | `47cd663c6d7a61a2fa54e58bbd6b8285c326c1767da09d9bff75b3c22fca837e` |
| `platform/infra/compose/compose.yaml` | `d3933ddad082f37c41485ddc6efc6779377ba59d5c532c9b4d9cf77722d5c201` |
| `platform/infra/minio/app-policy.json` | `323f8d0096b7bf268f66fd179496afefd9100975d3686ef5af61dcd4db834c34` |
| `platform/services/backend/Dockerfile` | `82dfc2128d5581f09fdd4e6481e1d2dfc993c75c9de7da7f07ff788d062dadae` |
| `platform/infra/migrations/alembic.ini` | `4518d2f3e38c3eb92f54614a4f5e0f78ffd9d1c0197bcdf0fb3f46c430946d0a` |
| `platform/infra/migrations/env.py` | `116875053b3d753fb1a8838aabbbab425529d06831902b24c208a43df1a9d32b` |

After this freeze, production source, existing tests, migrations, dependencies and Docker/configuration semantics are immutable for P3. Only `recovery/` evidence and minimal status documentation may be added or updated.
