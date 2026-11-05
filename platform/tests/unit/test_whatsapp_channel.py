"""WhatsApp adapter and channel inbox behaviour with fakes; no network, no database."""

import hashlib
import hmac
import json
from dataclasses import dataclass, field
from datetime import UTC, datetime
from typing import Any
from uuid import UUID, uuid4

import httpx
import pytest
from fastapi.testclient import TestClient

from platform_backend.agents.contracts import AgentEvent, AgentOutcome, Confidence, OutcomeStatus
from platform_backend.api.app import create_app
from platform_backend.channels.inbox import ChannelInbox, customer_wording, route
from platform_backend.channels.whatsapp import (
    ChannelSendError,
    InboundMessage,
    WhatsAppClient,
    WhatsAppSettings,
    parse_webhook,
    verify_signature,
)
from platform_backend.channels.wiring import ChannelServices
from platform_backend.domain.context import AgentRole

BUSINESS = UUID("00000000-0000-4000-8000-00000000b001")
SETTINGS = WhatsAppSettings.model_validate(
    {
        "WHATSAPP_VERIFY_TOKEN": "verify-token-1",
        "WHATSAPP_APP_SECRET": "app-secret-1",
        "WHATSAPP_ACCESS_TOKEN": "access-token-1",
        "WHATSAPP_PHONE_NUMBER_ID": "123456",
        "WHATSAPP_BUSINESS_ID": str(BUSINESS),
    }
)


def _inbound(text="Is the desk lamp available?", message_id="wamid.1", kind="text"):
    return {
        "object": "whatsapp_business_account",
        "entry": [
            {
                "id": "1",
                "changes": [
                    {
                        "field": "messages",
                        "value": {
                            "messaging_product": "whatsapp",
                            "metadata": {
                                "display_phone_number": "1555",
                                "phone_number_id": "123456",
                            },
                            "contacts": [{"profile": {"name": "Amina"}, "wa_id": "77010000000"}],
                            "messages": [
                                {
                                    "from": "77010000000",
                                    "id": message_id,
                                    "timestamp": "1",
                                    "type": kind,
                                    **({"text": {"body": text}} if kind == "text" else {}),
                                }
                            ],
                        },
                    }
                ],
            }
        ],
    }


def test_parse_webhook_extracts_text_messages_and_statuses():
    payload = _inbound()
    payload["entry"][0]["changes"][0]["value"]["statuses"] = [
        {"id": "wamid.out", "status": "delivered", "timestamp": "1", "recipient_id": "77010000000"}
    ]
    events = parse_webhook(payload)
    assert len(events.messages) == 1
    phone, message = events.messages[0]
    assert phone == "123456"
    assert message == InboundMessage(
        "wamid.1", "77010000000", "Amina", "Is the desk lamp available?", "text"
    )
    assert events.statuses == (("123456", events.statuses[0][1]),)
    assert events.statuses[0][1].status == "DELIVERED"


def test_parse_webhook_marks_non_text_and_ignores_garbage():
    image = parse_webhook(_inbound(kind="image"))
    assert image.messages[0][1].text is None
    assert image.messages[0][1].message_type == "image"
    assert parse_webhook({"object": "page"}).messages == ()
    assert parse_webhook(["not", "a", "dict"]).messages == ()
    assert (
        parse_webhook(
            {
                "object": "whatsapp_business_account",
                "entry": [
                    {
                        "changes": [
                            {
                                "field": "messages",
                                "value": {"metadata": {}, "messages": [{"id": 5}]},
                            }
                        ]
                    }
                ],
            }
        ).messages
        == ()
    )


def test_signature_verification_uses_app_secret():
    body = b'{"object":"whatsapp_business_account"}'
    good = "sha256=" + hmac.new(b"app-secret-1", body, hashlib.sha256).hexdigest()
    assert verify_signature("app-secret-1", body, good)
    assert not verify_signature("app-secret-1", body, "sha256=deadbeef")
    assert not verify_signature("app-secret-1", body, None)
    assert not verify_signature("other", body, good)


def test_send_text_returns_provider_id_and_fails_closed():
    calls = []

    def handler(request):
        calls.append(json.loads(request.content))
        assert request.headers["authorization"] == "Bearer access-token-1"
        assert request.url.path == "/v26.0/123456/messages"
        return httpx.Response(
            200, json={"messaging_product": "whatsapp", "messages": [{"id": "wamid.out"}]}
        )

    client = WhatsAppClient(SETTINGS, httpx.Client(transport=httpx.MockTransport(handler)))
    assert client.send_text("77010000000", "Hello") == "wamid.out"
    assert calls[0]["to"] == "77010000000" and calls[0]["text"]["body"] == "Hello"

    def rejected(request):
        return httpx.Response(400, json={"error": {"message": "bad"}})

    with pytest.raises(ChannelSendError):
        WhatsAppClient(SETTINGS, httpx.Client(transport=httpx.MockTransport(rejected))).send_text(
            "1", "x"
        )


# --- inbox with fakes ------------------------------------------------------------------


@dataclass
class FakeRepository:
    """In-memory stand-in for the tenant repository; records every write."""

    state: dict[str, Any]
    business_id: UUID = BUSINESS

    def get_integration(self, channel, provider_account_id):
        return self.state["integration"] if provider_account_id == "123456" else None

    def find_message_by_provider_id(self, integration_id, provider_message_id):
        return next(
            (
                m["id"]
                for m in self.state["messages"]
                if m["provider_message_id"] == provider_message_id and m["direction"] == "INBOUND"
            ),
            None,
        )

    def get_customer_identity(self, channel, external_user_id):
        return self.state["identities"].get(external_user_id)

    def insert_customer_with_identity(
        self, customer_id, identity_id, channel, external_user_id, display_name
    ):
        self.state["identities"][external_user_id] = {
            "id": identity_id,
            "customer_id": customer_id,
            "name": display_name,
        }

    def find_open_conversation(self, identity_id):
        return next(
            (
                c["id"]
                for c in self.state["conversations"]
                if c["identity_id"] == identity_id and c["status"] != "CLOSED"
            ),
            None,
        )

    def insert_conversation(self, conversation_id, customer_id, identity_id):
        self.state["conversations"].append(
            {
                "id": conversation_id,
                "customer_id": customer_id,
                "identity_id": identity_id,
                "status": "OPEN",
            }
        )

    def set_conversation_status(self, conversation_id, status):
        for conversation in self.state["conversations"]:
            if conversation["id"] == conversation_id:
                conversation["status"] = status

    def insert_message(
        self,
        message_id,
        conversation_id,
        integration_id,
        provider_message_id,
        direction,
        body,
        status,
        correlation_id,
    ):
        self.state["messages"].append(
            {
                "id": message_id,
                "conversation_id": conversation_id,
                "provider_message_id": provider_message_id,
                "direction": direction,
                "body": body,
                "status": status,
            }
        )

    def update_message_status(self, message_id, status, provider_message_id=None):
        for message in self.state["messages"]:
            if message["id"] == message_id:
                message["status"] = status
                if provider_message_id:
                    message["provider_message_id"] = provider_message_id

    def update_message_status_by_provider_id(self, provider_message_id, status):
        for message in self.state["messages"]:
            if (
                message["provider_message_id"] == provider_message_id
                and message["direction"] == "OUTBOUND"
            ):
                message["status"] = status
                return True
        return False

    def insert_agent_run(self, run_id, message_id, active_agent, deadline, metadata):
        self.state["runs"].append(
            {
                "id": run_id,
                "message_id": message_id,
                "status": "RUNNING",
                "active_agent": active_agent,
                "execution_metadata": metadata,
                "handoff_count": 0,
            }
        )

    def update_agent_run(
        self, run_id, *, status, active_agent, metadata, step_count, handoff_count, reason_code
    ):
        for run in self.state["runs"]:
            if run["id"] == run_id:
                run.update(
                    status=status,
                    active_agent=active_agent,
                    execution_metadata=metadata,
                    handoff_count=handoff_count,
                    reason_code=reason_code,
                )

    def latest_run_for_conversation(self, conversation_id):
        ids = {m["id"] for m in self.state["messages"] if m["conversation_id"] == conversation_id}
        runs = [r for r in self.state["runs"] if r["message_id"] in ids]
        return runs[-1] if runs else None

    def insert_escalation(self, escalation_id, run_id, reason):
        self.state["escalations"].append({"run_id": run_id, "reason": reason})


class FakeDatabase:
    def __init__(self):
        self.state = {
            "integration": {"id": uuid4(), "enabled": True, "mode": "SANDBOX"},
            "identities": {},
            "conversations": [],
            "messages": [],
            "runs": [],
            "escalations": [],
        }

    def transaction(self, business_id):
        assert business_id == BUSINESS
        repository = FakeRepository(self.state)

        class _Context:
            def __enter__(self_inner):
                return repository

            def __exit__(self_inner, *args):
                return False

        return _Context()


@dataclass
class FakeSpecialist:
    role: AgentRole
    outcomes: list[AgentOutcome]
    requests: list = field(default_factory=list)

    def run(self, request):
        self.requests.append(request)
        return self.outcomes.pop(0)


@dataclass
class FakeSender:
    sent: list = field(default_factory=list)
    fail: bool = False

    def send_text(self, to, text):
        if self.fail:
            raise ChannelSendError("down")
        self.sent.append((to, text))
        return f"wamid.out.{len(self.sent)}"


def _outcome(status, response="ok", role=AgentRole.SALES, events=(), handoff=None):
    return AgentOutcome(
        uuid4(),
        role,
        status,
        response,
        Confidence.HIGH,
        (),
        (),
        tuple(events),
        "d",
        "p",
        1,
        10,
        5,
        1.0,
        handoff,
    )


def _inbox(database, specialists, sender=None):
    return ChannelInbox(
        database, specialists, sender or FakeSender(), business_id=BUSINESS, channel="WHATSAPP"
    )


def test_first_contact_creates_customer_conversation_run_and_reply():
    database, sender = FakeDatabase(), FakeSender()
    sales = FakeSpecialist(
        AgentRole.SALES, [_outcome(OutcomeStatus.AUTONOMOUS_SUCCESS, "Yes, 8 in stock.")]
    )
    inbox = _inbox(
        database,
        {AgentRole.SALES: sales, AgentRole.SUPPORT: FakeSpecialist(AgentRole.SUPPORT, [])},
        sender,
    )
    reply = inbox.handle(
        "123456",
        InboundMessage("wamid.1", "77010000000", "Amina", "Is the desk lamp available?", "text"),
    )
    assert reply is not None and reply.delivered and reply.text == "Yes, 8 in stock."
    assert reply.outcome is OutcomeStatus.AUTONOMOUS_SUCCESS
    state = database.state
    assert state["identities"]["77010000000"]["name"] == "Amina"
    assert [m["direction"] for m in state["messages"]] == ["INBOUND", "OUTBOUND"]
    assert state["messages"][0]["status"] == "PROCESSED"
    assert (
        state["messages"][1]["status"] == "PENDING_DELIVERY"
        and state["messages"][1]["provider_message_id"] == "wamid.out.1"
    )
    assert state["runs"][0]["status"] == "SUCCEEDED" and state["runs"][0]["active_agent"] == "Sales"
    assert state["escalations"] == []
    request = sales.requests[0]
    assert (
        request.principal.kind.value == "CUSTOMER"
        and request.principal.customer_id == state["identities"]["77010000000"]["customer_id"]
    )
    assert request.write_confirmed is False
    assert sender.sent == [("77010000000", "Yes, 8 in stock.")]


def test_duplicate_webhook_delivery_is_ignored_and_unknown_number_rejected():
    database = FakeDatabase()
    sales = FakeSpecialist(AgentRole.SALES, [_outcome(OutcomeStatus.AUTONOMOUS_SUCCESS)])
    inbox = _inbox(database, {AgentRole.SALES: sales})
    message = InboundMessage("wamid.dup", "77010000000", None, "hi", "text")
    assert inbox.handle("123456", message) is not None
    assert inbox.handle("123456", message) is None
    assert inbox.handle("999", message) is None
    assert len(sales.requests) == 1


def test_escalation_and_unknown_outcome_create_escalations_with_safe_wording():
    database = FakeDatabase()
    sales = FakeSpecialist(
        AgentRole.SALES,
        [
            _outcome(OutcomeStatus.CONTROLLED_ESCALATION, "This needs human review."),
            _outcome(OutcomeStatus.OUTCOME_UNKNOWN, "The write result is unknown"),
        ],
    )
    inbox = _inbox(database, {AgentRole.SALES: sales})
    first = inbox.handle(
        "123456", InboundMessage("wamid.1", "7701", None, "I want a refund now", "text")
    )
    second = inbox.handle("123456", InboundMessage("wamid.2", "7701", None, "please", "text"))
    assert "our team" in first.text and "don't send it again" in second.text
    assert [run["status"] for run in database.state["runs"]] == ["WAITING_HUMAN", "WAITING_HUMAN"]
    assert [e["reason"] for e in database.state["escalations"]] == [
        "CONTROLLED_ESCALATION",
        "OUTCOME_UNKNOWN",
    ]
    assert database.state["conversations"][0]["status"] == "ESCALATED"
    assert "OUTCOME_UNKNOWN" not in second.text and "human review" not in first.text


def test_write_confirmation_only_after_explicit_yes():
    database = FakeDatabase()
    confirm_needed = _outcome(
        OutcomeStatus.CLARIFICATION_REQUIRED,
        "Please explicitly confirm before I make this change.",
        events=[AgentEvent("TOOL_REJECTED", "CONFIRMATION_REQUIRED")],
    )
    sales = FakeSpecialist(
        AgentRole.SALES,
        [confirm_needed, _outcome(OutcomeStatus.AUTONOMOUS_SUCCESS, "Order placed.")],
    )
    inbox = _inbox(
        database, {AgentRole.SALES: sales, AgentRole.SUPPORT: FakeSpecialist(AgentRole.SUPPORT, [])}
    )
    first = inbox.handle(
        "123456", InboundMessage("wamid.1", "7701", None, "Order one desk lamp", "text")
    )
    assert first.text.endswith("Reply YES to confirm.")
    assert database.state["runs"][0]["execution_metadata"]["awaiting_confirmation"] is True
    second = inbox.handle("123456", InboundMessage("wamid.2", "7701", None, "yes", "text"))
    assert second.text == "Order placed."
    assert sales.requests[1].write_confirmed is True
    assert sales.requests[1].conversation_id == sales.requests[0].conversation_id


def test_unconfirmed_follow_up_never_sets_write_flag():
    database = FakeDatabase()
    confirm_needed = _outcome(
        OutcomeStatus.CLARIFICATION_REQUIRED,
        "Confirm?",
        events=[AgentEvent("TOOL_REJECTED", "CONFIRMATION_REQUIRED")],
    )
    sales = FakeSpecialist(
        AgentRole.SALES,
        [confirm_needed, _outcome(OutcomeStatus.CLARIFICATION_REQUIRED, "Which colour?")],
    )
    inbox = _inbox(database, {AgentRole.SALES: sales})
    inbox.handle("123456", InboundMessage("wamid.1", "7701", None, "Order a lamp", "text"))
    inbox.handle("123456", InboundMessage("wamid.2", "7701", None, "actually make it two", "text"))
    assert sales.requests[1].write_confirmed is False


def test_single_bounded_handoff_updates_run_and_reruns_target():
    database = FakeDatabase()
    sales = FakeSpecialist(
        AgentRole.SALES,
        [_outcome(OutcomeStatus.SAFE_FAILURE, "handoff", handoff=AgentRole.SUPPORT)],
    )
    support = FakeSpecialist(
        AgentRole.SUPPORT,
        [
            _outcome(
                OutcomeStatus.AUTONOMOUS_SUCCESS,
                "Your order ships Tuesday.",
                role=AgentRole.SUPPORT,
            )
        ],
    )
    inbox = _inbox(database, {AgentRole.SALES: sales, AgentRole.SUPPORT: support})
    reply = inbox.handle("123456", InboundMessage("wamid.1", "7701", None, "hello there", "text"))
    assert reply.text == "Your order ships Tuesday."
    run = database.state["runs"][0]
    assert (
        run["active_agent"] == "Support"
        and run["handoff_count"] == 1
        and run["status"] == "SUCCEEDED"
    )
    assert support.requests[0].run_id == sales.requests[0].run_id


def test_send_failure_marks_outbound_failed_but_keeps_run_result():
    database = FakeDatabase()
    sales = FakeSpecialist(AgentRole.SALES, [_outcome(OutcomeStatus.AUTONOMOUS_SUCCESS, "Done.")])
    reply = _inbox(database, {AgentRole.SALES: sales}, FakeSender(fail=True)).handle(
        "123456", InboundMessage("wamid.1", "7701", None, "hi", "text")
    )
    assert reply.delivered is False
    assert database.state["messages"][1]["status"] == "FAILED"
    assert database.state["runs"][0]["status"] == "SUCCEEDED"


def test_non_text_message_gets_fixed_reply_without_running_agent():
    database = FakeDatabase()
    sales = FakeSpecialist(AgentRole.SALES, [])
    reply = _inbox(database, {AgentRole.SALES: sales}).handle(
        "123456", InboundMessage("wamid.1", "7701", None, None, "image")
    )
    assert reply.run_id is None and "text messages" in reply.text
    assert sales.requests == [] and database.state["runs"] == []


def test_delivery_status_updates_outbound_message():
    database = FakeDatabase()
    database.state["messages"].append(
        {
            "id": uuid4(),
            "conversation_id": uuid4(),
            "provider_message_id": "wamid.out",
            "direction": "OUTBOUND",
            "body": "x",
            "status": "PENDING_DELIVERY",
        }
    )
    inbox = _inbox(database, {})
    from platform_backend.channels.whatsapp import DeliveryStatus

    assert inbox.record_status("123456", DeliveryStatus("wamid.out", "DELIVERED")) is True
    assert database.state["messages"][0]["status"] == "DELIVERED"
    assert inbox.record_status("123456", DeliveryStatus("missing", "DELIVERED")) is False


def test_routing_and_wording_helpers():
    assert route("Where is my order?") is AgentRole.SUPPORT
    assert route("Do you have lamps?") is AgentRole.SALES
    assert route("Где мой заказ?") is AgentRole.SUPPORT
    assert (
        customer_wording(
            _outcome(OutcomeStatus.DEPENDENCY_FAILURE, "Model service is unavailable.")
        )
        == "Sorry, I can't help with that right now. A member of our team will follow up."
    )


# --- HTTP surface ----------------------------------------------------------------------


class RecordingInbox:
    def __init__(self):
        self.handled = []
        self.statuses = []

    def handle(self, phone_number_id, message):
        self.handled.append((phone_number_id, message))
        return None

    def record_status(self, phone_number_id, status):
        self.statuses.append((phone_number_id, status))
        return True


def _app(inbox):
    app = create_app()
    app.state.channel_services = ChannelServices(SETTINGS, inbox)
    return app


def _signed(body: bytes) -> dict[str, str]:
    return {
        "X-Hub-Signature-256": "sha256="
        + hmac.new(b"app-secret-1", body, hashlib.sha256).hexdigest()
    }


def test_webhook_verification_handshake():
    client = TestClient(_app(RecordingInbox()))
    ok = client.get(
        "/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "verify-token-1",
            "hub.challenge": "12345",
        },
    )
    assert ok.status_code == 200 and ok.text == "12345"
    bad = client.get(
        "/webhooks/whatsapp",
        params={"hub.mode": "subscribe", "hub.verify_token": "wrong", "hub.challenge": "12345"},
    )
    assert bad.status_code == 403


def test_webhook_rejects_bad_signature_and_accepts_signed_payload():
    inbox = RecordingInbox()
    client = TestClient(_app(inbox))
    body = json.dumps(_inbound()).encode()
    assert (
        client.post(
            "/webhooks/whatsapp", content=body, headers={"Content-Type": "application/json"}
        ).status_code
        == 403
    )
    assert (
        client.post(
            "/webhooks/whatsapp",
            content=body,
            headers={"Content-Type": "application/json", "X-Hub-Signature-256": "sha256=00"},
        ).status_code
        == 403
    )
    response = client.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", **_signed(body)},
    )
    assert response.status_code == 200 and response.json() == {
        "accepted": {"messages": 1, "statuses": 0}
    }
    assert (
        inbox.handled[0][0] == "123456"
        and inbox.handled[0][1].text == "Is the desk lamp available?"
    )


def test_webhook_unconfigured_returns_503(monkeypatch):
    from platform_backend.channels import wiring

    wiring.configured_channel_services.cache_clear()
    for name in (
        "WHATSAPP_VERIFY_TOKEN",
        "WHATSAPP_APP_SECRET",
        "WHATSAPP_ACCESS_TOKEN",
        "WHATSAPP_PHONE_NUMBER_ID",
        "WHATSAPP_BUSINESS_ID",
    ):
        monkeypatch.delenv(name, raising=False)
    client = TestClient(create_app())
    assert client.get("/webhooks/whatsapp", params={"hub.mode": "subscribe"}).status_code == 503
    assert client.post("/webhooks/whatsapp", content=b"{}").status_code == 503


def test_webhook_ignores_unrelated_objects_with_valid_signature():
    inbox = RecordingInbox()
    client = TestClient(_app(inbox))
    body = b'{"object":"page","entry":[]}'
    response = client.post(
        "/webhooks/whatsapp",
        content=body,
        headers={"Content-Type": "application/json", **_signed(body)},
    )
    assert response.status_code == 200 and inbox.handled == []
    assert datetime.now(UTC).tzinfo is UTC
