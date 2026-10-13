"""Stable, safe failures shared by domain services and tool execution."""

from dataclasses import dataclass
from enum import StrEnum


class ErrorCode(StrEnum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHENTICATED = "UNAUTHENTICATED"
    FORBIDDEN = "FORBIDDEN"
    NOT_ACCESSIBLE = "NOT_ACCESSIBLE"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    STALE_STATE = "STALE_STATE"
    DEPENDENCY_UNAVAILABLE = "DEPENDENCY_UNAVAILABLE"
    TIMEOUT = "TIMEOUT"
    POLICY_REJECTED = "POLICY_REJECTED"
    TOOL_FAILED = "TOOL_FAILED"
    OUTCOME_UNKNOWN = "OUTCOME_UNKNOWN"
    HUMAN_REQUIRED = "HUMAN_REQUIRED"
    INSUFFICIENT_INVENTORY = "INSUFFICIENT_INVENTORY"


@dataclass
class DomainFailure(Exception):
    code: ErrorCode
    safe_message: str
    detail: str | None = None
    reconciliation_required: bool = False

    def __str__(self) -> str:
        return f"{self.code}: {self.safe_message}"
