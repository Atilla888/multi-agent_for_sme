"""Read-only Business Brain: assembles seven typed sources without an LLM."""

import hashlib
import time
from dataclasses import replace
from datetime import UTC, datetime

from platform_backend.brain.conflicts import FactKind, SourceClaim, resolve_claims
from platform_backend.brain.contracts import (
    ConflictDecision,
    ContextBuildTrace,
    ContextBundle,
    ContextRequest,
    ContextStatus,
    ConversationContext,
    KnowledgeContext,
    KnowledgeEvidence,
    Provenance,
    RequestContext,
    RulesContext,
    RuntimeStateContext,
    SourceType,
    StructuredContext,
    canonical_context_digest,
)
from platform_backend.brain.sources import (
    ConversationProvider,
    KnowledgeProvider,
    NoKnowledgeProvider,
    PermissionsProvider,
    RulesProvider,
    RuntimeStateProvider,
    StructuredProvider,
    redact_context_text,
)
from platform_backend.domain.context import PrincipalKind, StaffRole
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.repositories.postgres import PostgresDatabase


class BusinessBrain:
    def __init__(
        self,
        database: PostgresDatabase,
        *,
        knowledge: KnowledgeProvider | None = None,
        conversation: ConversationProvider | None = None,
    ) -> None:
        self._conversation = conversation or ConversationProvider(database)
        self._structured = StructuredProvider(database)
        self._state = RuntimeStateProvider(database)
        self._rules = RulesProvider(database)
        self._permissions = PermissionsProvider(database)
        self._knowledge = knowledge or NoKnowledgeProvider()

    def build(self, request: ContextRequest) -> ContextBundle:
        started = time.monotonic()
        safe_question, question_truncated = redact_context_text(
            request.question, request.limits.DEV_CONTEXT_MAX_DOCUMENT_CHARS
        )
        request_context = RequestContext(
            request.request_id,
            request.purpose,
            safe_question,
            Provenance(
                SourceType.REQUEST,
                f"request:{request.request_id}",
                request.policy_version,
                request.business_id,
                datetime.now(UTC),
                ContextStatus.PRESENT,
                "PRINCIPAL",
                content_digest=hashlib.sha256(safe_question.encode()).hexdigest(),
            ),
        )
        conversation = self._conversation.get(request)
        structured = self._structured.get(request)
        state = self._state.get(request)
        if state.status is ContextStatus.PRESENT and state.active_agent != request.agent_role.value:
            raise DomainFailure(ErrorCode.POLICY_REJECTED, "Run agent role has changed")
        rules = self._rules.get(request)
        permissions = self._permissions.get(request)
        retrieved = (
            self._knowledge.retrieve(request)
            if request.include_knowledge
            else KnowledgeContext(ContextStatus.NOT_REQUESTED)
        )
        retrieved = self._bounded_knowledge(request, retrieved)
        if state.status is ContextStatus.PRESENT:
            conversation = replace(
                conversation,
                operation_references=tuple(
                    item.id for item in (*state.completed, *state.unresolved)
                )
                if conversation.status is ContextStatus.PRESENT
                else (),
            )
        structured = replace(
            structured,
            conflicts=self._resolve_conflicts(structured, conversation, retrieved),
        )
        requested = ["request", "structured", "rules", "permissions"]
        if request.conversation_id is not None:
            requested.append("conversation")
        if request.run_id is not None:
            requested.append("state")
        if request.include_knowledge:
            requested.append("retrieved")
        included = ["request", "structured", "rules", "permissions"]
        if conversation.status is ContextStatus.PRESENT:
            included.append("conversation")
        if state.status is ContextStatus.PRESENT:
            included.append("state")
        if retrieved.status is ContextStatus.PRESENT:
            included.append("retrieved")
        missing = [item.reason for item in structured.missing]
        for part in (conversation, state, retrieved):
            if part.missing_reason:
                missing.append(part.missing_reason)
        truncated = []
        if question_truncated:
            truncated.append("request")
        if conversation.truncated:
            truncated.append("conversation")
        if structured.truncated:
            truncated.append("structured")
        if state.truncated:
            truncated.append("state")
        if retrieved.truncated:
            truncated.append("retrieved")
        source_versions = self._source_versions(structured, conversation, state, rules, retrieved)
        trace = ContextBuildTrace(
            tuple(requested),
            tuple(included),
            source_versions,
            tuple(missing),
            tuple(decision.reason for decision in structured.conflicts),
            len(conversation.messages),
            self._structured_count(structured),
            len(retrieved.evidence),
            tuple(truncated),
            (time.monotonic() - started) * 1000,
            "",
        )
        bundle = ContextBundle(
            request_context, conversation, structured, retrieved, state, rules, permissions, trace
        )
        return replace(
            bundle,
            trace=replace(
                trace, context_digest=canonical_context_digest(bundle.model_projection())
            ),
        )

    @staticmethod
    def _bounded_knowledge(
        request: ContextRequest, knowledge: KnowledgeContext
    ) -> KnowledgeContext:
        limit = request.limits.DEV_CONTEXT_MAX_RETRIEVED_CHUNKS
        truncated = knowledge.truncated or len(knowledge.evidence) > limit
        evidence: list[KnowledgeEvidence] = []
        for item in knowledge.evidence[:limit]:
            if item.provenance.business_id != request.business_id:
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Knowledge scope is not accessible")
            scope = item.provenance.permission_scope
            if scope == "STAFF" and not (
                request.principal.kind is PrincipalKind.USER
                and request.principal.staff_role is StaffRole.OWNER
            ):
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Knowledge scope is not accessible")
            if scope not in {"CUSTOMER", "STAFF"}:
                raise DomainFailure(ErrorCode.NOT_ACCESSIBLE, "Knowledge scope is not accessible")
            text, clipped = redact_context_text(
                item.text, request.limits.DEV_CONTEXT_MAX_DOCUMENT_CHARS
            )
            truncated |= clipped
            evidence.append(
                replace(
                    item,
                    text=text,
                    provenance=replace(
                        item.provenance, content_digest=hashlib.sha256(text.encode()).hexdigest()
                    ),
                )
            )
        return replace(knowledge, evidence=tuple(evidence), truncated=truncated)

    @staticmethod
    def _resolve_conflicts(
        structured: StructuredContext,
        conversation: ConversationContext,
        retrieved: KnowledgeContext,
    ) -> tuple[ConflictDecision, ...]:
        claims: list[SourceClaim] = []
        if structured.order is not None:
            claims.append(
                SourceClaim(
                    FactKind.ORDER_STATUS,
                    structured.order.status,
                    SourceType.ORDER,
                    structured.order.provenance.source_reference,
                    resource_id=structured.order.id,
                )
            )
        for item in structured.inventory:
            claims.append(
                SourceClaim(
                    FactKind.INVENTORY_QUANTITY,
                    item.available_qty,
                    SourceType.INVENTORY,
                    item.provenance.source_reference,
                    resource_id=item.product_id,
                )
            )
        if conversation.summary is not None:
            for claim in conversation.summary.claims:
                try:
                    kind = FactKind(claim.fact_kind)
                except ValueError:
                    continue
                claims.append(
                    SourceClaim(
                        kind,
                        claim.value,
                        SourceType.SUMMARY,
                        conversation.summary.provenance.source_reference,
                        resource_id=claim.resource_id,
                    )
                )
        for evidence in retrieved.evidence:
            for claim in evidence.claims:
                try:
                    kind = FactKind(claim.fact_kind)
                except ValueError:
                    continue
                claims.append(
                    SourceClaim(
                        kind,
                        claim.value,
                        SourceType.KNOWLEDGE,
                        evidence.provenance.source_reference,
                        current=evidence.provenance.status is ContextStatus.PRESENT,
                        published=True,
                        resource_id=claim.resource_id,
                    )
                )
        decisions = []
        for kind in FactKind:
            typed = [claim for claim in claims if claim.kind is kind]
            if not typed:
                continue
            resource_ids = {claim.resource_id for claim in typed if claim.resource_id is not None}
            if not resource_ids:
                decisions.append(resolve_claims(kind, tuple(typed)))
                continue
            for resource_id in sorted(resource_ids, key=str):
                scoped = tuple(claim for claim in typed if claim.resource_id == resource_id)
                if len(resource_ids) == 1:
                    scoped += tuple(claim for claim in typed if claim.resource_id is None)
                decision = resolve_claims(kind, scoped)
                decisions.append(replace(decision, fact_kind=f"{kind.value}:{resource_id}"))
        return tuple(decisions)

    @staticmethod
    def _structured_count(structured: StructuredContext) -> int:
        return (
            len(structured.products)
            + len(structured.inventory)
            + int(structured.customer is not None)
            + int(structured.order is not None)
            + int(structured.report is not None)
        )

    @staticmethod
    def _source_versions(
        structured: StructuredContext,
        conversation: ConversationContext,
        state: RuntimeStateContext,
        rules: RulesContext,
        retrieved: KnowledgeContext,
    ) -> tuple[str, ...]:
        provenances: list[Provenance] = []
        provenances.extend(item.provenance for item in structured.products)
        provenances.extend(item.provenance for item in structured.inventory)
        provenances.extend(item.provenance for item in conversation.messages)
        provenances.extend(item.provenance for item in retrieved.evidence)
        for item in (structured.customer, structured.order, structured.report):
            if item is not None:
                provenances.append(item.provenance)
        if conversation.summary is not None:
            provenances.append(conversation.summary.provenance)
        provenances.extend(item.provenance for item in state.completed)
        provenances.extend(item.provenance for item in state.unresolved)
        provenances.extend(item.provenance for item in rules.rules)
        if state.provenance is not None:
            provenances.append(state.provenance)
        return tuple(
            sorted({f"{item.source_reference}@{item.source_version}" for item in provenances})
        )
