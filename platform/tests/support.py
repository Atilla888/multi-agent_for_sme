"""Synthetic engineering fixtures, never benchmark scenarios."""

from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import UUID, uuid4

import psycopg

from platform_backend.domain.context import (
    AgentRole,
    ExecutionContext,
    PrincipalContext,
    PrincipalKind,
    StaffRole,
)


@dataclass(frozen=True)
class TenantFixture:
    business_id: UUID
    user_id: UUID
    customer_id: UUID
    identity_id: UUID
    product_id: UUID
    inventory_id: UUID
    run_id: UUID
    conversation_id: UUID
    message_id: UUID

    def context(
        self, *, agent: AgentRole = AgentRole.SALES,
        role: StaffRole = StaffRole.OWNER, operation_key: str | None = None,
    ) -> ExecutionContext:
        return ExecutionContext(
            principal=PrincipalContext(
                PrincipalKind.USER, self.user_id, self.business_id, staff_role=role
            ),
            agent_role=agent,
            run_id=self.run_id,
            correlation_id=uuid4(),
            policy_version="m03-m05-v1",
            deadline=datetime.now(UTC) + timedelta(minutes=10),
            operation_key=operation_key,
        )


def seed_tenant(
    connection: psycopg.Connection,
    *, quantity: Decimal = Decimal("5.0000"),
    price: Decimal = Decimal("12.3400"),
    role: str = "OWNER",
) -> TenantFixture:
    business_id, user_id, customer_id = uuid4(), uuid4(), uuid4()
    product_id, inventory_id, integration_id, identity_id = uuid4(), uuid4(), uuid4(), uuid4()
    conversation_id, message_id, run_id = uuid4(), uuid4(), uuid4()
    with connection.cursor() as cursor:
        cursor.execute(
            "INSERT INTO businesses(id,name,timezone,configuration_version,updated_at) "
            "VALUES (%s,'Engineering tenant','UTC','1',now())",
            (business_id,),
        )
        cursor.execute(
            "INSERT INTO app_users(id,issuer,subject,updated_at) VALUES (%s,%s,%s,now())",
            (user_id, "https://issuer.example.invalid", str(user_id)),
        )
        cursor.execute(
            "INSERT INTO business_memberships(business_id,id,user_id,role,updated_at) "
            "VALUES (%s,%s,%s,%s,now())",
            (business_id, uuid4(), user_id, role),
        )
        cursor.execute(
            "INSERT INTO customers(business_id,id,display_name,updated_at) "
            "VALUES (%s,%s,'Synthetic customer',now())",
            (business_id, customer_id),
        )
        cursor.execute(
            "INSERT INTO customer_identities"
            "(business_id,id,customer_id,channel,external_user_id,link_method,updated_at) "
            "VALUES (%s,%s,%s,'WEB',%s,'FIRST_CONTACT',now())",
            (business_id, identity_id, customer_id, str(identity_id)),
        )
        cursor.execute(
            "INSERT INTO products"
            "(business_id,id,sku,name,unit_price,currency,active,updated_at) "
            "VALUES (%s,%s,'P-1','Synthetic product',%s,'USD',true,now())",
            (business_id, product_id, price),
        )
        cursor.execute(
            "INSERT INTO inventory"
            "(business_id,id,product_id,available_qty,reserved_qty,updated_at) "
            "VALUES (%s,%s,%s,%s,0,now())",
            (business_id, inventory_id, product_id, quantity),
        )
        cursor.execute(
            "INSERT INTO integrations"
            "(business_id,id,channel,provider_account_id,secret_reference,mode,enabled,updated_at) "
            "VALUES (%s,%s,'WEB',%s,'development-only','MOCK',true,now())",
            (business_id, integration_id, str(integration_id)),
        )
        cursor.execute(
            "INSERT INTO conversations"
            "(business_id,id,customer_id,identity_id,status,updated_at) "
            "VALUES (%s,%s,%s,%s,'OPEN',now())",
            (business_id, conversation_id, customer_id, identity_id),
        )
        cursor.execute(
            "INSERT INTO messages"
            "(business_id,id,conversation_id,integration_id,provider_message_id,direction,"
            "body,status,correlation_id,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,'INBOUND','synthetic engineering request',"
            "'PROCESSED',%s,now())",
            (business_id, message_id, conversation_id, integration_id, str(message_id), uuid4()),
        )
        cursor.execute(
            "INSERT INTO agent_runs"
            "(business_id,id,message_id,mode,status,active_agent,resume_revision,step_count,"
            "handoff_count,retry_count,deadline,budget_state,execution_metadata,"
            "routing_confidence,reason_code,updated_at) "
            "VALUES (%s,%s,%s,'SINGLE','RUNNING','Sales',0,0,0,0,now()+interval '1 hour',"
            "'{}'::jsonb,'{}'::jsonb,'UNKNOWN','CLEAR_INTENT',now())",
            (business_id, run_id, message_id),
        )
    return TenantFixture(
        business_id, user_id, customer_id, identity_id, product_id, inventory_id,
        run_id, conversation_id, message_id,
    )
