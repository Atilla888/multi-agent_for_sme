"""Authenticated HTTP adapters over unchanged existing query services."""

from datetime import UTC, datetime
from typing import Annotated, Literal
from uuid import UUID

from fastapi import APIRouter, Depends, Header, Request
from fastapi import Query as HttpQuery
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from platform_backend.api.configuration import HttpServices, configured_services
from platform_backend.api.schemas import (
    ConversationDetailDto,
    ConversationMessageDto,
    ConversationPageDto,
    ConversationRunDto,
    ConversationSummaryDto,
    CustomerDto,
    InventoryDto,
    InventoryPageDto,
    OrderDto,
    OrderItemDto,
    PrincipalDto,
    ProductDto,
    ProductPageDto,
    SalesReportDto,
)
from platform_backend.domain.context import PrincipalContext, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.domain.models import Product
from platform_backend.security.policy import require_business_access, require_customer_access

router = APIRouter()
bearer = HTTPBearer(auto_error=False)


def services(request: Request) -> HttpServices:
    configured = getattr(request.app.state, "http_services", None)
    if configured is not None:
        return configured  # type: ignore[no-any-return]
    try:
        return configured_services()
    except ValueError as exc:
        raise DomainFailure(
            ErrorCode.DEPENDENCY_UNAVAILABLE, "Integration is not configured"
        ) from exc


def principal(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    business_id: Annotated[str | None, Header(alias="X-Business-ID")] = None,
) -> PrincipalContext:
    if credentials is None or len(credentials.credentials) > 16_384:
        raise DomainFailure(ErrorCode.UNAUTHENTICATED, "Staff authentication is required")
    if business_id is None:
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Selected business scope is required")
    try:
        selected = UUID(business_id)
    except ValueError as exc:
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid selected business scope") from exc
    return services(request).identity.resolve(credentials.credentials, selected)


Principal = Annotated[PrincipalContext, Depends(principal)]
Services = Annotated[HttpServices, Depends(services)]


def product_dto(item: Product) -> ProductDto:
    return ProductDto(
        id=item.id,
        sku=item.sku,
        name=item.name,
        unit_price=str(item.price.amount),
        currency=item.price.currency,
        active=item.active,
        version=item.version,
    )


@router.get("/me", response_model=PrincipalDto)
def me(request: Request, scope: Principal, http: Services) -> PrincipalDto:
    credentials = request.headers["authorization"].split(" ", 1)[1]
    claims = http.verifier.verify_access_token(credentials)
    if scope.staff_role in {StaffRole.OWNER, StaffRole.OPERATOR}:
        with http.database.transaction(scope.business_id) as repository:
            require_business_access(scope, repository)
    return PrincipalDto(
        subject=scope.subject_id,
        kind="USER",
        role=scope.staff_role,  # type: ignore[arg-type]
        business_id=scope.business_id,
        # The existing configuration reader returns versions, not a display name.
        business_name=None,
        expires_at=datetime.fromtimestamp(claims["exp"], UTC),
    )


@router.get("/products", response_model=ProductPageDto)
def products(
    scope: Principal,
    http: Services,
    q: Annotated[str, HttpQuery(min_length=1, max_length=120)],
    limit: Annotated[int, HttpQuery(ge=1, le=50)] = 25,
    after_name: Annotated[str | None, HttpQuery(max_length=250)] = None,
    after_id: UUID | None = None,
) -> ProductPageDto:
    if (after_name is None) != (after_id is None):
        raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Both cursor fields are required")
    after = (after_name, after_id) if after_name is not None and after_id is not None else None
    rows = http.queries.find_products(scope, q, limit, after)
    shown = rows[:limit]
    last = shown[-1] if len(rows) > limit and shown else None
    return ProductPageDto(
        items=[product_dto(item) for item in shown],
        next_name=last.name if last else None,
        next_id=last.id if last else None,
    )


@router.get("/products/{product_id}", response_model=ProductDto)
def product(product_id: UUID, scope: Principal, http: Services) -> ProductDto:
    return product_dto(http.queries.get_product(scope, product_id))


@router.get("/inventory", response_model=InventoryPageDto)
def inventory(
    scope: Principal,
    http: Services,
    product_id: Annotated[list[UUID], HttpQuery(min_length=1, max_length=50)],
) -> InventoryPageDto:
    rows = http.queries.check_inventory(scope, tuple(product_id))
    return InventoryPageDto(
        items=[
            InventoryDto(
                id=item.id,
                product_id=item.product_id,
                available_quantity=str(item.available_qty),
                reserved_quantity=str(item.reserved_qty),
                version=item.version,
                observed_at=item.observed_at,
            )
            for item in rows
        ]
    )


@router.get("/customers/{customer_id}", response_model=CustomerDto)
def customer(customer_id: UUID, scope: Principal, http: Services) -> CustomerDto:
    item = http.queries.find_customer(scope, customer_id)
    if item is None:
        raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
    return CustomerDto(id=item.id, display_name=item.display_name, version=item.version)


@router.get("/orders/{order_id}", response_model=OrderDto)
def order(order_id: UUID, scope: Principal, http: Services) -> OrderDto:
    item = http.queries.get_order(scope, order_id)
    return OrderDto(
        id=item.id,
        customer_id=item.customer_id,
        status=item.status,
        currency=item.currency,
        version=item.version,
        created_at=item.created_at,
        delivery_reference=item.delivery_reference,
        items=[
            OrderItemDto(
                id=line.id,
                product_id=line.product_id,
                quantity=str(line.quantity),
                reserved_quantity=str(line.reserved_qty),
                unit_price=str(line.price.amount),
                version=line.version,
            )
            for line in item.items
        ],
    )


@router.get("/analytics/sales", response_model=SalesReportDto)
def sales(
    scope: Principal,
    http: Services,
    start: datetime,
    end: datetime,
    granularity: Literal["DAY", "WEEK", "MONTH"] = "DAY",
    target: Literal["CONFIRMED_ORDER_UNITS", "CONFIRMED_ORDER_VALUE"] = "CONFIRMED_ORDER_UNITS",
    product_id: UUID | None = None,
) -> SalesReportDto:
    return SalesReportDto.model_validate(
        http.queries.report(scope, start, end, granularity, target, product_id)
    )


def _conversation_summary(row: dict[str, object]) -> ConversationSummaryDto:
    return ConversationSummaryDto(
        id=row["id"],  # type: ignore[arg-type]
        customer_id=row["customer_id"],  # type: ignore[arg-type]
        customer_name=row.get("customer_name"),  # type: ignore[arg-type]
        channel=row.get("channel"),  # type: ignore[arg-type]
        status=row["status"],  # type: ignore[arg-type]
        last_message=row.get("last_body"),  # type: ignore[arg-type]
        last_direction=row.get("last_direction"),  # type: ignore[arg-type]
        last_at=row.get("last_at"),  # type: ignore[arg-type]
        run_status=row.get("run_status"),  # type: ignore[arg-type]
        active_agent=row.get("active_agent"),  # type: ignore[arg-type]
        outcome=row.get("reason_code"),  # type: ignore[arg-type]
        version=row["version"],  # type: ignore[arg-type]
        updated_at=row["updated_at"],  # type: ignore[arg-type]
    )


@router.get("/conversations", response_model=ConversationPageDto)
def conversations(
    scope: Principal,
    http: Services,
    status: Annotated[Literal["OPEN", "ESCALATED", "CLOSED"] | None, HttpQuery()] = None,
    limit: Annotated[int, HttpQuery(ge=1, le=100)] = 50,
) -> ConversationPageDto:
    """Customer conversations the staff member may see; operators only see assigned customers."""
    with http.database.transaction(scope.business_id) as repository:
        require_business_access(scope, repository)
        rows = repository.list_conversations(limit, status)
        visible = []
        for row in rows:
            try:
                require_customer_access(scope, repository, row["customer_id"])
            except DomainFailure:
                continue
            visible.append(_conversation_summary(row))
    return ConversationPageDto(items=visible)


@router.get("/conversations/{conversation_id}", response_model=ConversationDetailDto)
def conversation(conversation_id: UUID, scope: Principal, http: Services) -> ConversationDetailDto:
    with http.database.transaction(scope.business_id) as repository:
        require_business_access(scope, repository)
        row = repository.get_conversation_detail(conversation_id)
        if row is None or row["customer_id"] is None:
            raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
        require_customer_access(scope, repository, row["customer_id"])
        messages = repository.list_conversation_messages(conversation_id, 200)
        runs = repository.list_conversation_runs(conversation_id, 50)
        latest = runs[0] if runs else None
        summary = _conversation_summary(
            {
                **row,
                "last_body": messages[-1]["body"] if messages else None,
                "last_direction": messages[-1]["direction"] if messages else None,
                "last_at": messages[-1]["created_at"] if messages else None,
                "run_status": latest["status"] if latest else None,
                "active_agent": latest["active_agent"] if latest else None,
                "reason_code": latest["reason_code"] if latest else None,
            }
        )
    return ConversationDetailDto(
        conversation=summary,
        messages=[
            ConversationMessageDto(
                id=item["id"],
                direction=item["direction"],
                body=item["body"],
                status=item["status"],
                created_at=item["created_at"],
            )
            for item in messages
        ],
        runs=[
            ConversationRunDto(
                id=item["id"],
                status=item["status"],
                active_agent=item["active_agent"],
                outcome=item["reason_code"],
                handoff_count=item["handoff_count"],
                created_at=item["created_at"],
            )
            for item in runs
        ],
    )
