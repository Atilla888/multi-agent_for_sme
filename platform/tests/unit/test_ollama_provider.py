"""Unit tests for OllamaProvider adapter using mocked HTTP only.

No live Ollama daemon, external connection, or tool execution is permitted.
"""

import json
from typing import Any

import httpx
import pytest

from platform_backend.agents.ollama import OllamaConfig, OllamaProvider
from platform_backend.agents.provider import (
    LLMProvider,
    ProviderErrorKind,
    ProviderFailure,
)


def _make_provider(handler: Any, retries: int = 0) -> OllamaProvider:
    client = httpx.Client(transport=httpx.MockTransport(handler))
    config = OllamaConfig(
        base_url="http://localhost:11434",
        model="qwen3:1.7b",
        timeout_seconds=5.0,
        max_retries=retries,
    )
    return OllamaProvider(config, client=client)


def _ollama_response(
    content: str = "",
    tool_calls: list[dict[str, Any]] | None = None,
    prompt_tokens: int = 20,
    eval_tokens: int = 10,
    done_reason: str = "stop",
) -> dict[str, Any]:
    msg: dict[str, Any] = {"role": "assistant", "content": content}
    if tool_calls is not None:
        msg["tool_calls"] = tool_calls
    return {
        "model": "qwen3:1.7b",
        "message": msg,
        "done": True,
        "done_reason": done_reason,
        "prompt_eval_count": prompt_tokens,
        "eval_count": eval_tokens,
    }


def test_implements_llm_provider_protocol() -> None:
    provider: LLMProvider = _make_provider(lambda req: httpx.Response(200, json=_ollama_response()))
    assert callable(provider.invoke_structured)
    assert callable(provider.invoke_with_tools)
    assert callable(provider.model_info)
    assert callable(provider.usage_info)


def test_structured_reply_normalization() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/chat"
        body = json.loads(request.content)
        assert body["format"] == "json"
        assert body["thinking"] is False
        content = json.dumps(
            {
                "decision": "CLARIFY",
                "confidence": "HIGH",
                "reason_code": "MISSING_SKU",
                "clarification": "Please specify product SKU.",
            }
        )
        return httpx.Response(
            200, json=_ollama_response(content=content, prompt_tokens=15, eval_tokens=8)
        )

    provider = _make_provider(handler)
    reply = provider.invoke_structured(
        system_prompt="system", payload={"question": "check stock"}, schema={"type": "object"}
    )
    assert reply.proposal["decision"] == "CLARIFY"
    assert reply.proposal["clarification"] == "Please specify product SKU."
    assert reply.proposal["reason_code"] == "MISSING_SKU"
    assert reply.metadata.provider == "ollama"
    assert reply.metadata.model == "qwen3:1.7b"
    assert reply.metadata.usage.input_tokens == 15
    assert reply.metadata.usage.output_tokens == 8
    assert reply.metadata.tool_calls == 0
    assert reply.metadata.finish_reason == "stop"


def test_single_tool_call_normalization() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        body = json.loads(request.content)
        assert "tools" in body
        assert len(body["tools"]) == 1
        assert body["tools"][0]["function"]["name"] == "check_inventory"
        tool_call = {
            "id": "call_1",
            "function": {
                "name": "check_inventory",
                "arguments": {"product_ids": ["00000000-0000-0000-0000-000000000001"]},
            },
        }
        return httpx.Response(200, json=_ollama_response(tool_calls=[tool_call]))

    provider = _make_provider(handler)
    reply = provider.invoke_with_tools(
        system_prompt="system",
        payload={"query": "stock"},
        tools={"check_inventory": {"type": "object"}},
        schema={"type": "object"},
    )
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_name"] == "check_inventory"
    assert reply.proposal["tool_arguments"] == {
        "product_ids": ["00000000-0000-0000-0000-000000000001"]
    }
    assert reply.proposal["reason_code"] == "MODEL_TOOL_PROPOSAL"
    assert reply.metadata.tool_calls == 1


def test_dict_tool_arguments() -> None:
    tool_call = {
        "function": {
            "name": "find_product",
            "arguments": {"query": "blue pen", "limit": 10},
        }
    }
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(tool_calls=[tool_call]))
    )
    reply = provider.invoke_with_tools(
        system_prompt="s", payload={}, tools={"find_product": {}}, schema={}
    )
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_arguments"] == {"query": "blue pen", "limit": 10}


def test_json_string_tool_arguments() -> None:
    tool_call = {
        "function": {
            "name": "find_product",
            "arguments": '{"query": "wireless mouse"}',
        }
    }
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(tool_calls=[tool_call]))
    )
    reply = provider.invoke_with_tools(
        system_prompt="s", payload={}, tools={"find_product": {}}, schema={}
    )
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_arguments"] == {"query": "wireless mouse"}


def test_multiple_tool_calls_rejected() -> None:
    tool_calls = [
        {"function": {"name": "find_product", "arguments": {"query": "a"}}},
        {"function": {"name": "check_inventory", "arguments": {}}},
    ]
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(tool_calls=tool_calls))
    )
    with pytest.raises(ProviderFailure) as exc_info:
        provider.invoke_with_tools(
            system_prompt="s", payload={}, tools={"find_product": {}}, schema={}
        )
    assert exc_info.value.kind is ProviderErrorKind.MALFORMED_TOOL_CALL


def test_connection_unavailable_maps_to_unavailable() -> None:
    def handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("Connection refused by localhost:11434")

    provider = _make_provider(handler, retries=1)
    with pytest.raises(ProviderFailure) as exc_info:
        provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert exc_info.value.kind is ProviderErrorKind.UNAVAILABLE
    assert exc_info.value.retry_count == 1


def test_timeout_with_bounded_retry_maps_to_timeout() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        raise httpx.ReadTimeout("Read timed out")

    provider = _make_provider(handler, retries=2)
    with pytest.raises(ProviderFailure) as exc_info:
        provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert exc_info.value.kind is ProviderErrorKind.TIMEOUT
    assert exc_info.value.retry_count == 2
    assert calls == 3


def test_invalid_json_maps_to_invalid_response() -> None:
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(content="Not JSON"))
    )
    with pytest.raises(ProviderFailure) as exc_info:
        provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert exc_info.value.kind is ProviderErrorKind.INVALID_RESPONSE


def test_markdown_fences_stripped_in_structured_response() -> None:
    content = (
        "```json\n"
        '{"decision": "ESCALATE", "confidence": "LOW", "reason_code": "COMPLEX_REFUND"}\n'
        "```"
    )
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(content=content))
    )
    reply = provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert reply.proposal["decision"] == "ESCALATE"
    assert reply.proposal["reason_code"] == "COMPLEX_REFUND"


def test_metadata_and_token_accounting() -> None:
    calls = 0

    def handler(request: httpx.Request) -> httpx.Response:
        nonlocal calls
        calls += 1
        content = json.dumps(
            {"decision": "RESPOND", "confidence": "HIGH", "reason_code": "INFO", "response": "ok"}
        )
        return httpx.Response(
            200, json=_ollama_response(content=content, prompt_tokens=10, eval_tokens=5)
        )

    provider = _make_provider(handler)
    reply1 = provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert reply1.metadata.usage.input_tokens == 10
    assert reply1.metadata.usage.output_tokens == 5
    assert provider.usage_info().requests == 1
    assert provider.usage_info().input_tokens == 10
    assert provider.usage_info().output_tokens == 5

    reply2 = provider.invoke_structured(system_prompt="s", payload={}, schema={})
    assert reply2.metadata.usage.input_tokens == 10
    assert provider.usage_info().requests == 2
    assert provider.usage_info().input_tokens == 20
    assert provider.usage_info().output_tokens == 10


def test_model_info_and_usage_info_behavior() -> None:
    provider = _make_provider(lambda req: httpx.Response(200, json=_ollama_response()))
    info = provider.model_info()
    assert info["provider"] == "ollama"
    assert info["model"] == "qwen3:1.7b"
    assert info["base_url"] == "http://localhost:11434"
    assert info["temperature"] == 0.2
    assert info["top_p"] == 0.95
    assert info["num_predict"] == 1024

    usage = provider.usage_info()
    assert usage.requests == 0
    assert usage.input_tokens == 0


def test_no_tool_executor_called_by_provider() -> None:
    """Validate that OllamaProvider produces a CALL_TOOL proposal without executing any tool."""
    tool_call = {
        "function": {
            "name": "check_inventory",
            "arguments": {"product_ids": ["00000000-0000-0000-0000-000000000001"]},
        }
    }
    provider = _make_provider(
        lambda req: httpx.Response(200, json=_ollama_response(tool_calls=[tool_call]))
    )
    reply = provider.invoke_with_tools(
        system_prompt="s",
        payload={"query": "stock"},
        tools={"check_inventory": {"type": "object"}},
        schema={"type": "object"},
    )
    # The output is strictly an unexecuted proposal
    assert reply.proposal["decision"] == "CALL_TOOL"
    assert reply.proposal["tool_name"] == "check_inventory"
    # No tool execution result exists in proposal
    assert "status" not in reply.proposal
    assert "data" not in reply.proposal
