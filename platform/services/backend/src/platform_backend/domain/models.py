"""Framework-independent domain values over the approved physical model."""

from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
from enum import StrEnum
from uuid import UUID

from platform_backend.domain.errors import DomainFailure, ErrorCode


class OrderStatus(StrEnum):
    CREATED = "CREATED"
    CONFIRMED = "CONFIRMED"
    NEEDS_ATTENTION = "NEEDS_ATTENTION"


def decimal_4(value: Decimal | str, *, positive: bool = False) -> Decimal:
    """Reject binary floats, non-finite values and values outside NUMERIC(18,4)."""
    if isinstance(value, float) or isinstance(value, bool):
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Decimal value required")
    try:
        number = Decimal(value)
        quantized = number.quantize(Decimal("0.0001"))
    except (InvalidOperation, TypeError, ValueError) as exc:
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid decimal value") from exc
    if not number.is_finite() or number != quantized or abs(number) >= Decimal("100000000000000"):
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Decimal precision is invalid")
    if positive and number <= 0:
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Quantity must be positive")
    return quantized


@dataclass(frozen=True)
class Money:
    amount: Decimal
    currency: str

    def __post_init__(self) -> None:
        object.__setattr__(self, "amount", decimal_4(self.amount))
        if self.amount < 0:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Money amount cannot be negative")
        if len(self.currency) != 3 or not self.currency.isascii() or not self.currency.isupper():
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid currency")


@dataclass(frozen=True)
class Product:
    business_id: UUID
    id: UUID
    sku: str
    name: str
    price: Money
    active: bool
    version: int


@dataclass(frozen=True)
class Inventory:
    business_id: UUID
    id: UUID
    product_id: UUID
    available_qty: Decimal
    reserved_qty: Decimal
    version: int
    observed_at: datetime


@dataclass(frozen=True)
class Customer:
    business_id: UUID
    id: UUID
    display_name: str | None
    version: int


@dataclass(frozen=True)
class OrderItem:
    id: UUID
    product_id: UUID
    quantity: Decimal
    reserved_qty: Decimal
    price: Money
    version: int


@dataclass(frozen=True)
class Order:
    business_id: UUID
    id: UUID
    customer_id: UUID
    status: OrderStatus
    currency: str
    version: int
    items: tuple[OrderItem, ...]
    created_at: datetime
    delivery_reference: str | None = None


@dataclass(frozen=True)
class OrderLineRequest:
    product_id: UUID
    quantity: Decimal
    quoted_product_version: int

    def __post_init__(self) -> None:
        object.__setattr__(self, "quantity", decimal_4(self.quantity, positive=True))
        if self.quoted_product_version < 1:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid product version")
