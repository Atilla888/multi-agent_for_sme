"""M07 SQL restricted to the approved document/vector model and tenant predicate."""

from typing import Any
from uuid import UUID

import psycopg
from psycopg.types.json import Jsonb

from platform_backend.knowledge.processing import TextChunk


def vector_literal(vector: tuple[float, ...]) -> str:
    return "[" + ",".join(format(value, ".9g") for value in vector) + "]"


class KnowledgeRepository:
    def __init__(self, connection: psycopg.Connection[Any], business_id: UUID) -> None:
        self.connection = connection
        self.business_id = business_id

    def create_document(self, document_id: UUID, title: str, scope: str) -> None:
        self.connection.execute(
            "INSERT INTO documents(business_id,id,title,access_scope,updated_at) "
            "VALUES (%s,%s,%s,%s,now())",
            (self.business_id, document_id, title, scope),
        )

    def get_document(self, document_id: UUID, *, lock: bool = False) -> dict[str, Any] | None:
        suffix = " FOR UPDATE" if lock else ""
        return self.connection.execute(
            "SELECT id,title,access_scope,published_version_id,revoked_at,version "
            "FROM documents WHERE business_id=%s AND id=%s" + suffix,
            (self.business_id, document_id),
        ).fetchone()

    def insert_stage(
        self,
        *,
        document_id: UUID,
        version_id: UUID,
        object_id: UUID,
        bucket: str,
        object_key: str,
        sha256: str,
        size: int,
        media_type: str,
        parser_version: str,
        embedding_revision: str,
        dimension: int,
    ) -> None:
        self.connection.execute(
            "INSERT INTO object_records(business_id,id,bucket,object_key,sha256,media_type,"
            "byte_size,kind,status,updated_at) VALUES (%s,%s,%s,%s,%s,%s,%s,'DOCUMENT',"
            "'QUARANTINED',now())",
            (self.business_id, object_id, bucket, object_key, sha256, media_type, size),
        )
        self.connection.execute(
            "INSERT INTO document_versions(business_id,id,document_id,object_id,content_hash,"
            "parser_version,embedding_model,embedding_dimension,status,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'STAGED',now())",
            (
                self.business_id,
                version_id,
                document_id,
                object_id,
                sha256,
                parser_version,
                embedding_revision,
                dimension,
            ),
        )

    def get_version(self, version_id: UUID, *, lock: bool = False) -> dict[str, Any] | None:
        suffix = " FOR UPDATE OF v" if lock else ""
        return self.connection.execute(
            "SELECT v.id,v.document_id,v.object_id,v.content_hash,v.parser_version,"
            "v.embedding_model,v.embedding_dimension,v.status,o.bucket,o.object_key,"
            "o.byte_size,o.media_type,o.status AS object_status,o.storage_version_id "
            "FROM document_versions v JOIN object_records o ON o.business_id=v.business_id "
            "AND o.id=v.object_id WHERE v.business_id=%s AND v.id=%s" + suffix,
            (self.business_id, version_id),
        ).fetchone()

    def mark_object_clean(self, object_id: UUID, storage_version_id: str | None) -> None:
        self.connection.execute(
            "UPDATE object_records SET status='CLEAN',storage_version_id=%s,"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s "
            "AND status='QUARANTINED'",
            (storage_version_id, self.business_id, object_id),
        )

    def mark_failed(self, version_id: UUID) -> None:
        self.connection.execute(
            "UPDATE document_versions SET status='FAILED',version=version+1,updated_at=now() "
            "WHERE business_id=%s AND id=%s AND status='STAGED'",
            (self.business_id, version_id),
        )

    def finish_index(
        self,
        version: dict[str, Any],
        chunks: tuple[TextChunk, ...],
        vectors: tuple[tuple[float, ...], ...],
        chunker_version: str,
        embedding_revision: str,
        embedding_ids: tuple[UUID, ...],
    ) -> None:
        for chunk, vector, embedding_id in zip(chunks, vectors, embedding_ids, strict=True):
            self.connection.execute(
                "INSERT INTO embeddings(business_id,id,document_id,document_version_id,"
                "chunk_index,chunk_text,embedding_dimension,embedding,chunk_locator,"
                "chunk_text_sha256,chunker_version,embedding_revision) "
                "VALUES (%s,%s,%s,%s,%s,%s,%s,%s::vector,%s,%s,%s,%s)",
                (
                    self.business_id,
                    embedding_id,
                    version["document_id"],
                    version["id"],
                    chunk.index,
                    chunk.text,
                    len(vector),
                    vector_literal(vector),
                    chunk.locator,
                    chunk.sha256,
                    chunker_version,
                    embedding_revision,
                ),
            )
        self.connection.execute(
            "UPDATE document_versions SET status='READY',version=version+1,updated_at=now() "
            "WHERE business_id=%s AND id=%s AND status='STAGED'",
            (self.business_id, version["id"]),
        )

    def complete_index_count(self, version_id: UUID) -> tuple[int, int, int | None, int | None]:
        row = self.connection.execute(
            "SELECT count(*) AS total,count(*) FILTER (WHERE chunk_locator IS NOT NULL "
            "AND chunk_text_sha256 IS NOT NULL AND chunker_version IS NOT NULL "
            "AND embedding_revision=v.embedding_model "
            "AND e.embedding_dimension=v.embedding_dimension) AS complete,"
            "min(chunk_index) AS first,max(chunk_index) AS last "
            "FROM embeddings e JOIN document_versions v ON v.business_id=e.business_id "
            "AND v.id=e.document_version_id WHERE e.business_id=%s "
            "AND e.document_version_id=%s",
            (self.business_id, version_id),
        ).fetchone()
        if row is None:
            raise RuntimeError("Index count query returned no row")
        return int(row["total"]), int(row["complete"]), row["first"], row["last"]

    def publish(self, document_id: UUID, version_id: UUID, expected_version: int) -> bool:
        row = self.connection.execute(
            "UPDATE documents SET published_version_id=%s,revoked_at=NULL,"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s "
            "AND version=%s RETURNING id",
            (version_id, self.business_id, document_id, expected_version),
        ).fetchone()
        return row is not None

    def revoke(self, document_id: UUID, expected_version: int) -> bool:
        row = self.connection.execute(
            "UPDATE documents SET published_version_id=NULL,revoked_at=now(),"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s "
            "AND version=%s RETURNING id",
            (self.business_id, document_id, expected_version),
        ).fetchone()
        return row is not None

    def audit(
        self,
        audit_id: UUID,
        correlation_id: UUID,
        actor_scope: str,
        event: str,
        document_id: UUID,
        detail: dict[str, Any],
    ) -> None:
        self.connection.execute(
            "INSERT INTO audit_logs(business_id,id,correlation_id,actor_scope,event_type,"
            "resource_type,resource_id,detail) VALUES (%s,%s,%s,%s,%s,'DOCUMENT',%s,%s)",
            (
                self.business_id,
                audit_id,
                correlation_id,
                actor_scope,
                event,
                document_id,
                Jsonb(detail),
            ),
        )

    def search(
        self, vector: tuple[float, ...], revision: str, scopes: tuple[str, ...], limit: int
    ) -> tuple[int, list[dict[str, Any]]]:
        # MATERIALIZED forces tenant/current-publication/ACL selection ahead of ranking.
        base = (
            "FROM embeddings e JOIN document_versions v ON v.business_id=e.business_id "
            "AND v.document_id=e.document_id AND v.id=e.document_version_id "
            "JOIN documents d ON d.business_id=e.business_id AND d.id=e.document_id "
            "JOIN object_records o ON o.business_id=v.business_id AND o.id=v.object_id "
            "WHERE e.business_id=%s AND v.business_id=%s AND d.business_id=%s "
            "AND o.business_id=%s AND d.published_version_id=v.id "
            "AND d.revoked_at IS NULL AND v.status='READY' AND o.status='CLEAN' "
            "AND d.access_scope=ANY(%s) AND v.embedding_model=%s "
            "AND e.embedding_revision=%s AND e.embedding_dimension=%s "
            "AND v.embedding_dimension=%s AND e.chunk_locator IS NOT NULL "
            "AND e.chunk_text_sha256 IS NOT NULL AND e.chunker_version IS NOT NULL"
        )
        params = (
            self.business_id,
            self.business_id,
            self.business_id,
            self.business_id,
            list(scopes),
            revision,
            revision,
            len(vector),
            len(vector),
        )
        candidate = self.connection.execute("SELECT count(*) AS n " + base, params).fetchone()
        rows = self.connection.execute(
            "WITH eligible AS MATERIALIZED (SELECT e.id AS chunk_id,e.chunk_index,"
            "e.chunk_text,e.chunk_locator,e.chunk_text_sha256,e.chunker_version,"
            "e.embedding_revision,e.embedding,d.id AS document_id,d.access_scope,"
            "d.version AS publication_revision,v.id AS version_id,v.content_hash,"
            "v.parser_version,v.embedding_model,v.embedding_dimension,v.updated_at,"
            "o.id AS object_id " + base + ") "
            "SELECT chunk_id,chunk_index,chunk_text,chunk_locator,chunk_text_sha256,"
            "chunker_version,embedding_revision,document_id,access_scope,"
            "publication_revision,version_id,content_hash,parser_version,embedding_model,"
            "embedding_dimension,updated_at,object_id,embedding <=> %s::vector AS distance "
            "FROM eligible ORDER BY distance ASC,chunk_id ASC LIMIT %s",
            (*params, vector_literal(vector), limit),
        ).fetchall()
        if candidate is None:
            raise RuntimeError("Candidate count query returned no row")
        return int(candidate["n"]), rows
