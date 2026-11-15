"""Live local-Keycloak OIDC smoke test; synthetic realm is removed afterward."""

import json
import os
import secrets
from urllib.error import HTTPError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from uuid import UUID, uuid4

import pytest

from platform_backend.domain.context import StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.oidc import OidcConfig, OidcVerifier, StaffIdentityService
from tests.keycloak_admin import KeycloakTestAdmin
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]
BASE = "http://keycloak:8080"


def _http(
    path: str,
    *,
    method: str = "GET",
    body: dict | None = None,
    bearer: str | None = None,
    form: bool = False,
    timeout: float = 10,
    allowed_statuses: tuple[int, ...] = (),
) -> tuple[int, dict, str | None]:
    headers = {"Accept": "application/json"}
    data = None
    if body is not None:
        if form:
            headers["Content-Type"] = "application/x-www-form-urlencoded"
            data = urlencode(body).encode()
        else:
            headers["Content-Type"] = "application/json"
            data = json.dumps(body).encode()
    if bearer:
        headers["Authorization"] = f"Bearer {bearer}"
    request = Request(BASE + path, data=data, headers=headers, method=method)  # noqa: S310
    try:
        with urlopen(request, timeout=timeout) as response:  # noqa: S310
            raw = response.read()
            return response.status, json.loads(raw) if raw else {}, response.headers.get("Location")
    except HTTPError as exc:
        if exc.code in allowed_statuses:
            exc.close()
            return exc.code, {}, exc.headers.get("Location")
        try:
            error = json.loads(exc.read())
            code = error.get("error", "unspecified")
            description = str(error.get("error_description", ""))[:120]
        except (ValueError, AttributeError):
            code = "unspecified"
            description = ""
        raise AssertionError(
            f"Keycloak endpoint {path}: HTTP {exc.code}, error={code}, detail={description}"
        ) from None


def test_live_keycloak_token_jwks_membership_and_wrong_audience(
    admin_connection, runtime_url: str
) -> None:
    admin_user = os.environ["KEYCLOAK_SMOKE_ADMIN_USER"]
    admin_password = os.environ["KEYCLOAK_SMOKE_ADMIN_PASSWORD"]
    _, admin_grant, _ = _http(
        "/realms/master/protocol/openid-connect/token",
        method="POST",
        form=True,
        body={
            "grant_type": "password",
            "client_id": "admin-cli",
            "username": admin_user,
            "password": admin_password,
        },
    )
    admin_token = admin_grant["access_token"]
    admin = KeycloakTestAdmin(_http, admin_token)
    realm = f"m05-smoke-{uuid4().hex}"
    issuer = f"{BASE}/realms/{realm}"
    created = False
    try:
        admin.create_realm(realm)
        created = True
        status, _, _ = admin.request(
            f"/admin/realms/{realm}/clients",
            method="POST",
            body={
                "clientId": "business-api",
                "enabled": True,
                "publicClient": True,
                "directAccessGrantsEnabled": True,
                "protocol": "openid-connect",
                "protocolMappers": [
                    {
                        "name": "business-api-audience",
                        "protocol": "openid-connect",
                        "protocolMapper": "oidc-audience-mapper",
                        "consentRequired": False,
                        "config": {
                            "included.client.audience": "business-api",
                            "access.token.claim": "true",
                            "id.token.claim": "false",
                        },
                    }
                ],
            },
        )
        assert status == 201
        password = secrets.token_urlsafe(32)
        username = f"smoke-{uuid4().hex}"
        status, _, location = admin.request(
            f"/admin/realms/{realm}/users",
            method="POST",
            body={
                "username": username,
                "enabled": True,
                "email": f"{username}@example.invalid",
                "emailVerified": True,
                "firstName": "Engineering",
                "lastName": "Smoke",
                "requiredActions": [],
                "credentials": [{"type": "password", "value": password, "temporary": False}],
            },
        )
        assert status == 201 and location is not None
        keycloak_subject = location.rsplit("/", 1)[-1]
        UUID(keycloak_subject)
        _, grant, _ = _http(
            f"/realms/{realm}/protocol/openid-connect/token",
            method="POST",
            form=True,
            body={
                "grant_type": "password",
                "client_id": "business-api",
                "username": username,
                "password": password,
            },
        )
        token = grant["access_token"]
        verifier = OidcVerifier(
            OidcConfig(
                issuer,
                "business-api",
                cache_seconds=60,
                timeout_seconds=5,
                allow_local_http=True,
            )
        )
        claims = verifier.verify_access_token(token)
        assert claims["sub"] == keycloak_subject and claims["iss"] == issuer
        fixture = seed_tenant(admin_connection)
        with admin_connection.cursor() as cursor:
            cursor.execute(
                "UPDATE app_users SET issuer=%s,subject=%s,updated_at=now() WHERE id=%s",
                (issuer, keycloak_subject, fixture.user_id),
            )
        principal = StaffIdentityService(PostgresDatabase(runtime_url), verifier).resolve(
            token, fixture.business_id
        )
        assert principal.subject_id == fixture.user_id
        assert principal.staff_role is StaffRole.OWNER
        with pytest.raises(DomainFailure) as rejected:
            OidcVerifier(
                OidcConfig(
                    issuer,
                    "wrong-audience",
                    cache_seconds=60,
                    timeout_seconds=5,
                    allow_local_http=True,
                )
            ).verify_access_token(token)
        assert rejected.value.code is ErrorCode.UNAUTHENTICATED
    finally:
        if created:
            admin.delete_realm(realm)
