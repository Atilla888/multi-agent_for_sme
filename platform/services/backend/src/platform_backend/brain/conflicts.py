"""Fact-specific authority rules; vector similarity never chooses business truth."""

from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID

from platform_backend.brain.contracts import ConflictDecision, ContextStatus, SourceType


class FactKind(StrEnum):
    ORDER_STATUS = "ORDER_STATUS"
    INVENTORY_QUANTITY = "INVENTORY_QUANTITY"
    POLICY_RULE = "POLICY_RULE"
    DOCUMENT_POLICY = "DOCUMENT_POLICY"


@dataclass(frozen=True)
class SourceClaim:
    kind: FactKind
    value: str
    source_type: SourceType
    source_reference: str
    current: bool = True
    published: bool = True
    resource_id: UUID | None = None


def resolve_claims(kind: FactKind, claims: tuple[SourceClaim, ...]) -> ConflictDecision:
    """A conflict state is explicit; each fact type has its own authority rule."""
    matching = tuple(claim for claim in claims if claim.kind is kind)
    if not matching:
        return ConflictDecision(kind.value, ContextStatus.INSUFFICIENT, None, "NO_CLAIM")

    if kind is FactKind.ORDER_STATUS:
        authoritative = tuple(
            claim for claim in matching if claim.source_type is SourceType.ORDER and claim.current
        )
    elif kind is FactKind.INVENTORY_QUANTITY:
        authoritative = tuple(
            claim
            for claim in matching
            if claim.source_type is SourceType.INVENTORY and claim.current
        )
    elif kind is FactKind.POLICY_RULE:
        authoritative = tuple(
            claim for claim in matching if claim.source_type is SourceType.POLICY and claim.current
        )
    else:
        authoritative = tuple(
            claim
            for claim in matching
            if claim.source_type is SourceType.KNOWLEDGE and claim.current and claim.published
        )

    if not authoritative:
        return ConflictDecision(
            kind.value, ContextStatus.INSUFFICIENT, None, "NO_CURRENT_AUTHORITATIVE_CLAIM"
        )
    if len({claim.value for claim in authoritative}) > 1:
        return ConflictDecision(
            kind.value, ContextStatus.CONFLICT, None, "EQUAL_AUTHORITY_CONFLICT"
        )
    selected = authoritative[0]
    ignored = any(claim.value != selected.value for claim in matching if claim not in authoritative)
    return ConflictDecision(
        kind.value,
        ContextStatus.PRESENT,
        selected.source_type,
        "LOWER_AUTHORITY_CONTRADICTION_IGNORED" if ignored else "CONSISTENT",
    )
