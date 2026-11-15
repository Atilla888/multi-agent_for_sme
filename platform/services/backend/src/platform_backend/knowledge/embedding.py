"""Versioned local embedding port with strict shape and finite-value validation."""

import math
from collections.abc import Sequence
from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import TimeoutError as FutureTimeout
from typing import Protocol

from platform_backend.knowledge.contracts import KnowledgeCode, KnowledgeFailure


class EmbeddingProvider(Protocol):
    provider: str
    model: str
    version: str
    dimension: int

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]: ...


def embedding_revision(provider: EmbeddingProvider) -> str:
    return f"{provider.provider}/{provider.model}@{provider.version}"


def validated_embeddings(
    provider: EmbeddingProvider, texts: Sequence[str]
) -> tuple[tuple[float, ...], ...]:
    try:
        result = provider.embed(texts)
    except KnowledgeFailure:
        raise
    except Exception as exc:
        raise KnowledgeFailure(
            KnowledgeCode.EMBEDDING_UNAVAILABLE, "Embedding unavailable"
        ) from exc
    if len(result) != len(texts):
        raise KnowledgeFailure(
            KnowledgeCode.EMBEDDING_DIMENSION_MISMATCH, "Embedding count mismatch"
        )
    checked = []
    for vector in result:
        if (
            len(vector) != provider.dimension
            or not all(math.isfinite(float(x)) for x in vector)
            or math.sqrt(sum(float(x) * float(x) for x in vector)) == 0
        ):
            raise KnowledgeFailure(
                KnowledgeCode.EMBEDDING_DIMENSION_MISMATCH, "Embedding dimension/value mismatch"
            )
        checked.append(tuple(float(x) for x in vector))
    return tuple(checked)


class LocalFastEmbed:
    """DEVELOPMENT local ONNX model; no document text is sent to an API."""

    provider = "fastembed"
    model = "BAAI/bge-small-en-v1.5"
    version = "fastembed-0.8.1/qdrant-onnx-aa8f8b060edb00e03bfdd08813a2949946c8ba55"
    dimension = 384

    def __init__(
        self, *, cache_dir: str = "/opt/fastembed-cache", timeout_seconds: float = 120.0
    ) -> None:
        self._cache_dir = cache_dir
        self._timeout = timeout_seconds
        self._model: object | None = None

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        def run() -> list[list[float]]:
            from fastembed import TextEmbedding

            if self._model is None:
                self._model = TextEmbedding(
                    model_name=self.model, cache_dir=self._cache_dir, local_files_only=True
                )
            return [vector.tolist() for vector in self._model.embed(list(texts))]  # type: ignore[attr-defined]

        executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="local-embedding")
        future = executor.submit(run)
        try:
            return future.result(timeout=self._timeout)
        except FutureTimeout as exc:
            future.cancel()
            raise KnowledgeFailure(
                KnowledgeCode.EMBEDDING_UNAVAILABLE, "Embedding timed out"
            ) from exc
        finally:
            executor.shutdown(wait=False, cancel_futures=True)
