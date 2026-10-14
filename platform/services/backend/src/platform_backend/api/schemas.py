"""Purpose-specific public read DTOs; decimals remain exact strings."""

from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from platform_backend.domain.models import OrderStatus


class ReadDto(BaseModel):
    model_config = ConfigDict(extra="forbid")


class PrincipalDto(ReadDto):
    subject: UUID
    kind: Literal["USER"]
    role: Literal["OWNER", "OPERATOR", "PLATFORM_ADMIN"]
    business_id: UUID
    business_name: str | None
    expires_at: datetime


class ProductDto(ReadDto):
    id: UUID
    sku: str
    name: str
    unit_price: str
    currency: str
    active: bool
    version: int


class ProductPageDto(ReadDto):
    items: list[ProductDto]
    next_name: str | None
    next_id: UUID | None


class InventoryDto(ReadDto):
    id: UUID
    product_id: UUID
    available_quantity: str
    reserved_quantity: str
    version: int
    observed_at: datetime


class InventoryPageDto(ReadDto):
    items: list[InventoryDto]


class CustomerDto(ReadDto):
    id: UUID
    display_name: str | None
    version: int


class OrderItemDto(ReadDto):
    id: UUID
    product_id: UUID
    quantity: str
    reserved_quantity: str
    unit_price: str
    version: int


class OrderDto(ReadDto):
    id: UUID
    customer_id: UUID
    status: OrderStatus
    currency: str
    version: int
    created_at: datetime
    delivery_reference: str | None
    items: list[OrderItemDto]


class SalesPointDto(ReadDto):
    period: datetime
    currency: str
    value: str


class SalesReportDto(ReadDto):
    series: list[SalesPointDto]
    target_definition: Literal["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"]
    included_statuses: list[Literal["CONFIRMED"]]
    event_timestamp: Literal["orders.created_at"]
    cutoff: datetime
    as_of: datetime
    granularity: Literal["DAY", "WEEK", "MONTH"]
    currency_scope: Literal["PER_CURRENCY"]
    product_id: UUID | None
