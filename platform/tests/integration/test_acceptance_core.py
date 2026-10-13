"""M03–M05 integrated non-LLM engineering acceptance paths."""

from uuid import UUID

import pytest

from platform_backend.domain.context import AgentRole
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.tools.contracts import ResultStatus
from platform_backend.tools.executor import ToolExecutor, ToolLimits
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


def _tools(runtime_url: str) -> ToolExecutor:
    return ToolExecutor(
        PostgresDatabase(runtime_url),
        cursor_signing_key=b"engineering-acceptance-cursor-key-32!",
        limits=ToolLimits(max_forecast_horizon=12),
    )


def test_positive_find_check_create_reserve_persists_effect_and_evidence(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    tools = _tools(runtime_url)
    principal = fixture.context().principal
    assert principal.business_id == fixture.business_id
    found = tools.execute("find_product", {"query": "Synthetic"}, fixture.context())
    assert found.status is ResultStatus.SUCCEEDED
    assert found.data is not None and found.data["products"][0]["id"] == str(fixture.product_id)
    inventory = tools.execute(
        "check_inventory", {"product_ids": [str(fixture.product_id)]}, fixture.context()
    )
    assert inventory.status is ResultStatus.SUCCEEDED
    assert inventory.data is not None and inventory.data["items"][0]["available_qty"] == "5.0000"
    created = tools.execute(
        "create_order",
        {
            "customer_id": str(fixture.customer_id),
            "items": [
                {
                    "product_id": str(fixture.product_id),
                    "quantity": "2.0000",
                    "quoted_product_version": found.data["products"][0]["version"],
                }
            ],
        },
        fixture.context(operation_key="acceptance-create"),
    )
    assert created.status is ResultStatus.SUCCEEDED and created.data is not None
    reserved = tools.execute(
        "reserve_inventory",
        {
            "order_id": created.data["order_id"],
            "expected_order_version": 1,
            "expected_inventory_versions": {
                str(fixture.product_id): inventory.data["items"][0]["inventory_version"]
            },
        },
        fixture.context(operation_key="acceptance-reserve"),
    )
    assert reserved.status is ResultStatus.SUCCEEDED
    with PostgresDatabase(runtime_url).transaction(fixture.business_id) as repository:
        order = repository.get_order(UUID(created.data["order_id"]))
        stock = repository.get_inventory(fixture.product_id)
        assert order is not None and order.status.value == "CONFIRMED"
        assert stock is not None and str(stock.available_qty) == "3.0000"
        assert str(stock.reserved_qty) == "2.0000"
        for name, key in [
            ("create_order", "acceptance-create"),
            ("reserve_inventory", "acceptance-reserve"),
        ]:
            operation = repository.get_operation(name, principal.actor_scope, key)
            assert operation is not None and operation["status"] == "SUCCEEDED"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT event_type FROM audit_logs WHERE business_id=%s AND resource_id=%s",
            (fixture.business_id, UUID(created.data["order_id"])),
        )
        events = {row[0] for row in cursor.fetchall()}
        assert {"ORDER_CREATED", "INVENTORY_RESERVED"} <= events
        cursor.execute(
            "SELECT count(*) FROM tool_calls WHERE business_id=%s AND status='SUCCEEDED'",
            (fixture.business_id,),
        )
        assert cursor.fetchone() == (4,)


def test_negative_foreign_resource_and_forbidden_agent_have_no_business_effect(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    tools = _tools(runtime_url)
    created = tools.execute(
        "create_order",
        {
            "customer_id": str(a.customer_id),
            "items": [
                {"product_id": str(a.product_id), "quantity": "1.0000", "quoted_product_version": 1}
            ],
        },
        a.context(operation_key="negative-source"),
    )
    assert created.data is not None
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Support',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (b.business_id, b.run_id),
        )
    foreign = tools.execute(
        "get_order",
        {"order_id": created.data["order_id"]},
        b.context(agent=AgentRole.SUPPORT),
    )
    forbidden = tools.execute(
        "create_order",
        {
            "customer_id": str(b.customer_id),
            "items": [
                {"product_id": str(b.product_id), "quantity": "1.0000", "quoted_product_version": 1}
            ],
        },
        b.context(agent=AgentRole.SUPPORT, operation_key="forbidden-proposal"),
    )
    assert foreign.status is ResultStatus.REJECTED
    assert foreign.error is not None and foreign.error.code == "NOT_ACCESSIBLE"
    assert forbidden.status is ResultStatus.REJECTED
    assert forbidden.error is not None and forbidden.error.code == "FORBIDDEN"
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM orders WHERE business_id=%s", (b.business_id,))
        assert cursor.fetchone() == (0,)
        cursor.execute(
            "SELECT count(*) FROM idempotency_operations WHERE business_id=%s",
            (b.business_id,),
        )
        assert cursor.fetchone() == (0,)
        cursor.execute(
            "SELECT count(*) FROM tool_calls WHERE business_id=%s AND status='FAILED'",
            (b.business_id,),
        )
        assert cursor.fetchone() == (2,)
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND event_type='TOOL_FAILED'",
            (b.business_id,),
        )
        assert cursor.fetchone() == (2,)
