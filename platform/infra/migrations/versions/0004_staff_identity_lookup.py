"""Narrow OIDC subject lookup without granting runtime SELECT on app_users."""

import os
import re

from alembic import op

revision = "0004_staff_identity_lookup"
down_revision = "0003_readiness_grant"
branch_labels = None
depends_on = None


def _runtime_role() -> str:
    role = os.environ.get("POSTGRES_RUNTIME_USER", "platform_runtime")
    if not re.fullmatch(r"[a-z_][a-z0-9_]{0,62}", role):
        raise RuntimeError("POSTGRES_RUNTIME_USER is not a safe PostgreSQL identifier")
    return role


def upgrade() -> None:
    op.execute(
        "CREATE FUNCTION public.lookup_app_user_id(p_issuer text, p_subject text) "
        "RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER "
        "SET search_path = pg_catalog, public AS $$ "
        "SELECT id FROM public.app_users "
        "WHERE issuer = p_issuer AND subject = p_subject LIMIT 1 $$"
    )
    op.execute("REVOKE ALL ON FUNCTION public.lookup_app_user_id(text,text) FROM PUBLIC")
    op.execute(
        f'GRANT EXECUTE ON FUNCTION public.lookup_app_user_id(text,text) TO "{_runtime_role()}"'
    )


def downgrade() -> None:
    op.execute("DROP FUNCTION public.lookup_app_user_id(text,text)")
