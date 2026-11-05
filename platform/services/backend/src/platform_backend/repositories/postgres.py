"""Tenant-scoped PostgreSQL adapters; every query also carries a tenant predicate."""

from __future__ import annotations

from collections.abc import Iterator, Sequence
from contextlib import contextmanager
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Any
from uuid import UUID

import psycopg
from psycopg.rows import dict_row
from psycopg.types.json import Jsonb

from platform_backend.domain.models import (
    Customer,
    Inventory,
    Money,
    Order,
    OrderItem,
    OrderStatus,
    Product,
)

if TYPE_CHECKING:
    from platform_backend.knowledge.repository import KnowledgeRepository


class PostgresDatabase:
    def __init__(self, runtime_url: str) -> None:
        self._runtime_url = runtime_url

    @contextmanager
    def transaction(self, business_id: UUID) -> Iterator[PostgresRepository]:
        with psycopg.connect(
            self._runtime_url, autocommit=True, row_factory=dict_row
        ) as connection:
            with connection.transaction():
                connection.execute(
                    "SELECT set_config('app.current_business_id', %s, true)",
                    (str(business_id),),
                )
                yield PostgresRepository(connection, business_id)


class PostgresRepository:
    """One short transaction, bound to one trusted business ID."""

    def __init__(self, connection: psycopg.Connection[Any], business_id: UUID) -> None:
        self._connection = connection
        self.business_id = business_id

    @property
    def knowledge(self) -> KnowledgeRepository:
        """M07 adapter shares this authorized, tenant-bound transaction."""
        from platform_backend.knowledge.repository import KnowledgeRepository

        return KnowledgeRepository(self._connection, self.business_id)

    def get_product(self, product_id: UUID, *, lock: bool = False) -> Product | None:
        suffix = " FOR UPDATE" if lock else ""
        row = self._connection.execute(
            "SELECT business_id,id,sku,name,unit_price,currency,active,version "
            "FROM products WHERE business_id=%s AND id=%s" + suffix,
            (self.business_id, product_id),
        ).fetchone()
        return self._product(row) if row else None

    def search_products(
        self, query: str, limit: int, after: tuple[str, UUID] | None = None
    ) -> list[Product]:
        after_name = after[0] if after else None
        after_id = after[1] if after else None
        rows = self._connection.execute(
            "SELECT business_id,id,sku,name,unit_price,currency,active,version "
            "FROM products WHERE business_id=%s AND active=true "
            "AND (strpos(lower(name),lower(%s))>0 OR strpos(lower(sku),lower(%s))>0) "
            "AND (%s::text IS NULL OR name>%s OR (name=%s AND id>%s::uuid)) "
            "ORDER BY name,id LIMIT %s",
            (self.business_id, query, query, after_name, after_name, after_name, after_id, limit),
        ).fetchall()
        return [self._product(row) for row in rows]

    def get_inventory(self, product_id: UUID, *, lock: bool = False) -> Inventory | None:
        suffix = " FOR UPDATE" if lock else ""
        row = self._connection.execute(
            "SELECT business_id,id,product_id,available_qty,reserved_qty,version,"
            "updated_at AS observed_at "
            "FROM inventory WHERE business_id=%s AND product_id=%s" + suffix,
            (self.business_id, product_id),
        ).fetchone()
        return self._inventory(row) if row else None

    def get_customer(self, customer_id: UUID) -> Customer | None:
        row = self._connection.execute(
            "SELECT business_id,id,display_name,version FROM customers "
            "WHERE business_id=%s AND id=%s",
            (self.business_id, customer_id),
        ).fetchone()
        return Customer(**row) if row else None

    def get_order(self, order_id: UUID, *, lock: bool = False) -> Order | None:
        suffix = " FOR UPDATE" if lock else ""
        row = self._connection.execute(
            "SELECT business_id,id,customer_id,status,currency,version,created_at,"
            "delivery_reference "
            "FROM orders WHERE business_id=%s AND id=%s" + suffix,
            (self.business_id, order_id),
        ).fetchone()
        if row is None:
            return None
        lines = self._connection.execute(
            "SELECT id,product_id,quantity,reserved_qty,unit_price,version "
            "FROM order_items WHERE business_id=%s AND order_id=%s ORDER BY product_id,id",
            (self.business_id, order_id),
        ).fetchall()
        items = tuple(
            OrderItem(
                id=line["id"],
                product_id=line["product_id"],
                quantity=line["quantity"],
                reserved_qty=line["reserved_qty"],
                price=Money(line["unit_price"], row["currency"]),
                version=line["version"],
            )
            for line in lines
        )
        return Order(
            business_id=row["business_id"],
            id=row["id"],
            customer_id=row["customer_id"],
            status=OrderStatus(row["status"]),
            currency=row["currency"],
            version=row["version"],
            items=items,
            created_at=row["created_at"],
            delivery_reference=row["delivery_reference"],
        )

    def operator_assigned_to_customer(self, user_id: UUID, customer_id: UUID) -> bool:
        row = self._connection.execute(
            "SELECT 1 FROM escalations e "
            "JOIN agent_runs r ON r.business_id=e.business_id AND r.id=e.run_id "
            "JOIN messages m ON m.business_id=r.business_id AND m.id=r.message_id "
            "JOIN conversations c ON c.business_id=m.business_id AND c.id=m.conversation_id "
            "WHERE e.business_id=%s AND e.assigned_user_id=%s AND c.customer_id=%s "
            "AND e.status IN ('OPEN','CLAIMED') LIMIT 1",
            (self.business_id, user_id, customer_id),
        ).fetchone()
        return row is not None

    def get_membership_role(self, user_id: UUID) -> str | None:
        row = self._connection.execute(
            "SELECT role FROM business_memberships WHERE business_id=%s AND user_id=%s",
            (self.business_id, user_id),
        ).fetchone()
        return str(row["role"]) if row else None

    def lookup_app_user_id(self, issuer: str, subject: str) -> UUID | None:
        row = self._connection.execute(
            "SELECT public.lookup_app_user_id(%s,%s) AS id", (issuer, subject)
        ).fetchone()
        return row["id"] if row else None

    def get_customer_identity(self, channel: str, external_user_id: str) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT id,customer_id,channel,external_user_id,version "
            "FROM customer_identities WHERE business_id=%s AND channel=%s "
            "AND external_user_id=%s",
            (self.business_id, channel, external_user_id),
        ).fetchone()

    def identity_links_customer(self, identity_id: UUID, customer_id: UUID) -> bool:
        return (
            self._connection.execute(
                "SELECT 1 FROM customer_identities WHERE business_id=%s AND id=%s "
                "AND customer_id=%s",
                (self.business_id, identity_id, customer_id),
            ).fetchone()
            is not None
        )

    def insert_customer_identity(
        self, customer_id: UUID, identity_id: UUID, channel: str, external_user_id: str
    ) -> None:
        self._connection.execute(
            "INSERT INTO customers(business_id,id,updated_at) VALUES (%s,%s,now())",
            (self.business_id, customer_id),
        )
        self._connection.execute(
            "INSERT INTO customer_identities"
            "(business_id,id,customer_id,channel,external_user_id,link_method,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,'FIRST_CONTACT',now())",
            (self.business_id, identity_id, customer_id, channel, external_user_id),
        )

    def insert_order(self, order_id: UUID, customer_id: UUID, currency: str) -> None:
        self._connection.execute(
            "INSERT INTO orders(business_id,id,customer_id,status,currency,updated_at) "
            "VALUES (%s,%s,%s,'CREATED',%s,now())",
            (self.business_id, order_id, customer_id, currency),
        )

    def insert_order_item(
        self, item_id: UUID, order_id: UUID, product_id: UUID, quantity: Decimal, price: Decimal
    ) -> None:
        self._connection.execute(
            "INSERT INTO order_items"
            "(business_id,id,order_id,product_id,quantity,reserved_qty,unit_price,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,0,%s,now())",
            (self.business_id, item_id, order_id, product_id, quantity, price),
        )

    def decrement_inventory(self, product_id: UUID, quantity: Decimal, version: int) -> int | None:
        row = self._connection.execute(
            "UPDATE inventory SET available_qty=available_qty-%s, reserved_qty=reserved_qty+%s, "
            "version=version+1, updated_at=now() WHERE business_id=%s AND product_id=%s "
            "AND version=%s AND available_qty >= %s RETURNING version",
            (quantity, quantity, self.business_id, product_id, version, quantity),
        ).fetchone()
        return int(row["version"]) if row else None

    def mark_order_item_reserved(self, item_id: UUID, quantity: Decimal) -> bool:
        cursor = self._connection.execute(
            "UPDATE order_items SET reserved_qty=reserved_qty+%s, version=version+1, "
            "updated_at=now() WHERE business_id=%s AND id=%s AND reserved_qty=0",
            (quantity, self.business_id, item_id),
        )
        return cursor.rowcount == 1

    def set_order_status(
        self, order_id: UUID, expected_version: int, status: OrderStatus
    ) -> int | None:
        row = self._connection.execute(
            "UPDATE orders SET status=%s, version=version+1, updated_at=now() "
            "WHERE business_id=%s AND id=%s AND version=%s RETURNING version",
            (status.value, self.business_id, order_id, expected_version),
        ).fetchone()
        return int(row["version"]) if row else None

    def append_audit(
        self,
        audit_id: UUID,
        correlation_id: UUID,
        actor_scope: str,
        event_type: str,
        resource_type: str,
        resource_id: UUID | None,
        detail: dict[str, Any],
        run_id: UUID | None = None,
    ) -> None:
        self._connection.execute(
            "INSERT INTO audit_logs"
            "(business_id,id,run_id,correlation_id,actor_scope,event_type,"
            "resource_type,resource_id,detail) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)",
            (
                self.business_id,
                audit_id,
                run_id,
                correlation_id,
                actor_scope,
                event_type,
                resource_type,
                resource_id,
                Jsonb(detail),
            ),
        )

    def get_operation(self, tool_name: str, actor_scope: str, key: str) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT id,canonical_payload_hash,status,result,error_code,run_id "
            "FROM idempotency_operations WHERE business_id=%s AND tool_name=%s "
            "AND actor_scope=%s AND operation_key=%s FOR UPDATE",
            (self.business_id, tool_name, actor_scope, key),
        ).fetchone()

    def admit_operation(
        self,
        operation_id: UUID,
        key: str,
        tool_name: str,
        digest: str,
        actor_scope: str,
        run_id: UUID,
    ) -> bool:
        row = self._connection.execute(
            "INSERT INTO idempotency_operations"
            "(business_id,id,operation_key,tool_name,canonical_payload_hash,"
            "actor_scope,status,run_id,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,'STARTED',%s,now()) "
            "ON CONFLICT (business_id,tool_name,actor_scope,operation_key) DO NOTHING RETURNING id",
            (self.business_id, operation_id, key, tool_name, digest, actor_scope, run_id),
        ).fetchone()
        return row is not None

    def finish_operation(
        self,
        operation_id: UUID,
        status: str,
        result: dict[str, Any] | None,
        error_code: str | None,
    ) -> None:
        self._connection.execute(
            "UPDATE idempotency_operations SET status=%s,result=%s,error_code=%s,"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s "
            "AND status='STARTED'",
            (
                status,
                Jsonb(result) if result is not None else None,
                error_code,
                self.business_id,
                operation_id,
            ),
        )

    def mark_operation_unknown(self, operation_id: UUID) -> bool:
        row = self._connection.execute(
            "UPDATE idempotency_operations SET status='UNKNOWN',"
            "error_code='OUTCOME_UNKNOWN',reconcile_after=now()+interval '1 minute',"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s "
            "AND status='STARTED' RETURNING id",
            (self.business_id, operation_id),
        ).fetchone()
        return row is not None

    def insert_tool_call(self, call_id: UUID, run_id: UUID, tool_name: str) -> None:
        self._connection.execute(
            "INSERT INTO tool_calls"
            "(business_id,id,run_id,tool_name,attempt,status,updated_at) "
            "VALUES (%s,%s,%s,%s,1,'STARTED',now())",
            (self.business_id, call_id, run_id, tool_name),
        )

    def finish_tool_call(
        self,
        call_id: UUID,
        status: str,
        error_code: str | None,
        summary: dict[str, Any],
        operation_id: UUID | None = None,
    ) -> None:
        self._connection.execute(
            "UPDATE tool_calls SET status=%s,error_code=%s,result_summary=%s,operation_id=%s,"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s",
            (
                status,
                error_code,
                Jsonb(summary),
                operation_id,
                self.business_id,
                call_id,
            ),
        )

    def insert_escalation(self, escalation_id: UUID, run_id: UUID, reason: str) -> None:
        self._connection.execute(
            "INSERT INTO escalations"
            "(business_id,id,run_id,reason_code,status,expected_resume_revision,updated_at) "
            "VALUES (%s,%s,%s,%s,'OPEN',0,now())",
            (self.business_id, escalation_id, run_id, reason),
        )

    def get_run_status(self, run_id: UUID) -> tuple[str, datetime, str | None] | None:
        row = self._connection.execute(
            "SELECT status,deadline,active_agent FROM agent_runs WHERE business_id=%s AND id=%s",
            (self.business_id, run_id),
        ).fetchone()
        return (row["status"], row["deadline"], row["active_agent"]) if row else None

    def get_run_context(self, run_id: UUID) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT r.id,r.status,r.active_agent,r.mode,r.resume_revision,r.version,"
            "m.conversation_id FROM agent_runs r JOIN messages m "
            "ON m.business_id=r.business_id AND m.id=r.message_id "
            "WHERE r.business_id=%s AND r.id=%s",
            (self.business_id, run_id),
        ).fetchone()

    def list_run_operations(self, run_id: UUID, limit: int) -> list[dict[str, Any]]:
        return self._connection.execute(
            "SELECT id,tool_name,status,error_code,version,updated_at "
            "FROM idempotency_operations WHERE business_id=%s AND run_id=%s "
            "ORDER BY updated_at DESC,id DESC LIMIT %s",
            (self.business_id, run_id, limit),
        ).fetchall()

    def list_unresolved_run_operations(self, run_id: UUID) -> list[dict[str, Any]]:
        return self._connection.execute(
            "SELECT id,tool_name,status,error_code,version,updated_at "
            "FROM idempotency_operations WHERE business_id=%s AND run_id=%s "
            "AND status IN ('STARTED','UNKNOWN') ORDER BY updated_at DESC,id DESC",
            (self.business_id, run_id),
        ).fetchall()

    def get_conversation(self, conversation_id: UUID) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT id,customer_id,identity_id,owner_user_id,status,version,updated_at "
            "FROM conversations WHERE business_id=%s AND id=%s",
            (self.business_id, conversation_id),
        ).fetchone()

    def list_conversation_messages(self, conversation_id: UUID, limit: int) -> list[dict[str, Any]]:
        rows = self._connection.execute(
            "SELECT id,direction,body,status,version,created_at "
            "FROM messages WHERE business_id=%s AND conversation_id=%s "
            "ORDER BY created_at DESC,id DESC LIMIT %s",
            (self.business_id, conversation_id, limit),
        ).fetchall()
        return list(reversed(rows))

    # --- Channel conversations (M08 WhatsApp adapter) -------------------------------

    def get_integration(self, channel: str, provider_account_id: str) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT id,channel,mode,enabled FROM integrations "
            "WHERE business_id=%s AND channel=%s AND provider_account_id=%s",
            (self.business_id, channel, provider_account_id),
        ).fetchone()

    def find_message_by_provider_id(
        self, integration_id: UUID, provider_message_id: str
    ) -> UUID | None:
        row = self._connection.execute(
            "SELECT id FROM messages WHERE business_id=%s AND integration_id=%s "
            "AND provider_message_id=%s",
            (self.business_id, integration_id, provider_message_id),
        ).fetchone()
        return row["id"] if row else None

    def insert_customer_with_identity(
        self,
        customer_id: UUID,
        identity_id: UUID,
        channel: str,
        external_user_id: str,
        display_name: str | None,
    ) -> None:
        self._connection.execute(
            "INSERT INTO customers(business_id,id,display_name,updated_at) VALUES (%s,%s,%s,now())",
            (self.business_id, customer_id, display_name),
        )
        self._connection.execute(
            "INSERT INTO customer_identities"
            "(business_id,id,customer_id,channel,external_user_id,link_method,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,'FIRST_CONTACT',now())",
            (self.business_id, identity_id, customer_id, channel, external_user_id),
        )

    def find_open_conversation(self, identity_id: UUID) -> UUID | None:
        row = self._connection.execute(
            "SELECT id FROM conversations WHERE business_id=%s AND identity_id=%s "
            "AND status IN ('OPEN','ESCALATED') ORDER BY created_at DESC LIMIT 1",
            (self.business_id, identity_id),
        ).fetchone()
        return row["id"] if row else None

    def insert_conversation(
        self, conversation_id: UUID, customer_id: UUID, identity_id: UUID
    ) -> None:
        self._connection.execute(
            "INSERT INTO conversations(business_id,id,customer_id,identity_id,status,updated_at) "
            "VALUES (%s,%s,%s,%s,'OPEN',now())",
            (self.business_id, conversation_id, customer_id, identity_id),
        )

    def set_conversation_status(self, conversation_id: UUID, status: str) -> None:
        self._connection.execute(
            "UPDATE conversations SET status=%s,version=version+1,updated_at=now() "
            "WHERE business_id=%s AND id=%s",
            (status, self.business_id, conversation_id),
        )

    def insert_message(
        self,
        message_id: UUID,
        conversation_id: UUID,
        integration_id: UUID | None,
        provider_message_id: str | None,
        direction: str,
        body: str,
        status: str,
        correlation_id: UUID,
    ) -> None:
        self._connection.execute(
            "INSERT INTO messages(business_id,id,conversation_id,integration_id,"
            "provider_message_id,direction,body,status,correlation_id,updated_at) "
            "VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,now())",
            (
                self.business_id,
                message_id,
                conversation_id,
                integration_id,
                provider_message_id,
                direction,
                body,
                status,
                correlation_id,
            ),
        )

    def update_message_status(
        self, message_id: UUID, status: str, provider_message_id: str | None = None
    ) -> None:
        self._connection.execute(
            "UPDATE messages SET status=%s,provider_message_id=COALESCE(%s,provider_message_id),"
            "version=version+1,updated_at=now() WHERE business_id=%s AND id=%s",
            (status, provider_message_id, self.business_id, message_id),
        )

    def update_message_status_by_provider_id(self, provider_message_id: str, status: str) -> bool:
        row = self._connection.execute(
            "UPDATE messages SET status=%s,version=version+1,updated_at=now() "
            "WHERE business_id=%s AND provider_message_id=%s AND direction='OUTBOUND' "
            "RETURNING id",
            (status, self.business_id, provider_message_id),
        ).fetchone()
        return row is not None

    def insert_agent_run(
        self,
        run_id: UUID,
        message_id: UUID,
        active_agent: str,
        deadline: datetime,
        metadata: dict[str, Any],
    ) -> None:
        self._connection.execute(
            "INSERT INTO agent_runs(business_id,id,message_id,mode,status,active_agent,"
            "resume_revision,step_count,handoff_count,retry_count,deadline,budget_state,"
            "execution_metadata,routing_confidence,reason_code,updated_at) "
            "VALUES (%s,%s,%s,'SINGLE','RUNNING',%s,0,0,0,0,%s,'{}'::jsonb,%s,'UNKNOWN',"
            "'CHANNEL_INBOUND',now())",
            (self.business_id, run_id, message_id, active_agent, deadline, Jsonb(metadata)),
        )

    def update_agent_run(
        self,
        run_id: UUID,
        *,
        status: str,
        active_agent: str,
        metadata: dict[str, Any],
        step_count: int,
        handoff_count: int,
        reason_code: str,
    ) -> None:
        self._connection.execute(
            "UPDATE agent_runs SET status=%s,active_agent=%s,execution_metadata=%s,"
            "step_count=%s,handoff_count=%s,reason_code=%s,version=version+1,updated_at=now() "
            "WHERE business_id=%s AND id=%s",
            (
                status,
                active_agent,
                Jsonb(metadata),
                step_count,
                handoff_count,
                reason_code,
                self.business_id,
                run_id,
            ),
        )

    def latest_run_for_conversation(self, conversation_id: UUID) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT r.id,r.status,r.active_agent,r.execution_metadata FROM agent_runs r "
            "JOIN messages m ON m.business_id=r.business_id AND m.id=r.message_id "
            "WHERE r.business_id=%s AND m.conversation_id=%s "
            "ORDER BY r.created_at DESC LIMIT 1",
            (self.business_id, conversation_id),
        ).fetchone()

    def list_conversations(self, limit: int, status: str | None = None) -> list[dict[str, Any]]:
        """Staff inbox rows: newest first, with the last message and the latest run."""
        return self._connection.execute(
            "SELECT c.id,c.customer_id,c.identity_id,c.status,c.version,c.created_at,c.updated_at,"
            "cu.display_name AS customer_name,ci.channel,"
            "lm.body AS last_body,lm.direction AS last_direction,lm.created_at AS last_at,"
            "r.status AS run_status,r.active_agent,r.reason_code "
            "FROM conversations c "
            "LEFT JOIN customers cu ON cu.business_id=c.business_id AND cu.id=c.customer_id "
            "LEFT JOIN customer_identities ci ON ci.business_id=c.business_id "
            "AND ci.id=c.identity_id "
            "LEFT JOIN LATERAL (SELECT body,direction,created_at FROM messages m "
            "WHERE m.business_id=c.business_id AND m.conversation_id=c.id "
            "ORDER BY m.created_at DESC,m.id DESC LIMIT 1) lm ON true "
            "LEFT JOIN LATERAL (SELECT ar.status,ar.active_agent,ar.reason_code FROM agent_runs ar "
            "JOIN messages m ON m.business_id=ar.business_id AND m.id=ar.message_id "
            "WHERE ar.business_id=c.business_id AND m.conversation_id=c.id "
            "ORDER BY ar.created_at DESC LIMIT 1) r ON true "
            "WHERE c.business_id=%s AND c.customer_id IS NOT NULL "
            "AND (%s::text IS NULL OR c.status=%s) "
            "ORDER BY COALESCE(lm.created_at,c.updated_at) DESC,c.id DESC LIMIT %s",
            (self.business_id, status, status, limit),
        ).fetchall()

    def get_conversation_detail(self, conversation_id: UUID) -> dict[str, Any] | None:
        return self._connection.execute(
            "SELECT c.id,c.customer_id,c.identity_id,c.status,c.version,c.created_at,c.updated_at,"
            "cu.display_name AS customer_name,ci.channel "
            "FROM conversations c "
            "LEFT JOIN customers cu ON cu.business_id=c.business_id AND cu.id=c.customer_id "
            "LEFT JOIN customer_identities ci ON ci.business_id=c.business_id "
            "AND ci.id=c.identity_id "
            "WHERE c.business_id=%s AND c.id=%s",
            (self.business_id, conversation_id),
        ).fetchone()

    def list_conversation_runs(self, conversation_id: UUID, limit: int) -> list[dict[str, Any]]:
        return self._connection.execute(
            "SELECT r.id,r.message_id,r.status,r.active_agent,r.reason_code,r.handoff_count,"
            "r.execution_metadata,r.created_at FROM agent_runs r "
            "JOIN messages m ON m.business_id=r.business_id AND m.id=r.message_id "
            "WHERE r.business_id=%s AND m.conversation_id=%s "
            "ORDER BY r.created_at DESC LIMIT %s",
            (self.business_id, conversation_id, limit),
        ).fetchall()

    def get_business_configuration(self) -> tuple[str, int] | None:
        row = self._connection.execute(
            "SELECT configuration_version,version FROM businesses WHERE id=%s",
            (self.business_id,),
        ).fetchone()
        return (row["configuration_version"], row["version"]) if row else None

    def sales_report_rows(
        self,
        start: datetime,
        end: datetime,
        granularity: str,
        product_id: UUID | None,
    ) -> Sequence[dict[str, Any]]:
        # Granularity is validated against this allowlist before interpolation.
        bucket = {"DAY": "day", "WEEK": "week", "MONTH": "month"}[granularity]
        return self._connection.execute(
            "SELECT date_trunc(%s, o.created_at AT TIME ZONE b.timezone) AS period, "
            "o.currency, SUM(i.quantity) AS units, SUM(i.quantity*i.unit_price) AS value "
            "FROM orders o JOIN businesses b ON b.id=o.business_id "
            "JOIN order_items i ON i.business_id=o.business_id AND i.order_id=o.id "
            "WHERE o.business_id=%s AND i.business_id=%s AND o.status='CONFIRMED' "
            "AND o.created_at >= %s AND o.created_at < %s "
            "AND (%s::uuid IS NULL OR i.product_id=%s::uuid) "
            "GROUP BY period,o.currency ORDER BY period,o.currency",
            (bucket, self.business_id, self.business_id, start, end, product_id, product_id),
        ).fetchall()

    @staticmethod
    def _product(row: dict[str, Any]) -> Product:
        return Product(
            business_id=row["business_id"],
            id=row["id"],
            sku=row["sku"],
            name=row["name"],
            price=Money(row["unit_price"], row["currency"]),
            active=row["active"],
            version=row["version"],
        )

    @staticmethod
    def _inventory(row: dict[str, Any]) -> Inventory:
        return Inventory(**row)
