"""Shared M08 specialist runtime. Business effects always pass through ToolExecutor."""

import hashlib
import json
import time
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol
from uuid import UUID

from pydantic import ValidationError

from platform_backend.agents.contracts import (
    MODEL_DECISION_SCHEMA,
    AgentDecision,
    AgentEvent,
    AgentOutcome,
    Confidence,
    DecisionType,
    OutcomeStatus,
)
from platform_backend.agents.prompts import specialist_digest, specialist_prompt
from platform_backend.agents.provider import LLMProvider, ProviderFailure
from platform_backend.brain.contracts import ContextBundle, ContextPurpose, ContextRequest
from platform_backend.brain.service import BusinessBrain
from platform_backend.domain.context import AgentRole, ExecutionContext, PrincipalContext
from platform_backend.tools.contracts import TOOL_INPUTS, ResultStatus, ToolResult
from platform_backend.tools.executor import ROLE_TOOLS, WRITE_TOOLS, ToolExecutor


class BrainPort(Protocol):
    def build(self, request: ContextRequest) -> ContextBundle: ...


class ExecutorPort(Protocol):
    def execute(
        self, tool_name: str, payload: dict[str, Any], context: ExecutionContext
    ) -> ToolResult: ...


ROLE_PURPOSE = {
    AgentRole.SALES: ContextPurpose.SALES,
    AgentRole.SUPPORT: ContextPurpose.SUPPORT,
    AgentRole.ANALYTICS: ContextPurpose.ANALYTICS,
}


@dataclass(frozen=True)
class SpecialistRequest:
    request_id: UUID
    run_id: UUID
    correlation_id: UUID
    principal: PrincipalContext
    message: str
    conversation_id: UUID | None = None
    write_confirmed: bool = False
    policy_version: str = "m08-dev-1"
    timeout_seconds: int = 60
    max_model_calls: int = 6
    max_tool_calls: int = 4

    def __post_init__(self) -> None:
        if (
            not self.message.strip()
            or len(self.message) > 2000
            or not self.policy_version
            or self.timeout_seconds < 1
            or self.max_model_calls < 1
            or self.max_tool_calls < 0
        ):
            raise ValueError("Invalid specialist request")


class SpecialistAgent:
    """Explicit role, goal, tools, state and policy; not merely a prompt."""

    def __init__(
        self,
        role: AgentRole,
        *,
        provider: LLMProvider,
        brain: BrainPort,
        executor: ExecutorPort,
    ) -> None:
        self.role = role
        self.goal = {
            AgentRole.SALES: "Resolve authorized sales tasks",
            AgentRole.SUPPORT: "Resolve authorized support questions",
            AgentRole.ANALYTICS: "Resolve owner-authorized analytics requests",
        }[role]
        self.allowed_tools = ROLE_TOOLS[role]
        self._provider = provider
        self._brain = brain
        self._executor = executor

    def run(self, request: SpecialistRequest) -> AgentOutcome:
        started = time.monotonic()
        deadline = datetime.now(UTC) + timedelta(seconds=request.timeout_seconds)
        tool_results: list[ToolResult] = []
        executed_names: list[str] = []
        events: list[AgentEvent] = []
        evidence: set[str] = set()
        input_tokens = 0
        output_tokens = 0
        model_calls = 0
        context_digest = ""
        prompt_digest = specialist_digest(self.role)

        def outcome(
            status: OutcomeStatus,
            response: str,
            confidence: Confidence = Confidence.UNKNOWN,
            refs: tuple[str, ...] = (),
            handoff: AgentRole | None = None,
        ) -> AgentOutcome:
            confirmed = self._confirmed_effects(executed_names, tool_results)
            if confirmed:
                # The model cannot reverse or invent a committed write in user-facing text.
                response = (
                    confirmed
                    if status is OutcomeStatus.AUTONOMOUS_SUCCESS
                    else (f"{confirmed} {response}")
                )
            events.append(AgentEvent("TERMINAL", status.value))
            return AgentOutcome(
                request.run_id,
                self.role,
                status,
                response,
                confidence,
                refs,
                tuple(tool_results),
                tuple(events),
                context_digest,
                prompt_digest,
                model_calls,
                input_tokens,
                output_tokens,
                (time.monotonic() - started) * 1000,
                handoff,
            )

        try:
            bundle = self._brain.build(
                ContextRequest(
                    request.request_id,
                    request.principal,
                    ROLE_PURPOSE[self.role],
                    request.message,
                    request.policy_version,
                    self.role,
                    conversation_id=request.conversation_id,
                    run_id=request.run_id,
                    include_knowledge=True,
                )
            )
        except Exception as failure:
            # Do not leak tenant/resource details from a failed Brain build.
            events.append(AgentEvent("CONTEXT_ERROR", type(failure).__name__))
            return outcome(OutcomeStatus.DEPENDENCY_FAILURE, "Context is unavailable.")
        context_digest = bundle.trace.context_digest
        events.append(AgentEvent("CONTEXT", "BUILT", context_digest))
        evidence = self._evidence_refs(bundle)
        visible_tools = self.allowed_tools.intersection(bundle.permissions.potential_tools)
        schemas = {name: TOOL_INPUTS[name].model_json_schema() for name in sorted(visible_tools)}
        prompt = specialist_prompt(self.role)
        projection = bundle.model_projection()

        while model_calls < request.max_model_calls:
            if datetime.now(UTC) >= deadline:
                return outcome(OutcomeStatus.BUDGET_EXHAUSTED, "Time budget exhausted.")
            payload = {
                "context": projection,
                "allowed_tools": sorted(visible_tools),
                "previous_tool_results": [
                    {
                        "reference": f"tool:{item.tool_call_id}",
                        "status": item.status.value,
                        "data": item.data,
                        "error_code": item.error.code if item.error else None,
                        "safe_message": item.error.safe_message if item.error else None,
                    }
                    for item in tool_results
                ],
            }
            try:
                reply = self._provider.invoke_with_tools(
                    system_prompt=prompt,
                    payload=payload,
                    tools=schemas,
                    schema=MODEL_DECISION_SCHEMA,
                )
                model_calls += 1
                input_tokens += reply.metadata.usage.input_tokens
                output_tokens += reply.metadata.usage.output_tokens
                decision = AgentDecision.model_validate_json(json.dumps(reply.proposal))
            except ProviderFailure as failure:
                events.append(AgentEvent("PROVIDER_ERROR", failure.kind.value))
                return outcome(OutcomeStatus.DEPENDENCY_FAILURE, "Model service is unavailable.")
            except (ValidationError, ValueError, TypeError):
                events.append(AgentEvent("MODEL_REJECTED", "INVALID_STRUCTURED_DECISION"))
                return outcome(
                    OutcomeStatus.SAFE_FAILURE, "I could not validate the proposed action."
                )
            events.append(AgentEvent("DECISION", decision.reason_code, decision.decision.value))
            if decision.decision is DecisionType.CALL_TOOL:
                if len(tool_results) >= request.max_tool_calls:
                    return outcome(OutcomeStatus.BUDGET_EXHAUSTED, "Tool budget exhausted.")
                if decision.tool_name is None or decision.tool_arguments is None:
                    return outcome(OutcomeStatus.SAFE_FAILURE, "Invalid tool proposal.")
                if decision.tool_name in WRITE_TOOLS and not request.write_confirmed:
                    events.append(AgentEvent("TOOL_REJECTED", "CONFIRMATION_REQUIRED"))
                    return outcome(
                        OutcomeStatus.CLARIFICATION_REQUIRED,
                        "Please explicitly confirm before I make this change.",
                    )
                if decision.tool_name in WRITE_TOOLS and any(
                    item.status is ResultStatus.OUTCOME_UNKNOWN for item in tool_results
                ):
                    return outcome(
                        OutcomeStatus.OUTCOME_UNKNOWN,
                        "A previous write requires reconciliation before another write.",
                    )
                operation_key = None
                if decision.tool_name in WRITE_TOOLS:
                    digest = hashlib.sha256(
                        json.dumps(decision.tool_arguments, sort_keys=True, default=str).encode()
                    ).hexdigest()
                    operation_key = f"m08:{request.run_id}:{decision.tool_name}:{digest[:24]}"
                context = ExecutionContext(
                    request.principal,
                    self.role,
                    request.run_id,
                    request.correlation_id,
                    request.policy_version,
                    deadline,
                    operation_key,
                )
                result = self._executor.execute(
                    decision.tool_name, decision.tool_arguments, context
                )
                executed_names.append(decision.tool_name)
                tool_results.append(result)
                reference = f"tool:{result.tool_call_id}"
                evidence.add(reference)
                evidence.update(result.source_refs)
                events.append(AgentEvent("TOOL_RESULT", result.status.value, reference))
                if result.status is ResultStatus.OUTCOME_UNKNOWN:
                    return outcome(
                        OutcomeStatus.OUTCOME_UNKNOWN,
                        "The write result is unknown and needs human reconciliation.",
                        refs=(reference,),
                    )
                if result.status is not ResultStatus.SUCCEEDED:
                    safe = result.error.safe_message if result.error else "Tool failed."
                    status = (
                        OutcomeStatus.DEPENDENCY_FAILURE
                        if result.status is ResultStatus.FAILED
                        else OutcomeStatus.SAFE_FAILURE
                    )
                    return outcome(status, safe, refs=(reference,))
                continue
            if decision.decision is DecisionType.CLARIFY:
                return outcome(
                    OutcomeStatus.CLARIFICATION_REQUIRED,
                    decision.clarification or "Please clarify.",
                    decision.confidence,
                )
            if decision.decision is DecisionType.ESCALATE:
                return outcome(
                    OutcomeStatus.CONTROLLED_ESCALATION,
                    "This needs human review.",
                    decision.confidence,
                )
            if decision.decision is DecisionType.HANDOFF:
                return outcome(
                    OutcomeStatus.SAFE_FAILURE,
                    "A specialist handoff was proposed but requires orchestration.",
                    decision.confidence,
                    handoff=decision.target_agent,
                )
            if decision.confidence in {Confidence.LOW, Confidence.UNKNOWN}:
                return outcome(
                    OutcomeStatus.CONTROLLED_ESCALATION,
                    "I cannot verify this with sufficient confidence.",
                    decision.confidence,
                )
            if not decision.evidence_refs or not set(decision.evidence_refs).issubset(evidence):
                events.append(AgentEvent("GROUNDING_REJECTED", "MISSING_OR_UNKNOWN_EVIDENCE"))
                return outcome(
                    OutcomeStatus.CLARIFICATION_REQUIRED,
                    "I need verified information before answering.",
                    decision.confidence,
                )
            if not decision.response:
                return outcome(OutcomeStatus.SAFE_FAILURE, "No validated answer was produced.")
            if any(item.status is not ResultStatus.SUCCEEDED for item in tool_results):
                return outcome(OutcomeStatus.SAFE_FAILURE, "A required tool did not succeed.")
            return outcome(
                OutcomeStatus.AUTONOMOUS_SUCCESS,
                decision.response,
                decision.confidence,
                decision.evidence_refs,
            )
        return outcome(OutcomeStatus.BUDGET_EXHAUSTED, "Model-call budget exhausted.")

    @staticmethod
    def _confirmed_effects(names: list[str], results: list[ToolResult]) -> str:
        statements: list[str] = []
        seen: set[tuple[str, str]] = set()
        for name, result in zip(names, results, strict=True):
            if name not in WRITE_TOOLS or result.status is not ResultStatus.SUCCEEDED:
                continue
            order_id = str((result.data or {}).get("order_id", ""))
            key = (name, order_id)
            if key in seen:
                continue
            seen.add(key)
            if name == "create_order":
                statements.append(f"Order {order_id} was created.")
            elif name == "reserve_inventory":
                statements.append(f"Inventory reservation for order {order_id} succeeded.")
            else:
                statements.append(f"Order {order_id} was updated.")
        return " ".join(statements)

    @staticmethod
    def _evidence_refs(bundle: ContextBundle) -> set[str]:
        refs = {item.provenance.source_reference for item in bundle.structured.products}
        refs.update(item.provenance.source_reference for item in bundle.structured.inventory)
        refs.update(item.provenance.source_reference for item in bundle.retrieved.evidence)
        refs.update(item.provenance.source_reference for item in bundle.rules.rules)
        for item in (bundle.structured.customer, bundle.structured.order, bundle.structured.report):
            if item is not None:
                refs.add(item.provenance.source_reference)
        return refs


def make_specialists(
    provider: LLMProvider, brain: BusinessBrain, executor: ToolExecutor
) -> dict[AgentRole, SpecialistAgent]:
    """One shared provider, Brain and executor for all three specialist roles."""
    return {
        role: SpecialistAgent(role, provider=provider, brain=brain, executor=executor)
        for role in AgentRole
    }
