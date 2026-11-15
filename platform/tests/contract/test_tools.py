"""M04 executable contracts for all ten frozen tools, without an LLM."""

import json
from dataclasses import replace
from datetime import UTC, datetime, timedelta
from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError

from platform_backend.domain.context import AgentRole
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.tools.contracts import TOOL_INPUTS, ResultStatus
from platform_backend.tools.executor import ToolExecutor, ToolLimits
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


def executor(runtime_url: str, **kwargs) -> ToolExecutor:
    return ToolExecutor(
        PostgresDatabase(runtime_url),
        cursor_signing_key=b"synthetic-test-cursor-key-32-bytes!",
        limits=ToolLimits(max_forecast_horizon=12),
        **kwargs,
    )


def create_payload(fixture) -> dict:
    return {
        "customer_id": str(fixture.customer_id),
        "items": [
            {
                "product_id": str(fixture.product_id),
                "quantity": "1.0000",
                "quoted_product_version": 1,
            }
        ],
    }


def test_exact_registry_and_strict_extra_field_rejection(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    assert len(TOOL_INPUTS) == 10
    assert set(TOOL_INPUTS) == {
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
    samples = {
        "find_product": {"query": "Synthetic"},
        "check_inventory": {"product_ids": [str(fixture.product_id)]},
        "find_customer": {"customer_id": str(fixture.customer_id)},
        "get_order": {"order_id": str(uuid4())},
        "create_order": create_payload(fixture),
        "update_order": {"order_id": str(uuid4()), "expected_version": 1, "patch": {}},
        "reserve_inventory": {
            "order_id": str(uuid4()),
            "expected_order_version": 1,
            "expected_inventory_versions": {str(fixture.product_id): 1},
        },
        "get_delivery_status": {"order_id": str(uuid4())},
        "get_sales_report": {
            "from_at": "2026-01-01T00:00:00Z",
            "to_at": "2026-01-02T00:00:00Z",
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_UNITS",
        },
        "forecast_sales": {
            "as_of": "2026-01-01T00:00:00Z",
            "horizon": 1,
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_UNITS",
        },
    }
    # Every schema rejects protected control fields, even when the role would also deny it.
    for name, sample in samples.items():
        parsed = TOOL_INPUTS[name]
        for protected, value in {
            "business_id": str(uuid4()),
            "principal": str(uuid4()),
            "agent_role": "Sales",
            "operation_key": "injected-key",
            "status": "SUCCEEDED",
        }.items():
            with pytest.raises(ValidationError):
                parsed.model_validate_json(json.dumps({**sample, protected: value}))


def test_find_product_search_cursor_empty_and_tamper(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    second_id = uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO products"
            "(business_id,id,sku,name,unit_price,currency,active,updated_at) "
            "VALUES (%s,%s,'P-2','Synthetic product 2',3,'USD',true,now())",
            (fixture.business_id, second_id),
        )
    tools = executor(runtime_url)
    context = fixture.context()
    first = tools.execute("find_product", {"query": "Synthetic", "limit": 1}, context)
    assert first.status is ResultStatus.SUCCEEDED
    assert first.data is not None and len(first.data["products"]) == 1
    token = first.data["next_cursor"]
    assert token
    second = tools.execute(
        "find_product", {"query": "Synthetic", "limit": 1, "cursor": token}, context
    )
    assert second.status is ResultStatus.SUCCEEDED
    assert second.data is not None and len(second.data["products"]) == 1
    assert second.data["products"][0]["id"] != first.data["products"][0]["id"]
    tampered = tools.execute(
        "find_product", {"query": "Other", "limit": 1, "cursor": token}, context
    )
    assert tampered.status is ResultStatus.REJECTED
    empty = tools.execute("find_product", {"query": "no-such-product"}, context)
    assert empty.status is ResultStatus.SUCCEEDED and empty.data == {
        "products": [],
        "next_cursor": None,
    }


def test_check_inventory_is_read_only_and_customer_lookup_is_minimal(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    tools = executor(runtime_url)
    inventory = tools.execute(
        "check_inventory", {"product_ids": [str(fixture.product_id)]}, fixture.context()
    )
    assert inventory.status is ResultStatus.SUCCEEDED
    assert inventory.data is not None
    assert inventory.data["items"][0]["available_qty"] == "5.0000"
    customer = tools.execute(
        "find_customer", {"customer_id": str(fixture.customer_id)}, fixture.context()
    )
    assert customer.status is ResultStatus.SUCCEEDED
    assert customer.data is not None
    assert set(customer.data["customer"]) == {"id", "display_name", "version"}


def test_create_order_get_order_replay_and_audit(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    tools = executor(runtime_url)
    context = fixture.context(operation_key="tool-create")
    created = tools.execute("create_order", create_payload(fixture), context)
    assert created.status is ResultStatus.SUCCEEDED
    replay = tools.execute("create_order", create_payload(fixture), context)
    assert replay.status is ResultStatus.SUCCEEDED and replay.data == created.data
    assert created.data is not None
    order_id = created.data["order_id"]
    read = tools.execute("get_order", {"order_id": order_id}, fixture.context())
    assert read.status is ResultStatus.SUCCEEDED
    assert read.data is not None and read.data["order"]["status"] == "CREATED"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT count(*) FROM orders WHERE business_id=%s AND id=%s",
            (fixture.business_id, UUID(order_id)),
        )
        assert cursor.fetchone() == (1,)
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND resource_id=%s "
            "AND event_type='ORDER_CREATED'",
            (fixture.business_id, UUID(order_id)),
        )
        assert cursor.fetchone() == (1,)


def test_reserve_inventory_and_labelled_owner_report(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    tools = executor(runtime_url)
    created = tools.execute(
        "create_order", create_payload(fixture), fixture.context(operation_key="for-reserve")
    )
    assert created.data is not None
    reserved = tools.execute(
        "reserve_inventory",
        {
            "order_id": created.data["order_id"],
            "expected_order_version": 1,
            "expected_inventory_versions": {str(fixture.product_id): 1},
        },
        fixture.context(operation_key="reserve-once"),
    )
    assert reserved.status is ResultStatus.SUCCEEDED
    assert reserved.data is not None and reserved.data["status"] == "CONFIRMED"
    now = datetime.now(UTC)
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Analytics',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, fixture.run_id),
        )
    report = tools.execute(
        "get_sales_report",
        {
            "from_at": (now - timedelta(days=1)).isoformat(),
            "to_at": (now + timedelta(days=1)).isoformat(),
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_VALUE",
        },
        fixture.context(agent=AgentRole.ANALYTICS),
    )
    assert report.status is ResultStatus.SUCCEEDED
    assert report.data is not None
    assert report.data["target_definition"] == "CONFIRMED_ORDER_VALUE"
    assert report.data["series"][0]["currency"] == "USD"
    assert report.data["series"][0]["value"] == "12.34000000"


def test_update_order_is_controlled_policy_block_not_fake_mutation(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    tools = executor(runtime_url)
    created = tools.execute(
        "create_order", create_payload(fixture), fixture.context(operation_key="created")
    )
    assert created.data is not None
    blocked = tools.execute(
        "update_order",
        {"order_id": created.data["order_id"], "expected_version": 1, "patch": {}},
        fixture.context(operation_key="unsupported-update"),
    )
    assert blocked.status is ResultStatus.REJECTED
    assert blocked.error is not None
    assert blocked.error.code == "POLICY_REJECTED"
    assert blocked.error.detail == "BLOCKED_BY_APPROVED_POLICY"
    unknown_field = tools.execute(
        "update_order",
        {
            "order_id": created.data["order_id"],
            "expected_version": 1,
            "patch": {"status": "CANCELLED"},
        },
        fixture.context(operation_key="unsupported-patch"),
    )
    assert unknown_field.status is ResultStatus.REJECTED
    assert unknown_field.error is not None and unknown_field.error.code == "VALIDATION_ERROR"


def test_delivery_unavailable_is_not_order_status(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    tools = executor(runtime_url)
    created = tools.execute(
        "create_order", create_payload(fixture), fixture.context(operation_key="delivery-order")
    )
    assert created.data is not None
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Support',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, fixture.run_id),
        )
    delivery = tools.execute(
        "get_delivery_status",
        {"order_id": created.data["order_id"]},
        fixture.context(agent=AgentRole.SUPPORT),
    )
    assert delivery.status is ResultStatus.SUCCEEDED
    assert delivery.data is not None
    assert delivery.data["availability"] == "UNAVAILABLE"
    assert delivery.data["provider_status"] is None


def test_forecast_without_artifact_fails_truthfully_and_creates_no_run(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Analytics',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, fixture.run_id),
        )
    result = executor(runtime_url).execute(
        "forecast_sales",
        {
            "as_of": datetime.now(UTC).isoformat(),
            "horizon": 2,
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_UNITS",
        },
        fixture.context(agent=AgentRole.ANALYTICS),
    )
    assert result.status is ResultStatus.FAILED
    assert result.error is not None and result.error.detail == "MODEL_NOT_READY"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT count(*) FROM forecast_runs WHERE business_id=%s", (fixture.business_id,)
        )
        assert cursor.fetchone() == (0,)


def test_support_cannot_write_and_foreign_order_has_no_effect(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    tools = executor(runtime_url)
    created = tools.execute("create_order", create_payload(a), a.context(operation_key="a-order"))
    assert created.data is not None
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Support',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (b.business_id, b.run_id),
        )
    forbidden = tools.execute(
        "create_order",
        create_payload(b),
        b.context(agent=AgentRole.SUPPORT, operation_key="forbidden-write"),
    )
    assert forbidden.status is ResultStatus.REJECTED
    assert forbidden.error is not None and forbidden.error.code == "FORBIDDEN"
    foreign = tools.execute(
        "get_order",
        {"order_id": created.data["order_id"]},
        b.context(agent=AgentRole.SUPPORT),
    )
    assert foreign.status is ResultStatus.REJECTED
    assert foreign.error is not None and foreign.error.code == "NOT_ACCESSIBLE"
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM orders WHERE business_id=%s", (b.business_id,))
        assert cursor.fetchone() == (0,)


@pytest.mark.parametrize("name", sorted(TOOL_INPUTS))
def test_every_tool_rejects_forbidden_specialist_with_durable_evidence(
    admin_connection, runtime_url: str, name: str
) -> None:
    fixture = seed_tenant(admin_connection)
    agent = (
        AgentRole.SALES
        if name in {"forecast_sales", "get_sales_report", "get_delivery_status"}
        else AgentRole.ANALYTICS
    )
    if agent is AgentRole.ANALYTICS:
        with admin_connection.cursor() as cursor:
            cursor.execute(
                "UPDATE agent_runs SET active_agent='Analytics',updated_at=now(),version=version+1 "
                "WHERE business_id=%s AND id=%s",
                (fixture.business_id, fixture.run_id),
            )
    payloads = {
        "find_product": {"query": "Synthetic"},
        "check_inventory": {"product_ids": [str(fixture.product_id)]},
        "find_customer": {"customer_id": str(fixture.customer_id)},
        "get_order": {"order_id": str(uuid4())},
        "create_order": create_payload(fixture),
        "update_order": {"order_id": str(uuid4()), "expected_version": 1, "patch": {}},
        "reserve_inventory": {
            "order_id": str(uuid4()),
            "expected_order_version": 1,
            "expected_inventory_versions": {str(fixture.product_id): 1},
        },
        "get_delivery_status": {"order_id": str(uuid4())},
        "get_sales_report": {
            "from_at": "2026-01-01T00:00:00Z",
            "to_at": "2026-01-02T00:00:00Z",
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_UNITS",
        },
        "forecast_sales": {
            "as_of": "2026-01-01T00:00:00Z",
            "horizon": 1,
            "granularity": "DAY",
            "target_definition": "CONFIRMED_ORDER_UNITS",
        },
    }
    result = executor(runtime_url).execute(name, payloads[name], fixture.context(agent=agent))
    assert result.status is ResultStatus.REJECTED
    assert result.error is not None and result.error.code == "FORBIDDEN"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT status,error_code FROM tool_calls WHERE business_id=%s AND id=%s",
            (fixture.business_id, result.tool_call_id),
        )
        assert cursor.fetchone() == ("FAILED", "FORBIDDEN")
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND resource_id=%s "
            "AND event_type='TOOL_FAILED'",
            (fixture.business_id, result.tool_call_id),
        )
        assert cursor.fetchone() == (1,)
        cursor.execute("SELECT count(*) FROM orders WHERE business_id=%s", (fixture.business_id,))
        assert cursor.fetchone() == (0,)


@pytest.mark.parametrize(
    "fault,expected_code",
    [
        (TimeoutError, "TIMEOUT"),
        (ConnectionError, "DEPENDENCY_UNAVAILABLE"),
    ],
)
def test_delivery_adapter_timeout_and_dependency_failure_are_typed(
    admin_connection, runtime_url: str, fault: type[Exception], expected_code: str
) -> None:
    fixture = seed_tenant(admin_connection)
    order = executor(runtime_url).execute(
        "create_order", create_payload(fixture), fixture.context(operation_key="delivery-fault")
    )
    assert order.data is not None
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE orders SET delivery_reference='synthetic-reference',updated_at=now() "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, UUID(order.data["order_id"])),
        )
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Support',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, fixture.run_id),
        )

    class FaultyDelivery:
        def lookup(self, business_id: UUID, order_id: UUID, reference: str) -> dict:
            raise fault("synthetic adapter fault")

    result = executor(runtime_url, delivery=FaultyDelivery()).execute(
        "get_delivery_status",
        {"order_id": order.data["order_id"]},
        fixture.context(agent=AgentRole.SUPPORT),
    )
    assert result.status is ResultStatus.FAILED
    assert result.error is not None and result.error.code == expected_code


def test_delivery_reference_without_configured_adapter_is_dependency_unavailable(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    order = executor(runtime_url).execute(
        "create_order", create_payload(fixture), fixture.context(operation_key="delivery-port")
    )
    assert order.data is not None
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "UPDATE orders SET delivery_reference='synthetic-reference',updated_at=now() "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, UUID(order.data["order_id"])),
        )
        cursor.execute(
            "UPDATE agent_runs SET active_agent='Support',updated_at=now(),version=version+1 "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, fixture.run_id),
        )
    result = executor(runtime_url).execute(
        "get_delivery_status",
        {"order_id": order.data["order_id"]},
        fixture.context(agent=AgentRole.SUPPORT),
    )
    assert result.status is ResultStatus.FAILED
    assert result.error is not None
    assert result.error.code == "DEPENDENCY_UNAVAILABLE"
    assert result.error.detail == "DELIVERY_ADAPTER_NOT_CONFIGURED"


def test_expired_trusted_context_fails_closed_with_pre_admission_audit(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    expired = replace(fixture.context(), deadline=datetime.now(UTC) - timedelta(seconds=1))
    result = executor(runtime_url).execute("find_product", {"query": "Synthetic"}, expired)
    assert result.status is ResultStatus.REJECTED
    assert result.error is not None and result.error.code == "POLICY_REJECTED"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT count(*) FROM tool_calls WHERE business_id=%s AND id=%s",
            (fixture.business_id, result.tool_call_id),
        )
        assert cursor.fetchone() == (0,)
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND resource_id=%s "
            "AND event_type='TOOL_REJECTED_PRE_ADMISSION'",
            (fixture.business_id, result.tool_call_id),
        )
        assert cursor.fetchone() == (1,)
