"""M07 staged ingestion, explicit publication, revocation and scoped pgvector read."""

import hashlib
import time
from typing import Any
from uuid import UUID, uuid4

import psycopg

from platform_backend.brain.contracts import (
    ContextRequest,
    ContextStatus,
    KnowledgeContext,
    KnowledgeEvidence,
    Provenance,
    SourceType,
)
from platform_backend.domain.context import PrincipalContext, PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure
from platform_backend.knowledge.contracts import (
    DevKnowledgeConfig,
    IngestionTrace,
    KnowledgeCode,
    KnowledgeFailure,
    RetrievalRequest,
    RetrievalResult,
    RetrievalTrace,
)
from platform_backend.knowledge.embedding import (
    EmbeddingProvider,
    embedding_revision,
    validated_embeddings,
)
from platform_backend.knowledge.processing import (
    CHUNKER_VERSION,
    DocumentParser,
    PlainTextParser,
    chunk_document,
)
from platform_backend.knowledge.storage import PrivateObjectStore
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.policy import require_business_access, require_owner


class KnowledgeService:
    def __init__(
        self,
        database: PostgresDatabase,
        store: PrivateObjectStore,
        embedding: EmbeddingProvider,
        *,
        parser: DocumentParser | None = None,
        config: DevKnowledgeConfig | None = None,
    ) -> None:
        self._database = database
        self._store = store
        self._embedding = embedding
        self._parser = parser or PlainTextParser()
        self._config = config or DevKnowledgeConfig()

    @property
    def embedding_revision(self) -> str:
        return embedding_revision(self._embedding)

    def create_document(self, principal: PrincipalContext, title: str, access_scope: str) -> UUID:
        if access_scope not in {"CUSTOMER", "STAFF"} or not title.strip() or len(title) > 200:
            raise KnowledgeFailure(KnowledgeCode.VALIDATION_ERROR, "Invalid document metadata")
        document_id = uuid4()
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                repository.knowledge.create_document(document_id, title.strip(), access_scope)
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_CREATED", document_id,
                    {"scope": access_scope},
                )
        except psycopg.Error as exc:
            raise KnowledgeFailure(
                KnowledgeCode.PERSISTENCE_UNAVAILABLE, "Document persistence unavailable"
            ) from exc
        return document_id

    def stage_version(
        self, principal: PrincipalContext, document_id: UUID, data: bytes, media_type: str
    ) -> IngestionTrace:
        started = time.monotonic()
        if media_type != "text/plain":
            raise KnowledgeFailure(KnowledgeCode.UNSUPPORTED_TYPE, "Unsupported document type")
        if not data or not data.strip():
            raise KnowledgeFailure(KnowledgeCode.EMPTY_CONTENT, "Document is empty")
        if len(data) > self._config.DEV_DOCUMENT_MAX_BYTES:
            raise KnowledgeFailure(KnowledgeCode.OVERSIZED, "Document exceeds development limit")
        signature = data.lstrip()[:32].lower()
        if data.startswith(
            (b"%PDF", b"PK\x03\x04", b"\x89PNG", b"\xff\xd8")
        ) or signature.startswith(
            (b"<!doctype html", b"<html", b"<?xml")
        ):
            raise KnowledgeFailure(KnowledgeCode.UNSUPPORTED_TYPE, "Unsupported document signature")
        version_id, object_id = uuid4(), uuid4()
        key = f"business/{principal.business_id}/DOCUMENT/{object_id}/{version_id}"
        digest = hashlib.sha256(data).hexdigest()
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                if repository.knowledge.get_document(document_id) is None:
                    raise KnowledgeFailure(KnowledgeCode.UNAUTHORIZED, "Document is not accessible")
                repository.knowledge.insert_stage(
                    document_id=document_id,
                    version_id=version_id,
                    object_id=object_id,
                    bucket=self._store.bucket,
                    object_key=key,
                    sha256=digest,
                    size=len(data),
                    media_type=media_type,
                    parser_version=self._parser.version,
                    embedding_revision=self.embedding_revision,
                    dimension=self._embedding.dimension,
                )
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_VERSION_STAGED",
                    document_id, {"version_id": str(version_id), "source_sha256": digest},
                )
        except psycopg.Error as exc:
            raise KnowledgeFailure(
                KnowledgeCode.PERSISTENCE_UNAVAILABLE, "Version persistence unavailable"
            ) from exc
        try:
            self._store.put(key, data, media_type)
        except Exception as exc:
            self._fail_stage(principal, version_id, document_id, KnowledgeCode.OBJECT_UNAVAILABLE)
            if isinstance(exc, KnowledgeFailure):
                raise
            raise KnowledgeFailure(
                KnowledgeCode.OBJECT_UNAVAILABLE, "Object upload unavailable"
            ) from exc
        # Keep the object quarantined until read-back hash, parsing and indexing succeed.
        return IngestionTrace(
            principal.business_id, document_id, version_id, object_id, digest,
            self._parser.version, CHUNKER_VERSION, self.embedding_revision, 0,
            (time.monotonic() - started) * 1000, "STAGED",
        )

    def process_version(self, principal: PrincipalContext, version_id: UUID) -> IngestionTrace:
        started = time.monotonic()
        version: dict[str, Any] | None = None
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                version = repository.knowledge.get_version(version_id)
                if version is None:
                    raise KnowledgeFailure(KnowledgeCode.UNAUTHORIZED, "Version is not accessible")
                document = repository.knowledge.get_document(version["document_id"])
                if document is None or version["status"] != "STAGED":
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Version is not staged")
                if (
                    version["embedding_model"] != self.embedding_revision
                    or version["embedding_dimension"] != self._embedding.dimension
                    or version["parser_version"] != self._parser.version
                ):
                    raise KnowledgeFailure(
                        KnowledgeCode.EMBEDDING_DIMENSION_MISMATCH,
                        "Version indexing configuration mismatch",
                    )
            try:
                data = self._store.read_verified(version["object_key"], version["byte_size"])
            except KnowledgeFailure:
                raise
            except Exception as exc:
                raise KnowledgeFailure(
                    KnowledgeCode.OBJECT_UNAVAILABLE, "Object read unavailable"
                ) from exc
            if hashlib.sha256(data).hexdigest() != version["content_hash"]:
                raise KnowledgeFailure(KnowledgeCode.OBJECT_INTEGRITY, "Object hash mismatch")
            parse_started = time.monotonic()
            parsed = self._parser.parse(data, version["media_type"])
            chunks = chunk_document(parsed, self._config)
            parse_ms = (time.monotonic() - parse_started) * 1000
            embed_started = time.monotonic()
            vectors = validated_embeddings(self._embedding, [item.text for item in chunks])
            embedding_ms = (time.monotonic() - embed_started) * 1000
            if not vectors:
                raise KnowledgeFailure(KnowledgeCode.INCOMPLETE_INDEXING, "No embeddings produced")
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                current = repository.knowledge.get_version(version_id, lock=True)
                if current is None or current["status"] != "STAGED":
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Version state changed")
                repository.knowledge.mark_object_clean(
                    current["object_id"], current["storage_version_id"]
                )
                repository.knowledge.finish_index(
                    current, chunks, vectors, CHUNKER_VERSION, self.embedding_revision,
                    tuple(uuid4() for _ in chunks),
                )
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_VERSION_READY",
                    current["document_id"],
                    {"version_id": str(version_id), "chunk_count": len(chunks),
                     "source_sha256": current["content_hash"]},
                )
            return IngestionTrace(
                principal.business_id, version["document_id"], version_id, version["object_id"],
                version["content_hash"], parsed.parser_version, CHUNKER_VERSION,
                self.embedding_revision, len(chunks), (time.monotonic() - started) * 1000, "READY",
                parse_duration_ms=parse_ms, embedding_duration_ms=embedding_ms,
            )
        except (KnowledgeFailure, psycopg.Error) as exc:
            if isinstance(exc, KnowledgeFailure):
                failure = exc
            else:
                failure = KnowledgeFailure(
                    KnowledgeCode.PERSISTENCE_UNAVAILABLE, "Index persistence unavailable"
                )
            if version is not None and failure.code not in {
                KnowledgeCode.CONFLICT,
                KnowledgeCode.UNAUTHORIZED,
            }:
                self._fail_stage(principal, version_id, version["document_id"], failure.code)
            raise failure from exc

    def publish(
        self, principal: PrincipalContext, document_id: UUID, version_id: UUID,
        expected_document_version: int,
    ) -> int:
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                document = repository.knowledge.get_document(document_id, lock=True)
                version = repository.knowledge.get_version(version_id)
                if document is None or version is None or version["document_id"] != document_id:
                    raise KnowledgeFailure(KnowledgeCode.UNAUTHORIZED, "Document is not accessible")
                if version["status"] != "READY" or version["object_status"] != "CLEAN":
                    raise KnowledgeFailure(
                        KnowledgeCode.INCOMPLETE_INDEXING, "Version is incomplete"
                    )
                total, complete, first, last = repository.knowledge.complete_index_count(version_id)
                if not total or total != complete or first != 0 or last != total - 1:
                    raise KnowledgeFailure(KnowledgeCode.INCOMPLETE_INDEXING, "Index is incomplete")
                if document["version"] != expected_document_version:
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Document version changed")
                if not repository.knowledge.publish(
                    document_id, version_id, expected_document_version
                ):
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Publication race")
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_VERSION_PUBLISHED",
                    document_id, {"version_id": str(version_id), "previous_version_id":
                                  str(document["published_version_id"])
                                  if document["published_version_id"] else None},
                )
                return expected_document_version + 1
        except psycopg.Error as exc:
            raise KnowledgeFailure(
                KnowledgeCode.PERSISTENCE_UNAVAILABLE, "Publication persistence unavailable"
            ) from exc

    def revoke(self, principal: PrincipalContext, document_id: UUID, expected_version: int) -> int:
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                document = repository.knowledge.get_document(document_id, lock=True)
                if document is None:
                    raise KnowledgeFailure(KnowledgeCode.UNAUTHORIZED, "Document is not accessible")
                if document["version"] != expected_version:
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Document version changed")
                if not repository.knowledge.revoke(document_id, expected_version):
                    raise KnowledgeFailure(KnowledgeCode.CONFLICT, "Revocation race")
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_REVOKED", document_id,
                    {"previous_version_id": str(document["published_version_id"])
                     if document["published_version_id"] else None},
                )
                return expected_version + 1
        except psycopg.Error as exc:
            raise KnowledgeFailure(
                KnowledgeCode.PERSISTENCE_UNAVAILABLE, "Revocation persistence unavailable"
            ) from exc

    def retrieve(self, request: RetrievalRequest) -> RetrievalResult:
        started = time.monotonic()
        query = request.query.strip()
        if not query or len(query) > self._config.DEV_RETRIEVAL_MAX_QUERY_CHARS:
            raise KnowledgeFailure(KnowledgeCode.RETRIEVAL_EMPTY, "Invalid or empty query")
        if not 1 <= request.limit <= self._config.DEV_RETRIEVAL_MAX_RESULTS:
            raise KnowledgeFailure(KnowledgeCode.RETRIEVAL_UNAVAILABLE, "Invalid retrieval limit")
        principal = request.principal
        scopes = ("CUSTOMER", "STAFF") if (
            principal.kind is PrincipalKind.USER and principal.staff_role is StaffRole.OWNER
        ) else ("CUSTOMER",)
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_business_access(principal, repository)
            vector = validated_embeddings(self._embedding, (query,))[0]
            with self._database.transaction(principal.business_id) as repository:
                require_business_access(principal, repository)
                candidate_count, rows = repository.knowledge.search(
                    vector, self.embedding_revision, scopes, request.limit
                )
                evidence = []
                for row in rows:
                    # Final current-pointer/ACL check after vector ranking, before content escapes.
                    document = repository.knowledge.get_document(row["document_id"])
                    if (
                        document is None
                        or document["published_version_id"] != row["version_id"]
                        or document["revoked_at"] is not None
                        or document["access_scope"] not in scopes
                        or hashlib.sha256(row["chunk_text"].encode("utf-8")).hexdigest()
                        != row["chunk_text_sha256"]
                    ):
                        continue
                    evidence.append(
                        KnowledgeEvidence(
                            row["document_id"], row["version_id"], row["chunk_id"],
                            row["chunk_text"], 1.0 - float(row["distance"]),
                            row["chunk_locator"],
                            Provenance(
                                SourceType.KNOWLEDGE,
                                f"document:{row['document_id']}/version:{row['version_id']}/"
                                f"chunk:{row['chunk_index']}",
                                str(row["publication_revision"]), principal.business_id,
                                row["updated_at"], ContextStatus.PRESENT,
                                row["access_scope"], row["chunk_text_sha256"],
                            ),
                            source_sha256=row["content_hash"], object_id=row["object_id"],
                            parser_version=row["parser_version"],
                            chunker_version=row["chunker_version"],
                            embedding_revision=row["embedding_revision"],
                        )
                    )
        except psycopg.Error as exc:
            raise KnowledgeFailure(
                KnowledgeCode.RETRIEVAL_UNAVAILABLE, "Knowledge retrieval unavailable"
            ) from exc
        trace = RetrievalTrace(
            principal.business_id, principal.actor_scope,
            hashlib.sha256(query.encode("utf-8")).hexdigest(), self.embedding_revision,
            candidate_count, len(rows) - len(evidence),
            tuple(item.chunk_id for item in evidence),
            tuple(sorted({item.version_id for item in evidence}, key=str)),
            (time.monotonic() - started) * 1000,
            None if evidence else KnowledgeCode.RETRIEVAL_EMPTY,
        )
        return RetrievalResult(tuple(evidence), trace)

    def _fail_stage(
        self, principal: PrincipalContext, version_id: UUID, document_id: UUID,
        code: KnowledgeCode,
    ) -> None:
        try:
            with self._database.transaction(principal.business_id) as repository:
                require_owner(principal, repository)
                repository.knowledge.mark_failed(version_id)
                repository.knowledge.audit(
                    uuid4(), uuid4(), principal.actor_scope, "DOCUMENT_VERSION_FAILED",
                    document_id, {"version_id": str(version_id), "failure_code": code.value},
                )
        except (psycopg.Error, DomainFailure) as exc:
            raise KnowledgeFailure(
                KnowledgeCode.PERSISTENCE_UNAVAILABLE,
                "Cannot persist failed version; publication remains unchanged",
            ) from exc


class KnowledgeContextProvider:
    """Read-only M06 KnowledgeProvider adapter; retrieved bytes remain untrusted data."""

    def __init__(self, service: KnowledgeService) -> None:
        self._service = service

    def retrieve(self, request: ContextRequest) -> KnowledgeContext:
        if not request.include_knowledge:
            return KnowledgeContext(ContextStatus.NOT_REQUESTED)
        try:
            result = self._service.retrieve(
                RetrievalRequest(
                    request.principal, request.question,
                    min(request.limits.DEV_CONTEXT_MAX_RETRIEVED_CHUNKS,
                        self._service._config.DEV_RETRIEVAL_MAX_RESULTS),
                    request.request_id,
                )
            )
        except KnowledgeFailure as exc:
            return KnowledgeContext(ContextStatus.UNAVAILABLE, missing_reason=exc.code.value)
        if not result.evidence:
            return KnowledgeContext(ContextStatus.INSUFFICIENT, missing_reason="RETRIEVAL_EMPTY")
        return KnowledgeContext(ContextStatus.PRESENT, result.evidence)
