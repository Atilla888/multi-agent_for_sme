"""Validated HTTP/OIDC configuration; no domain policy lives here."""

from functools import lru_cache
from typing import Any
from urllib.parse import urlparse

import httpx
from pydantic import Field, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from platform_backend.application.queries import QueryService
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.oidc import OidcConfig, OidcVerifier, StaffIdentityService


def trusted_url(value: str, allow_local_http: bool) -> str:
    parsed = urlparse(value)
    local = parsed.hostname in {"localhost", "127.0.0.1", "keycloak"}
    if (
        not parsed.netloc
        or parsed.username
        or parsed.password
        or parsed.query
        or parsed.fragment
        or not (
            parsed.scheme == "https" or (allow_local_http and local and parsed.scheme == "http")
        )
    ):
        raise ValueError("Integration URL requires HTTPS or explicitly permitted local HTTP")
    return value.rstrip("/")


class HttpSettings(BaseSettings):
    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    database_url: str = Field(min_length=1, alias="DATABASE_URL")
    issuer: str = Field(min_length=1, alias="OIDC_ISSUER")
    audience: str = Field(min_length=1, alias="OIDC_AUDIENCE")
    jwks_transport_url: str | None = Field(default=None, alias="OIDC_JWKS_TRANSPORT_URL")
    allow_local_http: bool = Field(default=False, alias="OIDC_ALLOW_LOCAL_HTTP")
    cors_origins: str = Field(default="", alias="HTTP_CORS_ORIGINS")

    @model_validator(mode="after")
    def validate_urls(self) -> "HttpSettings":
        trusted_url(self.issuer, self.allow_local_http)
        if self.jwks_transport_url:
            trusted_url(self.jwks_transport_url, self.allow_local_http)
        for origin in self.origins:
            parsed = urlparse(trusted_url(origin, self.allow_local_http))
            if parsed.path not in {"", "/"}:
                raise ValueError("CORS requires exact origins without paths")
        return self

    @property
    def origins(self) -> list[str]:
        return [
            origin.strip().rstrip("/") for origin in self.cors_origins.split(",") if origin.strip()
        ]


class HttpServices:
    def __init__(self, settings: HttpSettings) -> None:
        self.database = PostgresDatabase(settings.database_url)
        self.queries = QueryService(self.database)
        config = OidcConfig(
            settings.issuer, settings.audience, 60, 5, allow_local_http=settings.allow_local_http
        )

        def fetch_jwks() -> dict[str, Any]:
            # A fixed operator-configured internal transport, never a request-controlled URL.
            try:
                with httpx.Client(timeout=5, follow_redirects=False) as client:
                    response = client.get(settings.jwks_transport_url or config.jwks_url)
                    response.raise_for_status()
                    if len(response.content) > 65_536:
                        raise ValueError("JWKS response is too large")
                    document = response.json()
                    if not isinstance(document, dict):
                        raise ValueError("Invalid JWKS response")
                    return document
            except httpx.HTTPError as exc:
                raise OSError("Identity provider is unavailable") from exc

        self.verifier = OidcVerifier(config, fetch_jwks=fetch_jwks)
        self.identity = StaffIdentityService(self.database, self.verifier)


@lru_cache(maxsize=1)
def configured_services() -> HttpServices:
    return HttpServices(HttpSettings.model_validate({}))
