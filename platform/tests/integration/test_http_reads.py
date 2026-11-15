"""Real DB and signed OIDC transport tests, including every public read boundary."""

from datetime import UTC, datetime, timedelta
from uuid import uuid4

import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from fastapi.testclient import TestClient

from platform_backend.api.app import create_app
from platform_backend.api.configuration import HttpServices, HttpSettings, trusted_url
from platform_backend.application.orders import OrderService
from platform_backend.domain.models import OrderLineRequest
from platform_backend.security.oidc import StaffIdentityService
from tests.security.test_identity import _b64, token, verifier
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


@pytest.fixture()
def http_case(admin_connection, runtime_url, monkeypatch):
    tenant = seed_tenant(admin_connection)
    foreign = seed_tenant(admin_connection)
    private = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public = private.public_key().public_numbers()
    jwks = {
        "keys": [
            {
                "kty": "RSA",
                "kid": "engineering-key",
                "use": "sig",
                "alg": "RS256",
                "n": _b64(public.n),
                "e": _b64(public.e),
            }
        ]
    }
    http = HttpServices(
        HttpSettings(
            DATABASE_URL=runtime_url,
            OIDC_ISSUER="https://issuer.example.invalid",
            OIDC_AUDIENCE="business-api",
        )
    )
    http.verifier = verifier(jwks)
    http.identity = StaffIdentityService(http.database, http.verifier)
    order = OrderService(http.database).create_order(
        tenant.context(operation_key="http-read-order"),
        tenant.customer_id,
        (OrderLineRequest(tenant.product_id, "1.0000", 1),),
    )
    monkeypatch.setenv("OIDC_ALLOW_LOCAL_HTTP", "true")
    monkeypatch.setenv("HTTP_CORS_ORIGINS", "http://127.0.0.1:3100")
    client = TestClient(create_app(http))
    headers = {
        "Authorization": f"Bearer {token(private, tenant.user_id)}",
        "X-Business-ID": str(tenant.business_id),
    }
    paths = [
        "/me",
        "/products?q=Synthetic",
        f"/products/{tenant.product_id}",
        f"/inventory?product_id={tenant.product_id}",
        f"/customers/{tenant.customer_id}",
        f"/orders/{order['order_id']}",
        "/analytics/sales?start=2026-01-01T00:00:00Z&end=2027-01-01T00:00:00Z",
    ]
    return client, http, tenant, foreign, private, headers, paths


@pytest.mark.parametrize("index", range(7))
def test_authenticated_reads_have_safe_schema_and_request_id(http_case, index):
    client, _, tenant, _, _, headers, paths = http_case
    request_id = str(uuid4())
    response = client.get(paths[index], headers={**headers, "X-Request-ID": request_id})
    assert response.status_code == 200
    assert response.headers["x-request-id"] == request_id
    assert response.headers["cache-control"] == "no-store"
    body = response.json()
    assert isinstance(body, dict)
    assert not {"access_token", "secret_reference", "raw_prompt", "password"} & body.keys()
    if index == 0:
        assert body["business_id"] == str(tenant.business_id)
        assert body["role"] == "OWNER" and body["kind"] == "USER"
        assert body["business_name"] is None  # Configuration version is not a name.
    if index == 2:
        assert body["unit_price"] == "12.3400"
    if index == 3:
        assert body["items"][0]["available_quantity"] == "5.0000"
    if index == 5:
        assert body["status"] == "CREATED"
        assert body["items"][0]["reserved_quantity"] == "0.0000"
    if index == 6:
        assert body["series"] == []  # CREATED is not a confirmed sales effect.


@pytest.mark.parametrize("index", range(7))
@pytest.mark.parametrize("case", ["missing", "invalid", "foreign-business"])
def test_every_route_rejects_missing_invalid_and_foreign_auth(http_case, index, case):
    client, _, _, foreign, _, headers, paths = http_case
    sent = dict(headers)
    if case == "missing":
        sent.pop("Authorization")
    elif case == "invalid":
        sent["Authorization"] = "Bearer invalid-token"
    else:
        sent["X-Business-ID"] = str(foreign.business_id)
    response = client.get(paths[index], headers=sent)
    assert response.status_code == (403 if case == "foreign-business" else 401)
    assert "items" not in response.json()


@pytest.mark.parametrize("index", [1, 2, 3, 4, 5, 6])
def test_platform_admin_has_no_automatic_business_grant(http_case, index):
    client, _, tenant, foreign, private, _, paths = http_case
    headers = {
        "Authorization": f"Bearer {token(private, tenant.user_id, realm_access={'roles': ['platform_admin']})}",
        "X-Business-ID": str(foreign.business_id),
    }
    response = client.get(paths[index], headers=headers)
    assert response.status_code in {403, 404}


def test_foreign_object_ids_are_not_accessible(http_case):
    client, _, _, foreign, _, headers, _ = http_case
    assert client.get(f"/products/{foreign.product_id}", headers=headers).status_code == 404
    assert client.get(f"/customers/{foreign.customer_id}", headers=headers).status_code == 404
    assert client.get(f"/orders/{uuid4()}", headers=headers).status_code == 404
    assert (
        client.get(f"/inventory?product_id={foreign.product_id}", headers=headers).status_code
        == 404
    )


def test_operator_needs_object_assignment_and_owner_report(http_case, admin_connection):
    client, _, tenant, _, _, headers, paths = http_case
    admin_connection.execute(
        "UPDATE business_memberships SET role='OPERATOR' WHERE business_id=%s AND user_id=%s",
        (tenant.business_id, tenant.user_id),
    )
    assert client.get(paths[1], headers=headers).status_code == 200
    assert client.get(paths[3], headers=headers).status_code == 200
    assert client.get(paths[4], headers=headers).status_code == 404
    assert client.get(paths[5], headers=headers).status_code == 404
    assert client.get(paths[6], headers=headers).status_code == 403


def test_empty_search_validation_and_no_mutation_routes(http_case):
    client, _, tenant, _, _, headers, _ = http_case
    assert client.get("/products?q=no-matching-name", headers=headers).json()["items"] == []
    assert client.get("/products?q=", headers=headers).status_code == 422
    assert client.get("/products?q=%20", headers=headers).status_code == 422
    assert client.get("/products?q=Synthetic&limit=51", headers=headers).status_code == 422
    assert (
        client.get(
            f"/inventory?product_id={tenant.product_id}&product_id={tenant.product_id}",
            headers=headers,
        ).status_code
        == 422
    )
    assert (
        client.get("/analytics/sales?start=2026-01-01&end=2027-01-01", headers=headers).status_code
        == 422
    )
    assert client.post("/products", headers=headers, json={}).status_code == 405
    assert client.post("/execute-tool", headers=headers, json={}).status_code == 404


def test_expired_token_and_removed_membership_fail_closed(http_case, admin_connection):
    client, _, tenant, _, private, headers, _ = http_case
    expired = token(
        private, tenant.user_id, exp=int((datetime.now(UTC) - timedelta(seconds=1)).timestamp())
    )
    assert (
        client.get("/me", headers={**headers, "Authorization": f"Bearer {expired}"}).status_code
        == 401
    )
    admin_connection.execute(
        "DELETE FROM business_memberships WHERE business_id=%s AND user_id=%s",
        (tenant.business_id, tenant.user_id),
    )
    assert client.get("/products?q=Synthetic", headers=headers).status_code == 403


def test_cors_only_approved_origin_and_no_wildcard(http_case):
    client = http_case[0]
    accepted = client.options(
        "/me",
        headers={
            "Origin": "http://127.0.0.1:3100",
            "Access-Control-Request-Method": "GET",
            "Access-Control-Request-Headers": "authorization,x-business-id",
        },
    )
    assert accepted.status_code == 200
    assert accepted.headers["access-control-allow-origin"] == "http://127.0.0.1:3100"
    refused = client.options(
        "/me",
        headers={
            "Origin": "https://foreign.example.invalid",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert refused.status_code == 400 and "access-control-allow-origin" not in refused.headers
    with pytest.raises(ValueError):
        trusted_url("*", True)
