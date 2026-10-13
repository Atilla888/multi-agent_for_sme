"""Q01 channel identity resolution; no phone or cross-channel inference."""

import hashlib
from dataclasses import dataclass
from uuid import UUID, uuid4

import psycopg

from platform_backend.domain.context import PrincipalContext, PrincipalKind
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.repositories.postgres import PostgresDatabase

CHANNELS = frozenset({"TELEGRAM", "WHATSAPP", "INSTAGRAM", "WEB"})


@dataclass(frozen=True)
class LinkedCustomer:
    business_id: UUID
    customer_id: UUID
    identity_id: UUID
    channel: str

    def principal(self) -> PrincipalContext:
        return PrincipalContext(
            kind=PrincipalKind.CUSTOMER,
            subject_id=self.identity_id,
            business_id=self.business_id,
            customer_id=self.customer_id,
            identity_id=self.identity_id,
        )


class IdentityService:
    def __init__(self, database: PostgresDatabase) -> None:
        self._database = database

    def resolve_or_create_verified_channel_identity(
        self, business_id: UUID, channel: str, external_user_id: str,
        correlation_id: UUID,
    ) -> LinkedCustomer:
        """Caller must have verified the provider/session before invoking this method."""
        if channel not in CHANNELS or not (1 <= len(external_user_id) <= 200):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Invalid channel identity")
        actor_digest = hashlib.sha256(
            f"{business_id}:{channel}:{external_user_id}".encode()
        ).hexdigest()
        try:
            with self._database.transaction(business_id) as repository:
                existing = repository.get_customer_identity(channel, external_user_id)
                if existing is not None:
                    return LinkedCustomer(
                        business_id, existing["customer_id"], existing["id"], channel
                    )
                customer_id, identity_id = uuid4(), uuid4()
                repository.insert_customer_identity(
                    customer_id, identity_id, channel, external_user_id
                )
                repository.append_audit(
                    uuid4(), correlation_id, f"CHANNEL:{actor_digest}",
                    "IDENTITY_RESOLVED", "customer_identity", identity_id,
                    {"link_method": "FIRST_CONTACT", "channel": channel},
                )
                return LinkedCustomer(business_id, customer_id, identity_id, channel)
        except psycopg.errors.UniqueViolation:
            # The losing first-contact transaction was rolled back in full.
            with self._database.transaction(business_id) as repository:
                winner = repository.get_customer_identity(channel, external_user_id)
                if winner is None:
                    raise DomainFailure(
                        ErrorCode.OUTCOME_UNKNOWN, "Identity creation needs reconciliation",
                        reconciliation_required=True,
                    ) from None
                return LinkedCustomer(business_id, winner["customer_id"], winner["id"], channel)
