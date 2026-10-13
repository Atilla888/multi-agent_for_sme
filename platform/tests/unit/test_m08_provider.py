"""Scripted HTTP proves adapter normalization, never a real-provider acceptance claim."""

import json

import httpx
import pytest

from platform_backend.agents.provider import (
    DevModelConfig,
    GeminiProvider,
    ProviderErrorKind,
    ProviderFailure,
)


def _provider(handler, retries=0):
    client = httpx.Client(transport=httpx.MockTransport(handler))
    return GeminiProvider(DevModelConfig(max_retries=retries), api_key="test-only", client=client)


def _reply(parts):
    return {
        "candidates": [{"content": {"parts": parts}, "finishReason": "STOP"}],
        "modelVersion": "synthetic-version",
        "responseId": "synthetic-request",
        "usageMetadata": {
            "promptTokenCount": 12,
            "candidatesTokenCount": 3,
            "cachedContentTokenCount": 2,
        },
    }


def test_structured_reply_normalizes_usage_and_version():
    def handler(request):
        assert request.headers["x-goog-api-key"] == "test-only"
        return httpx.Response(200, json=_reply([{"text": '{"decision":"CLARIFY"}'}]))

    provider = _provider(handler)
    reply = provider.invoke_structured(system_prompt="safe", payload={}, schema={"type": "object"})
    assert reply.proposal == {"decision": "CLARIFY"}
    assert reply.metadata.model_version == "synthetic-version"
    assert reply.metadata.usage.input_tokens == 12
    assert provider.usage_info().requests == 1


def test_native_function_call_remains_unexecuted_proposal():
    def handler(request):
        body = json.loads(request.content)
        assert body["tools"][0]["functionDeclarations"][0]["name"] == "find_product"
        return httpx.Response(
            200, json=_reply([{"functionCall": {"name": "find_product", "args": {"query": "pen"}}}])
        )

    reply = _provider(handler).invoke_with_tools(
        system_prompt="safe",
        payload={},
        tools={"find_product": {"type": "object"}},
        schema={"type": "object"},
    )
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_arguments"] == {"query": "pen"}
    assert reply.metadata.tool_calls == 1


def test_authentication_failure_is_not_retried():
    calls = 0

    def handler(request):
        nonlocal calls
        calls += 1
        return httpx.Response(401)

    with pytest.raises(ProviderFailure) as raised:
        _provider(handler, retries=2).invoke_structured(
            system_prompt="safe", payload={}, schema={"type": "object"}
        )
    assert raised.value.kind is ProviderErrorKind.AUTHENTICATION
    assert calls == 1


def test_rate_limit_retries_once_then_succeeds():
    calls = 0

    def handler(request):
        nonlocal calls
        calls += 1
        if calls == 1:
            return httpx.Response(429)
        return httpx.Response(200, json=_reply([{"text": "{}"}]))

    reply = _provider(handler, retries=1).invoke_structured(
        system_prompt="safe", payload={}, schema={"type": "object"}
    )
    assert calls == 2
    assert reply.metadata.retry_count == 1


def test_multiple_function_calls_are_rejected_without_execution():
    parts = [
        {"functionCall": {"name": "create_order", "args": {}}},
        {"functionCall": {"name": "create_order", "args": {}}},
    ]
    provider = _provider(lambda request: httpx.Response(200, json=_reply(parts)))
    with pytest.raises(ProviderFailure) as raised:
        provider.invoke_with_tools(
            system_prompt="safe", payload={}, tools={}, schema={"type": "object"}
        )
    assert raised.value.kind is ProviderErrorKind.MALFORMED_TOOL_CALL
