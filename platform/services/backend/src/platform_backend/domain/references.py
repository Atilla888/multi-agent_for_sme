"""Typed references to approved, later-milestone resources; no retrieval behavior."""

from dataclasses import dataclass
from uuid import UUID


@dataclass(frozen=True)
class ConversationReference:
    business_id: UUID
    conversation_id: UUID
    customer_id: UUID | None


@dataclass(frozen=True)
class DocumentReference:
    business_id: UUID
    document_id: UUID
    published_version_id: UUID | None
    version: int


@dataclass(frozen=True)
class ForecastArtifactReference:
    business_id: UUID
    artifact_id: UUID
    model_version: str
    status: str
    version: int
