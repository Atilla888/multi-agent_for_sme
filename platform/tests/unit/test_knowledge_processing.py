"""Pure M07 parser/chunker/embedding contract tests; fake vectors are TEST ONLY."""

from collections.abc import Sequence

import pytest

from platform_backend.knowledge.contracts import DevKnowledgeConfig, KnowledgeCode, KnowledgeFailure
from platform_backend.knowledge.embedding import embedding_revision, validated_embeddings
from platform_backend.knowledge.processing import PlainTextParser, chunk_document


class FakeTestEmbedding:
    provider = "FAKE_TEST_ONLY"
    model = "keyword-mechanics"
    version = "v1"
    dimension = 4

    def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
        vectors = []
        for text in texts:
            lowered = text.lower()
            vectors.append(
                [
                    float("refund" in lowered or "return" in lowered),
                    float("garden" in lowered),
                    float("order" in lowered or "stock" in lowered),
                    0.01,
                ]
            )
        return vectors


def test_plain_text_utf8_normalization_and_locator() -> None:
    parsed = PlainTextParser().parse(b"First\r\nSecond", "text/plain")
    chunks = chunk_document(
        parsed, DevKnowledgeConfig(DEV_CHUNK_MAX_CHARS=6, DEV_CHUNK_OVERLAP_CHARS=0)
    )
    assert parsed.text == "First\nSecond"
    assert chunks[0].locator.startswith("line:1-")
    assert chunks[0].sha256 != chunks[1].sha256


@pytest.mark.parametrize(
    ("data", "media_type", "code"),
    [
        (b"hello", "text/html", KnowledgeCode.UNSUPPORTED_TYPE),
        (b"", "text/plain", KnowledgeCode.EMPTY_CONTENT),
        (b"  \n", "text/plain", KnowledgeCode.EMPTY_CONTENT),
        (b"\xff", "text/plain", KnowledgeCode.PARSE_FAILURE),
        (b"hello\x00world", "text/plain", KnowledgeCode.PARSE_FAILURE),
    ],
)
def test_parser_rejects_unsupported_empty_and_malformed(
    data: bytes, media_type: str, code: KnowledgeCode
) -> None:
    with pytest.raises(KnowledgeFailure) as failure:
        PlainTextParser().parse(data, media_type)
    assert failure.value.code is code


def test_chunking_is_deterministic_with_overlap() -> None:
    parsed = PlainTextParser().parse(b"alpha beta gamma delta epsilon", "text/plain")
    config = DevKnowledgeConfig(DEV_CHUNK_MAX_CHARS=12, DEV_CHUNK_OVERLAP_CHARS=3)
    assert chunk_document(parsed, config) == chunk_document(parsed, config)
    assert [item.index for item in chunk_document(parsed, config)] == list(
        range(len(chunk_document(parsed, config)))
    )


def test_embedding_shape_revision_and_finite_values() -> None:
    provider = FakeTestEmbedding()
    vectors = validated_embeddings(provider, ("refund", "garden"))
    assert len(vectors) == 2 and len(vectors[0]) == 4
    assert embedding_revision(provider) == "FAKE_TEST_ONLY/keyword-mechanics@v1"


@pytest.mark.parametrize("bad", [[1.0], [float("nan")] * 4, [0.0] * 4])
def test_bad_embedding_dimension_finite_or_zero_rejected(bad: list[float]) -> None:
    class Bad(FakeTestEmbedding):
        def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
            return [bad for _ in texts]

    with pytest.raises(KnowledgeFailure) as failure:
        validated_embeddings(Bad(), ("query",))
    assert failure.value.code is KnowledgeCode.EMBEDDING_DIMENSION_MISMATCH


def test_embedding_provider_error_is_typed() -> None:
    class Broken(FakeTestEmbedding):
        def embed(self, texts: Sequence[str]) -> Sequence[Sequence[float]]:
            raise RuntimeError("provider unavailable")

    with pytest.raises(KnowledgeFailure) as failure:
        validated_embeddings(Broken(), ("query",))
    assert failure.value.code is KnowledgeCode.EMBEDDING_UNAVAILABLE


def test_development_overlap_must_be_smaller_than_chunk() -> None:
    with pytest.raises(ValueError):
        DevKnowledgeConfig(DEV_CHUNK_MAX_CHARS=10, DEV_CHUNK_OVERLAP_CHARS=10)
