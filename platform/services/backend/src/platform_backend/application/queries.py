"""Authorized, tenant-scoped read services and labelled operational analytics."""

from datetime import UTC, datetime
from typing import Any
from uuid import UUID

from platform_backend.domain.context import PrincipalContext
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import Customer, Inventory, Order, Product
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.policy import (
    require_business_access,
    require_customer_access,
    require_owner,
)


class QueryService:
    def __init__(self, database: PostgresDatabase) -> None:
        self._database = database

    def find_products(
        self,
        principal: PrincipalContext,
        query: str,
        limit: int,
        after: tuple[str, UUID] | None = None,
    ) -> list[Product]:
        if not query.strip() or len(query) > 120 or not 1 <= limit <= 50:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid product search")
        with self._database.transaction(principal.business_id) as repository:
            require_business_access(principal, repository)
            return repository.search_products(query.strip(), limit + 1, after)

    def get_product(self, principal: PrincipalContext, product_id: UUID) -> Product:
        with self._database.transaction(principal.business_id) as repository:
            require_business_access(principal, repository)
            product = repository.get_product(product_id)
            if product is None:
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
            return product

    def check_inventory(
        self, principal: PrincipalContext, product_ids: tuple[UUID, ...]
    ) -> list[Inventory]:
        if not product_ids or len(product_ids) > 50 or len(set(product_ids)) != len(product_ids):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid product list")
        with self._database.transaction(principal.business_id) as repository:
            require_business_access(principal, repository)
            items = []
            for product_id in product_ids:
                if repository.get_product(product_id) is None:
                    raise DomainFailure(ErrorCode.NOT_FOUND, "Product not found")
                inventory = repository.get_inventory(product_id)
                if inventory is None:
                    raise DomainFailure(
                        ErrorCode.DEPENDENCY_UNAVAILABLE, "Inventory is unavailable"
                    )
                items.append(inventory)
            return items

    def find_customer(
        self, principal: PrincipalContext, customer_id: UUID | None
    ) -> Customer | None:
        target = customer_id or principal.customer_id
        if target is None:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Customer reference is required")
        with self._database.transaction(principal.business_id) as repository:
            require_customer_access(principal, repository, target)
            customer = repository.get_customer(target)
            if customer is None:
                return None
            return customer

    def get_order(self, principal: PrincipalContext, order_id: UUID) -> Order:
        with self._database.transaction(principal.business_id) as repository:
            order = repository.get_order(order_id)
            if order is None:
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
            require_customer_access(principal, repository, order.customer_id)
            return order

    def report(
        self,
        principal: PrincipalContext,
        start: datetime,
        end: datetime,
        granularity: str,
        target: str,
        product_id: UUID | None,
    ) -> dict[str, Any]:
        if (
            start.tzinfo is None
            or end.tzinfo is None
            or start >= end
            or granularity not in {"DAY", "WEEK", "MONTH"}
            or target not in {"CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"}
        ):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid report scope")
        with self._database.transaction(principal.business_id) as repository:
            require_owner(principal, repository)
            if product_id is not None and repository.get_product(product_id) is None:
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
            rows = repository.sales_report_rows(start, end, granularity, product_id)
        measure = "units" if target == "CONFIRMED_ORDER_UNITS" else "value"
        series = [
            {
                "period": row["period"].isoformat(),
                "currency": row["currency"],
                "value": str(row[measure]),
            }
            for row in rows
        ]
        # No cross-currency total is invented; every series point carries its currency.
        return {
            "series": series,
            "target_definition": target,
            "included_statuses": ["CONFIRMED"],
            "event_timestamp": "orders.created_at",
            "cutoff": end.isoformat(),
            "as_of": datetime.now(UTC).isoformat(),
            "granularity": granularity,
            "currency_scope": "PER_CURRENCY",
            "product_id": str(product_id) if product_id else None,
        }
