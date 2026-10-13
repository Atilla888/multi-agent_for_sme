"""Bounded Gemini development adapter. API responses are proposals, never tool authority."""

import json
import os
import time
from dataclasses import dataclass
from enum import StrEnum
from typing import Any, Protocol

import httpx


class ProviderErrorKind(StrEnum):
    TIMEOUT = "TIMEOUT"
    RATE_LIMIT = "RATE_LIMIT"
    AUTHENTICATION = "AUTHENTICATION"
    INVALID_RESPONSE = "INVALID_RESPONSE"
    MALFORMED_TOOL_CALL = "MALFORMED_TOOL_CALL"
    UNAVAILABLE = "UNAVAILABLE"
    CONTEXT_LENGTH = "CONTEXT_LENGTH"
    REFUSAL = "REFUSAL"
    UNKNOWN = "UNKNOWN"


class ProviderFailure(Exception):
    def __init__(self, kind: ProviderErrorKind, *, retry_count: int = 0) -> None:
        super().__init__(kind.value)
        self.kind = kind
        self.retry_count = retry_count


@dataclass(frozen=True)
class DevModelConfig:
    provider: str = "gemini"
    model: str = "gemini-3.8-flash"
    temperature: float = 0.2
    top_p: float = 0.95
    max_output_tokens: int = 1024
    timeout_seconds: float = 20.0
    max_retries: int = 1

    @classmethod
    def from_environment(cls) -> "DevModelConfig":
        return cls(
            provider=os.getenv("DEV_LLM_PROVIDER", "gemini"),
            model=os.getenv("DEV_LLM_MODEL", "gemini-3.8-flash"),
            temperature=float(os.getenv("DEV_LLM_TEMPERATURE", "0.2")),
            top_p=float(os.getenv("DEV_LLM_TOP_P", "0.95")),
            max_output_tokens=int(os.getenv("DEV_LLM_MAX_OUTPUT_TOKENS", "1024")),
            timeout_seconds=float(os.getenv("DEV_LLM_TIMEOUT_SECONDS", "20")),
            max_retries=int(os.getenv("DEV_LLM_MAX_RETRIES", "1")),
        )

    def __post_init__(self) -> None:
        if (
            self.provider != "gemini"
            or not self.model.startswith("gemini-")
            or not 0 <= self.temperature <= 2
            or not 0 < self.top_p <= 1
            or not 1 <= self.max_output_tokens <= 8192
            or not 1 <= self.timeout_seconds <= 120
            or not 0 <= self.max_retries <= 3
        ):
            raise ValueError("Invalid DEVELOPMENT model configuration")


@dataclass(frozen=True)
class ModelUsage:
    input_tokens: int = 0
    output_tokens: int = 0
    cached_tokens: int = 0
    requests: int = 0


@dataclass(frozen=True)
class ModelMetadata:
    provider: str
    model: str
    model_version: str | None
    request_id: str | None
    latency_ms: float
    usage: ModelUsage
    tool_calls: int
    finish_reason: str | None
    retry_count: int


@dataclass(frozen=True)
class ModelReply:
    proposal: dict[str, Any]
    metadata: ModelMetadata


class LLMProvider(Protocol):
    def invoke_structured(
        self, *, system_prompt: str, payload: dict[str, Any], schema: dict[str, Any]
    ) -> ModelReply: ...

    def invoke_with_tools(
        self,
        *,
        system_prompt: str,
        payload: dict[str, Any],
        tools: dict[str, dict[str, Any]],
        schema: dict[str, Any],
    ) -> ModelReply: ...

    def model_info(self) -> dict[str, Any]: ...

    def usage_info(self) -> ModelUsage: ...


class GeminiProvider:
    """Uses Google's generateContent REST API through pinned httpx, no auto tool execution."""

    def __init__(
        self,
        config: DevModelConfig,
        *,
        api_key: str | None = None,
        client: httpx.Client | None = None,
    ) -> None:
        self.config = config
        self._api_key = api_key if api_key is not None else os.getenv("GEMINI_API_KEY", "")
        self._client = client or httpx.Client(timeout=config.timeout_seconds)
        self._usage = ModelUsage()

    def model_info(self) -> dict[str, Any]:
        return {
            "provider": self.config.provider,
            "model": self.config.model,
            "temperature": self.config.temperature,
            "top_p": self.config.top_p,
            "max_output_tokens": self.config.max_output_tokens,
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
        if not self._api_key:
            raise ProviderFailure(ProviderErrorKind.AUTHENTICATION)
        body: dict[str, Any] = {
            "systemInstruction": {"parts": [{"text": system_prompt}]},
            "contents": [{"role": "user", "parts": [{"text": json.dumps(payload, default=str)}]}],
            "generationConfig": {
                "temperature": self.config.temperature,
                "topP": self.config.top_p,
                "maxOutputTokens": self.config.max_output_tokens,
                "responseMimeType": "application/json",
                "responseJsonSchema": schema,
            },
        }
        if tools:
            body["tools"] = [
                {
                    "functionDeclarations": [
                        {
                            "name": name,
                            "description": f"Trusted business tool {name}",
                            "parametersJsonSchema": tool_schema,
                        }
                        for name, tool_schema in tools.items()
                    ]
                }
            ]
        started = time.monotonic()
        url = (
            "https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.config.model}:generateContent"
        )
        for attempt in range(self.config.max_retries + 1):
            try:
                response = self._client.post(
                    url,
                    headers={"x-goog-api-key": self._api_key},
                    json=body,
                    timeout=self.config.timeout_seconds,
                )
            except httpx.TimeoutException as exc:
                failure = ProviderErrorKind.TIMEOUT
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(failure, retry_count=attempt) from exc
                continue
            except httpx.TransportError as exc:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(
                        ProviderErrorKind.UNAVAILABLE, retry_count=attempt
                    ) from exc
                continue
            if response.status_code == 401 or response.status_code == 403:
                raise ProviderFailure(ProviderErrorKind.AUTHENTICATION, retry_count=attempt)
            if response.status_code == 429:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(ProviderErrorKind.RATE_LIMIT, retry_count=attempt)
                continue
            if response.status_code in {500, 502, 503, 504}:
                if attempt >= self.config.max_retries:
                    raise ProviderFailure(ProviderErrorKind.UNAVAILABLE, retry_count=attempt)
                continue
            if response.status_code == 400:
                try:
                    message = str(response.json().get("error", {}).get("message", "")).lower()
                except (ValueError, AttributeError):
                    message = ""
                kind = (
                    ProviderErrorKind.CONTEXT_LENGTH
                    if "context" in message and ("limit" in message or "length" in message)
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
            candidates = raw["candidates"]
            if len(candidates) != 1:
                raise ValueError("Expected one candidate")
            candidate = candidates[0]
            finish = candidate.get("finishReason")
            if finish in {"SAFETY", "RECITATION", "PROHIBITED_CONTENT"}:
                raise ProviderFailure(ProviderErrorKind.REFUSAL, retry_count=attempt)
            parts = candidate["content"]["parts"]
            calls = [part["functionCall"] for part in parts if "functionCall" in part]
            if len(calls) > 1:
                raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL)
            if calls:
                call = calls[0]
                if not isinstance(call.get("name"), str) or not isinstance(call.get("args"), dict):
                    raise ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL)
                proposal: dict[str, Any] = {
                    "decision": "CALL_TOOL",
                    "confidence": "UNKNOWN",
                    "reason_code": "MODEL_TOOL_PROPOSAL",
                    "tool_name": call["name"],
                    "tool_arguments": call["args"],
                    "evidence_refs": [],
                }
            else:
                texts = [part["text"] for part in parts if "text" in part]
                if len(texts) != 1:
                    raise ValueError("Expected one structured text part")
                proposal = json.loads(texts[0])
                if not isinstance(proposal, dict):
                    raise ValueError("Decision must be an object")
            usage_raw = raw.get("usageMetadata", {})
            usage = ModelUsage(
                input_tokens=int(usage_raw.get("promptTokenCount", 0)),
                output_tokens=int(usage_raw.get("candidatesTokenCount", 0)),
                cached_tokens=int(usage_raw.get("cachedContentTokenCount", 0)),
                requests=1,
            )
            self._usage = ModelUsage(
                self._usage.input_tokens + usage.input_tokens,
                self._usage.output_tokens + usage.output_tokens,
                self._usage.cached_tokens + usage.cached_tokens,
                self._usage.requests + 1,
            )
            return ModelReply(
                proposal,
                ModelMetadata(
                    self.config.provider,
                    self.config.model,
                    raw.get("modelVersion"),
                    raw.get("responseId"),
                    (time.monotonic() - started) * 1000,
                    usage,
                    len(calls),
                    finish,
                    attempt,
                ),
            )
        except (KeyError, ValueError, TypeError, json.JSONDecodeError) as exc:
            raise ProviderFailure(ProviderErrorKind.INVALID_RESPONSE, retry_count=attempt) from exc
