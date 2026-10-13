"""Pure, bounded UTF-8 text parser and deterministic development chunker."""

import hashlib
from dataclasses import dataclass
from typing import Protocol

from platform_backend.knowledge.contracts import DevKnowledgeConfig, KnowledgeCode, KnowledgeFailure

PARSER_VERSION = "text-plain-utf8-v1"
CHUNKER_VERSION = "char-window-line-locator-v1"


@dataclass(frozen=True)
class ParsedDocument:
    text: str
    parser_version: str


@dataclass(frozen=True)
class TextChunk:
    index: int
    text: str
    locator: str
    sha256: str


class DocumentParser(Protocol):
    version: str

    def parse(self, data: bytes, media_type: str) -> ParsedDocument: ...


class PlainTextParser:
    version = PARSER_VERSION

    def parse(self, data: bytes, media_type: str) -> ParsedDocument:
        if media_type != "text/plain":
            raise KnowledgeFailure(KnowledgeCode.UNSUPPORTED_TYPE, "Unsupported document type")
        if not data:
            raise KnowledgeFailure(KnowledgeCode.EMPTY_CONTENT, "Document is empty")
        try:
            text = data.decode("utf-8-sig", errors="strict")
        except UnicodeDecodeError as exc:
            raise KnowledgeFailure(KnowledgeCode.PARSE_FAILURE, "Invalid UTF-8 document") from exc
        if "\x00" in text or any(ord(ch) < 32 and ch not in "\n\r\t" for ch in text):
            raise KnowledgeFailure(KnowledgeCode.PARSE_FAILURE, "Unsafe text control bytes")
        text = text.replace("\r\n", "\n").replace("\r", "\n")
        if not text.strip():
            raise KnowledgeFailure(KnowledgeCode.EMPTY_CONTENT, "Document is empty")
        return ParsedDocument(text, self.version)


def chunk_document(parsed: ParsedDocument, config: DevKnowledgeConfig) -> tuple[TextChunk, ...]:
    text = parsed.text
    size = config.DEV_CHUNK_MAX_CHARS
    overlap = config.DEV_CHUNK_OVERLAP_CHARS
    chunks: list[TextChunk] = []
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        if end < len(text):
            split = text.rfind("\n", start + size // 2, end)
            if split > start:
                end = split + 1
        chunk_text = text[start:end].strip()
        if chunk_text:
            first_line = text.count("\n", 0, start) + 1
            last_line = text.count("\n", 0, end) + 1
            chunks.append(
                TextChunk(
                    len(chunks),
                    chunk_text,
                    f"line:{first_line}-{last_line};char:{start}-{end}",
                    hashlib.sha256(chunk_text.encode("utf-8")).hexdigest(),
                )
            )
        if end == len(text):
            break
        start = max(start + 1, end - overlap)
    if not chunks:
        raise KnowledgeFailure(KnowledgeCode.EMPTY_CONTENT, "Document is empty")
    return tuple(chunks)
