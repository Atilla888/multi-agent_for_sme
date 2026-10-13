"""Durable write admission and canonical payload hashing."""

import hashlib
import json
from dataclasses import dataclass
from typing import Any
from uuid import UUID, uuid4

from platform_backend.domain.context import ExecutionContext
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.repositories.postgres import PostgresDatabase


def canonical_payload_hash(
    context: ExecutionContext, tool_name: str, payload: dict[str, Any]
) -> str:
    envelope = {
        "schema_version": "v1",
        "business_id": str(context.business_id),
        "actor_scope": context.principal.actor_scope,
        "tool_name": tool_name,
        "payload": payload,
    }
    encoded = json.dumps(envelope, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
    return hashlib.sha256(encoded.encode("utf-8")).hexdigest()


@dataclass(frozen=True)
class OperationTicket:
    id: UUID
    prior_result: dict[str, Any] | None = None


class OperationLedger:
    def __init__(self, database: PostgresDatabase) -> None:
        self._database = database

    def admit(
        self, context: ExecutionContext, tool_name: str, payload: dict[str, Any]
    ) -> OperationTicket:
        if not context.operation_key or not (1 <= len(context.operation_key) <= 200):
            raise DomainFailure(ErrorCode.VALIDATION_ERROR, "Server operation key is required")
        digest = canonical_payload_hash(context, tool_name, payload)
        proposed_id = uuid4()
        with self._database.transaction(context.business_id) as repository:
            created = repository.admit_operation(
                proposed_id, context.operation_key, tool_name, digest,
                context.principal.actor_scope, context.run_id,
            )
            if created:
                return OperationTicket(proposed_id)
            prior = repository.get_operation(
                tool_name, context.principal.actor_scope, context.operation_key
            )
            if prior is None:
                raise DomainFailure(ErrorCode.OUTCOME_UNKNOWN, "Operation requires reconciliation",
                                    reconciliation_required=True)
            if prior["canonical_payload_hash"] != digest:
                raise DomainFailure(
                    ErrorCode.CONFLICT, "Operation key was used for another request"
                )
            if prior["status"] == "SUCCEEDED" and isinstance(prior["result"], dict):
                return OperationTicket(prior["id"], prior["result"])
            if prior["status"] == "FAILED":
                code = ErrorCode(prior["error_code"] or ErrorCode.TOOL_FAILED.value)
                raise DomainFailure(code, "Prior operation failed")
            raise DomainFailure(
                ErrorCode.OUTCOME_UNKNOWN, "Operation requires reconciliation",
                reconciliation_required=True,
            )

    def mark_known_failure(
        self, context: ExecutionContext, operation_id: UUID, failure: DomainFailure
    ) -> None:
        with self._database.transaction(context.business_id) as repository:
            repository.finish_operation(operation_id, "FAILED", None, failure.code.value)
            repository.append_audit(
                uuid4(), context.correlation_id, context.principal.actor_scope,
                "TOOL_FAILED", "operation", operation_id,
                {"error_code": failure.code.value}, context.run_id,
            )

    def mark_unknown(self, context: ExecutionContext, operation_id: UUID) -> None:
        with self._database.transaction(context.business_id) as repository:
            if repository.mark_operation_unknown(operation_id):
                repository.append_audit(
                    uuid4(), context.correlation_id, context.principal.actor_scope,
                    "TOOL_OUTCOME_UNKNOWN", "operation", operation_id,
                    {"error_code": ErrorCode.OUTCOME_UNKNOWN.value}, context.run_id,
                )

    def lookup(
        self, context: ExecutionContext, tool_name: str, key: str
    ) -> dict[str, Any] | None:
        with self._database.transaction(context.business_id) as repository:
            return repository.get_operation(tool_name, context.principal.actor_scope, key)
