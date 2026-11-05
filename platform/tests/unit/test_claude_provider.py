"""Scripted HTTP proves the Claude adapter's normalization; never a real-provider claim."""

import json

import anthropic
import httpx2
import pytest

from platform_backend.agents.contracts import MODEL_DECISION_SCHEMA
from platform_backend.agents.provider import (
    ClaudeProvider,
    DevModelConfig,
    ProviderErrorKind,
    ProviderFailure,
    claude_decision_schema,
    provider_from_environment,
)

CONFIG = DevModelConfig(provider="claude", model="claude-opus-5-5", max_retries=0)


def _message(content, stop_reason="end_turn"):
    return {
        "id": "msg_test",
        "type": "message",
        "role": "assistant",
        "model": "claude-opus-5-5",
        "content": content,
        "stop_reason": stop_reason,
        "stop_sequence": None,
        "usage": {"input_tokens": 12, "output_tokens": 3, "cache_read_input_tokens": 2},
    }


def _provider(handler):
    client = anthropic.Anthropic(
        api_key="test-only",
        max_retries=0,
        http_client=anthropic.DefaultHttpxClient(transport=httpx2.MockTransport(handler)),
    )
    return ClaudeProvider(CONFIG, client=client)


def test_structured_reply_normalizes_usage_and_drops_nulls():
    captured = {}

    def handler(request):
        captured["body"] = json.loads(request.content)
        captured["beta"] = request.headers.get("anthropic-beta")
        text = json.dumps(
            {
                "decision": "CLARIFY",
                "confidence": "LOW",
                "reason_code": "ASK",
                "clarification": "Which size?",
                "response": None,
                "target_agent": None,
                "evidence_refs": [],
            }
        )
        return httpx2.Response(200, json=_message([{"type": "text", "text": text}]))

    provider = _provider(handler)
    reply = provider.invoke_structured(
        system_prompt="safe", payload={"q": 1}, schema=MODEL_DECISION_SCHEMA
    )
    assert reply.proposal == {
        "decision": "CLARIFY",
        "confidence": "LOW",
        "reason_code": "ASK",
        "clarification": "Which size?",
        "evidence_refs": [],
    }
    assert reply.metadata.usage.input_tokens == 12
    assert reply.metadata.usage.cached_tokens == 2
    assert provider.usage_info().requests == 1
    assert captured["body"]["model"] == "claude-opus-5-5"
    assert captured["body"]["system"] == "safe"
    assert captured["body"]["fallbacks"] == "default"
    assert "server-side-fallback" in captured["beta"]
    assert captured["body"]["output_config"]["format"]["schema"]["additionalProperties"] is False
    assert (
        "tool_arguments" not in captured["body"]["output_config"]["format"]["schema"]["properties"]
    )


def test_native_tool_use_remains_unexecuted_proposal():
    def handler(request):
        body = json.loads(request.content)
        assert body["tools"][0]["name"] == "find_product"
        assert body["tools"][0]["input_schema"] == {"type": "object"}
        return httpx2.Response(
            200,
            json=_message(
                [
                    {
                        "type": "tool_use",
                        "id": "toolu_1",
                        "name": "find_product",
                        "input": {"query": "pen"},
                    }
                ],
                "tool_use",
            ),
        )

    reply = _provider(handler).invoke_with_tools(
        system_prompt="safe",
        payload={},
        tools={"find_product": {"type": "object"}},
        schema=MODEL_DECISION_SCHEMA,
    )
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_name"] == "find_product"
    assert reply.proposal["tool_arguments"] == {"query": "pen"}
    assert reply.metadata.tool_calls == 1


def test_two_tool_calls_are_malformed():
    def handler(request):
        blocks = [
            {"type": "tool_use", "id": f"toolu_{index}", "name": "find_product", "input": {}}
            for index in range(2)
        ]
        return httpx2.Response(200, json=_message(blocks, "tool_use"))

    with pytest.raises(ProviderFailure) as failure:
        _provider(handler).invoke_with_tools(
            system_prompt="s", payload={}, tools={"find_product": {}}, schema=MODEL_DECISION_SCHEMA
        )
    assert failure.value.kind is ProviderErrorKind.MALFORMED_TOOL_CALL


@pytest.mark.parametrize(
    ("status", "kind"),
    [
        (401, ProviderErrorKind.AUTHENTICATION),
        (403, ProviderErrorKind.AUTHENTICATION),
        (429, ProviderErrorKind.RATE_LIMIT),
        (500, ProviderErrorKind.UNAVAILABLE),
        (529, ProviderErrorKind.UNAVAILABLE),
    ],
)
def test_http_errors_map_to_bounded_kinds(status, kind):
    def handler(request):
        return httpx2.Response(
            status, json={"type": "error", "error": {"type": "x", "message": "m"}}
        )

    with pytest.raises(ProviderFailure) as failure:
        _provider(handler).invoke_structured(
            system_prompt="s", payload={}, schema=MODEL_DECISION_SCHEMA
        )
    assert failure.value.kind is kind


def test_refusal_and_truncation_do_not_become_decisions():
    def refused(request):
        return httpx2.Response(200, json=_message([{"type": "text", "text": "no"}], "refusal"))

    def truncated(request):
        return httpx2.Response(200, json=_message([{"type": "text", "text": "{"}], "max_tokens"))

    with pytest.raises(ProviderFailure) as refusal:
        _provider(refused).invoke_structured(
            system_prompt="s", payload={}, schema=MODEL_DECISION_SCHEMA
        )
    assert refusal.value.kind is ProviderErrorKind.REFUSAL
    with pytest.raises(ProviderFailure) as cut:
        _provider(truncated).invoke_structured(
            system_prompt="s", payload={}, schema=MODEL_DECISION_SCHEMA
        )
    assert cut.value.kind is ProviderErrorKind.INVALID_RESPONSE


def test_context_length_and_bad_request_distinct():
    def too_long(request):
        return httpx2.Response(
            400,
            json={
                "type": "error",
                "error": {
                    "type": "invalid_request_error",
                    "message": "prompt is too long: 300000 tokens",
                },
            },
        )

    with pytest.raises(ProviderFailure) as failure:
        _provider(too_long).invoke_structured(
            system_prompt="s", payload={}, schema=MODEL_DECISION_SCHEMA
        )
    assert failure.value.kind is ProviderErrorKind.CONTEXT_LENGTH


def test_missing_key_fails_closed_without_network(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    with pytest.raises(ProviderFailure) as failure:
        ClaudeProvider(CONFIG).invoke_structured(
            system_prompt="s", payload={}, schema=MODEL_DECISION_SCHEMA
        )
    assert failure.value.kind is ProviderErrorKind.AUTHENTICATION


def test_config_accepts_claude_and_rejects_mismatched_models(monkeypatch):
    monkeypatch.setenv("DEV_LLM_PROVIDER", "claude")
    monkeypatch.delenv("DEV_LLM_MODEL", raising=False)
    assert DevModelConfig.from_environment().model == "claude-opus-5-5"
    with pytest.raises(ValueError):
        DevModelConfig(provider="claude", model="gemini-3.8-flash")
    with pytest.raises(ValueError):
        DevModelConfig(provider="openai", model="gpt-5")
    monkeypatch.setenv("ANTHROPIC_API_KEY", "test-only")
    assert isinstance(provider_from_environment(), ClaudeProvider)


def test_transport_schema_keeps_decision_fields_only():
    schema = claude_decision_schema(MODEL_DECISION_SCHEMA)
    assert set(schema["properties"]) == {
        "decision",
        "confidence",
        "reason_code",
        "response",
        "clarification",
        "target_agent",
        "evidence_refs",
    }
    assert schema["required"][:3] == ["decision", "confidence", "reason_code"]
    assert schema["properties"]["target_agent"]["anyOf"][1] == {"type": "null"}
