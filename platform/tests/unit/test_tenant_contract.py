from pathlib import Path


def test_tenant_context_is_transaction_local() -> None:
    source = Path("services/backend/src/platform_backend/infrastructure/tenant.py").read_text(
        encoding="utf-8"
    )
    assert "set_config('app.current_business_id', :business_id, true)" in source
    assert "with connection.begin()" in source
