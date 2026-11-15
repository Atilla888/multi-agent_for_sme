"""Channel inbox: one inbound customer message becomes one bounded specialist run.

The inbox owns persistence (customer identity, conversation, messages, run, escalation)
and the customer-facing wording of each outcome. The specialist only proposes; the
trusted executor decides; this module never grants anything the model asked for.
"""

import re
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from typing import Any, Protocol
from uuid import UUID, uuid4

from platform_backend.agents.contracts import AgentOutcome, OutcomeStatus
from platform_backend.agents.runtime import SpecialistAgent, SpecialistRequest
from platform_backend.channels.whatsapp import ChannelSendError, DeliveryStatus, InboundMessage
from platform_backend.domain.context import AgentRole, PrincipalContext, PrincipalKind
from platform_backend.repositories.postgres import PostgresDatabase


class Sender(Protocol):
    def send_text(self, to: str, text: str) -> str: ...


@dataclass(frozen=True)
class ChannelReply:
    conversation_id: UUID
    run_id: UUID | None
    outcome: OutcomeStatus | None
    text: str
    delivered: bool


SUPPORT_HINTS = re.compile(
    r"\b(delivery|deliver(ed)?|shipped|shipping|track(ing)?|status|refund|return|where is)\b"
    r"|доставк|статус|возврат|где мой|жеткіз",
    re.IGNORECASE,
)
AFFIRMATIVE = re.compile(
    r"^\s*(yes|yes please|confirm|confirmed|ok|okay|sure|да|иә)\s*[.!]*\s*$", re.IGNORECASE
)

UNSUPPORTED_REPLY = "I can only read text messages for now. Could you type your question?"
ESCALATED_REPLY = (
    "Thanks! I've passed this to our team and someone will get back to you here shortly."
)
UNKNOWN_REPLY = (
    "We're checking whether your request went through. Please don't send it again; "
    "we'll confirm here shortly."
)
FAILURE_REPLY = "Sorry, I can't help with that right now. A member of our team will follow up."
CONFIRM_SUFFIX = " Reply YES to confirm."


def route(text: str, available: frozenset[AgentRole] = frozenset(AgentRole)) -> AgentRole:
    """Deterministic first-hop routing; the specialist may still propose a handoff."""
    preferred = AgentRole.SUPPORT if SUPPORT_HINTS.search(text) else AgentRole.SALES
    if preferred in available:
        return preferred
    return AgentRole.SALES if AgentRole.SALES in available else next(iter(sorted(available)))


def customer_wording(outcome: AgentOutcome) -> str:
    if outcome.status is OutcomeStatus.AUTONOMOUS_SUCCESS:
        return outcome.response
    if outcome.status is OutcomeStatus.CLARIFICATION_REQUIRED:
        if _awaits_confirmation(outcome):
            return outcome.response.rstrip() + CONFIRM_SUFFIX
        return outcome.response
    if outcome.status is OutcomeStatus.CONTROLLED_ESCALATION:
        return ESCALATED_REPLY
    if outcome.status is OutcomeStatus.OUTCOME_UNKNOWN:
        return UNKNOWN_REPLY
    return FAILURE_REPLY


def run_status(outcome: AgentOutcome) -> str:
    if outcome.status in {OutcomeStatus.AUTONOMOUS_SUCCESS, OutcomeStatus.CLARIFICATION_REQUIRED}:
        return "SUCCEEDED"
    if outcome.status in {OutcomeStatus.CONTROLLED_ESCALATION, OutcomeStatus.OUTCOME_UNKNOWN}:
        return "WAITING_HUMAN"
    return "FAILED"


def _awaits_confirmation(outcome: AgentOutcome) -> bool:
    return any(
        event.kind == "TOOL_REJECTED" and event.reason_code == "CONFIRMATION_REQUIRED"
        for event in outcome.events
    )


class ChannelInbox:
    def __init__(
        self,
        database: PostgresDatabase,
        specialists: dict[AgentRole, SpecialistAgent],
        sender: Sender,
        *,
        business_id: UUID,
        channel: str,
        policy_version: str = "m08-dev-1",
        run_timeout_seconds: int = 60,
    ) -> None:
        self._database = database
        self._specialists = specialists
        self._sender = sender
        self._business_id = business_id
        self._channel = channel
        self._policy_version = policy_version
        self._timeout = run_timeout_seconds

    def record_status(self, provider_account_id: str, status: DeliveryStatus) -> bool:
        with self._database.transaction(self._business_id) as repository:
            integration = repository.get_integration(self._channel, provider_account_id)
            if integration is None:
                return False
            return repository.update_message_status_by_provider_id(
                status.provider_message_id, status.status
            )

    def handle(self, provider_account_id: str, inbound: InboundMessage) -> ChannelReply | None:
        """Process one inbound message end to end; None for duplicates or unknown numbers."""
        correlation_id = uuid4()
        with self._database.transaction(self._business_id) as repository:
            integration = repository.get_integration(self._channel, provider_account_id)
            if integration is None or not integration["enabled"]:
                return None
            integration_id: UUID = integration["id"]
            if repository.find_message_by_provider_id(integration_id, inbound.provider_message_id):
                return None
            identity = repository.get_customer_identity(self._channel, inbound.external_user_id)
            if identity is None:
                customer_id, identity_id = uuid4(), uuid4()
                repository.insert_customer_with_identity(
                    customer_id,
                    identity_id,
                    self._channel,
                    inbound.external_user_id,
                    inbound.display_name,
                )
            else:
                customer_id, identity_id = identity["customer_id"], identity["id"]
            conversation_id = repository.find_open_conversation(identity_id)
            if conversation_id is None:
                conversation_id = uuid4()
                repository.insert_conversation(conversation_id, customer_id, identity_id)
            message_id = uuid4()
            repository.insert_message(
                message_id,
                conversation_id,
                integration_id,
                inbound.provider_message_id,
                "INBOUND",
                inbound.text or f"[{inbound.message_type} message]",
                "PROCESSING",
                correlation_id,
            )
            previous = repository.latest_run_for_conversation(conversation_id)

        if inbound.text is None:
            self._reply(
                conversation_id, inbound.external_user_id, UNSUPPORTED_REPLY, correlation_id
            )
            with self._database.transaction(self._business_id) as repository:
                repository.update_message_status(message_id, "PROCESSED")
            return ChannelReply(conversation_id, None, None, UNSUPPORTED_REPLY, True)

        awaiting = bool(
            previous and (previous["execution_metadata"] or {}).get("awaiting_confirmation")
        )
        write_confirmed = awaiting and AFFIRMATIVE.match(inbound.text) is not None
        available = frozenset(self._specialists)
        role = route(inbound.text, available)
        previous_agent = previous["active_agent"] if previous else None
        if awaiting and previous_agent in {item.value for item in available}:
            role = AgentRole(previous_agent)

        run_id = uuid4()
        deadline = datetime.now(UTC) + timedelta(seconds=self._timeout)
        with self._database.transaction(self._business_id) as repository:
            repository.insert_agent_run(
                run_id,
                message_id,
                role.value,
                deadline,
                {"channel": self._channel, "write_confirmed": write_confirmed},
            )

        principal = PrincipalContext(
            PrincipalKind.CUSTOMER,
            identity_id,
            self._business_id,
            customer_id=customer_id,
            identity_id=identity_id,
        )
        outcome, role, hops = self._run(
            principal, run_id, correlation_id, conversation_id, inbound.text, role, write_confirmed
        )

        metadata: dict[str, Any] = {
            "channel": self._channel,
            "write_confirmed": write_confirmed,
            "outcome": outcome.status.value,
            "awaiting_confirmation": _awaits_confirmation(outcome),
            "events": [[event.kind, event.reason_code] for event in outcome.events][-20:],
            "model_requests": outcome.model_requests,
            "input_tokens": outcome.input_tokens,
            "output_tokens": outcome.output_tokens,
        }
        status = run_status(outcome)
        with self._database.transaction(self._business_id) as repository:
            repository.update_agent_run(
                run_id,
                status=status,
                active_agent=role.value,
                metadata=metadata,
                step_count=outcome.model_requests,
                handoff_count=hops,
                reason_code=outcome.status.value,
            )
            if status != "SUCCEEDED":
                repository.insert_escalation(uuid4(), run_id, outcome.status.value)
                repository.set_conversation_status(conversation_id, "ESCALATED")
            repository.update_message_status(message_id, "PROCESSED")

        text = customer_wording(outcome)
        delivered = self._reply(conversation_id, inbound.external_user_id, text, correlation_id)
        return ChannelReply(conversation_id, run_id, outcome.status, text, delivered)

    def _run(
        self,
        principal: PrincipalContext,
        run_id: UUID,
        correlation_id: UUID,
        conversation_id: UUID,
        text: str,
        role: AgentRole,
        write_confirmed: bool,
    ) -> tuple[AgentOutcome, AgentRole, int]:
        hops = 0
        while True:
            request = SpecialistRequest(
                uuid4(),
                run_id,
                correlation_id,
                principal,
                text,
                conversation_id=conversation_id,
                write_confirmed=write_confirmed,
                policy_version=self._policy_version,
                timeout_seconds=self._timeout,
            )
            outcome = self._specialists[role].run(request)
            target = outcome.handoff_proposal
            if target is None or hops >= 1 or target == role or target not in self._specialists:
                return outcome, role, hops
            # One bounded handoff: the run row must name the active specialist before it may act.
            hops += 1
            role = target
            with self._database.transaction(self._business_id) as repository:
                repository.update_agent_run(
                    run_id,
                    status="RUNNING",
                    active_agent=role.value,
                    metadata={"channel": self._channel, "handoff_from": outcome.role.value},
                    step_count=outcome.model_requests,
                    handoff_count=hops,
                    reason_code="HANDOFF",
                )

    def _reply(self, conversation_id: UUID, to: str, text: str, correlation_id: UUID) -> bool:
        outbound_id = uuid4()
        with self._database.transaction(self._business_id) as repository:
            repository.insert_message(
                outbound_id,
                conversation_id,
                None,
                None,
                "OUTBOUND",
                text,
                "PENDING_DELIVERY",
                correlation_id,
            )
        try:
            provider_message_id = self._sender.send_text(to, text)
        except ChannelSendError:
            with self._database.transaction(self._business_id) as repository:
                repository.update_message_status(outbound_id, "FAILED")
            return False
        with self._database.transaction(self._business_id) as repository:
            repository.update_message_status(outbound_id, "PENDING_DELIVERY", provider_message_id)
        return True
