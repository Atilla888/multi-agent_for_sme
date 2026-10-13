"""Add runtime grants and forced row-level tenant isolation."""

import os
import re

from alembic import op

revision = "0002_tenant_security"
down_revision = "0001_approved_schema"
branch_labels = None
depends_on = None

TENANT_TABLES = [
    "businesses",
    "business_memberships",
    "customers",
    "customer_identities",
    "integrations",
    "products",
    "inventory",
    "orders",
    "order_items",
    "conversations",
    "messages",
    "object_records",
    "message_attachments",
    "documents",
    "document_versions",
    "embeddings",
    "agent_runs",
    "idempotency_operations",
    "tool_calls",
    "agent_steps",
    "escalations",
    "audit_logs",
    "model_artifacts",
    "forecast_runs",
]


def _runtime_role() -> str:
    role = os.environ.get("POSTGRES_RUNTIME_USER", "platform_runtime")
    if not re.fullmatch(r"[a-z_][a-z0-9_]{0,62}", role):
        raise RuntimeError("POSTGRES_RUNTIME_USER is not a safe PostgreSQL identifier")
    return role


def upgrade() -> None:
    role = _runtime_role()
    op.execute("REVOKE ALL ON SCHEMA public FROM PUBLIC")
    op.execute(f'GRANT USAGE ON SCHEMA public TO "{role}"')
    for table in TENANT_TABLES:
        predicate = (
            "id = nullif(current_setting('app.current_business_id', true), '')::uuid"
            if table == "businesses"
            else "business_id = nullif(current_setting('app.current_business_id', true), '')::uuid"
        )
        op.execute(f'ALTER TABLE "{table}" ENABLE ROW LEVEL SECURITY')
        op.execute(f'ALTER TABLE "{table}" FORCE ROW LEVEL SECURITY')
        op.execute(
            f'CREATE POLICY tenant_isolation ON "{table}" '
            f"USING ({predicate}) WITH CHECK ({predicate})"
        )
        privileges = "SELECT, INSERT, UPDATE, DELETE"
        if table == "businesses":
            privileges = "SELECT"
        if table == "audit_logs":
            privileges = "SELECT, INSERT"
        op.execute(f'GRANT {privileges} ON TABLE "{table}" TO "{role}"')
    op.execute(f'REVOKE ALL ON TABLE app_users FROM "{role}"')


def downgrade() -> None:
    role = _runtime_role()
    for table in reversed(TENANT_TABLES):
        op.execute(f'REVOKE ALL ON TABLE "{table}" FROM "{role}"')
        op.execute(f'DROP POLICY IF EXISTS tenant_isolation ON "{table}"')
        op.execute(f'ALTER TABLE "{table}" DISABLE ROW LEVEL SECURITY')
