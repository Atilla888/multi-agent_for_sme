"""Trusted, non-LLM executor for the ten frozen business tools."""

import hashlib
import json
from dataclasses import dataclass
from datetime import UTC, datetime
from decimal import Decimal
from typing import Any, cast
from uuid import UUID, uuid4

import psycopg
from pydantic import ValidationError

from platform_backend.application.evidence import OperationLedger
from platform_backend.application.orders import OrderService
from platform_backend.application.queries import QueryService
from platform_backend.domain.context import AgentRole, ExecutionContext
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import OrderLineRequest
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.policy import require_owner
from platform_backend.tools.contracts import (
    TOOL_INPUTS,
    CheckInventoryInput,
    CreateOrderInput,
    FindCustomerInput,
    FindProductInput,
    ForecastSalesInput,
    GetDeliveryStatusInput,
    GetOrderInput,
    GetSalesReportInput,
    ReserveInventoryInput,
    ResultStatus,
    StrictInput,
    ToolError,
    ToolResult,
    UpdateOrderInput,
)
from platform_backend.tools.cursor import ProductCursor
from platform_backend.tools.ports import (
    DeliveryStatusPort,
    ForecastServicePort,
    NoArtifactForecastService,
    NoDeliveryAdapter,
)

ROLE_TOOLS: dict[AgentRole, frozenset[str]] = {
    AgentRole.SALES: frozenset(
        {
            "find_product",
            "check_inventory",
            "find_customer",
            "get_order",
            "create_order",
            "update_order",
            "reserve_inventory",
        }
    ),
    AgentRole.SUPPORT: frozenset(
        {
            "check_inventory",
            "find_customer",
            "get_order",
            "get_delivery_status",
        }
    ),
    AgentRole.ANALYTICS: frozenset({"get_sales_report", "forecast_sales"}),
}

WRITE_TOOLS = frozenset({"create_order", "update_order", "reserve_inventory"})


@dataclass(frozen=True)
class ToolLimits:
    max_forecast_horizon: int

    def __post_init__(self) -> None:
        if self.max_forecast_horizon < 1:
            raise ValueError("Forecast horizon must be configured as positive")


class ToolExecutor:
    def __init__(
        self,
        database: PostgresDatabase,
        *,
        cursor_signing_key: bytes,
        limits: ToolLimits,
        delivery: DeliveryStatusPort | None = None,
        forecast: ForecastServicePort | None = None,
    ) -> None:
        self._database = database
        self._queries = QueryService(database)
        self._orders = OrderService(database)
        self._ledger = OperationLedger(database)
        self._cursor = ProductCursor(cursor_signing_key)
        self._limits = limits
        self._delivery = delivery or NoDeliveryAdapter()
        self._forecast = forecast or NoArtifactForecastService()

    def execute(
        self, tool_name: str, payload: dict[str, Any], context: ExecutionContext
    ) -> ToolResult:
        call_id = uuid4()
        observed = datetime.now(UTC)
        try:
            self._check_run(context)
        except DomainFailure as failure:
            result = self._failure_result(call_id, failure, observed)
            self._record_admission_rejection(tool_name, payload, context, result)
            return result
        except psycopg.Error:
            return self._failure_result(
                call_id,
                DomainFailure(ErrorCode.DEPENDENCY_UNAVAILABLE, "Database unavailable"),
                observed,
            )

        try:
            with self._database.transaction(context.business_id) as repository:
                repository.insert_tool_call(call_id, context.run_id, tool_name)
        except psycopg.Error:
            return self._failure_result(
                call_id,
                DomainFailure(ErrorCode.DEPENDENCY_UNAVAILABLE, "Database unavailable"),
                observed,
            )

        try:
            if tool_name not in TOOL_INPUTS:
                raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Unknown tool")
            if tool_name not in ROLE_TOOLS.get(context.agent_role, frozenset()):
                raise DomainFailure(
                    ErrorCode.FORBIDDEN, "Tool is not permitted for this agent role"
                )
            # Serialize as JSON first: strict validation still accepts UUID/date wire strings.
            try:
                raw = json.dumps(payload, allow_nan=False)
                request = TOOL_INPUTS[tool_name].model_validate_json(raw)
            except (TypeError, ValueError, ValidationError) as exc:
                raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid tool arguments") from exc
            data = self._dispatch(tool_name, request, context)
            result = ToolResult(
                tool_call_id=call_id,
                status=ResultStatus.SUCCEEDED,
                data=data,
                observed_at=datetime.now(UTC),
                resource_versions=self._resource_versions(data),
                source_refs=self._source_refs(data),
            )
        except DomainFailure as failure:
            result = self._failure_result(call_id, failure, datetime.now(UTC))
        except TimeoutError:
            result = self._failure_result(
                call_id,
                DomainFailure(ErrorCode.TIMEOUT, "Tool dependency timed out"),
                datetime.now(UTC),
            )
        except ConnectionError:
            result = self._failure_result(
                call_id,
                DomainFailure(ErrorCode.DEPENDENCY_UNAVAILABLE, "Tool dependency is unavailable"),
                datetime.now(UTC),
            )
        except psycopg.Error:
            db_failure = (
                DomainFailure(
                    ErrorCode.OUTCOME_UNKNOWN,
                    "Write result requires reconciliation",
                    reconciliation_required=True,
                )
                if tool_name in WRITE_TOOLS
                else DomainFailure(ErrorCode.DEPENDENCY_UNAVAILABLE, "Database unavailable")
            )
            result = self._failure_result(call_id, db_failure, datetime.now(UTC))
        self._record_terminal(tool_name, payload, context, result)
        return result

    def _record_admission_rejection(
        self,
        name: str,
        payload: dict[str, Any],
        context: ExecutionContext,
        result: ToolResult,
    ) -> None:
        try:
            with self._database.transaction(context.business_id) as repository:
                repository.append_audit(
                    uuid4(),
                    context.correlation_id,
                    context.principal.actor_scope,
                    "TOOL_REJECTED_PRE_ADMISSION",
                    "tool_call",
                    result.tool_call_id,
                    {
                        "tool_name": name,
                        "tool_version": "v1",
                        "agent_role": context.agent_role.value,
                        "argument_digest": self._argument_digest(payload),
                        "error_code": result.error.code if result.error else None,
                    },
                    None,
                )
        except psycopg.Error:
            # Admission remains denied even if its audit store is unavailable.
            pass

    def _check_run(self, context: ExecutionContext) -> None:
        if (
            not context.policy_version
            or context.deadline.tzinfo is None
            or context.deadline <= datetime.now(UTC)
        ):
            raise DomainFailure(ErrorCode.POLICY_REJECTED, "Execution context is not active")
        with self._database.transaction(context.business_id) as repository:
            run = repository.get_run_status(context.run_id)
        if (
            run is None
            or run[0] != "RUNNING"
            or run[1] <= datetime.now(UTC)
            or run[2] != context.agent_role.value
        ):
            raise DomainFailure(ErrorCode.POLICY_REJECTED, "Execution run is not active")

    def _dispatch(
        self, name: str, request: StrictInput, context: ExecutionContext
    ) -> dict[str, Any]:
        principal = context.principal
        if name == "find_product":
            arg = cast(FindProductInput, request)
            after = (
                self._cursor.decode(arg.cursor, context.business_id, arg.query)
                if arg.cursor
                else None
            )
            products = self._queries.find_products(principal, arg.query, arg.limit, after)
            more = len(products) > arg.limit
            shown = products[: arg.limit]
            cursor = (
                self._cursor.encode(context.business_id, arg.query, shown[-1].name, shown[-1].id)
                if more and shown
                else None
            )
            return {
                "products": [
                    {
                        "id": str(p.id),
                        "sku": p.sku,
                        "name": p.name,
                        "price": str(p.price.amount),
                        "currency": p.price.currency,
                        "version": p.version,
                    }
                    for p in shown
                ],
                "next_cursor": cursor,
            }
        if name == "check_inventory":
            inventory_arg = cast(CheckInventoryInput, request)
            inventory = self._queries.check_inventory(principal, inventory_arg.product_ids)
            return {
                "items": [
                    {
                        "product_id": str(item.product_id),
                        "available_qty": str(item.available_qty),
                        "inventory_version": item.version,
                        "observed_at": item.observed_at.isoformat(),
                    }
                    for item in inventory
                ]
            }
        if name == "find_customer":
            customer_arg = cast(FindCustomerInput, request)
            customer = self._queries.find_customer(principal, customer_arg.customer_id)
            return {
                "customer": (
                    {
                        "id": str(customer.id),
                        "display_name": customer.display_name,
                        "version": customer.version,
                    }
                    if customer
                    else None
                )
            }
        if name == "get_order":
            order_arg = cast(GetOrderInput, request)
            order = self._queries.get_order(principal, order_arg.order_id)
            return {
                "order": {
                    "id": str(order.id),
                    "customer_id": str(order.customer_id),
                    "status": order.status.value,
                    "currency": order.currency,
                    "version": order.version,
                    "items": [
                        {
                            "id": str(item.id),
                            "product_id": str(item.product_id),
                            "quantity": str(item.quantity),
                            "reserved_qty": str(item.reserved_qty),
                            "unit_price": str(item.price.amount),
                        }
                        for item in order.items
                    ],
                }
            }
        if name == "create_order":
            create_arg = cast(CreateOrderInput, request)
            lines = tuple(
                OrderLineRequest(
                    item.product_id, Decimal(item.quantity), item.quoted_product_version
                )
                for item in create_arg.items
            )
            return self._orders.create_order(context, create_arg.customer_id, lines)
        if name == "update_order":
            update_arg = cast(UpdateOrderInput, request)
            self._queries.get_order(principal, update_arg.order_id)
            raise DomainFailure(
                ErrorCode.POLICY_REJECTED,
                "Order edits await an approved field policy",
                detail="BLOCKED_BY_APPROVED_POLICY",
            )
        if name == "reserve_inventory":
            reserve_arg = cast(ReserveInventoryInput, request)
            if any(version < 1 for version in reserve_arg.expected_inventory_versions.values()):
                raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid inventory version")
            return self._orders.reserve_inventory(
                context,
                reserve_arg.order_id,
                reserve_arg.expected_order_version,
                reserve_arg.expected_inventory_versions,
            )
        if name == "get_delivery_status":
            delivery_arg = cast(GetDeliveryStatusInput, request)
            order = self._queries.get_order(principal, delivery_arg.order_id)
            if order.delivery_reference is None:
                return {
                    "availability": "UNAVAILABLE",
                    "provider_status": None,
                    "observed_at": datetime.now(UTC).isoformat(),
                    "delivery_reference": None,
                }
            return self._delivery.lookup(context.business_id, order.id, order.delivery_reference)
        if name == "get_sales_report":
            report_arg = cast(GetSalesReportInput, request)
            return self._queries.report(
                principal,
                report_arg.from_at,
                report_arg.to_at,
                report_arg.granularity,
                report_arg.target_definition,
                report_arg.product_id,
            )
        if name == "forecast_sales":
            forecast_arg = cast(ForecastSalesInput, request)
            if (
                forecast_arg.horizon > self._limits.max_forecast_horizon
                or forecast_arg.as_of.tzinfo is None
            ):
                raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid forecast scope")
            with self._database.transaction(context.business_id) as repository:
                require_owner(principal, repository)
            return self._forecast.forecast(context, forecast_arg)
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Unknown tool")

    def _record_terminal(
        self,
        name: str,
        payload: dict[str, Any],
        context: ExecutionContext,
        result: ToolResult,
    ) -> None:
        code = result.error.code if result.error else None
        status = (
            "SUCCEEDED"
            if result.status is ResultStatus.SUCCEEDED
            else "OUTCOME_UNKNOWN"
            if result.status is ResultStatus.OUTCOME_UNKNOWN
            else "FAILED"
        )
        argument_digest = self._argument_digest(payload)
        operation_id: UUID | None = None
        if name in WRITE_TOOLS and context.operation_key:
            operation = self._ledger.lookup(context, name, context.operation_key)
            operation_id = operation["id"] if operation else None
        with self._database.transaction(context.business_id) as repository:
            repository.finish_tool_call(
                result.tool_call_id,
                status,
                code,
                {
                    "tool_version": "v1",
                    "agent_role": context.agent_role.value,
                    "argument_digest": argument_digest,
                    "result_status": result.status.value,
                    "error_detail": result.error.detail if result.error else None,
                },
                operation_id,
            )
            repository.append_audit(
                uuid4(),
                context.correlation_id,
                context.principal.actor_scope,
                "TOOL_SUCCEEDED" if code is None else "TOOL_FAILED",
                "tool_call",
                result.tool_call_id,
                {
                    "tool_name": name,
                    "tool_version": "v1",
                    "agent_role": context.agent_role.value,
                    "argument_digest": argument_digest,
                    "status": result.status.value,
                    "error_code": code,
                    "operation_id": str(operation_id) if operation_id else None,
                },
                context.run_id,
            )

    @staticmethod
    def _argument_digest(payload: dict[str, Any]) -> str:
        return hashlib.sha256(
            json.dumps(payload, sort_keys=True, default=str, allow_nan=True).encode()
        ).hexdigest()

    @staticmethod
    def _failure_result(call_id: UUID, failure: DomainFailure, observed: datetime) -> ToolResult:
        if failure.code is ErrorCode.OUTCOME_UNKNOWN:
            status = ResultStatus.OUTCOME_UNKNOWN
        elif failure.code in {
            ErrorCode.DEPENDENCY_UNAVAILABLE,
            ErrorCode.TIMEOUT,
            ErrorCode.TOOL_FAILED,
        }:
            status = ResultStatus.FAILED
        else:
            status = ResultStatus.REJECTED
        return ToolResult(
            tool_call_id=call_id,
            status=status,
            observed_at=observed,
            error=ToolError(
                code=failure.code.value,
                safe_message=failure.safe_message,
                reconciliation_required=failure.reconciliation_required,
                detail=failure.detail,
            ),
        )

    @staticmethod
    def _resource_versions(data: dict[str, Any]) -> dict[str, int]:
        if "order_id" in data and "order_version" in data:
            return {data["order_id"]: int(data["order_version"])}
        if isinstance(data.get("order"), dict):
            order = data["order"]
            return {order["id"]: int(order["version"])}
        return {}

    @staticmethod
    def _source_refs(data: dict[str, Any]) -> tuple[str, ...]:
        if "order_id" in data:
            return (f"order:{data['order_id']}",)
        if isinstance(data.get("order"), dict):
            return (f"order:{data['order']['id']}",)
        if "products" in data:
            return tuple(f"product:{item['id']}" for item in data["products"])
        return ()
