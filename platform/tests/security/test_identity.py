"""M05 staff OIDC, Q01, membership and object-authorization negatives."""

import base64
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import UUID, uuid4

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa

from platform_backend.application.identity import IdentityService
from platform_backend.application.orders import OrderService
from platform_backend.application.queries import QueryService
from platform_backend.domain.context import PrincipalContext, PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import OrderLineRequest
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.security.oidc import OidcConfig, OidcVerifier, StaffIdentityService
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]
ISSUER = "https://issuer.example.invalid"
AUDIENCE = "business-api"


def _b64(value: int) -> str:
    width = (value.bit_length() + 7) // 8
    return base64.urlsafe_b64encode(value.to_bytes(width, "big")).rstrip(b"=").decode()


@pytest.fixture(scope="module")
def keys():
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
    return private, jwks


def token(private, subject: UUID, **changes) -> str:
    now = datetime.now(UTC)
    claims = {
        "iss": ISSUER,
        "aud": AUDIENCE,
        "sub": str(subject),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=10)).timestamp()),
        "typ": "Bearer",
    }
    claims.update(changes)
    return jwt.encode(claims, private, algorithm="RS256", headers={"kid": "engineering-key"})


def verifier(jwks) -> OidcVerifier:
    return OidcVerifier(
        OidcConfig(ISSUER, AUDIENCE, cache_seconds=60, timeout_seconds=2),
        fetch_jwks=lambda: jwks,
    )


def test_valid_owner_token_resolves_only_own_membership(
    admin_connection, runtime_url: str, keys
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    private, jwks = keys
    service = StaffIdentityService(PostgresDatabase(runtime_url), verifier(jwks))
    resolved = service.resolve(token(private, a.user_id), a.business_id)
    assert resolved.subject_id == a.user_id
    assert resolved.staff_role is StaffRole.OWNER
    with pytest.raises(DomainFailure) as foreign:
        service.resolve(token(private, a.user_id), b.business_id)
    assert foreign.value.code is ErrorCode.FORBIDDEN


@pytest.mark.parametrize(
    "changes",
    [
        {"iss": "https://wrong.example.invalid"},
        {"aud": "wrong-audience"},
        {"exp": 1},
        {"typ": "ID"},
    ],
)
def test_wrong_issuer_audience_expiry_or_token_type_is_rejected(keys, changes) -> None:
    private, jwks = keys
    with pytest.raises(DomainFailure) as rejected:
        verifier(jwks).verify_access_token(token(private, uuid4(), **changes))
    assert rejected.value.code is ErrorCode.UNAUTHENTICATED


def test_invalid_signature_and_unsupported_algorithm_are_rejected(keys) -> None:
    private, jwks = keys
    other = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    with pytest.raises(DomainFailure) as invalid:
        verifier(jwks).verify_access_token(token(other, uuid4()))
    assert invalid.value.code is ErrorCode.UNAUTHENTICATED
    hs = jwt.encode(
        {
            "iss": ISSUER,
            "aud": AUDIENCE,
            "sub": str(uuid4()),
            "iat": 1,
            "exp": 9999999999,
            "typ": "Bearer",
        },
        "not-an-allowed-key-with-32-byte-minimum",
        algorithm="HS256",
        headers={"kid": "engineering-key"},
    )
    with pytest.raises(DomainFailure) as unsupported:
        verifier(jwks).verify_access_token(hs)
    assert unsupported.value.code is ErrorCode.UNAUTHENTICATED


def test_platform_admin_is_not_automatically_business_owner(
    admin_connection, runtime_url: str, keys
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    private, jwks = keys
    auth = StaffIdentityService(PostgresDatabase(runtime_url), verifier(jwks))
    principal = auth.resolve(
        token(private, a.user_id, realm_access={"roles": ["platform_admin"]}),
        b.business_id,
    )
    assert principal.staff_role is StaffRole.PLATFORM_ADMIN
    with pytest.raises(DomainFailure) as forbidden:
        QueryService(PostgresDatabase(runtime_url)).report(
            principal,
            datetime.now(UTC) - timedelta(days=1),
            datetime.now(UTC),
            "DAY",
            "CONFIRMED_ORDER_UNITS",
            None,
        )
    assert forbidden.value.code is ErrorCode.FORBIDDEN


def test_q01_same_account_is_tenant_scoped_and_channels_do_not_merge(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    service = IdentityService(PostgresDatabase(runtime_url))
    first = service.resolve_or_create_verified_channel_identity(
        a.business_id, "TELEGRAM", "synthetic-external-42", uuid4()
    )
    replay = service.resolve_or_create_verified_channel_identity(
        a.business_id, "TELEGRAM", "synthetic-external-42", uuid4()
    )
    other_tenant = service.resolve_or_create_verified_channel_identity(
        b.business_id, "TELEGRAM", "synthetic-external-42", uuid4()
    )
    other_channel = service.resolve_or_create_verified_channel_identity(
        a.business_id, "WEB", "synthetic-external-42", uuid4()
    )
    assert first.identity_id == replay.identity_id
    assert first.customer_id == replay.customer_id
    assert first.customer_id != other_tenant.customer_id
    assert first.customer_id != other_channel.customer_id
    assert first.principal().kind is PrincipalKind.CUSTOMER


def test_customer_owns_only_linked_order_and_uuid_is_not_authority(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    other = IdentityService(database).resolve_or_create_verified_channel_identity(
        fixture.business_id, "TELEGRAM", "different-account", uuid4()
    )
    order = OrderService(database).create_order(
        fixture.context(operation_key="customer-protected-order"),
        fixture.customer_id,
        (OrderLineRequest(fixture.product_id, Decimal("1"), 1),),
    )
    own = PrincipalContext(
        PrincipalKind.CUSTOMER,
        fixture.identity_id,
        fixture.business_id,
        customer_id=fixture.customer_id,
        identity_id=fixture.identity_id,
    )
    assert QueryService(database).get_order(own, UUID(order["order_id"])).id == UUID(
        order["order_id"]
    )
    with pytest.raises(DomainFailure) as forbidden:
        QueryService(database).get_order(other.principal(), UUID(order["order_id"]))
    assert forbidden.value.code is ErrorCode.NOT_ACCESSIBLE


def test_operator_needs_explicit_escalation_assignment(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection, role="OPERATOR")
    order_id = uuid4()
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO orders(business_id,id,customer_id,status,currency,updated_at) "
            "VALUES (%s,%s,%s,'CREATED','USD',now())",
            (fixture.business_id, order_id, fixture.customer_id),
        )
    principal = fixture.context(role=StaffRole.OPERATOR).principal
    query = QueryService(PostgresDatabase(runtime_url))
    with pytest.raises(DomainFailure) as unassigned:
        query.get_order(principal, order_id)
    assert unassigned.value.code is ErrorCode.NOT_ACCESSIBLE
    with admin_connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO escalations"
            "(business_id,id,run_id,reason_code,assigned_user_id,status,"
            "expected_resume_revision,updated_at) "
            "VALUES (%s,%s,%s,'HUMAN_REQUIRED',%s,'CLAIMED',0,now())",
            (fixture.business_id, uuid4(), fixture.run_id, fixture.user_id),
        )
    assert query.get_order(principal, order_id).id == order_id
