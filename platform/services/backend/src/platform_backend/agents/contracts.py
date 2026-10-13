"""M08 model proposals and observable specialist outcomes; never authorization objects."""

from dataclasses import dataclass
from enum import StrEnum
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from platform_backend.domain.context import AgentRole
from platform_backend.tools.contracts import ToolResult


class DecisionType(StrEnum):
    RESPOND = "RESPOND"
    CALL_TOOL = "CALL_TOOL"
    CLARIFY = "CLARIFY"
    HANDOFF = "HANDOFF"
    ESCALATE = "ESCALATE"
    COMPLETE = "COMPLETE"


class Confidence(StrEnum):
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"
    UNKNOWN = "UNKNOWN"


class AgentDecision(BaseModel):
    """Untrusted model output. The runtime validates it again before any effect."""

    model_config = ConfigDict(extra="forbid", strict=True)
    decision: DecisionType
    confidence: Confidence = Confidence.UNKNOWN
    reason_code: str = Field(min_length=1, max_length=80)
    response: str | None = Field(default=None, max_length=4000)
    clarification: str | None = Field(default=None, max_length=1000)
    tool_name: str | None = None
    tool_arguments: dict[str, Any] | None = None
    target_agent: AgentRole | None = None
    evidence_refs: tuple[str, ...] = ()

    @model_validator(mode="after")
    def validate_shape(self) -> "AgentDecision":
        if self.decision is DecisionType.CALL_TOOL:
            if not self.tool_name or self.tool_arguments is None:
                raise ValueError("CALL_TOOL requires a name and arguments")
        elif self.tool_name is not None or self.tool_arguments is not None:
            raise ValueError("Only CALL_TOOL may propose a tool")
        if self.decision is DecisionType.HANDOFF and self.target_agent is None:
            raise ValueError("HANDOFF requires a target")
        if self.decision is DecisionType.CLARIFY and not self.clarification:
            raise ValueError("CLARIFY requires a question")
        return self


# Gemini supports a JSON-Schema subset; keep the transport schema flat and validate
# the complete Pydantic contract again after receipt. Tool arguments remain untrusted.
MODEL_DECISION_SCHEMA: dict[str, Any] = {
    "type": "object",
    "properties": {
        "decision": {"type": "string", "enum": [item.value for item in DecisionType]},
        "confidence": {"type": "string", "enum": [item.value for item in Confidence]},
        "reason_code": {"type": "string"},
        "response": {"type": "string"},
        "clarification": {"type": "string"},
        "tool_name": {"type": "string"},
        "tool_arguments": {"type": "object", "additionalProperties": True},
        "target_agent": {"type": "string", "enum": [item.value for item in AgentRole]},
        "evidence_refs": {"type": "array", "items": {"type": "string"}},
    },
    "required": ["decision", "confidence", "reason_code"],
    "additionalProperties": False,
}


class OutcomeStatus(StrEnum):
    AUTONOMOUS_SUCCESS = "AUTONOMOUS_SUCCESS"
    CLARIFICATION_REQUIRED = "CLARIFICATION_REQUIRED"
    CONTROLLED_ESCALATION = "CONTROLLED_ESCALATION"
    SAFE_FAILURE = "SAFE_FAILURE"
    DEPENDENCY_FAILURE = "DEPENDENCY_FAILURE"
    BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED"
    OUTCOME_UNKNOWN = "OUTCOME_UNKNOWN"


@dataclass(frozen=True)
class AgentEvent:
    kind: str
    reason_code: str
    reference: str | None = None


@dataclass(frozen=True)
class AgentOutcome:
    run_id: UUID
    role: AgentRole
    status: OutcomeStatus
    response: str
    confidence: Confidence
    evidence_refs: tuple[str, ...]
    tool_results: tuple[ToolResult, ...]
    events: tuple[AgentEvent, ...]
    context_digest: str
    prompt_digest: str
    model_requests: int
    input_tokens: int
    output_tokens: int
    latency_ms: float
    handoff_proposal: AgentRole | None = None

