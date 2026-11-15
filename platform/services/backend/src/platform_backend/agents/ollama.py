"""Ollama development adapter for local model experimentation.

Model outputs remain untrusted proposals, never tool execution authority.
"""

import json
import os
import re
import time
from dataclasses import dataclass
from typing import Any

import httpx
from pydantic import ValidationError

from platform_backend.agents.contracts import (
    AgentDecision,
    Confidence,
    DecisionType,
)
from platform_backend.agents.provider import (
    ModelMetadata,
    ModelReply,
    ModelUsage,
    ProviderErrorKind,
    ProviderFailure,
)


@dataclass(frozen=True)
class OllamaConfig:
    base_url: str = "http://localhost:11434"
    model: str = "qwen3:1.7b"
    timeout_seconds: float = 60.0
    max_retries: int = 1
    temperature: float = 0.2
    top_p: float = 0.95
    num_predict: int = 1024

    @classmethod
    def from_environment(cls) -> "OllamaConfig":
        return cls(
            base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434").rstrip("/"),
            model=os.getenv("OLLAMA_MODEL", "qwen3:1.7b"),
            timeout_seconds=float(os.getenv("OLLAMA_TIMEOUT_SECONDS", "60")),
            max_retries=int(os.getenv("OLLAMA_MAX_RETRIES", "1")),
            temperature=float(os.getenv("OLLAMA_TEMPERATURE", "0.2")),
            top_p=float(os.getenv("OLLAMA_TOP_P", "0.95")),
            num_predict=int(os.getenv("OLLAMA_NUM_PREDICT", "1024")),
        )

    def __post_init__(self) -> None:
        if not (self.base_url.startswith("http://") or self.base_url.startswith("https://")):
            raise ValueError("Ollama base_url must start with http:// or https://")
        if not self.model or not self.model.strip():
            raise ValueError("Ollama model name cannot be empty")
        if not (0.0 <= self.temperature <= 2.0):
            raise ValueError("Temperature must be between 0 and 2")
        if not (0.0 < self.top_p <= 1.0):
            raise ValueError("top_p must be between 0 and 1")
        if not (1 <= self.num_predict <= 8192):
            raise ValueError("num_predict must be between 1 and 8192")
        if not (1.0 <= self.timeout_seconds <= 300.0):
            raise ValueError("timeout_seconds must be between 1 and 300")
        if not (0 <= self.max_retries <= 5):
            raise ValueError("max_retries must be between 0 and 5")


class OllamaProvider:
    """Ollama HTTP adapter implementing LLMProvider protocol without local tool authority."""

    def __init__(
        self,
        config: OllamaConfig,
        *,
        client: httpx.Client | None = None,
    ) -> None:
        self.config = config
        self._client = client or httpx.Client(timeout=config.timeout_seconds)
        self._usage = ModelUsage()

    def model_info(self) -> dict[str, Any]:
        return {
            "provider": "ollama",
            "model": self.config.model,
            "base_url": self.config.base_url,
            "temperature": self.config.temperature,
            "top_p": self.config.top_p,
            "num_predict": self.config.num_predict,
        }

    def usage_info(self) -> ModelUsage:
        return self._usage

    def invoke_structured(
        self, *, system_prompt: str, payload: dict[str, Any], schema: dict[str, Any]
    ) -> ModelReply:
        return self._invoke(system_prompt, payload, schema, {})

    def invoke_with_tools(
        self,
        *,
        system_prompt: str,
        payload: dict[str, Any],
        tools: dict[str, dict[str, Any]],
        schema: dict[str, Any],
    ) -> ModelReply:
        return self._invoke(system_prompt, payload, schema, tools)

    def _invoke(
        self,
        system_prompt: str,
        payload: dict[str, Any],
        schema: dict[str, Any],
        tools: dict[str, dict[str, Any]],
    ) -> ModelReply:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": json.dumps(payload, default=str)},
        ]
        body: dict[str, Any] = {
            "model": self.config.model,
            "messages": messages,
            "stream": False,
            "options": {
                "temperature": self.config.temperature,
                "top_p": self.config.top_p,
                "num_predict": self.config.num_predict,
            },
            "thinking": False,
        }
        if tools:
            body["tools"] = [
                {
                    "type": "function",
                    "function": {
                        "name": name,
                        "description": f"Trusted business tool {name}",
                        "parameters": tool_schema,
                    },
                }
                for name, tool_schema in tools.items()
            ]
        else:
            body["format"] = "json"

        started = time.monotonic()
        endpoint = f"{self.config.base_url}/api/chat"

        for attempt in range(self.config.max_retries + 1):
            try:
                response = self._client.post(
                    endpoint,
                    json=body,
                    timeout=self.config.timeout_seconds,
                )
            except httpx.TimeoutException as exc:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(ProviderErrorKind.TIMEOUT, retry_count=attempt) from exc
                continue
            except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(
                        ProviderErrorKind.UNAVAILABLE, retry_count=attempt
                    ) from exc
                continue
            except httpx.TransportError as exc:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(
                        ProviderErrorKind.UNAVAILABLE, retry_count=attempt
                    ) from exc
                continue

            if response.status_code in {500, 502, 503, 504}:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(ProviderErrorKind.UNAVAILABLE, retry_count=attempt)
                continue
            if response.status_code == 429:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(ProviderErrorKind.RATE_LIMIT, retry_count=attempt)
                continue
            if response.status_code == 400:
                try:
                    err_msg = str(response.json().get("error", "")).lower()
                except Exception:
                    err_msg = response.text.lower()
                kind = (
                    ProviderErrorKind.CONTEXT_LENGTH
                    if "context" in err_msg and ("limit" in err_msg or "length" in err_msg)
                    else ProviderErrorKind.INVALID_RESPONSE
                )
                raise ProviderFailure(kind, retry_count=attempt)
            if response.status_code >= 400:
                raise ProviderFailure(ProviderErrorKind.UNKNOWN, retry_count=attempt)

            return self._parse(response, started, attempt)

        raise AssertionError("bounded retry loop did not terminate")

    def _parse(self, response: httpx.Response, started: float, attempt: int) -> ModelReply:
        try:
            raw = response.json()
        except (ValueError, json.JSONDecodeError) as exc:
            raise ProviderFailure(ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt) from exc

        if not isinstance(raw, dict):
            raise ProviderFailure(ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt)

        message = raw.get("message")
        if not isinstance(message, dict):
            raise ProviderFailure(ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt)

        tool_calls = message.get("tool_calls") or []
        if not isinstance(tool_calls, list):
            raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)

        if len(tool_calls) > 1:
            raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)

        if len(tool_calls) == 1:
            call = tool_calls[0]
            if not isinstance(call, dict):
                raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)
            fn = call.get("function")
            if not isinstance(fn, dict):
                raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)
            tool_name = fn.get("name")
            if not isinstance(tool_name, str) or not tool_name:
                raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)

            tool_args = self._parse_arguments(fn.get("arguments"), attempt)

            proposal: dict[str, Any] = {
                "decision": DecisionType.CALL_TOOL.value,
                "confidence": Confidence.UNKNOWN.value,
                "reason_code": "MODEL_TOOL_PROPOSAL",
                "tool_name": tool_name,
                "tool_arguments": tool_args,
                "evidence_refs": [],
            }
            try:
                AgentDecision.model_validate_json(json.dumps(proposal))
            except (ValidationError, ValueError, TypeError) as exc:
                raise ProviderFailure(
                    ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt
                ) from exc
        else:
            content = message.get("content", "")
            if not isinstance(content, str):
                raise ProviderFailure(ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt)
            clean_text = self._strip_fences(content)
            try:
                decision = AgentDecision.model_validate_json(clean_text)
                proposal = json.loads(decision.model_dump_json())
            except (ValidationError, ValueError, TypeError) as exc:
                raise ProviderFailure(
                    ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt
                ) from exc

        input_tokens = int(raw.get("prompt_eval_count") or 0)
        output_tokens = int(raw.get("eval_count") or 0)
        usage = ModelUsage(
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            cached_tokens=0,
            requests=1,
        )
        self._usage = ModelUsage(
            self._usage.input_tokens + usage.input_tokens,
            self._usage.output_tokens + usage.output_tokens,
            self._usage.cached_tokens + usage.cached_tokens,
            self._usage.requests + 1,
        )

        metadata = ModelMetadata(
            provider="ollama",
            model=self.config.model,
            model_version=str(raw.get("model")) if raw.get("model") else None,
            request_id=None,
            latency_ms=(time.monotonic() - started) * 1000,
            usage=usage,
            tool_calls=len(tool_calls),
            finish_reason=str(raw.get("done_reason")) if raw.get("done_reason") else None,
            retry_count=attempt,
        )
        return ModelReply(proposal=proposal, metadata=metadata)

    def _parse_arguments(self, raw_args: Any, attempt: int) -> dict[str, Any]:
        if isinstance(raw_args, dict):
            return raw_args
        if isinstance(raw_args, str):
            try:
                parsed = json.loads(raw_args)
                if isinstance(parsed, dict):
                    return parsed
            except (json.JSONDecodeError, ValueError) as exc:
                raise ProviderFailure(
                    ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt
                ) from exc
        raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL, retry_count=attempt)

    @staticmethod
    def _strip_fences(text: str) -> str:
        stripped = text.strip()
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", stripped)
        if match:
            return match.group(1).strip()
        return stripped
