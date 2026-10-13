"""Private MinIO object adapter; no public or permanent URL API."""

from io import BytesIO
from typing import Protocol

from minio import Minio

from platform_backend.knowledge.contracts import KnowledgeCode, KnowledgeFailure


class PrivateObjectStore(Protocol):
    bucket: str

    def put(self, key: str, data: bytes, media_type: str) -> str | None: ...

    def read_verified(self, key: str, size: int) -> bytes: ...


class MinioPrivateStore:
    def __init__(
        self, endpoint: str, access_key: str, secret_key: str, bucket: str, *, secure: bool = False
    ) -> None:
        if not endpoint or not access_key or not secret_key or not bucket:
            raise ValueError("MinIO endpoint, app credentials and bucket are required")
        self.bucket = bucket
        self._client = Minio(endpoint, access_key=access_key, secret_key=secret_key, secure=secure)

    def put(self, key: str, data: bytes, media_type: str) -> str | None:
        try:
            response = self._client.put_object(
                self.bucket, key, BytesIO(data), len(data), content_type=media_type
            )
            return response.version_id
        except Exception as exc:
            raise KnowledgeFailure(KnowledgeCode.OBJECT_UNAVAILABLE, "Object upload unavailable") from exc

    def read_verified(self, key: str, size: int) -> bytes:
        try:
            response = self._client.get_object(self.bucket, key)
            try:
                data = response.read(size + 1)
            finally:
                response.close()
                response.release_conn()
            if len(data) != size:
                raise KnowledgeFailure(KnowledgeCode.OBJECT_INTEGRITY, "Object size mismatch")
            return data
        except KnowledgeFailure:
            raise
        except Exception as exc:
            raise KnowledgeFailure(KnowledgeCode.OBJECT_UNAVAILABLE, "Object read unavailable") from exc
