"""Ports for later external adapters; safe deterministic defaults now."""

from typing import Any, Protocol
from uuid import UUID

from platform_backend.domain.context import ExecutionContext
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.tools.contracts import ForecastSalesInput


class DeliveryStatusPort(Protocol):
    def lookup(self, business_id: UUID, order_id: UUID, reference: str) -> dict[str, Any]: ...


class NoDeliveryAdapter:
    def lookup(self, business_id: UUID, order_id: UUID, reference: str) -> dict[str, Any]:
        raise DomainFailure(
            ErrorCode.DEPENDENCY_UNAVAILABLE,
            "Delivery provider is not configured",
            detail="DELIVERY_ADAPTER_NOT_CONFIGURED",
        )


class ForecastServicePort(Protocol):
    def forecast(
        self, context: ExecutionContext, request: ForecastSalesInput
    ) -> dict[str, Any]: ...


class NoArtifactForecastService:
    def forecast(self, context: ExecutionContext, request: ForecastSalesInput) -> dict[str, Any]:
        raise DomainFailure(
            ErrorCode.DEPENDENCY_UNAVAILABLE,
            "Validated forecast model is not ready",
            detail="MODEL_NOT_READY",
        )
