from uuid import uuid4

import psycopg
import pytest
from psycopg_pool import ConnectionPool
from sqlalchemy import create_engine, text

from platform_backend.infrastructure.tenant import tenant_transaction


def _seed(admin_connection):
    a, b = uuid4(), uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) VALUES (%s,'Tenant A','UTC','1',now()),(%s,'Tenant B','UTC','1',now())",
            (a, b),
        )
        cursor.execute(
            "INSERT INTO customers(business_id,id,display_name,updated_at) VALUES (%s,%s,'A customer',now()),(%s,%s,'B customer',now())",
            (a, uuid4(), b, uuid4()),
        )
    return a, b


@pytest.mark.postgres
@pytest.mark.integration
def test_runtime_role_has_rls_without_bypass(admin_connection, runtime_url: str) -> None:
    with psycopg.connect(runtime_url) as connection, connection.cursor() as cursor:
        cursor.execute(
            "SELECT rolsuper, rolbypassrls, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user"
        )
        assert cursor.fetchone() == (False, False, False, False)
        cursor.execute(
            "SELECT relrowsecurity, relforcerowsecurity FROM pg_class WHERE oid='customers'::regclass"
        )
        assert cursor.fetchone() == (True, True)
        cursor.execute("SELECT pg_has_role(current_user, 'platform_migrator', 'MEMBER')")
        assert cursor.fetchone() == (False,)


@pytest.mark.postgres
@pytest.mark.integration
def test_all_tenant_tables_have_forced_rls_and_policy(admin_connection) -> None:
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT c.relname, c.relrowsecurity, c.relforcerowsecurity, "
            "EXISTS (SELECT 1 FROM pg_policy p WHERE p.polrelid=c.oid AND p.polname='tenant_isolation') "
            "FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace "
            "WHERE n.nspname='public' AND c.relkind='r' "
            "AND c.relname NOT IN ('app_users','alembic_version')"
        )
        rows = cursor.fetchall()
        assert len(rows) == 24
        assert all(enabled and forced and policy for _, enabled, forced, policy in rows)


@pytest.mark.postgres
@pytest.mark.integration
def test_runtime_grants_are_least_privilege(admin_connection, runtime_url: str) -> None:
    with psycopg.connect(runtime_url) as connection, connection.cursor() as cursor:
        cursor.execute(
            "SELECT has_table_privilege(current_user,'alembic_version','SELECT'), "
            "has_table_privilege(current_user,'app_users','SELECT'), "
            "has_table_privilege(current_user,'businesses','INSERT'), "
            "has_table_privilege(current_user,'audit_logs','DELETE')"
        )
        assert cursor.fetchone() == (True, False, False, False)
        cursor.execute(
            "SELECT pg_get_userbyid(relowner) FROM pg_class WHERE oid='customers'::regclass"
        )
        assert cursor.fetchone() != ("platform_runtime",)
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            cursor.execute("SELECT count(*) FROM app_users")


@pytest.mark.postgres
@pytest.mark.integration
def test_runtime_cannot_disable_rls(admin_connection, runtime_url: str) -> None:
    _seed(admin_connection)
    with psycopg.connect(runtime_url, autocommit=True) as connection, connection.cursor() as cursor:
        cursor.execute("SET row_security = off")
        with pytest.raises(psycopg.errors.InsufficientPrivilege):
            cursor.execute("SELECT count(*) FROM customers")
        cursor.execute("RESET row_security")


@pytest.mark.postgres
@pytest.mark.integration
def test_runtime_cannot_insert_foreign_tenant_row(admin_connection, runtime_url: str) -> None:
    tenant_a, tenant_b = _seed(admin_connection)
    with psycopg.connect(runtime_url, autocommit=True) as connection:
        with pytest.raises(psycopg.errors.InsufficientPrivilege), connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('app.current_business_id', %s, true)", (str(tenant_a),)
                )
                cursor.execute(
                    "INSERT INTO customers(business_id,id,display_name,updated_at) VALUES (%s,%s,'Spoofed',now())",
                    (tenant_b, uuid4()),
                )


@pytest.mark.postgres
@pytest.mark.integration
def test_sqlalchemy_tenant_transaction_resets_on_pool_reuse(
    admin_connection, runtime_url: str
) -> None:
    tenant_a, tenant_b = _seed(admin_connection)
    url = runtime_url.replace("postgresql://", "postgresql+psycopg://", 1)
    engine = create_engine(url, pool_size=1, max_overflow=0)
    try:
        with engine.connect() as connection:
            with tenant_transaction(connection, tenant_a):
                backend_pid = connection.execute(text("SELECT pg_backend_pid()")).scalar_one()
                assert connection.execute(text("SELECT count(*) FROM customers")).scalar_one() == 1
        with engine.connect() as reused:
            with reused.begin():
                assert reused.execute(text("SELECT pg_backend_pid()")).scalar_one() == backend_pid
                assert reused.execute(text("SELECT count(*) FROM customers")).scalar_one() == 0
            with tenant_transaction(reused, tenant_b):
                assert reused.execute(text("SELECT count(*) FROM customers")).scalar_one() == 1
    finally:
        engine.dispose()


@pytest.mark.postgres
@pytest.mark.integration
def test_missing_context_fails_closed_and_other_tenant_is_hidden(
    admin_connection, runtime_url: str
) -> None:
    tenant_a, tenant_b = _seed(admin_connection)
    with psycopg.connect(runtime_url) as connection, connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM customers")
        assert cursor.fetchone() == (0,)
        cursor.execute("SELECT set_config('app.current_business_id', %s, true)", (str(tenant_a),))
        cursor.execute("SELECT DISTINCT business_id FROM customers")
        assert cursor.fetchall() == [(tenant_a,)]
        cursor.execute("SELECT count(*) FROM customers WHERE business_id = %s", (tenant_b,))
        assert cursor.fetchone() == (0,)


@pytest.mark.postgres
@pytest.mark.integration
def test_transaction_local_context_does_not_leak_through_pool(
    admin_connection, runtime_url: str
) -> None:
    tenant_a, tenant_b = _seed(admin_connection)
    with ConnectionPool(runtime_url, min_size=1, max_size=1) as pool:
        with pool.connection() as connection:
            with connection.transaction(), connection.cursor() as cursor:
                cursor.execute(
                    "SELECT set_config('app.current_business_id', %s, true)", (str(tenant_a),)
                )
                cursor.execute("SELECT count(*) FROM customers")
                assert cursor.fetchone() == (1,)
        with pool.connection() as reused:
            with reused.transaction(), reused.cursor() as cursor:
                cursor.execute("SELECT current_setting('app.current_business_id', true)")
                assert cursor.fetchone()[0] in (None, "")
                cursor.execute("SELECT count(*) FROM customers")
                assert cursor.fetchone() == (0,)
                cursor.execute(
                    "SELECT set_config('app.current_business_id', %s, true)", (str(tenant_b),)
                )
                cursor.execute("SELECT count(*) FROM customers")
                assert cursor.fetchone() == (1,)
