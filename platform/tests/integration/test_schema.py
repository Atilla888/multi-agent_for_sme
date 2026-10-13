from uuid import uuid4

import psycopg
import pytest

EXPECTED_TABLES = {
    "businesses", "app_users", "business_memberships", "customers", "customer_identities",
    "integrations", "products", "inventory", "orders", "order_items", "conversations",
    "messages", "object_records", "message_attachments", "documents", "document_versions",
    "embeddings", "agent_runs", "idempotency_operations", "tool_calls", "agent_steps",
    "escalations", "audit_logs", "model_artifacts", "forecast_runs",
}


@pytest.mark.postgres
@pytest.mark.integration
def test_migration_revision_and_required_tables(admin_connection) -> None:
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT version_num FROM alembic_version")
        assert cursor.fetchone() == ("0005_embedding_provenance",)
        cursor.execute("SELECT extname FROM pg_extension WHERE extname = 'vector'")
        assert cursor.fetchone() == ("vector",)
        cursor.execute("SELECT tablename FROM pg_tables WHERE schemaname = 'public'")
        assert EXPECTED_TABLES <= {row[0] for row in cursor.fetchall()}
        cursor.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_schema='public' AND table_name='embeddings'"
        )
        assert {
            "chunk_locator",
            "chunk_text_sha256",
            "chunker_version",
            "embedding_revision",
        } <= {row[0] for row in cursor.fetchall()}


@pytest.mark.postgres
@pytest.mark.integration
def test_constraints_and_cross_tenant_composite_fk(admin_connection) -> None:
    business_a, business_b, product_b, inventory_id = uuid4(), uuid4(), uuid4(), uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) VALUES (%s,'A','UTC','1',now()),(%s,'B','UTC','1',now())",
            (business_a, business_b),
        )
        cursor.execute(
            "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at) VALUES (%s,%s,'SKU','P',1,'USD',true,now())",
            (business_b, product_b),
        )
        with pytest.raises(psycopg.errors.ForeignKeyViolation):
            cursor.execute(
                "INSERT INTO inventory(business_id,id,product_id,available_qty,reserved_qty,updated_at) VALUES (%s,%s,%s,1,0,now())",
                (business_a, inventory_id, product_b),
            )
        with pytest.raises(psycopg.errors.CheckViolation):
            cursor.execute(
                "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at) VALUES (%s,%s,'BAD','Bad',-1,'USD',true,now())",
                (business_a, uuid4()),
            )


@pytest.mark.postgres
@pytest.mark.integration
def test_required_unique_and_version_constraints_exist(admin_connection) -> None:
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM pg_constraint WHERE contype IN ('u','f','c')")
        assert cursor.fetchone()[0] >= 50
        cursor.execute(
            "SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND column_name='version'"
        )
        assert cursor.fetchone()[0] >= 20


@pytest.mark.postgres
@pytest.mark.integration
def test_unique_check_and_positive_version_are_enforced(admin_connection) -> None:
    business_id = uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) VALUES (%s,'Constraint test','UTC','1',now())",
            (business_id,),
        )
        cursor.execute(
            "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at) VALUES (%s,%s,'UNIQUE-SKU','P',1,'USD',true,now())",
            (business_id, uuid4()),
        )
        with pytest.raises(psycopg.errors.UniqueViolation):
            cursor.execute(
                "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at) VALUES (%s,%s,'UNIQUE-SKU','P2',1,'USD',true,now())",
                (business_id, uuid4()),
            )
        with pytest.raises(psycopg.errors.CheckViolation):
            cursor.execute(
                "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at,version) VALUES (%s,%s,'BAD-VERSION','P3',1,'USD',true,now(),0)",
                (business_id, uuid4()),
            )


@pytest.mark.postgres
@pytest.mark.integration
def test_transaction_rollback_does_not_persist_product(migrator_url: str) -> None:
    business_id, product_id = uuid4(), uuid4()
    with psycopg.connect(migrator_url, autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) VALUES (%s,'Rollback test','UTC','1',now())",
                (business_id,),
            )
        with pytest.raises(RuntimeError), connection.transaction():
            with connection.cursor() as cursor:
                cursor.execute(
                    "INSERT INTO products(business_id,id,sku,name,unit_price,currency,active,updated_at) VALUES (%s,%s,'ROLLBACK-SKU','P',1,'USD',true,now())",
                    (business_id, product_id),
                )
            raise RuntimeError("rollback test sentinel")
        with connection.cursor() as cursor:
            cursor.execute("SELECT count(*) FROM products WHERE business_id=%s AND id=%s", (business_id, product_id))
            assert cursor.fetchone() == (0,)


@pytest.mark.postgres
@pytest.mark.integration
def test_forecast_artifact_fk_is_required(admin_connection) -> None:
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT is_nullable FROM information_schema.columns WHERE table_schema='public' AND table_name='forecast_runs' AND column_name='model_artifact_id'"
        )
        assert cursor.fetchone() == ("NO",)
        cursor.execute(
            "SELECT count(*) FROM pg_constraint WHERE conname='fk_forecast_runs_0' AND contype='f'"
        )
        assert cursor.fetchone() == (1,)

