"""Isolated engineering-only Keycloak realm and real tenant seed for P5I smoke.

Run in the existing db-tests image with a mounted private output directory.
Never use against a production identity provider or print the credential file.
"""

import json
import os
import secrets
import sys
from pathlib import Path
from uuid import UUID

import httpx
import psycopg

from platform_backend.application.orders import OrderService
from platform_backend.domain.models import OrderLineRequest
from platform_backend.repositories.postgres import PostgresDatabase
from tests.support import seed_tenant


def run() -> None:
    realm = os.environ["P5I_REALM"]
    if not realm.startswith("p5i-engineering-") or len(realm) > 100:
        raise ValueError("Only a named isolated P5I engineering realm is permitted")
    public_origin = os.environ["KEYCLOAK_PUBLIC_ORIGIN"]
    app_origin = os.environ["P5I_APP_ORIGIN"]
    output = Path(os.environ["P5I_SMOKE_OUTPUT"])
    with httpx.Client(base_url="http://keycloak:8080", timeout=20) as admin:
        grant = admin.post(
            "/realms/master/protocol/openid-connect/token",
            data={
                "grant_type": "password",
                "client_id": "admin-cli",
                "username": os.environ["KEYCLOAK_SMOKE_ADMIN_USER"],
                "password": os.environ["KEYCLOAK_SMOKE_ADMIN_PASSWORD"],
            },
        )
        grant.raise_for_status()
        headers = {"Authorization": f"Bearer {grant.json()['access_token']}"}
        if "--cleanup" in sys.argv:
            response = admin.delete(f"/admin/realms/{realm}", headers=headers)
            if response.status_code not in {204, 404}:
                raise RuntimeError("Isolated realm cleanup failed")
            print("Isolated P5I engineering realm removed.")
            return
        response = admin.post(
            "/admin/realms",
            headers=headers,
            json={
                "realm": realm,
                "enabled": True,
                "accessTokenLifespan": 120,
                "sslRequired": "none",
                "registrationAllowed": False,
            },
        )
        if response.status_code != 201:
            raise RuntimeError("Refusing to overwrite an existing realm")
        client_id = "diploma-frontend"
        response = admin.post(
            f"/admin/realms/{realm}/clients",
            headers=headers,
            json={
                "clientId": client_id,
                "enabled": True,
                "publicClient": True,
                "standardFlowEnabled": True,
                "directAccessGrantsEnabled": False,
                "implicitFlowEnabled": False,
                "serviceAccountsEnabled": False,
                "redirectUris": [f"{app_origin}/api/auth/callback"],
                "webOrigins": [app_origin],
                "attributes": {
                    "pkce.code.challenge.method": "S256",
                    "post.logout.redirect.uris": f"{app_origin}/login",
                },
                "protocolMappers": [
                    {
                        "name": "backend-audience",
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
        response.raise_for_status()
        password = secrets.token_urlsafe(32)
        username = "p5i-engineering-owner"
        response = admin.post(
            f"/admin/realms/{realm}/users",
            headers=headers,
            json={
                "username": username,
                "enabled": True,
                "emailVerified": True,
                "email": "p5i-engineering@example.invalid",
                "firstName": "Engineering",
                "lastName": "Owner",
                "requiredActions": [],
                "credentials": [{"type": "password", "value": password, "temporary": False}],
            },
        )
        response.raise_for_status()
        subject = response.headers["Location"].rsplit("/", 1)[-1]
        UUID(subject)
    issuer = f"{public_origin}/realms/{realm}"
    with psycopg.connect(os.environ["MIGRATOR_DATABASE_URL"], autocommit=True) as db:
        seed = seed_tenant(db)
        foreign = seed_tenant(db)
        db.execute(
            "UPDATE app_users SET issuer=%s,subject=%s WHERE id=%s", (issuer, subject, seed.user_id)
        )
        db.execute(
            "UPDATE products SET name=%s,sku='P5I-LOCAL-01' WHERE business_id=%s AND id=%s",
            (
                "P5I engineering product — long authorized name for responsive review",
                seed.business_id,
                seed.product_id,
            ),
        )
        context = seed.context(operation_key="p5i-engineering-seed-order")
        order = OrderService(PostgresDatabase(os.environ["DATABASE_URL"])).create_order(
            context,
            seed.customer_id,
            (OrderLineRequest(seed.product_id, "1.0000", 1),),
        )
    evidence = {
        "realm": realm,
        "issuer": issuer,
        "client_id": client_id,
        "business_id": str(seed.business_id),
        "product_id": str(seed.product_id),
        "customer_id": str(seed.customer_id),
        "order_id": order["order_id"],
        "foreign_business_id": str(foreign.business_id),
        "foreign_product_id": str(foreign.product_id),
        "username": username,
        "password": password,
    }
    output.write_text(json.dumps(evidence), encoding="utf-8")
    output.chmod(0o600)
    print("Isolated real Keycloak realm and tenant seed prepared; credentials stored privately.")


if __name__ == "__main__":
    run()
