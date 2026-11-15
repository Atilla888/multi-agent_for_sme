"""Exactly ten frozen, strict model-facing tool input contracts."""

from datetime import datetime
from enum import StrEnum
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class StrictInput(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class FindProductInput(StrictInput):
    query: str = Field(min_length=1, max_length=120)
    limit: int = Field(default=20, ge=1, le=50)
    cursor: str | None = Field(default=None, max_length=1000)


class CheckInventoryInput(StrictInput):
    product_ids: tuple[UUID, ...] = Field(min_length=1, max_length=50)


class FindCustomerInput(StrictInput):
    customer_id: UUID | None = None


class GetOrderInput(StrictInput):
    order_id: UUID


class OrderLineInput(StrictInput):
    product_id: UUID
    quantity: str = Field(pattern=r"^[0-9]+(?:\.[0-9]{1,4})?$")
    quoted_product_version: int = Field(ge=1)


class CreateOrderInput(StrictInput):
    customer_id: UUID
    items: tuple[OrderLineInput, ...] = Field(min_length=1, max_length=50)


class UpdateOrderPatch(StrictInput):
    """No editable fields are approved under E02 yet."""


class UpdateOrderInput(StrictInput):
    order_id: UUID
    expected_version: int = Field(ge=1)
    patch: UpdateOrderPatch


class ReserveInventoryInput(StrictInput):
    order_id: UUID
    expected_order_version: int = Field(ge=1)
    expected_inventory_versions: dict[UUID, int] = Field(min_length=1, max_length=50)


class GetDeliveryStatusInput(StrictInput):
    order_id: UUID


class GetSalesReportInput(StrictInput):
    from_at: datetime
    to_at: datetime
    granularity: Literal["DAY", "WEEK", "MONTH"]
    target_definition: Literal["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"]
    product_id: UUID | None = None


class ForecastSalesInput(StrictInput):
    as_of: datetime
    horizon: int = Field(ge=1)
    granularity: Literal["DAY", "WEEK", "MONTH"]
    target_definition: Literal["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"]
    product_id: UUID | None = None


TOOL_INPUTS: dict[str, type[StrictInput]] = {
    "find_product": FindProductInput,
    "check_inventory": CheckInventoryInput,
    "find_customer": FindCustomerInput,
    "get_order": GetOrderInput,
    "create_order": CreateOrderInput,
    "update_order": UpdateOrderInput,
    "reserve_inventory": ReserveInventoryInput,
    "get_delivery_status": GetDeliveryStatusInput,
    "get_sales_report": GetSalesReportInput,
    "forecast_sales": ForecastSalesInput,
}


class ResultStatus(StrEnum):
    SUCCEEDED = "SUCCEEDED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"
    OUTCOME_UNKNOWN = "OUTCOME_UNKNOWN"


class ToolError(BaseModel):
    code: str
    safe_message: str
    retryable: bool = False
    reconciliation_required: bool = False
    detail: str | None = None


class ToolResult(BaseModel):
    schema_version: Literal["v1"] = "v1"
    tool_call_id: UUID
    status: ResultStatus
    data: dict[str, Any] | None = None
    error: ToolError | None = None
    resource_versions: dict[str, int] = Field(default_factory=dict)
    observed_at: datetime
    source_refs: tuple[str, ...] = ()
