"""Public development diagnostic: real local model + MinIO + PostgreSQL/pgvector."""

import os

from platform_backend.knowledge.contracts import RetrievalRequest
from platform_backend.knowledge.embedding import LocalFastEmbed
from platform_backend.knowledge.service import KnowledgeService
from platform_backend.knowledge.storage import MinioPrivateStore
from platform_backend.repositories.postgres import PostgresDatabase
from tests.support import seed_tenant


def test_local_model_ranks_public_development_refund_example(admin_connection, runtime_url):
    tenant = seed_tenant(admin_connection)
    owner = tenant.context().principal
    store = MinioPrivateStore(
        os.environ["MINIO_ENDPOINT"],
        os.environ["MINIO_APP_USER"],
        os.environ["MINIO_APP_PASSWORD"],
        os.environ["MINIO_APP_BUCKET"],
    )
    service = KnowledgeService(PostgresDatabase(runtime_url), store, LocalFastEmbed())
    relevant = service.create_document(owner, "Returns", "CUSTOMER")
    unrelated = service.create_document(owner, "Garden", "CUSTOMER")
    for document, text in (
        (relevant, "Customers can return a purchase for a refund within 30 days with a receipt."),
        (unrelated, "Garden irrigation equipment needs regular seasonal maintenance."),
    ):
        stage = service.stage_version(owner, document, text.encode(), "text/plain")
        ready = service.process_version(owner, stage.version_id)
        assert ready.chunk_count == 1 and ready.status == "READY"
        service.publish(owner, document, stage.version_id, 1)
    result = service.retrieve(RetrievalRequest(owner, "How can I return a purchase for a refund?"))
    assert result.evidence[0].document_id == relevant
    assert result.evidence[0].similarity > result.evidence[1].similarity
    assert result.trace.candidate_count == 2
