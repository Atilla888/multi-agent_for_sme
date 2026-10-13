"""Opaque, tenant/filter-bound signed product-page cursors."""

import base64
import hashlib
import hmac
import json
from uuid import UUID

from platform_backend.domain.errors import DomainFailure, ErrorCode


def _b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _unb64(value: str) -> bytes:
    return base64.urlsafe_b64decode(value + "=" * (-len(value) % 4))


class ProductCursor:
    def __init__(self, secret: bytes) -> None:
        if len(secret) < 32:
            raise ValueError("Cursor signing key must be at least 32 bytes")
        self._secret = secret

    @staticmethod
    def _query_hash(query: str) -> str:
        return hashlib.sha256(query.strip().lower().encode()).hexdigest()

    def encode(self, business_id: UUID, query: str, name: str, product_id: UUID) -> str:
        payload = json.dumps(
            {"b": str(business_id), "q": self._query_hash(query), "n": name, "i": str(product_id)},
            sort_keys=True,
            separators=(",", ":"),
        ).encode()
        signature = hmac.new(self._secret, payload, hashlib.sha256).digest()
        return f"{_b64(payload)}.{_b64(signature)}"

    def decode(self, token: str, business_id: UUID, query: str) -> tuple[str, UUID]:
        try:
            left, right = token.split(".", 1)
            payload, signature = _unb64(left), _unb64(right)
            expected = hmac.new(self._secret, payload, hashlib.sha256).digest()
            if not hmac.compare_digest(signature, expected):
                raise ValueError("invalid signature")
            parsed = json.loads(payload)
            if parsed["b"] != str(business_id) or parsed["q"] != self._query_hash(query):
                raise ValueError("cursor scope mismatch")
            name = parsed["n"]
            if not isinstance(name, str) or len(name) > 500:
                raise ValueError("invalid name")
            return name, UUID(parsed["i"])
        except (KeyError, ValueError, TypeError, UnicodeError) as exc:
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid product cursor") from exc
