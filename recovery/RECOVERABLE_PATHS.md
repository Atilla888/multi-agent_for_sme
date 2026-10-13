# Recoverable path inventory

Only paths targeted by successfully executed primary-session patches are counted here. Secret-sensitive paths are named but never reconstructed.

| Platform-relative path | Class | Successful revisions | Recovery |
| --- | --- | --- | --- |
| .dockerignore | CONFIG | 1 | FULLY RECOVERED |
| .env | SECRET-SENSITIVE | 3 | SECRET-SENSITIVE SOURCE OMITTED |
| .env.example | CONFIG | 2 | PARTIALLY RECOVERED |
| .gitattributes | CONFIG | 1 | FULLY RECOVERED |
| .gitignore | CONFIG | 1 | FULLY RECOVERED |
| README.md | DOCUMENTATION | 3 | FULLY RECOVERED |
| apps/web/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| data/development/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| data/manifests/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| docs/implementation/benchmark_isolation_audit.md | DOCUMENTATION | 1 | FULLY RECOVERED |
| docs/implementation/dependency_decisions.md | DOCUMENTATION | 7 | FULLY RECOVERED |
| docs/implementation/deviations.md | DOCUMENTATION | 5 | FULLY RECOVERED |
| docs/implementation/implementation_architecture_map.md | DOCUMENTATION | 9 | FULLY RECOVERED |
| docs/implementation/implementation_preflight.md | DOCUMENTATION | 2 | FULLY RECOVERED |
| docs/implementation/m01_execution_report.md | DOCUMENTATION | 7 | FULLY RECOVERED |
| docs/implementation/m02_execution_report.md | DOCUMENTATION | 7 | FULLY RECOVERED |
| docs/implementation/m03_execution_report.md | DOCUMENTATION | 3 | FULLY RECOVERED |
| docs/implementation/m04_execution_report.md | DOCUMENTATION | 2 | FULLY RECOVERED |
| docs/implementation/m05_execution_report.md | DOCUMENTATION | 2 | FULLY RECOVERED |
| docs/implementation/m06_execution_report.md | DOCUMENTATION | 3 | FULLY RECOVERED |
| docs/implementation/m07_execution_report.md | DOCUMENTATION | 5 | FULLY RECOVERED |
| docs/implementation/m08_execution_report.md | DOCUMENTATION | 8 | FULLY RECOVERED |
| docs/implementation/m08_prompt_model_registry.md | DOCUMENTATION | 2 | FULLY RECOVERED |
| docs/implementation/m09_execution_report.md | DOCUMENTATION | 1 | FULLY RECOVERED |
| docs/implementation/m10_execution_report.md | DOCUMENTATION | 1 | FULLY RECOVERED |
| docs/implementation/m11_execution_report.md | DOCUMENTATION | 1 | FULLY RECOVERED |
| docs/implementation/m12_execution_report.md | DOCUMENTATION | 1 | FULLY RECOVERED |
| docs/implementation/milestone_status.md | DOCUMENTATION | 16 | FULLY RECOVERED |
| experiments/analysis/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| experiments/instrumentation/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| experiments/raw/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| experiments/runner/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| experiments/schemas/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| implementation_handoff/SANITIZATION_REPORT.json | DOCUMENTATION | 1 | PARTIALLY RECOVERED |
| infra/compose/compose.yaml | BUILD/INFRA | 12 | PARTIALLY RECOVERED |
| infra/keycloak/.gitkeep | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/migrations/alembic.ini | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/migrations/env.py | BUILD/INFRA | 3 | FULLY RECOVERED |
| infra/migrations/script.py.mako | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/migrations/versions/0001_approved_physical_schema.py | BUILD/INFRA | 2 | FULLY RECOVERED |
| infra/migrations/versions/0002_tenant_security.py | BUILD/INFRA | 3 | FULLY RECOVERED |
| infra/migrations/versions/0003_readiness_revision_grant.py | BUILD/INFRA | 2 | FULLY RECOVERED |
| infra/migrations/versions/0004_staff_identity_lookup.py | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/migrations/versions/0005_embedding_provenance.py | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/minio/app-policy.json | BUILD/INFRA | 3 | PARTIALLY RECOVERED |
| infra/model/fastembed-0.8.1-bge-small-en-v1.5.sha256 | BUILD/INFRA | 1 | FULLY RECOVERED |
| infra/scripts/verify_structure.py | BUILD/INFRA | 1 | FULLY RECOVERED |
| packages/contracts/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| packages/schemas/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| packages/shared/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| pyproject.toml | CONFIG | 8 | FULLY RECOVERED |
| requirements-m01-m02.lock | BUILD/INFRA | 1 | FULLY RECOVERED |
| requirements-m01-m05.lock | BUILD/INFRA | 1 | FULLY RECOVERED |
| requirements-m01-m07.lock | GENERATED | 1 | PARTIALLY RECOVERED |
| services/backend/Dockerfile | BUILD/INFRA | 12 | PARTIALLY RECOVERED |
| services/backend/agents/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/api/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/brain/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/domain/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/infrastructure/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/observability/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/orchestration/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/rag/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/repositories/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/security/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/agents/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/agents/contracts.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/agents/prompts.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/agents/provider.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/agents/runtime.py | SOURCE CODE | 6 | FULLY RECOVERED |
| services/backend/src/platform_backend/api/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/api/app.py | SOURCE CODE | 4 | FULLY RECOVERED |
| services/backend/src/platform_backend/application/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/application/evidence.py | SOURCE CODE | 3 | FULLY RECOVERED |
| services/backend/src/platform_backend/application/identity.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/application/orders.py | SOURCE CODE | 4 | FULLY RECOVERED |
| services/backend/src/platform_backend/application/queries.py | SOURCE CODE | 5 | FULLY RECOVERED |
| services/backend/src/platform_backend/brain/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/brain/conflicts.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/brain/contracts.py | SOURCE CODE | 8 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/brain/service.py | SOURCE CODE | 6 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/brain/sources.py | SOURCE CODE | 3 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/domain/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/domain/context.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/domain/errors.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/domain/models.py | SOURCE CODE | 3 | FULLY RECOVERED |
| services/backend/src/platform_backend/domain/references.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/infrastructure/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/infrastructure/bootstrap.py | SOURCE CODE | 3 | FULLY RECOVERED |
| services/backend/src/platform_backend/infrastructure/settings.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/infrastructure/tenant.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/contracts.py | SOURCE CODE | 3 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/embedding.py | SOURCE CODE | 4 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/processing.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/repository.py | SOURCE CODE | 5 | FULLY RECOVERED |
| services/backend/src/platform_backend/knowledge/service.py | SOURCE CODE | 7 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/knowledge/storage.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/observability/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/orchestration/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/rag/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/repositories/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/repositories/postgres.py | SOURCE CODE | 16 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/security/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/security/oidc.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/security/policy.py | SOURCE CODE | 2 | FULLY RECOVERED |
| services/backend/src/platform_backend/tools/__init__.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/tools/contracts.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/tools/cursor.py | SOURCE CODE | 1 | FULLY RECOVERED |
| services/backend/src/platform_backend/tools/executor.py | SOURCE CODE | 7 | PARTIALLY RECOVERED |
| services/backend/src/platform_backend/tools/ports.py | SOURCE CODE | 2 | PARTIALLY RECOVERED |
| services/backend/tools/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| services/forecast/.gitkeep | UNKNOWN | 1 | FULLY RECOVERED |
| tests/__init__.py | TEST | 1 | FULLY RECOVERED |
| tests/api/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/conftest.py | TEST | 2 | FULLY RECOVERED |
| tests/contract/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/contract/test_tools.py | TEST | 6 | FULLY RECOVERED |
| tests/e2e/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/evidence/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/external/test_m08_real_gemini.py | TEST | 2 | PARTIALLY RECOVERED |
| tests/external/test_m08_real_specialists.py | TEST | 2 | PARTIALLY RECOVERED |
| tests/frontend/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/integration/conftest.py | TEST | 2 | DELETED |
| tests/integration/test_acceptance_core.py | TEST | 2 | FULLY RECOVERED |
| tests/integration/test_brain.py | TEST | 3 | FULLY RECOVERED |
| tests/integration/test_domain_core.py | TEST | 5 | FULLY RECOVERED |
| tests/integration/test_knowledge.py | TEST | 8 | PARTIALLY RECOVERED |
| tests/integration/test_knowledge_real_model.py | TEST | 1 | FULLY RECOVERED |
| tests/integration/test_m08_specialists.py | TEST | 6 | PARTIALLY RECOVERED |
| tests/integration/test_schema.py | TEST | 6 | FULLY RECOVERED |
| tests/load/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/ml/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/orchestration/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/rag/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/recovery/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/research/.gitkeep | TEST | 1 | FULLY RECOVERED |
| tests/security/test_identity.py | TEST | 2 | FULLY RECOVERED |
| tests/security/test_keycloak_live.py | TEST | 6 | FULLY RECOVERED |
| tests/security/test_rls.py | TEST | 3 | FULLY RECOVERED |
| tests/support.py | TEST | 4 | FULLY RECOVERED |
| tests/unit/test_brain_contracts.py | TEST | 1 | FULLY RECOVERED |
| tests/unit/test_knowledge_processing.py | TEST | 1 | FULLY RECOVERED |
| tests/unit/test_m08_provider.py | TEST | 2 | FULLY RECOVERED |
| tests/unit/test_tenant_contract.py | TEST | 1 | FULLY RECOVERED |
