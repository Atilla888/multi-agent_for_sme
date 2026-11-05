"""Real-PostgreSQL run of the WhatsApp channel inbox with a scripted model and sender."""

from uuid import uuid4

import pytest

from platform_backend.agents.provider import ModelMetadata, ModelReply, ModelUsage
from platform_backend.agents.runtime import make_specialists
from platform_backend.brain.service import BusinessBrain
from platform_backend.channels.inbox import ChannelInbox
from platform_backend.channels.whatsapp import ChannelSendError, InboundMessage
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.tools.executor import ToolExecutor, ToolLimits
from tests.support import seed_tenant

pytestmark = [pytest.mark.postgres, pytest.mark.integration]


class ScriptedProvider:
    """Answers with a scripted decision sequence; proposes one real tool call first."""

    def __init__(self, decisions):
        self.decisions = list(decisions)
        self.payloads = []

    def _reply(self, payload):
        self.payloads.append(payload)
        proposal = self.decisions.pop(0)
        return ModelReply(
            proposal,
            ModelMetadata("scripted", "scripted", None, None, 1.0, ModelUsage(5, 2, 0, 1), 0, "stop", 0),
        )

    def invoke_structured(self, *, system_prompt, payload, schema):
        return self._reply(payload)

    def invoke_with_tools(self, *, system_prompt, payload, tools, schema):
        return self._reply(payload)

    def model_info(self):
        return {"provider": "scripted"}

    def usage_info(self):
        return ModelUsage()


class RecordingSender:
    def __init__(self, fail=False):
        self.sent = []
        self.fail = fail

    def send_text(self, to, text):
        if self.fail:
            raise ChannelSendError("down")
        self.sent.append((to, text))
        return f"wamid.out.{len(self.sent)}"


def _inbox(runtime_url, business_id, provider, sender):
    database = PostgresDatabase(runtime_url)
    executor = ToolExecutor(database, cursor_signing_key=b"k" * 32, limits=ToolLimits(30))
    specialists = make_specialists(provider, BusinessBrain(database), executor)
    return ChannelInbox(database, specialists, sender, business_id=business_id, channel="WHATSAPP"), database


def test_whatsapp_first_contact_runs_a_tool_and_replies(admin_connection, runtime_url):
    tenant = seed_tenant(admin_connection)
    phone_number_id = f"pn-{uuid4().hex[:8]}"
    admin_connection.execute(
        "INSERT INTO integrations(business_id,id,channel,provider_account_id,secret_reference,mode,enabled,updated_at) "
        "VALUES (%s,%s,'WHATSAPP',%s,'env',\'SANDBOX\',true,now())",
        (tenant.business_id, uuid4(), phone_number_id),
    )
    provider = ScriptedProvider(
        [
            {"decision": "CALL_TOOL", "confidence": "UNKNOWN", "reason_code": "LOOKUP", "tool_name": "find_product", "tool_arguments": {"query": "Synthetic"}, "evidence_refs": []},
            # The second decision must cite the tool result reference the runtime hands back.
            None,
        ]
    )

    original = provider._reply

    def reply_with_evidence(payload):
        if provider.decisions[0] is None:
            reference = payload["previous_tool_results"][0]["reference"]
            provider.decisions[0] = {"decision": "RESPOND", "confidence": "HIGH", "reason_code": "ANSWER", "response": "Yes, the synthetic product is available.", "evidence_refs": [reference]}
        return original(payload)

    provider._reply = reply_with_evidence
    sender = RecordingSender()
    inbox, database = _inbox(runtime_url, tenant.business_id, provider, sender)

    reply = inbox.handle(phone_number_id, InboundMessage("wamid.in.1", "77010000001", "Amina", "Do you have the synthetic product?", "text"))

    assert reply is not None and reply.delivered
    assert reply.text == "Yes, the synthetic product is available."
    assert reply.outcome.value == "AUTONOMOUS_SUCCESS"
    assert sender.sent == [("77010000001", reply.text)]
    assert provider.payloads[0]["context"]["structured"]["customer"] is not None
    with database.transaction(tenant.business_id) as repository:
        identity = repository.get_customer_identity("WHATSAPP", "77010000001")
        assert identity is not None
        rows = repository.list_conversations(10)
        mine = [row for row in rows if row["id"] == reply.conversation_id]
        assert mine and mine[0]["channel"] == "WHATSAPP" and mine[0]["customer_name"] == "Amina"
        assert mine[0]["run_status"] == "SUCCEEDED" and mine[0]["active_agent"] == "Sales"
        assert mine[0]["last_direction"] == "OUTBOUND"
        messages = repository.list_conversation_messages(reply.conversation_id, 10)
        assert [m["direction"] for m in messages] == ["INBOUND", "OUTBOUND"]
        assert messages[1]["status"] == "PENDING_DELIVERY"
        runs = repository.list_conversation_runs(reply.conversation_id, 5)
        assert runs[0]["status"] == "SUCCEEDED" and runs[0]["execution_metadata"]["outcome"] == "AUTONOMOUS_SUCCESS"

    # Same provider message id again: ignored, nothing new is sent.
    assert inbox.handle(phone_number_id, InboundMessage("wamid.in.1", "77010000001", "Amina", "again", "text")) is None
    assert len(sender.sent) == 1


def test_escalation_is_recorded_and_delivery_failure_is_separate(admin_connection, runtime_url):
    tenant = seed_tenant(admin_connection)
    phone_number_id = f"pn-{uuid4().hex[:8]}"
    admin_connection.execute(
        "INSERT INTO integrations(business_id,id,channel,provider_account_id,secret_reference,mode,enabled,updated_at) "
        "VALUES (%s,%s,'WHATSAPP',%s,'env','SANDBOX',true,now())",
        (tenant.business_id, uuid4(), phone_number_id),
    )
    provider = ScriptedProvider([{"decision": "ESCALATE", "confidence": "LOW", "reason_code": "POLICY", "evidence_refs": []}])
    sender = RecordingSender(fail=True)
    inbox, database = _inbox(runtime_url, tenant.business_id, provider, sender)
    reply = inbox.handle(phone_number_id, InboundMessage("wamid.in.2", "77010000002", None, "I demand a refund", "text"))
    assert reply is not None and reply.delivered is False
    assert reply.outcome.value == "CONTROLLED_ESCALATION"
    with database.transaction(tenant.business_id) as repository:
        detail = repository.get_conversation_detail(reply.conversation_id)
        assert detail is not None and detail["status"] == "ESCALATED"
        messages = repository.list_conversation_messages(reply.conversation_id, 10)
        assert messages[1]["status"] == "FAILED"
        runs = repository.list_conversation_runs(reply.conversation_id, 5)
        assert runs[0]["status"] == "WAITING_HUMAN"
        escalations = admin_connection.execute(
            "SELECT reason_code,status FROM escalations WHERE business_id=%s AND run_id=%s",
            (tenant.business_id, runs[0]["id"]),
        ).fetchall()
        assert escalations == [("CONTROLLED_ESCALATION", "OPEN")]
