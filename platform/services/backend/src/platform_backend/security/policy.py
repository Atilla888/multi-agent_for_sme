"""Deterministic object and tenant authorization, independent of any LLM."""

from typing import Protocol
from uuid import UUID

from platform_backend.domain.context import PrincipalContext, PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode


class PolicyReader(Protocol):
    business_id: UUID

    def get_membership_role(self, user_id: UUID) -> str | None: ...

    def operator_assigned_to_customer(self, user_id: UUID, customer_id: UUID) -> bool: ...

    def identity_links_customer(self, identity_id: UUID, customer_id: UUID) -> bool: ...


def require_business_access(principal: PrincipalContext, reader: PolicyReader) -> None:
    if principal.business_id != reader.business_id:
        raise DomainFailure(ErrorCode.FORBIDDEN, "Business is not accessible")
    if principal.kind is PrincipalKind.USER:
        role = reader.get_membership_role(principal.subject_id)
        if role in {StaffRole.OWNER.value, StaffRole.OPERATOR.value} and (
            principal.staff_role is not None and principal.staff_role.value == role
        ):
            return
    if (
        principal.kind is PrincipalKind.CUSTOMER
        and principal.customer_id is not None
        and principal.identity_id is not None
        and reader.identity_links_customer(principal.identity_id, principal.customer_id)
    ):
        return
    raise DomainFailure(ErrorCode.FORBIDDEN, "Business is not accessible")


def require_customer_access(
    principal: PrincipalContext, reader: PolicyReader, customer_id: UUID
) -> None:
    if principal.business_id != reader.business_id:
        raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
    if principal.kind is PrincipalKind.CUSTOMER:
        if (
            principal.customer_id == customer_id
            and principal.identity_id is not None
            and reader.identity_links_customer(principal.identity_id, customer_id)
        ):
            return
        raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")
    if principal.kind is PrincipalKind.USER:
        actual = reader.get_membership_role(principal.subject_id)
        if actual == StaffRole.OWNER.value and principal.staff_role is StaffRole.OWNER:
            return
        if (
            actual == StaffRole.OPERATOR.value
            and principal.staff_role is StaffRole.OPERATOR
            and reader.operator_assigned_to_customer(principal.subject_id, customer_id)
        ):
            return
    raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Resource is not accessible")


def require_owner(principal: PrincipalContext, reader: PolicyReader) -> None:
    if (
        principal.business_id != reader.business_id
        or principal.kind is not PrincipalKind.USER
        or principal.staff_role is not StaffRole.OWNER
        or reader.get_membership_role(principal.subject_id) != StaffRole.OWNER.value
    ):
        raise DomainFailure(ErrorCode.FORBIDDEN, "Owner permission is required")
