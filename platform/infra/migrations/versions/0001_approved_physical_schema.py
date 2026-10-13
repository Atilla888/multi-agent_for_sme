"""Apply the hash-pinned approved physical schema."""
from hashlib import sha256
from pathlib import Path

from alembic import op

revision = "0001_approved_schema"
down_revision = None
branch_labels = None
depends_on = None

EXPECTED_SHA256 = "5535ba8ab12b17eb5192b034c8b6eda840fadd95dc4eb3cee93d3b4b909c6c94"
TABLES_REVERSE = [
    "forecast_runs", "model_artifacts", "audit_logs", "escalations", "agent_steps",
    "tool_calls", "idempotency_operations", "agent_runs", "embeddings", "document_versions",
    "documents", "message_attachments", "object_records", "messages", "conversations",
    "order_items", "orders", "inventory", "products", "integrations", "customer_identities",
    "customers", "business_memberships", "app_users", "businesses",
]


def _schema_path() -> Path:
    return (
        Path(__file__).resolve().parents[3]
        / "implementation_handoff/contracts/docs/engineering/physical_schema.sql"
    )


def upgrade() -> None:
    raw = _schema_path().read_bytes()
    if sha256(raw).hexdigest() != EXPECTED_SHA256:
        raise RuntimeError("approved physical schema digest mismatch")
    op.get_bind().exec_driver_sql(raw.decode("utf-8-sig"))


def downgrade() -> None:
    for table in TABLES_REVERSE:
        op.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE')
    op.execute("DROP EXTENSION IF EXISTS vector")

