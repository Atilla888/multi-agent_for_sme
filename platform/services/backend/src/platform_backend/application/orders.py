"""Atomic approved order creation and pooled-inventory reservation."""

from typing import Any
from uuid import UUID, uuid4

import psycopg

from platform_backend.application.evidence import OperationLedger
from platform_backend.domain.context import ExecutionContext
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import OrderLineRequest, OrderStatus
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.policy import require_customer_access


class OrderService:
    def __init__(self, database: PostgresDatabase) -> None:
        self._database = database
        self._ledger = OperationLedger(database)

    def create_order(
        self,
        context: ExecutionContext,
        customer_id: UUID,
        lines: tuple[OrderLineRequest, ...],
    ) -> dict[str, Any]:
        if not lines or len(lines) > 50:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Order lines are required")
        if len({line.product_id for line in lines}) != len(lines):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Duplicate products are not allowed")
        payload = {
            "customer_id": str(customer_id),
            "items": [
                {
                    "product_id": str(line.product_id),
                    "quantity": str(line.quantity),
                    "quoted_product_version": line.quoted_product_version,
                }
                for line in sorted(lines, key=lambda item: item.product_id.hex)
            ],
        }
        ticket = self._ledger.admit(context, "create_order", payload)
        if ticket.prior_result is not None:
            return ticket.prior_result
        try:
            with self._database.transaction(context.business_id) as repository:
                customer = repository.get_customer(customer_id)
                if customer is None:
                    raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
                require_customer_access(context.principal, repository, customer_id)
                products = []
                for line in sorted(lines, key=lambda item: item.product_id.hex):
                    product = repository.get_product(line.product_id, lock=True)
                    if product is None or not product.active:
                        raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
                    if product.version != line.quoted_product_version:
                        raise DomainFailure(ErrorCode.STALE_STATE, "Product quote is stale")
                    products.append(product)
                currencies = {product.price.currency for product in products}
                if len(currencies) != 1:
                    raise DomainFailure(
                        ErrorCode.POLICY_REJECTED, "Mixed currencies are not allowed"
                    )
                currency = currencies.pop()
                order_id = uuid4()
                repository.insert_order(order_id, customer_id, currency)
                snapshots = []
                for line, product in zip(
                    sorted(lines, key=lambda item: item.product_id.hex), products, strict=True
                ):
                    item_id = uuid4()
                    repository.insert_order_item(
                        item_id, order_id, product.id, line.quantity, product.price.amount
                    )
                    snapshots.append(
                        {
                            "item_id": str(item_id),
                            "product_id": str(product.id),
                            "quantity": str(line.quantity),
                            "unit_price": str(product.price.amount),
                        }
                    )
                result = {
                    "order_id": str(order_id),
                    "status": OrderStatus.CREATED.value,
                    "order_version": 1,
                    "currency": currency,
                    "items": snapshots,
                }
                repository.finish_operation(ticket.id, "SUCCEEDED", result, None)
                repository.append_audit(
                    uuid4(),
                    context.correlation_id,
                    context.principal.actor_scope,
                    "ORDER_CREATED",
                    "order",
                    order_id,
                    {
                        "operation_id": str(ticket.id),
                        "version_before": None,
                        "version_after": 1,
                        "item_count": len(lines),
                    },
                    context.run_id,
                )
            return result
        except DomainFailure as failure:
            self._ledger.mark_known_failure(context, ticket.id, failure)
            raise
        except psycopg.Error as exc:
            # A lost COMMIT acknowledgement is not proof that the write failed.
            try:
                self._ledger.mark_unknown(context, ticket.id)
            except psycopg.Error:
                # The committed STARTED admission remains a reconciliation marker.
                pass
            raise DomainFailure(
                ErrorCode.OUTCOME_UNKNOWN,
                "Order result requires reconciliation",
                reconciliation_required=True,
            ) from exc

    def reserve_inventory(
        self,
        context: ExecutionContext,
        order_id: UUID,
        expected_order_version: int,
        expected_inventory_versions: dict[UUID, int],
    ) -> dict[str, Any]:
        if expected_order_version < 1 or not expected_inventory_versions:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Expected versions are required")
        payload = {
            "order_id": str(order_id),
            "expected_order_version": expected_order_version,
            "expected_inventory_versions": {
                str(key): value
                for key, value in sorted(
                    expected_inventory_versions.items(), key=lambda item: item[0].hex
                )
            },
        }
        ticket = self._ledger.admit(context, "reserve_inventory", payload)
        if ticket.prior_result is not None:
            return ticket.prior_result
        after_commit_failure: DomainFailure | None = None
        try:
            with self._database.transaction(context.business_id) as repository:
                order = repository.get_order(order_id, lock=True)
                if order is None:
                    raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
                require_customer_access(context.principal, repository, order.customer_id)
                if order.version != expected_order_version:
                    raise DomainFailure(ErrorCode.STALE_STATE, "Order version is stale")
                if order.status is not OrderStatus.CREATED:
                    raise DomainFailure(ErrorCode.POLICY_REJECTED, "Order is not reservable")
                if not order.items or any(item.reserved_qty != 0 for item in order.items):
                    raise DomainFailure(ErrorCode.POLICY_REJECTED, "Order lines are not reservable")
                if set(expected_inventory_versions) != {item.product_id for item in order.items}:
                    raise DomainFailure(
                        ErrorCode.VALIDATION_ERROR, "Inventory versions are incomplete"
                    )

                locked = {}
                for item in order.items:
                    inventory = repository.get_inventory(item.product_id, lock=True)
                    if inventory is None:
                        raise DomainFailure(
                            ErrorCode.DEPENDENCY_UNAVAILABLE, "Inventory is unavailable"
                        )
                    if inventory.version != expected_inventory_versions[item.product_id]:
                        raise DomainFailure(ErrorCode.STALE_STATE, "Inventory version is stale")
                    locked[item.product_id] = inventory

                insufficient = any(
                    locked[item.product_id].available_qty < item.quantity for item in order.items
                )
                if insufficient:
                    new_version = repository.set_order_status(
                        order_id, order.version, OrderStatus.NEEDS_ATTENTION
                    )
                    if new_version is None:
                        raise DomainFailure(ErrorCode.STALE_STATE, "Order version is stale")
                    repository.insert_escalation(uuid4(), context.run_id, "INSUFFICIENT_INVENTORY")
                    repository.finish_operation(
                        ticket.id, "FAILED", None, ErrorCode.INSUFFICIENT_INVENTORY.value
                    )
                    repository.append_audit(
                        uuid4(),
                        context.correlation_id,
                        context.principal.actor_scope,
                        "RESERVATION_REJECTED",
                        "order",
                        order_id,
                        {
                            "operation_id": str(ticket.id),
                            "error_code": "INSUFFICIENT_INVENTORY",
                            "version_before": order.version,
                            "version_after": new_version,
                        },
                        context.run_id,
                    )
                    after_commit_failure = DomainFailure(
                        ErrorCode.INSUFFICIENT_INVENTORY,
                        "Insufficient inventory; order needs attention",
                    )
                else:
                    reservations = []
                    for item in order.items:
                        inventory = locked[item.product_id]
                        new_inventory_version = repository.decrement_inventory(
                            item.product_id, item.quantity, inventory.version
                        )
                        if new_inventory_version is None:
                            raise DomainFailure(ErrorCode.STALE_STATE, "Inventory version is stale")
                        if not repository.mark_order_item_reserved(item.id, item.quantity):
                            raise DomainFailure(ErrorCode.STALE_STATE, "Order line changed")
                        reservations.append(
                            {
                                "product_id": str(item.product_id),
                                "quantity": str(item.quantity),
                                "inventory_version": new_inventory_version,
                            }
                        )
                    new_order_version = repository.set_order_status(
                        order_id, order.version, OrderStatus.CONFIRMED
                    )
                    if new_order_version is None:
                        raise DomainFailure(ErrorCode.STALE_STATE, "Order version is stale")
                    result = {
                        "order_id": str(order_id),
                        "status": OrderStatus.CONFIRMED.value,
                        "order_version": new_order_version,
                        "reservations": reservations,
                    }
                    repository.finish_operation(ticket.id, "SUCCEEDED", result, None)
                    repository.append_audit(
                        uuid4(),
                        context.correlation_id,
                        context.principal.actor_scope,
                        "INVENTORY_RESERVED",
                        "order",
                        order_id,
                        {
                            "operation_id": str(ticket.id),
                            "version_before": order.version,
                            "version_after": new_order_version,
                            "products": [str(item.product_id) for item in order.items],
                        },
                        context.run_id,
                    )
            if after_commit_failure is not None:
                raise after_commit_failure
            return result
        except DomainFailure as failure:
            if failure is not after_commit_failure:
                self._ledger.mark_known_failure(context, ticket.id, failure)
            raise
        except psycopg.Error as exc:
            try:
                self._ledger.mark_unknown(context, ticket.id)
            except psycopg.Error:
                pass
            raise DomainFailure(
                ErrorCode.OUTCOME_UNKNOWN,
                "Reservation result requires reconciliation",
                reconciliation_required=True,
            ) from exc
