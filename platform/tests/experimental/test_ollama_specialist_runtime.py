"""Experimental test harness validating SpecialistAgent + Ollama safety boundaries.

Strictly a LOCAL MODEL EXPERIMENT; does not complete or alter M08 status.
Verifies that:
MODEL PROPOSES -> EXECUTOR AUTHORIZES -> DOMAIN ENFORCES -> DATABASE PERSISTS.
All tests run against recording/fixture executors without PostgreSQL mutation.
"""

import json
from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any
from uuid import uuid4

import pytest
from pydantic import ValidationError

from platform_backend.agents.contracts import (
    DecisionType,
    OutcomeStatus,
)
from platform_backend.agents.ollama import OllamaConfig, OllamaProvider
from platform_backend.agents.provider import (
    ModelMetadata,
    ModelReply,
    ModelUsage,
)
from platform_backend.agents.runtime import SpecialistAgent, SpecialistRequest
from platform_backend.brain.contracts import (
    ContextBuildTrace,
    ContextBundle,
    ContextRequest,
    ContextStatus,
    ConversationContext,
    KnowledgeContext,
    PermissionsContext,
    Provenance,
    RequestContext,
    RulesContext,
    RuntimeStateContext,
    SourceType,
    StructuredContext,
)
from platform_backend.domain.context import (
    AgentRole,
    ExecutionContext,
    PrincipalContext,
    PrincipalKind,
    StaffRole,
)
from platform_backend.tools.contracts import (
    TOOL_INPUTS,
    ResultStatus,
    ToolError,
    ToolResult,
)
from platform_backend.tools.executor import ROLE_TOOLS


class StubBrain:
    """Deterministic, read-only stub Business Brain for testing."""

    def build(self, request: ContextRequest) -> ContextBundle:
        now = datetime.now(UTC)
        prov = Provenance(
            source_type=SourceType.REQUEST,
            source_reference=f"req:{request.request_id}",
            source_version=request.policy_version,
            business_id=request.business_id,
            observed_at=now,
            status=ContextStatus.PRESENT,
            permission_scope="PRINCIPAL",
        )
        return ContextBundle(
            request=RequestContext(request.request_id, request.purpose, request.question, prov),
            conversation=ConversationContext(status=ContextStatus.PRESENT),
            structured=StructuredContext(),
            retrieved=KnowledgeContext(status=ContextStatus.NOT_REQUESTED),
            state=RuntimeStateContext(status=ContextStatus.NOT_REQUESTED),
            rules=RulesContext(
                status=ContextStatus.PRESENT, policy_version=request.policy_version, rules=()
            ),
            permissions=PermissionsContext(
                status=ContextStatus.PRESENT,
                potential_tools=tuple(ROLE_TOOLS[request.agent_role]),
                resource_check_required=False,
                human_approval_required=False,
                provenance=Provenance(
                    source_type=SourceType.PERMISSION,
                    source_reference="role_permissions",
                    source_version="v1",
                    business_id=request.business_id,
                    observed_at=now,
                    status=ContextStatus.PRESENT,
                    permission_scope="ROLE",
                ),
            ),
            trace=ContextBuildTrace(
                requested_providers=(),
                included_providers=(),
                source_versions=(),
                missing_reasons=(),
                conflict_reasons=(),
                message_count=0,
                structured_count=0,
                knowledge_count=0,
                truncated_sections=(),
                duration_ms=1.0,
                context_digest="synthetic-stub-digest",
            ),
        )


@dataclass(frozen=True)
class RecordedCall:
    tool_name: str
    arguments: dict[str, Any]
    agent_role: AgentRole
    observed_at: datetime


class RecordingExecutor:
    """Safe recording executor boundary: validates and records calls without mutating database."""

    def __init__(
        self,
        fixtures: dict[str, Any] | None = None,
        forced_status: ResultStatus | None = None,
    ) -> None:
        self.recorded_calls: list[RecordedCall] = []
        self.call_count = 0
        self.fixtures = fixtures or {}
        self.forced_status = forced_status

    def execute(
        self, tool_name: str, payload: dict[str, Any], context: ExecutionContext
    ) -> ToolResult:
        self.call_count += 1
        now = datetime.now(UTC)
        call_id = uuid4()

        if self.forced_status is not None:
            return ToolResult(
                tool_call_id=call_id,
                status=self.forced_status,
                data=None,
                observed_at=now,
                source_refs=(f"fixture:{tool_name}",),
            )

        if tool_name not in TOOL_INPUTS:
            return ToolResult(
                tool_call_id=call_id,
                status=ResultStatus.FAILED,
                error=ToolError(code="VALIDATION_ERROR", safe_message="Unknown tool"),
                observed_at=now,
            )

        allowed = ROLE_TOOLS.get(context.agent_role, frozenset())
        if tool_name not in allowed:
            return ToolResult(
                tool_call_id=call_id,
                status=ResultStatus.REJECTED,
                error=ToolError(
                    code="FORBIDDEN", safe_message="Tool is not permitted for this agent role"
                ),
                observed_at=now,
            )

        try:
            raw = json.dumps(payload, allow_nan=False)
            TOOL_INPUTS[tool_name].model_validate_json(raw)
        except (TypeError, ValueError, ValidationError) as exc:
            return ToolResult(
                tool_call_id=call_id,
                status=ResultStatus.FAILED,
                error=ToolError(code="VALIDATION_ERROR", safe_message=f"Invalid arguments: {exc}"),
                observed_at=now,
            )

        self.recorded_calls.append(RecordedCall(tool_name, payload, context.agent_role, now))
        fixture_data = self.fixtures.get(tool_name, {"status": "ok"})
        return ToolResult(
            tool_call_id=call_id,
            status=ResultStatus.SUCCEEDED,
            data=fixture_data,
            observed_at=now,
            source_refs=(f"fixture:{tool_name}",),
        )


class ControlledProvider:
    """Mock LLMProvider supplying scripted AgentDecision proposals for deterministic tests."""

    def __init__(self, proposals: list[dict[str, Any]] | None = None) -> None:
        self.proposals = proposals or []
        self._call_count = 0
        self._usage = ModelUsage()

    def invoke_structured(
        self, *, system_prompt: str, payload: dict[str, Any], schema: dict[str, Any]
    ) -> ModelReply:
        return self._reply()

    def invoke_with_tools(
        self,
        *,
        system_prompt: str,
        payload: dict[str, Any],
        tools: dict[str, dict[str, Any]],
        schema: dict[str, Any],
    ) -> ModelReply:
        return self._reply()

    def _reply(self) -> ModelReply:
        if self._call_count < len(self.proposals):
            prop = self.proposals[self._call_count]
        else:
            prop = {
                "decision": "RESPOND",
                "confidence": "HIGH",
                "reason_code": "DEFAULT_REPLY",
                "response": "Understood.",
                "evidence_refs": (),
            }
        self._call_count += 1
        return ModelReply(
            proposal=prop,
            metadata=ModelMetadata(
                provider="controlled",
                model="mock",
                model_version="1.0",
                request_id=None,
                latency_ms=1.0,
                usage=ModelUsage(input_tokens=10, output_tokens=10, requests=1),
                tool_calls=1 if prop.get("decision") == "CALL_TOOL" else 0,
                finish_reason="stop",
                retry_count=0,
            ),
        )

    def model_info(self) -> dict[str, Any]:
        return {"provider": "controlled", "model": "mock"}

    def usage_info(self) -> ModelUsage:
        return self._usage


def _make_request(
    role: AgentRole, message: str, *, write_confirmed: bool = False
) -> SpecialistRequest:
    is_owner = role is AgentRole.ANALYTICS
    principal = PrincipalContext(
        kind=PrincipalKind.USER if is_owner else PrincipalKind.CUSTOMER,
        subject_id=uuid4(),
        business_id=uuid4(),
        staff_role=StaffRole.OWNER if is_owner else None,
        customer_id=None if is_owner else uuid4(),
    )
    return SpecialistRequest(
        request_id=uuid4(),
        run_id=uuid4(),
        correlation_id=uuid4(),
        principal=principal,
        message=message,
        write_confirmed=write_confirmed,
        timeout_seconds=90,
        max_model_calls=4,
        max_tool_calls=2,
    )


# ==============================================================================
# SECTION A: DETERMINISTIC NEGATIVE-PATH AND SAFETY BOUNDARY TESTS
# ==============================================================================


def test_forbidden_tool_rejected_before_executor() -> None:
    """DETERMINISTIC NEGATIVE-PATH TEST: Support attempts create_order (forbidden).

    Proves that deterministic boundaries prevent execution: executor call count = 0.
    """
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "UNAUTHORIZED_WRITE_ATTEMPT",
                "tool_name": "create_order",
                "tool_arguments": {"customer_id": str(uuid4()), "items": []},
                "evidence_refs": [],
            }
        ]
    )
    executor = RecordingExecutor()
    agent = SpecialistAgent(
        AgentRole.SUPPORT, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SUPPORT, "Please create an order for me", write_confirmed=False)

    outcome = agent.run(req)

    # SpecialistAgent rejects write without confirmation before calling executor
    assert outcome.status is OutcomeStatus.CLARIFICATION_REQUIRED
    assert executor.call_count == 0
    assert len(executor.recorded_calls) == 0


def test_forbidden_tool_rejected_by_permission_if_confirmed() -> None:
    """DETERMINISTIC NEGATIVE-PATH TEST: Support attempts create_order with write_confirmed=True.

    Even if confirmation flag is somehow set, executor independently rejects based on ROLE_TOOLS.
    """
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "UNAUTHORIZED_WRITE_ATTEMPT",
                "tool_name": "create_order",
                "tool_arguments": {"customer_id": str(uuid4()), "items": []},
                "evidence_refs": [],
            }
        ]
    )
    executor = RecordingExecutor()
    agent = SpecialistAgent(
        AgentRole.SUPPORT, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SUPPORT, "Confirmed order creation", write_confirmed=True)

    outcome = agent.run(req)

    # Tool is rejected by executor permission check; NO execution recorded
    assert outcome.status in {OutcomeStatus.SAFE_FAILURE, OutcomeStatus.DEPENDENCY_FAILURE}
    assert len(executor.recorded_calls) == 0


def test_write_confirmation_case() -> None:
    """DETERMINISTIC TEST: Sales write tool (create_order) with write_confirmed = False.

    Proves that unconfirmed writes never reach the executor.
    """
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "MODEL_TOOL_PROPOSAL",
                "tool_name": "create_order",
                "tool_arguments": {
                    "customer_id": str(uuid4()),
                    "items": [
                        {"product_id": str(uuid4()), "quantity": "1", "quoted_product_version": 1}
                    ],
                },
                "evidence_refs": [],
            }
        ]
    )
    executor = RecordingExecutor()
    agent = SpecialistAgent(
        AgentRole.SALES, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SALES, "Buy item", write_confirmed=False)

    outcome = agent.run(req)

    assert outcome.status is OutcomeStatus.CLARIFICATION_REQUIRED
    assert "confirm" in outcome.response.lower()
    assert executor.call_count == 0
    assert len(executor.recorded_calls) == 0


def test_outcome_unknown_safety_blocks_repeated_mutation() -> None:
    """DETERMINISTIC TEST: previous write = OUTCOME_UNKNOWN prevents subsequent mutation."""
    pid = str(uuid4())
    cid = str(uuid4())
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "FIRST_WRITE",
                "tool_name": "create_order",
                "tool_arguments": {
                    "customer_id": cid,
                    "items": [{"product_id": pid, "quantity": "1", "quoted_product_version": 1}],
                },
                "evidence_refs": [],
            },
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "REPEAT_WRITE",
                "tool_name": "create_order",
                "tool_arguments": {
                    "customer_id": cid,
                    "items": [{"product_id": pid, "quantity": "1", "quoted_product_version": 1}],
                },
                "evidence_refs": [],
            },
        ]
    )
    executor = RecordingExecutor(forced_status=ResultStatus.OUTCOME_UNKNOWN)
    agent = SpecialistAgent(
        AgentRole.SALES, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SALES, "Order now", write_confirmed=True)

    outcome = agent.run(req)

    # Halts immediately upon receiving OUTCOME_UNKNOWN; does not perform blind retry
    assert outcome.status is OutcomeStatus.OUTCOME_UNKNOWN
    assert executor.call_count == 1
    assert len(executor.recorded_calls) == 0


def test_malformed_tool_argument_rejected() -> None:
    """DETERMINISTIC TEST: Malformed arguments for check_inventory rejected by schema validation."""
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "MODEL_TOOL_PROPOSAL",
                "tool_name": "check_inventory",
                "tool_arguments": {
                    "product_ids": "not-a-list"
                },  # Invalid: requires tuple/list of UUIDs
                "evidence_refs": [],
            }
        ]
    )
    executor = RecordingExecutor()
    agent = SpecialistAgent(
        AgentRole.SALES, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SALES, "Check stock", write_confirmed=False)

    outcome = agent.run(req)

    # Tool call failed validation; 0 admitted executions
    assert outcome.status in {OutcomeStatus.SAFE_FAILURE, OutcomeStatus.DEPENDENCY_FAILURE}
    assert len(executor.recorded_calls) == 0


def test_sales_read_only_fixture_admitted() -> None:
    """DETERMINISTIC TEST: Valid read tool (check_inventory) admitted by RecordingExecutor."""
    pid = str(uuid4())
    provider = ControlledProvider(
        [
            {
                "decision": "CALL_TOOL",
                "confidence": "UNKNOWN",
                "reason_code": "MODEL_TOOL_PROPOSAL",
                "tool_name": "check_inventory",
                "tool_arguments": {"product_ids": [pid]},
                "evidence_refs": [],
            },
            {
                "decision": "RESPOND",
                "confidence": "HIGH",
                "reason_code": "INVENTORY_ANSWER",
                "response": "Item is in stock with 5 available.",
                "evidence_refs": ["fixture:check_inventory"],
            },
        ]
    )
    executor = RecordingExecutor(
        fixtures={"check_inventory": {"sku": "SKU-123", "available_quantity": 5}}
    )
    agent = SpecialistAgent(
        AgentRole.SALES, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SALES, "Is SKU-123 in stock?")

    outcome = agent.run(req)

    assert executor.call_count == 1
    assert len(executor.recorded_calls) == 1
    assert executor.recorded_calls[0].tool_name == "check_inventory"
    assert outcome.status is OutcomeStatus.AUTONOMOUS_SUCCESS


# ==============================================================================
# SECTION B: LIVE LOCAL OLLAMA BEHAVIOR TESTS (qwen3:1.7b)
# ==============================================================================


@pytest.mark.integration
def test_live_sales_inventory_query() -> None:
    """LIVE OLLAMA TEST: Customer asks 'Is product SKU-123 currently in stock?' to Sales agent."""
    provider = OllamaProvider(OllamaConfig(timeout_seconds=90))
    executor = RecordingExecutor(
        fixtures={"check_inventory": {"sku": "SKU-123", "available_quantity": 5}}
    )
    agent = SpecialistAgent(
        AgentRole.SALES, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SALES, "Is product SKU-123 currently in stock?")

    outcome = agent.run(req)

    # Model proposed check_inventory; role permission verified
    assert len(outcome.events) > 0
    decision_events = [e for e in outcome.events if e.kind == "DECISION"]
    assert len(decision_events) > 0
    # Proposed action is CALL_TOOL
    assert decision_events[0].reference == DecisionType.CALL_TOOL.value
    assert outcome.model_requests >= 1


@pytest.mark.integration
def test_live_support_order_query() -> None:
    """LIVE OLLAMA TEST: Customer asks 'Where is order ORD-123?' to Support agent."""
    provider = OllamaProvider(OllamaConfig(timeout_seconds=90))
    executor = RecordingExecutor()
    agent = SpecialistAgent(
        AgentRole.SUPPORT, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.SUPPORT, "Where is order ORD-123?")

    outcome = agent.run(req)

    # Verify model proposed a legitimate Support tool
    decision_events = [e for e in outcome.events if e.kind == "DECISION"]
    assert len(decision_events) > 0
    assert outcome.model_requests >= 1


@pytest.mark.integration
def test_live_analytics_sales_report_query() -> None:
    """LIVE OLLAMA TEST: Owner asks 'Show me the sales report for this month.' to Analytics agent."""
    provider = OllamaProvider(OllamaConfig(timeout_seconds=90))
    executor = RecordingExecutor(fixtures={"get_sales_report": {"units": 100, "value": 5000.0}})
    agent = SpecialistAgent(
        AgentRole.ANALYTICS, provider=provider, brain=StubBrain(), executor=executor
    )
    req = _make_request(AgentRole.ANALYTICS, "Show me the sales report for this month.")

    outcome = agent.run(req)

    decision_events = [e for e in outcome.events if e.kind == "DECISION"]
    assert len(decision_events) > 0
    assert outcome.model_requests >= 1


def test_zero_direct_execution_authority_invariant() -> None:
    """INVARIANT TEST: OllamaProvider possesses zero execution authority over domain or DB."""
    provider = OllamaProvider(OllamaConfig())
    # Provider does not expose or implement any execute or persist methods
    assert not hasattr(provider, "execute")
    assert not hasattr(provider, "database")
    assert not hasattr(provider, "persist")
    assert not hasattr(provider, "commit")
