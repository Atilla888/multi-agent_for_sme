"""Explicit M07 lifecycle, retrieval and observation contracts."""

from dataclasses import dataclass
from enum import StrEnum
from uuid import UUID

from platform_backend.brain.contracts import KnowledgeEvidence
from platform_backend.domain.context import PrincipalContext


class KnowledgeCode(StrEnum):
    VALIDATION_ERROR = "VALIDATION_ERROR"
    UNAUTHORIZED = "UNAUTHORIZED"
    UNSUPPORTED_TYPE = "UNSUPPORTED_TYPE"
    OVERSIZED = "OVERSIZED"
    PARSE_FAILURE = "PARSE_FAILURE"
    EMPTY_CONTENT = "EMPTY_CONTENT"
    OBJECT_UNAVAILABLE = "OBJECT_UNAVAILABLE"
    OBJECT_INTEGRITY = "OBJECT_INTEGRITY"
    EMBEDDING_UNAVAILABLE = "EMBEDDING_UNAVAILABLE"
    EMBEDDING_DIMENSION_MISMATCH = "EMBEDDING_DIMENSION_MISMATCH"
    INCOMPLETE_INDEXING = "INCOMPLETE_INDEXING"
    UNPUBLISHED = "UNPUBLISHED"
    REVOKED = "REVOKED"
    RETRIEVAL_EMPTY = "RETRIEVAL_EMPTY"
    RETRIEVAL_UNAVAILABLE = "RETRIEVAL_UNAVAILABLE"
    ACL_REJECTED = "ACL_REJECTED"
    CONFLICT = "CONFLICT"
    PERSISTENCE_UNAVAILABLE = "PERSISTENCE_UNAVAILABLE"


@dataclass
class KnowledgeFailure(Exception):
    code: KnowledgeCode
    safe_message: str

    def __str__(self) -> str:
        return f"{self.code}: {self.safe_message}"


@dataclass(frozen=True)
class DevKnowledgeConfig:
    DEV_DOCUMENT_MAX_BYTES: int = 1_048_576
    DEV_CHUNK_MAX_CHARS: int = 800
    DEV_CHUNK_OVERLAP_CHARS: int = 100
    DEV_RETRIEVAL_MAX_RESULTS: int = 5
    DEV_RETRIEVAL_MAX_QUERY_CHARS: int = 2000

    def __post_init__(self) -> None:
        if not 0 <= self.DEV_CHUNK_OVERLAP_CHARS < self.DEV_CHUNK_MAX_CHARS:
            raise ValueError("Invalid development chunk overlap")
        if min(
            self.DEV_DOCUMENT_MAX_BYTES,
            self.DEV_CHUNK_MAX_CHARS,
            self.DEV_RETRIEVAL_MAX_RESULTS,
            self.DEV_RETRIEVAL_MAX_QUERY_CHARS,
        ) < 1:
            raise ValueError("Development limits must be positive")


@dataclass(frozen=True)
class RetrievalRequest:
    principal: PrincipalContext
    query: str
    limit: int = 5
    request_id: UUID | None = None


@dataclass(frozen=True)
class RetrievalTrace:
    business_id: UUID
    principal_scope: str
    query_sha256: str
    embedding_revision: str
    candidate_count: int
    filtered_count: int
    returned_ids: tuple[UUID, ...]
    corpus_versions: tuple[UUID, ...]
    duration_ms: float
    status: KnowledgeCode | None


@dataclass(frozen=True)
class RetrievalResult:
    evidence: tuple[KnowledgeEvidence, ...]
    trace: RetrievalTrace


@dataclass(frozen=True)
class IngestionTrace:
    business_id: UUID
    document_id: UUID
    version_id: UUID
    object_id: UUID
    source_sha256: str
    parser_version: str
    chunker_version: str
    embedding_revision: str
    chunk_count: int
    duration_ms: float
    status: str
    failure_code: KnowledgeCode | None = None
    parse_duration_ms: float = 0.0
    embedding_duration_ms: float = 0.0
