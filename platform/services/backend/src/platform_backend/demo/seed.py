"""Seed a demo business with a small catalog and a WhatsApp integration row.

Usage (inside the backend container or a local venv with the migrator URL):

    WHATSAPP_PHONE_NUMBER_ID=... WHATSAPP_BUSINESS_ID=<uuid> \\
    python -m platform_backend.demo.seed

Idempotent: re-running updates the same business, products and integration.
"""

import os
from decimal import Decimal
from uuid import UUID, uuid4, uuid5

import psycopg

NAMESPACE = UUID("3a6c8f4e-6d2a-4c62-9a1a-9d9a2a1b0c11")

PRODUCTS = [
    ("SKU-LAMP-42", "Desk Lamp / Slate", Decimal("24900.0000"), Decimal("8.0000")),
    ("SKU-CHAIR-11", "Work Chair / Graphite", Decimal("89000.0000"), Decimal("3.0000")),
    ("SKU-SHELF-07", "Wall Shelf / Oak 80 cm", Decimal("31500.0000"), Decimal("0.0000")),
]


def required(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"{name} is required")
    return value


def main() -> None:
    url = required("MIGRATOR_DATABASE_URL")
    business_id = UUID(required("WHATSAPP_BUSINESS_ID"))
    phone_number_id = required("WHATSAPP_PHONE_NUMBER_ID")
    business_name = os.environ.get("DEMO_BUSINESS_NAME", "North Shop")
    timezone = os.environ.get("DEMO_BUSINESS_TIMEZONE", "Asia/Almaty")
    currency = os.environ.get("DEMO_CURRENCY", "KZT")
    issuer = os.environ.get("DEMO_STAFF_ISSUER", "").strip()
    subject = os.environ.get("DEMO_STAFF_SUBJECT", "").strip()

    with psycopg.connect(url, autocommit=True) as connection:
        connection.execute(
            "SELECT set_config('app.current_business_id', %s, false)", (str(business_id),)
        )
        connection.execute(
            "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) "
            "VALUES (%s,%s,%s,'1',now()) ON CONFLICT (id) DO UPDATE "
            "SET name=EXCLUDED.name,timezone=EXCLUDED.timezone,updated_at=now()",
            (business_id, business_name, timezone),
        )
        for sku, name, price, quantity in PRODUCTS:
            product_id = uuid5(NAMESPACE, f"{business_id}:product:{sku}")
            inventory_id = uuid5(NAMESPACE, f"{business_id}:inventory:{sku}")
            connection.execute(
                "INSERT INTO products"
                "(business_id,id,sku,name,unit_price,currency,active,updated_at) "
                "VALUES (%s,%s,%s,%s,%s,%s,true,now()) ON CONFLICT (business_id,id) DO UPDATE "
                "SET name=EXCLUDED.name,unit_price=EXCLUDED.unit_price,active=true,"
                "updated_at=now()",
                (business_id, product_id, sku, name, price, currency),
            )
            connection.execute(
                "INSERT INTO inventory"
                "(business_id,id,product_id,available_qty,reserved_qty,updated_at) "
                "VALUES (%s,%s,%s,%s,0,now()) ON CONFLICT (business_id,id) DO UPDATE "
                "SET available_qty=EXCLUDED.available_qty,updated_at=now()",
                (business_id, inventory_id, product_id, quantity),
            )
        integration_id = uuid5(NAMESPACE, f"{business_id}:integration:WHATSAPP")
        connection.execute(
            "INSERT INTO integrations(business_id,id,channel,provider_account_id,secret_reference,"
            "mode,enabled,updated_at) VALUES (%s,%s,'WHATSAPP',%s,'env:WHATSAPP_ACCESS_TOKEN',"
            "'SANDBOX',true,now()) ON CONFLICT (business_id,id) DO UPDATE "
            "SET provider_account_id=EXCLUDED.provider_account_id,enabled=true,updated_at=now()",
            (business_id, integration_id, phone_number_id),
        )
        if issuer and subject:
            existing = connection.execute(
                "SELECT id FROM app_users WHERE issuer=%s AND subject=%s", (issuer, subject)
            ).fetchone()
            if existing is None:
                user_id = uuid5(NAMESPACE, f"user:{issuer}:{subject}")
                connection.execute(
                    "INSERT INTO app_users(id,issuer,subject,updated_at) VALUES (%s,%s,%s,now())",
                    (user_id, issuer, subject),
                )
            else:
                user_id = existing[0]
            connection.execute(
                "INSERT INTO business_memberships(business_id,id,user_id,role,updated_at) "
                "VALUES (%s,%s,%s,'OWNER',now()) ON CONFLICT DO NOTHING",
                (business_id, uuid4(), user_id),
            )
    print(f"Seeded business {business_id} ({business_name}) with {len(PRODUCTS)} products.")
    print("WhatsApp integration row is enabled for phone number id", phone_number_id)


if __name__ == "__main__":
    main()
