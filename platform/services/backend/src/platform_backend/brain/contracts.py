"""Typed, non-LLM seven-part Business Brain contract and provenance."""

import hashlib
import json
from dataclasses import asdict, dataclass, field
from datetime import datetime
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from platform_backend.domain.context import AgentRole, PrincipalContext
from platform_backend.domain.errors import DomainFailure, ErrorCode


class ContextStatus(StrEnum):
    PRESENT = "PRESENT"
    NOT_REQUESTED = "NOT_REQUESTED"
    NOT_FOUND = "NOT_FOUND"
    NOT_ACCESSIBLE = "NOT_ACCESSIBLE"
    UNAVAILABLE = "UNAVAILABLE"
    STALE = "STALE"
    CONFLICT = "CONFLICT"
    INSUFFICIENT = "INSUFFICIENT"


class SourceType(StrEnum):
    REQUEST = "REQUEST"
    CONVERSATION = "CONVERSATION"
    SUMMARY = "SUMMARY"
    PRODUCT = "PRODUCT"
    INVENTORY = "INVENTORY"
    CUSTOMER = "CUSTOMER"
    ORDER = "ORDER"
    REPORT = "REPORT"
    RUNTIME = "RUNTIME"
    POLICY = "POLICY"
    PERMISSION = "PERMISSION"
    KNOWLEDGE = "KNOWLEDGE"


class ContextPurpose(StrEnum):
    SALES = "SALES"
    SUPPORT = "SUPPORT"
    ANALYTICS = "ANALYTICS"


class ArchitectureMode(StrEnum):
    SINGLE = "SINGLE"
    STATIC_MULTI = "STATIC_MULTI"
    ADAPTIVE_MULTI = "ADAPTIVE_MULTI"


class ModelContextHints(BaseModel):
    """Only user text is accepted from the future model/user boundary."""

    model_config = ConfigDict(extra="forbid", strict=True)
    question: str = Field(min_length=1, max_length=2000)


@dataclass(frozen=True)
class DevContextLimits:
    DEV_CONTEXT_MAX_MESSAGES: int = 12
    DEV_CONTEXT_MAX_STRUCTURED_RECORDS: int = 20
    DEV_CONTEXT_MAX_RETRIEVED_CHUNKS: int = 5
    DEV_CONTEXT_MAX_DOCUMENT_CHARS: int = 2000
    DEV_CONTEXT_MAX_MESSAGE_CHARS: int = 500
    DEV_CONTEXT_INVENTORY_STALE_AFTER_SECONDS: int = 300

    def __post_init__(self) -> None:
        if any(value < 1 for value in asdict(self).values()):
            raise ValueError("Development context limits must be positive")


@dataclass(frozen=True)
class ContextRequest:
    """Constructed by trusted application code, never parsed from model JSON."""

    request_id: UUID
    principal: PrincipalContext
    purpose: ContextPurpose
    question: str
    policy_version: str
    agent_role: AgentRole
    conversation_id: UUID | None = None
    run_id: UUID | None = None
    product_ids: tuple[UUID, ...] = ()
    customer_id: UUID | None = None
    order_id: UUID | None = None
    include_knowledge: bool = False
    report_start: datetime | None = None
    report_end: datetime | None = None
    report_granularity: str = "DAY"
    report_target: str = "CONFIRMED_ORDER_UNITS"
    architecture_mode: ArchitectureMode = ArchitectureMode.SINGLE
    limits: DevContextLimits = field(default_factory=DevContextLimits)

    def __post_init__(self) -> None:
        if (
            not self.question.strip()
            or len(self.question) > 2000
            or not self.policy_version
            or len(self.product_ids) > 20
            or len(set(self.product_ids)) != len(self.product_ids)
            or (self.report_start is None) != (self.report_end is None)
        ):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid context request")

    @property
    def business_id(self) -> UUID:
        return self.principal.business_id


@dataclass(frozen=True)
class Provenance:
    source_type: SourceType
    source_reference: str
    source_version: str
    business_id: UUID
    observed_at: datetime
    status: ContextStatus
    permission_scope: str
    content_digest: str | None = None
    effective_from: datetime | None = None
    effective_to: datetime | None = None
    missing_reason: str | None = None
    conflict: bool = False


@dataclass(frozen=True)
class RequestContext:
    request_id: UUID
    purpose: ContextPurpose
    question: str
    provenance: Provenance


@dataclass(frozen=True)
class ConversationMessage:
    id: UUID
    direction: str
    status: str
    text: str
    created_at: datetime
    provenance: Provenance


@dataclass(frozen=True)
class SummaryFactClaim:
    fact_kind: str
    value: str
    resource_id: UUID | None = None


@dataclass(frozen=True)
class DerivedSummary:
    text: str
    provenance: Provenance
    claims: tuple[SummaryFactClaim, ...] = ()


@dataclass(frozen=True)
class ConversationContext:
    status: ContextStatus
    messages: tuple[ConversationMessage, ...] = ()
    summary: DerivedSummary | None = None
    operation_references: tuple[UUID, ...] = ()
    truncated: bool = False
    missing_reason: str | None = None


@dataclass(frozen=True)
class ProductFact:
    id: UUID
    name: str
    sku: str
    price: str
    currency: str
    active: bool
    provenance: Provenance


@dataclass(frozen=True)
class InventoryFact:
    product_id: UUID
    available_qty: str
    reserved_qty: str
    provenance: Provenance


@dataclass(frozen=True)
class CustomerFact:
    id: UUID
    provenance: Provenance


@dataclass(frozen=True)
class OrderItemFact:
    product_id: UUID
    quantity: str
    reserved_qty: str
    unit_price: str


@dataclass(frozen=True)
class OrderFact:
    id: UUID
    status: str
    currency: str
    items: tuple[OrderItemFact, ...]
    provenance: Provenance


@dataclass(frozen=True)
class ReportFact:
    target_definition: str
    series: tuple[tuple[str, str, str], ...]
    provenance: Provenance


@dataclass(frozen=True)
class MissingFact:
    kind: str
    status: ContextStatus
    reason: str


@dataclass(frozen=True)
class ConflictDecision:
    fact_kind: str
    status: ContextStatus
    winning_source: SourceType | None
    reason: str


@dataclass(frozen=True)
class StructuredContext:
    products: tuple[ProductFact, ...] = ()
    inventory: tuple[InventoryFact, ...] = ()
    customer: CustomerFact | None = None
    order: OrderFact | None = None
    report: ReportFact | None = None
    forecast_availability: ContextStatus = ContextStatus.NOT_REQUESTED
    missing: tuple[MissingFact, ...] = ()
    conflicts: tuple[ConflictDecision, ...] = ()
    truncated: bool = False


@dataclass(frozen=True)
class KnowledgeEvidence:
    document_id: UUID
    version_id: UUID
    chunk_id: UUID
    text: str
    similarity: float
    locator: str
    provenance: Provenance
    claims: tuple[SummaryFactClaim, ...] = ()
    source_sha256: str | None = None
    object_id: UUID | None = None
    parser_version: str | None = None
    chunker_version: str | None = None
    embedding_revision: str | None = None


@dataclass(frozen=True)
class KnowledgeContext:
    status: ContextStatus
    evidence: tuple[KnowledgeEvidence, ...] = ()
    missing_reason: str | None = None
    truncated: bool = False


@dataclass(frozen=True)
class OperationReference:
    id: UUID
    tool_name: str
    status: str
    error_code: str | None
    provenance: Provenance


@dataclass(frozen=True)
class RuntimeStateContext:
    status: ContextStatus
    run_id: UUID | None = None
    run_status: str | None = None
    active_agent: str | None = None
    completed: tuple[OperationReference, ...] = ()
    unresolved: tuple[OperationReference, ...] = ()
    provenance: Provenance | None = None
    missing_reason: str | None = None
    truncated: bool = False


@dataclass(frozen=True)
class RuleFact:
    code: str
    statement: str
    provenance: Provenance


@dataclass(frozen=True)
class RulesContext:
    status: ContextStatus
    policy_version: str
    rules: tuple[RuleFact, ...]
    conflicts: tuple[ConflictDecision, ...] = ()


@dataclass(frozen=True)
class PermissionsContext:
    status: ContextStatus
    potential_tools: tuple[str, ...]
    resource_check_required: bool
    human_approval_required: bool
    provenance: Provenance


@dataclass(frozen=True)
class ContextBuildTrace:
    requested_providers: tuple[str, ...]
    included_providers: tuple[str, ...]
    source_versions: tuple[str, ...]
    missing_reasons: tuple[str, ...]
    conflict_reasons: tuple[str, ...]
    message_count: int
    structured_count: int
    knowledge_count: int
    truncated_sections: tuple[str, ...]
    duration_ms: float
    context_digest: str


@dataclass(frozen=True)
class ContextBundle:
    request: RequestContext
    conversation: ConversationContext
    structured: StructuredContext
    retrieved: KnowledgeContext
    state: RuntimeStateContext
    rules: RulesContext
    permissions: PermissionsContext
    trace: ContextBuildTrace

    def model_projection(self) -> dict[str, Any]:
        """Minimal future-model view; never contains credential or authority objects."""
        return {
            "request": {"purpose": self.request.purpose.value, "question": self.request.question},
            "conversation": {
                "status": self.conversation.status.value,
                "messages": [
                    {
                        "direction": item.direction,
                        "text": item.text,
                        "source_reference": item.provenance.source_reference,
                    }
                    for item in self.conversation.messages
                ],
                "summary": {"text": self.conversation.summary.text, "authority": "DERIVED"}
                if self.conversation.summary
                else None,
                "truncated": self.conversation.truncated,
            },
            "structured": {
                "products": [asdict(item) for item in self.structured.products],
                "inventory": [asdict(item) for item in self.structured.inventory],
                "customer": asdict(self.structured.customer) if self.structured.customer else None,
                "order": asdict(self.structured.order) if self.structured.order else None,
                "report": asdict(self.structured.report) if self.structured.report else None,
                "forecast_availability": self.structured.forecast_availability.value,
                "missing": [asdict(item) for item in self.structured.missing],
                "conflicts": [asdict(item) for item in self.structured.conflicts],
                "truncated": self.structured.truncated,
            },
            "retrieved": {
                "status": self.retrieved.status.value,
                "evidence": [asdict(item) for item in self.retrieved.evidence],
                "truncated": self.retrieved.truncated,
            },
            "state": {
                "status": self.state.status.value,
                "run_status": self.state.run_status,
                "active_agent": self.state.active_agent,
                "completed": [asdict(item) for item in self.state.completed],
                "unresolved": [asdict(item) for item in self.state.unresolved],
                "truncated": self.state.truncated,
            },
            "rules": {
                "status": self.rules.status.value,
                "rules": [asdict(item) for item in self.rules.rules],
                "conflicts": [asdict(item) for item in self.rules.conflicts],
            },
            "permissions": {
                "status": self.permissions.status.value,
                "potential_tools": self.permissions.potential_tools,
                "resource_check_required": self.permissions.resource_check_required,
                "human_approval_required": self.permissions.human_approval_required,
            },
        }


def canonical_context_digest(projection: dict[str, Any]) -> str:
    def stable(value: Any) -> Any:
        if isinstance(value, dict):
            return {
                key: stable(item)
                for key, item in value.items()
                if key not in {"observed_at", "effective_from", "effective_to"}
            }
        if isinstance(value, tuple | list):
            return [stable(item) for item in value]
        return value

    encoded = json.dumps(stable(projection), sort_keys=True, separators=(",", ":"), default=str)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()
