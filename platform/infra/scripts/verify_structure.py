from pathlib import Path

REQUIRED = [
    "apps/web",
    "services/backend/api",
    "services/backend/domain",
    "services/backend/repositories",
    "services/backend/orchestration",
    "services/backend/agents",
    "services/backend/tools",
    "services/backend/brain",
    "services/backend/rag",
    "services/backend/security",
    "services/backend/observability",
    "services/backend/infrastructure",
    "services/forecast",
    "packages/contracts",
    "packages/schemas",
    "packages/shared",
    "infra/compose",
    "infra/keycloak",
    "infra/migrations",
    "infra/scripts",
    "tests/unit",
    "tests/contract",
    "tests/integration",
    "tests/api",
    "tests/security",
    "tests/recovery",
    "tests/rag",
    "tests/ml",
    "tests/orchestration",
    "tests/frontend",
    "tests/e2e",
    "tests/load",
    "tests/research",
    "data/development",
    "data/manifests",
    "experiments/schemas",
    "experiments/runner",
    "experiments/instrumentation",
    "experiments/raw",
    "experiments/analysis",
    "docs/implementation",
]


def main() -> None:
    missing = [path for path in REQUIRED if not Path(path).is_dir()]
    if missing:
        raise SystemExit(f"missing required directories: {missing}")
    print(f"STRUCTURE_OK: {len(REQUIRED)} required directories")


if __name__ == "__main__":
    main()
