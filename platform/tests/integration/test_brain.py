"""M06 Business Brain authorization and evidence against real PostgreSQL."""

from dataclasses import replace
from datetime import UTC, datetime, timedelta
from decimal import Decimal
from uuid import UUID, uuid4

import pytest

from platform_backend.application.identity import IdentityService
from platform_backend.application.orders import OrderService
from platform_backend.brain.contracts import (
    ArchitectureMode,
    ContextPurpose,
    ContextRequest,
    ContextStatus,
    DerivedSummary,
    DevContextLimits,
    KnowledgeContext,
    KnowledgeEvidence,
    Provenance,
    SourceType,
    SummaryFactClaim,
)
from platform_backend.brain.service import BusinessBrain
from platform_backend.brain.sources import ConversationProvider
from platform_backend.domain.context import AgentRole, PrincipalContext, PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import OrderLineRequest
from platform_backend.repositories.postgres import PostgresDatabase
from tests.support import TenantFixture, seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


def _request(fixture: TenantFixture, **changes) -> ContextRequest:
    defaults = dict(
        request_id=uuid4(), principal=fixture.context().principal,
        purpose=ContextPurpose.SALES, question="What is the current order and stock status?",
        policy_version="m06-dev-v1", agent_role=AgentRole.SALES,
        conversation_id=fixture.conversation_id, run_id=fixture.run_id,
        product_ids=(fixture.product_id,), customer_id=fixture.customer_id,
    )
    defaults.update(changes)
    return ContextRequest(**defaults)


def _order(fixture: TenantFixture, runtime_url: str, *, customer_id: UUID | None = None) -> UUID:
    result = OrderService(PostgresDatabase(runtime_url)).create_order(
        fixture.context(operation_key=f"brain-{uuid4()}"),
        customer_id or fixture.customer_id,
        (OrderLineRequest(fixture.product_id, Decimal("1"), 1),),
    )
    return UUID(result["order_id"])


def test_seven_typed_parts_provenance_minimal_projection_and_no_write(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    order_id = _order(fixture, runtime_url)
    database = PostgresDatabase(runtime_url)
    before = None
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM audit_logs WHERE business_id=%s", (fixture.business_id,))
        before = cursor.fetchone()[0]
    request = _request(fixture, order_id=order_id)
    bundle = BusinessBrain(database).build(request)
    assert bundle.request.request_id == request.request_id
    assert bundle.conversation.status is ContextStatus.PRESENT
    assert len(bundle.conversation.messages) == 1
    assert bundle.structured.products[0].id == fixture.product_id
    assert bundle.structured.inventory[0].provenance.source_version == "1"
    assert bundle.structured.customer is not None
    assert bundle.structured.order is not None and bundle.structured.order.status == "CREATED"
    assert bundle.structured.order.items[0].quantity == "1.0000"
    assert bundle.retrieved.status is ContextStatus.NOT_REQUESTED
    assert bundle.state.status is ContextStatus.PRESENT
    assert bundle.state.completed[0].tool_name == "create_order"
    assert bundle.rules.status is ContextStatus.PRESENT and len(bundle.rules.rules) == 4
    assert "create_order" in bundle.permissions.potential_tools
    assert bundle.trace.context_digest and bundle.trace.structured_count == 4
    assert all(item.provenance.business_id == fixture.business_id
               for item in bundle.structured.products)
    projection = str(bundle.model_projection())
    assert "contact_reference" not in projection
    assert "DATABASE_URL" not in projection
    assert "secret_reference" not in projection
    with admin_connection.cursor() as cursor:
        cursor.execute("SELECT count(*) FROM audit_logs WHERE business_id=%s", (fixture.business_id,))
        assert cursor.fetchone()[0] == before


def test_customer_owned_order_and_foreign_tenant_order_are_distinguished_safely(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)
    own_order, foreign_order = _order(a, runtime_url), _order(b, runtime_url)
    customer = PrincipalContext(
        PrincipalKind.CUSTOMER, a.identity_id, a.business_id,
        customer_id=a.customer_id, identity_id=a.identity_id,
    )
    brain = BusinessBrain(PostgresDatabase(runtime_url))
    own = brain.build(_request(a, principal=customer, order_id=own_order))
    assert own.structured.order is not None and own.structured.order.id == own_order
    foreign = brain.build(_request(a, principal=customer, order_id=foreign_order))
    assert foreign.structured.order is None
    assert any(item.kind == "order" and item.status is ContextStatus.NOT_ACCESSIBLE
               for item in foreign.structured.missing)
    assert str(foreign_order) not in str(foreign.model_projection())


def test_same_tenant_other_customer_order_is_not_exposed(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    database = PostgresDatabase(runtime_url)
    other = IdentityService(database).resolve_or_create_verified_channel_identity(
        fixture.business_id, "TELEGRAM", "brain-other-customer", uuid4()
    )
    order_id = _order(fixture, runtime_url, customer_id=other.customer_id)
    customer = PrincipalContext(
        PrincipalKind.CUSTOMER, fixture.identity_id, fixture.business_id,
        customer_id=fixture.customer_id, identity_id=fixture.identity_id,
    )
    bundle = BusinessBrain(database).build(_request(fixture, principal=customer,
                                                    order_id=order_id))
    assert bundle.structured.order is None
    assert any(item.kind == "order" and item.status is ContextStatus.NOT_ACCESSIBLE
               for item in bundle.structured.missing)


def test_summary_cannot_override_current_order_and_digest_is_repeatable(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    order_id = _order(fixture, runtime_url)

    class Summary:
        def get_summary(self, request: ContextRequest) -> DerivedSummary:
            return DerivedSummary(
                "Order confirmed according to old summary",
                Provenance(SourceType.SUMMARY, "summary:dev", "1", request.business_id,
                           datetime.now(UTC), ContextStatus.PRESENT, "CONVERSATION"),
                (SummaryFactClaim("ORDER_STATUS", "CONFIRMED", order_id),),
            )

    database = PostgresDatabase(runtime_url)
    brain = BusinessBrain(database, conversation=ConversationProvider(database, Summary()))
    request = _request(fixture, order_id=order_id)
    first = brain.build(request)
    second = brain.build(replace(request, request_id=uuid4()))
    assert first.structured.order is not None and first.structured.order.status == "CREATED"
    assert any(item.winning_source is SourceType.ORDER
               and item.reason == "LOWER_AUTHORITY_CONTRADICTION_IGNORED"
               for item in first.structured.conflicts)
    assert first.trace.context_digest == second.trace.context_digest


def test_bounded_history_and_stale_inventory_are_explicit(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    with admin_connection.cursor() as cursor:
        for number in range(6):
            cursor.execute(
                "INSERT INTO messages(business_id,id,conversation_id,direction,body,status,"
                "correlation_id,updated_at) VALUES (%s,%s,%s,'OUTBOUND',%s,'DELIVERED',%s,now())",
                (fixture.business_id, uuid4(), fixture.conversation_id,
                 f"synthetic message {number}", uuid4()),
            )
        cursor.execute(
            "UPDATE inventory SET updated_at=now()-interval '1 day' "
            "WHERE business_id=%s AND product_id=%s",
            (fixture.business_id, fixture.product_id),
        )
    limits = DevContextLimits(DEV_CONTEXT_MAX_MESSAGES=2,
                              DEV_CONTEXT_INVENTORY_STALE_AFTER_SECONDS=30)
    bundle = BusinessBrain(PostgresDatabase(runtime_url)).build(_request(fixture, limits=limits))
    assert len(bundle.conversation.messages) == 2
    assert bundle.conversation.truncated and "conversation" in bundle.trace.truncated_sections
    assert bundle.structured.inventory[0].provenance.status is ContextStatus.STALE


def test_architecture_mode_never_changes_structured_truth_or_tool_matrix(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    brain = BusinessBrain(PostgresDatabase(runtime_url))
    single = brain.build(_request(fixture, architecture_mode=ArchitectureMode.SINGLE))
    adaptive = brain.build(_request(fixture,
                                    architecture_mode=ArchitectureMode.ADAPTIVE_MULTI))
    assert single.structured.inventory[0].available_qty == adaptive.structured.inventory[0].available_qty
    assert single.permissions.potential_tools == adaptive.permissions.potential_tools
    assert single.trace.context_digest == adaptive.trace.context_digest


def test_run_agent_mismatch_fails_closed(admin_connection, runtime_url: str) -> None:
    fixture = seed_tenant(admin_connection)
    with pytest.raises(DomainFailure) as denied:
        BusinessBrain(PostgresDatabase(runtime_url)).build(
            _request(fixture, agent_role=AgentRole.SUPPORT)
        )
    assert denied.value.code is ErrorCode.POLICY_REJECTED


def test_owner_analytics_report_and_nonowner_denial(admin_connection, runtime_url: str) -> None:
    owner = seed_tenant(admin_connection)
    operator = seed_tenant(admin_connection, role="OPERATOR")
    now = datetime.now(UTC)
    changes = dict(
        purpose=ContextPurpose.ANALYTICS, agent_role=AgentRole.ANALYTICS,
        run_id=None, conversation_id=None, product_ids=(), customer_id=None,
        report_start=now - timedelta(days=1), report_end=now + timedelta(days=1),
    )
    owner_bundle = BusinessBrain(PostgresDatabase(runtime_url)).build(_request(owner, **changes))
    assert owner_bundle.structured.report is not None
    assert owner_bundle.structured.forecast_availability is ContextStatus.UNAVAILABLE
    assert owner_bundle.permissions.potential_tools == ("forecast_sales", "get_sales_report")
    operator_bundle = BusinessBrain(PostgresDatabase(runtime_url)).build(
        _request(operator, principal=operator.context(role=StaffRole.OPERATOR).principal,
                 **changes)
    )
    assert operator_bundle.structured.report is None
    assert operator_bundle.permissions.status is ContextStatus.NOT_ACCESSIBLE


def test_foreign_knowledge_provider_result_fails_closed(
    admin_connection, runtime_url: str
) -> None:
    a, b = seed_tenant(admin_connection), seed_tenant(admin_connection)

    class ForeignKnowledge:
        def retrieve(self, request: ContextRequest) -> KnowledgeContext:
            return KnowledgeContext(ContextStatus.PRESENT, (
                KnowledgeEvidence(
                    uuid4(), uuid4(), uuid4(), "foreign", 0.99, "line:1",
                    Provenance(SourceType.KNOWLEDGE, "document:foreign", "1", b.business_id,
                               datetime.now(UTC), ContextStatus.PRESENT, "CUSTOMER"),
                ),
            ))

    with pytest.raises(DomainFailure) as denied:
        BusinessBrain(PostgresDatabase(runtime_url), knowledge=ForeignKnowledge()).build(
            _request(a, include_knowledge=True)
        )
    assert denied.value.code is ErrorCode.NOT_ACCESSIBLE


def test_same_tenant_staff_knowledge_is_not_exposed_to_customer(
    admin_connection, runtime_url: str
) -> None:
    fixture = seed_tenant(admin_connection)
    customer = PrincipalContext(
        PrincipalKind.CUSTOMER, fixture.identity_id, fixture.business_id,
        customer_id=fixture.customer_id, identity_id=fixture.identity_id,
    )

    class RestrictedKnowledge:
        def retrieve(self, request: ContextRequest) -> KnowledgeContext:
            return KnowledgeContext(ContextStatus.PRESENT, (
                KnowledgeEvidence(
                    uuid4(), uuid4(), uuid4(), "staff-only content", 0.95, "line:1",
                    Provenance(SourceType.KNOWLEDGE, "document:staff", "1",
                               fixture.business_id, datetime.now(UTC),
                               ContextStatus.PRESENT, "STAFF"),
                ),
            ))

    with pytest.raises(DomainFailure) as denied:
        BusinessBrain(PostgresDatabase(runtime_url), knowledge=RestrictedKnowledge()).build(
            _request(fixture, principal=customer, include_knowledge=True)
        )
    assert denied.value.code is ErrorCode.NOT_ACCESSIBLE
