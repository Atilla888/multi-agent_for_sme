"""Trusted execution scope; never assembled from model-facing arguments."""

from dataclasses import dataclass
from datetime import datetime
from enum import StrEnum
from uuid import UUID


class PrincipalKind(StrEnum):
    USER = "USER"
    CUSTOMER = "CUSTOMER"
    SERVICE = "SERVICE"


class AgentRole(StrEnum):
    SALES = "Sales"
    SUPPORT = "Support"
    ANALYTICS = "Analytics"


class StaffRole(StrEnum):
    OWNER = "OWNER"
    OPERATOR = "OPERATOR"
    PLATFORM_ADMIN = "PLATFORM_ADMIN"


@dataclass(frozen=True)
class PrincipalContext:
    kind: PrincipalKind
    subject_id: UUID
    business_id: UUID
    staff_role: StaffRole | None = None
    customer_id: UUID | None = None
    identity_id: UUID | None = None

    @property
    def actor_scope(self) -> str:
        return f"{self.kind.value}:{self.subject_id}"


@dataclass(frozen=True)
class ExecutionContext:
    principal: PrincipalContext
    agent_role: AgentRole
    run_id: UUID
    correlation_id: UUID
    policy_version: str
    deadline: datetime
    operation_key: str | None = None

    @property
    def business_id(self) -> UUID:
        return self.principal.business_id
