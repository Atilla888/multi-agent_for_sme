"""Allow the unprivileged runtime role to read only the migration revision."""

import os
import re

from alembic import op

revision = "0003_readiness_grant"
down_revision = "0002_tenant_security"
branch_labels = None
depends_on = None


def _runtime_role() -> str:
    role = os.environ.get("POSTGRES_RUNTIME_USER", "platform_runtime")
    if not re.fullmatch(r"[a-z_][a-z0-9_]{0,62}", role):
        raise RuntimeError("POSTGRES_RUNTIME_USER is not a safe PostgreSQL identifier")
    return role


def upgrade() -> None:
    op.execute(f'GRANT SELECT ON TABLE alembic_version TO "{_runtime_role()}"')


def downgrade() -> None:
    op.execute(f'REVOKE SELECT ON TABLE alembic_version FROM "{_runtime_role()}"')  # noqa: S608
