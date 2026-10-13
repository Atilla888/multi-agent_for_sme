"""M03 database-semantic tests; all writes target isolated synthetic tenants."""

from concurrent.futures import ThreadPoolExecutor
from decimal import Decimal
from uuid import UUID, uuid4

import pytest

from platform_backend.application.evidence import OperationLedger
from platform_backend.application.orders import OrderService
from platform_backend.application.queries import QueryService
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import Money, OrderLineRequest
from platform_backend.repositories.postgres import PostgresDatabase
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


def test_repository_read_is_tenant_scoped(admin_connection, runtime_url: str) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    with database.transaction(a.business_id) as repository:
        assert repository.get_product(a.product_id) is not None
        assert repository.get_product(b.product_id) is None
    with database.transaction(b.business_id) as repository:
        assert repository.get_product(a.product_id) is None


def test_cross_tenant_and_missing_order_are_not_accessible(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    created = OrderService(database).create_order(
        a.context(operation_key="order-a"), a.customer_id,
        (OrderLineRequest(a.product_id, Decimal("1"), 1),),
    )
    query = QueryService(database)
    with pytest.raises(DomainFailure) as foreign:
        query.get_order(b.context().principal, UUID(created["order_id"]))
    assert foreign.value.code is ErrorCode.NOT_ACCESSIBLE
    with pytest.raises(DomainFailure) as absent:
        query.get_order(a.context().principal, uuid4())
    assert absent.value.code is ErrorCode.NOT_ACCESSIBLE


def test_money_is_exact_decimal_and_rejects_float() -> None:
    assert Money(Decimal("0.10") + Decimal("0.20"), "USD").amount == Decimal("0.3000")
    with pytest.raises(DomainFailure):
        Money(0.1, "USD")
    with pytest.raises(DomainFailure):
        Money(Decimal("-1"), "USD")


def test_order_creation_is_atomic_audited_and_idempotent(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    service = OrderService(database)
    context = fixture.context(operation_key="create-1")
    line = OrderLineRequest(fixture.product_id, Decimal("2.0000"), 1)
    result = service.create_order(context, fixture.customer_id, (line,))
    replay = service.create_order(context, fixture.customer_id, (line,))
    assert result == replay
    assert result["status"] == "CREATED"
    assert result["items"][0]["unit_price"] == "12.3400"
    with database.transaction(fixture.business_id) as repository:
        order = repository.get_order(UUID(result["order_id"]))
        inventory = repository.get_inventory(fixture.product_id)
        operation = repository.get_operation("create_order", context.principal.actor_scope, "create-1")
        assert order is not None and order.version == 1 and len(order.items) == 1
        assert inventory is not None and inventory.available_qty == Decimal("5.0000")
        assert operation is not None and operation["status"] == "SUCCEEDED"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND resource_id=%s "
            "AND event_type='ORDER_CREATED'",
            (fixture.business_id, result["order_id"]),
        )
        assert cursor.fetchone() == (1,)


def test_stale_quote_and_changed_idempotency_payload_fail(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    service = OrderService(PostgresDatabase(runtime_url))
    context = fixture.context(operation_key="stale-quote")
    with pytest.raises(DomainFailure) as stale:
        service.create_order(
            context, fixture.customer_id,
            (OrderLineRequest(fixture.product_id, Decimal("1"), 2),),
        )
    assert stale.value.code is ErrorCode.STALE_STATE
    with pytest.raises(DomainFailure) as changed:
        service.create_order(
            context, fixture.customer_id,
            (OrderLineRequest(fixture.product_id, Decimal("2"), 1),),
        )
    assert changed.value.code is ErrorCode.CONFLICT


def test_last_unit_concurrency_cannot_oversell(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection, quantity=Decimal("1.0000"))
    database = PostgresDatabase(runtime_url)
    service = OrderService(database)
    line = OrderLineRequest(fixture.product_id, Decimal("1"), 1)
    orders = [
        service.create_order(fixture.context(operation_key=f"make-{n}"), fixture.customer_id, (line,))
        for n in range(2)
    ]

    def reserve(index: int) -> str:
        try:
            service.reserve_inventory(
                fixture.context(operation_key=f"reserve-{index}"),
                UUID(orders[index]["order_id"]), 1, {fixture.product_id: 1},
            )
            return "SUCCEEDED"
        except DomainFailure as failure:
            return failure.code.value

    with ThreadPoolExecutor(max_workers=2) as executor:
        outcomes = list(executor.map(reserve, range(2)))
    assert outcomes.count("SUCCEEDED") == 1
    assert outcomes.count("STALE_STATE") == 1
    with database.transaction(fixture.business_id) as repository:
        inventory = repository.get_inventory(fixture.product_id)
        assert inventory is not None
        assert inventory.available_qty == Decimal("0.0000")
        assert inventory.reserved_qty == Decimal("1.0000")


def test_multi_line_insufficiency_keeps_all_inventory_unchanged(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection, quantity=Decimal("1.0000"))
    other_product, other_inventory = uuid4(), uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO products"
            "(business_id,id,sku,name,unit_price,currency,active,updated_at) "
            "VALUES (%s,%s,'P-2','Second product',2,'USD',true,now())",
            (fixture.business_id, other_product),
        )
        cursor.execute(
            "INSERT INTO inventory"
            "(business_id,id,product_id,available_qty,reserved_qty,updated_at) "
            "VALUES (%s,%s,%s,0,0,now())",
            (fixture.business_id, other_inventory, other_product),
        )
    database = PostgresDatabase(runtime_url)
    service = OrderService(database)
    order = service.create_order(
        fixture.context(operation_key="two-lines"), fixture.customer_id,
        (OrderLineRequest(fixture.product_id, Decimal("1"), 1),
         OrderLineRequest(other_product, Decimal("1"), 1)),
    )
    with pytest.raises(DomainFailure) as failure:
        service.reserve_inventory(
            fixture.context(operation_key="reserve-two"), UUID(order["order_id"]), 1,
            {fixture.product_id: 1, other_product: 1},
        )
    assert failure.value.code is ErrorCode.INSUFFICIENT_INVENTORY
    with database.transaction(fixture.business_id) as repository:
        first = repository.get_inventory(fixture.product_id)
        second = repository.get_inventory(other_product)
        current = repository.get_order(UUID(order["order_id"]))
        assert first is not None and first.available_qty == 1 and first.reserved_qty == 0
        assert second is not None and second.available_qty == 0 and second.reserved_qty == 0
        assert current is not None and current.status.value == "NEEDS_ATTENTION"
        assert all(item.reserved_qty == 0 for item in current.items)


def test_explicit_transaction_rollback_removes_order(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    order_id = uuid4()
    with pytest.raises(RuntimeError):
        with database.transaction(fixture.business_id) as repository:
            repository.insert_order(order_id, fixture.customer_id, "USD")
            raise RuntimeError("test rollback")
    with database.transaction(fixture.business_id) as repository:
        assert repository.get_order(order_id) is None


def test_unknown_operation_is_durable_and_requires_reconciliation(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    ledger = OperationLedger(database)
    context = fixture.context(operation_key="uncertain-create")
    payload = {"customer_id": str(fixture.customer_id), "items": []}
    ticket = ledger.admit(context, "create_order", payload)
    ledger.mark_unknown(context, ticket.id)
    with pytest.raises(DomainFailure) as unresolved:
        ledger.admit(context, "create_order", payload)
    assert unresolved.value.code is ErrorCode.OUTCOME_UNKNOWN
    assert unresolved.value.reconciliation_required
    with database.transaction(fixture.business_id) as repository:
        operation = repository.get_operation(
            "create_order", context.principal.actor_scope, "uncertain-create"
        )
        assert operation is not None and operation["status"] == "UNKNOWN"
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "SELECT reconcile_after FROM idempotency_operations "
            "WHERE business_id=%s AND id=%s",
            (fixture.business_id, ticket.id),
        )
        assert cursor.fetchone()[0] is not None
        cursor.execute(
            "SELECT count(*) FROM audit_logs WHERE business_id=%s AND resource_id=%s "
            "AND event_type='TOOL_OUTCOME_UNKNOWN'",
            (fixture.business_id, ticket.id),
        )
        assert cursor.fetchone() == (1,)
