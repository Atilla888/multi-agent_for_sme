"""P2 structural gates; intentionally do not import the Python 3.11+ backend."""

import ast
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = ROOT / "services/backend/src/platform_backend"


def _module(relative: str) -> ast.Module:
    path = ROOT / relative
    return ast.parse(path.read_text(encoding="utf-8"), filename=str(path))


def _assigned(module: ast.Module, name: str) -> ast.expr:
    for node in module.body:
        if isinstance(node, ast.Assign | ast.AnnAssign):
            targets = node.targets if isinstance(node, ast.Assign) else [node.target]
            if any(isinstance(target, ast.Name) and target.id == name for target in targets):
                return node.value
    raise AssertionError(f"missing assignment: {name}")


def test_all_python_sources_parse() -> None:
    files = list(ROOT.rglob("*.py"))
    assert len(files) >= 70
    for path in files:
        ast.parse(path.read_text(encoding="utf-8"), filename=str(path))


def test_backend_absolute_imports_resolve_in_source_tree() -> None:
    modules = {
        ".".join(path.relative_to(PACKAGE.parent).with_suffix("").parts)
        for path in PACKAGE.rglob("*.py")
    }
    for path in ROOT.rglob("*.py"):
        for node in ast.walk(ast.parse(path.read_text(encoding="utf-8"))):
            if (
                isinstance(node, ast.ImportFrom)
                and node.module
                and node.module.startswith("platform_backend.")
            ):
                assert node.module in modules or any(
                    module.startswith(node.module + ".") for module in modules
                ), (path, node.module)


def test_migration_chain_and_approved_schema_digest() -> None:
    revisions = sorted((ROOT / "infra/migrations/versions").glob("*.py"))
    assert len(revisions) == 5
    previous = None
    for path in revisions:
        module = ast.parse(path.read_text(encoding="utf-8"))
        assert ast.literal_eval(_assigned(module, "down_revision")) == previous
        previous = ast.literal_eval(_assigned(module, "revision"))
    sql = ROOT / "implementation_handoff/contracts/docs/engineering/physical_schema.sql"
    first = ast.parse(revisions[0].read_text(encoding="utf-8"))
    assert hashlib.sha256(sql.read_bytes()).hexdigest() == ast.literal_eval(
        _assigned(first, "EXPECTED_SHA256")
    )


def test_frozen_ten_tool_names_and_role_scopes() -> None:
    contracts = _module("services/backend/src/platform_backend/tools/contracts.py")
    executor = _module("services/backend/src/platform_backend/tools/executor.py")
    inputs = _assigned(contracts, "TOOL_INPUTS")
    assert isinstance(inputs, ast.Dict)
    tool_names = {ast.literal_eval(key) for key in inputs.keys}
    assert tool_names == {
        "find_product",
        "check_inventory",
        "find_customer",
        "get_order",
        "create_order",
        "update_order",
        "reserve_inventory",
        "get_delivery_status",
        "get_sales_report",
        "forecast_sales",
    }
    scopes = _assigned(executor, "ROLE_TOOLS")
    assert isinstance(scopes, ast.Dict)
    role_tools = {}
    for key, call in zip(scopes.keys, scopes.values, strict=True):
        assert isinstance(key, ast.Attribute) and isinstance(call, ast.Call)
        assert len(call.args) == 1
        role_tools[key.attr] = set(ast.literal_eval(call.args[0]))
    assert role_tools == {
        "SALES": {
            "find_product",
            "check_inventory",
            "find_customer",
            "get_order",
            "create_order",
            "update_order",
            "reserve_inventory",
        },
        "SUPPORT": {
            "check_inventory",
            "find_customer",
            "get_order",
            "get_delivery_status",
        },
        "ANALYTICS": {"get_sales_report", "forecast_sales"},
    }


def test_e02_unknown_and_pre_artifact_forecast_guards_exist() -> None:
    executor = (PACKAGE / "tools/executor.py").read_text(encoding="utf-8")
    orders = (PACKAGE / "application/orders.py").read_text(encoding="utf-8")
    ports = (PACKAGE / "tools/ports.py").read_text(encoding="utf-8")
    assert "BLOCKED_BY_APPROVED_POLICY" in executor
    assert "OUTCOME_UNKNOWN" in executor and "OUTCOME_UNKNOWN" in orders
    assert "MODEL_NOT_READY" in ports


def test_no_secret_environment_or_frontend_was_restored() -> None:
    assert not (ROOT / ".env").exists()
    assert not (ROOT / "frontend").exists()
    assert not (ROOT / "apps/web/package.json").exists()
