"""Keycloak-compatible staff access-token verification and membership resolution."""

import json
import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import Any
from urllib.parse import urlparse
from urllib.request import Request, urlopen
from uuid import UUID

import jwt

from platform_backend.domain.context import PrincipalContext, PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.repositories.postgres import PostgresDatabase

JWKS = dict[str, Any]


@dataclass(frozen=True)
class OidcConfig:
    issuer: str
    audience: str
    cache_seconds: int
    timeout_seconds: float
    allow_local_http: bool = False
    algorithms: tuple[str, ...] = ("RS256",)

    def __post_init__(self) -> None:
        parsed = urlparse(self.issuer)
        local_http = (
            self.allow_local_http and parsed.scheme == "http"
            and parsed.hostname in {"keycloak", "localhost", "127.0.0.1"}
        )
        if (
            not self.audience or not parsed.netloc or (parsed.scheme != "https" and not local_http)
            or self.issuer.endswith("/") or self.cache_seconds < 1
            or self.timeout_seconds <= 0 or self.algorithms != ("RS256",)
        ):
            raise ValueError("OIDC verifier requires a trusted issuer and explicit settings")

    @property
    def jwks_url(self) -> str:
        return f"{self.issuer}/protocol/openid-connect/certs"


class OidcVerifier:
    def __init__(
        self, config: OidcConfig, fetch_jwks: Callable[[], JWKS] | None = None
    ) -> None:
        self._config = config
        self._fetch_jwks = fetch_jwks or self._fetch_from_issuer
        self._cached: JWKS | None = None
        self._expires_at = 0.0

    def _fetch_from_issuer(self) -> JWKS:
        # The URL is derived only from scheme-validated, trusted issuer configuration.
        request = Request(  # noqa: S310
            self._config.jwks_url, headers={"Accept": "application/json"}
        )
        with urlopen(request, timeout=self._config.timeout_seconds) as response:  # noqa: S310
            if response.geturl() != self._config.jwks_url:
                raise ValueError("JWKS redirect is not permitted")
            raw = response.read(65_537)
            if len(raw) > 65_536:
                raise ValueError("JWKS document is too large")
        document = json.loads(raw)
        if not isinstance(document, dict):
            raise ValueError("Invalid JWKS document")
        return document

    def _key(self, kid: str, algorithm: str) -> Any:
        for refresh in (False, True):
            if refresh or self._cached is None or time.monotonic() >= self._expires_at:
                self._cached = self._fetch_jwks()
                self._expires_at = time.monotonic() + self._config.cache_seconds
            keys = self._cached.get("keys", []) if isinstance(self._cached, dict) else []
            if not isinstance(keys, list) or len(keys) > 100:
                raise ValueError("Invalid JWKS keys")
            for item in keys:
                if not isinstance(item, dict) or item.get("kid") != kid:
                    continue
                if (
                    item.get("kty") != "RSA" or item.get("use", "sig") != "sig"
                    or item.get("alg", algorithm) != algorithm
                ):
                    raise ValueError("JWKS key is not an allowed signing key")
                return jwt.PyJWK.from_dict(item, algorithm=algorithm).key
        raise ValueError("Signing key is unavailable")

    def verify_access_token(self, token: str) -> dict[str, Any]:
        try:
            header = jwt.get_unverified_header(token)
            algorithm, kid = header.get("alg"), header.get("kid")
            if algorithm not in self._config.algorithms or not isinstance(kid, str) or not kid:
                raise ValueError("Unsupported JWT header")
            key = self._key(kid, algorithm)
            claims = jwt.decode(
                token, key=key, algorithms=list(self._config.algorithms),
                issuer=self._config.issuer, audience=self._config.audience,
                options={"require": ["iss", "aud", "sub", "iat", "exp"]},
            )
            if claims.get("typ") != "Bearer" or not isinstance(claims.get("sub"), str):
                raise ValueError("Only staff access tokens are accepted")
            if not claims["sub"] or len(claims["sub"]) > 200:
                raise ValueError("Invalid subject")
            return claims
        except (jwt.PyJWTError, ValueError, TypeError, OSError) as exc:
            raise DomainFailure(ErrorCode.UNAUTHENTICATED, "Invalid access token") from exc


class StaffIdentityService:
    def __init__(self, database: PostgresDatabase, verifier: OidcVerifier) -> None:
        self._database = database
        self._verifier = verifier

    def resolve(self, access_token: str, business_id: UUID) -> PrincipalContext:
        claims = self._verifier.verify_access_token(access_token)
        with self._database.transaction(business_id) as repository:
            user_id = repository.lookup_app_user_id(claims["iss"], claims["sub"])
            if user_id is None:
                raise DomainFailure(ErrorCode.FORBIDDEN, "Staff account is not provisioned")
            membership = repository.get_membership_role(user_id)
        if membership in {StaffRole.OWNER.value, StaffRole.OPERATOR.value}:
            role = StaffRole(membership)
        else:
            realm_access = claims.get("realm_access", {})
            roles = realm_access.get("roles", []) if isinstance(realm_access, dict) else []
            if isinstance(roles, list) and "platform_admin" in roles:
                role = StaffRole.PLATFORM_ADMIN
            else:
                raise DomainFailure(ErrorCode.FORBIDDEN, "Business membership is required")
        return PrincipalContext(
            kind=PrincipalKind.USER, subject_id=user_id, business_id=business_id,
            staff_role=role,
        )
