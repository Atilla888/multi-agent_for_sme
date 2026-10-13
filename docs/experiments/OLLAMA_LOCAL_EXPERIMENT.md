# Local Model Experiment — Ollama & Qwen3:1.7B

## 1. Governance & Boundary Notice

> [!IMPORTANT]
> **LOCAL MODEL EXPERIMENT != M08 PASS**
>
> In accordance with `recovery/P4_M08_DEFERRED_FREEZE.md` (Section 14), this activity is strictly a **LOCAL MODEL EXPERIMENT** on a dedicated research branch (`experiment/ollama-local`). It does **NOT** complete, reopen, or pass the formally frozen M08 milestone (**PARTIAL / BLOCKED / DEFERRED**).
>
> Model outputs remain untrusted proposals. The canonical safety invariant remains absolute:
> **MODEL PROPOSES → EXECUTOR AUTHORIZES → DOMAIN ENFORCES → DATABASE PERSISTS**

---

## 2. Environment & Hardware Profile

- **Host Machine:** Secondary development machine (Windows 11)
- **Processor:** Intel Core i5-1135G7 @ 2.40GHz (4 cores / 8 threads)
- **Memory:** 8 GB RAM
- **Graphics:** Integrated Intel Iris Xe Graphics
- **Storage:** NVMe SSD
- **Execution Target:** CPU runtime
- **Inference Server:** Local Ollama daemon (`http://localhost:11434`)
- **Active Model:** `qwen3:1.7b`
- **Context Window:** 4096 tokens
- **Measured Generation Throughput:** ~29.39 tokens/sec

---

## 3. Integration Architecture

The Ollama adapter (`OllamaProvider` in `platform_backend.agents.ollama`) implements the frozen `LLMProvider` protocol without introducing external tool authority:

```
SpecialistAgent (Sales / Support / Analytics)
                    ↓
          LLMProvider Protocol
                    ↓
             OllamaProvider
                    ↓
         POST /api/chat (stream=false, thinking=false)
                    ↓
            Ollama daemon (qwen3:1.7b)
```

### Safety & Structural Invariants
1. **Zero Direct Tool Execution:** `OllamaProvider` only normalizes responses into `CALL_TOOL` proposals matching the platform's `AgentDecision` contract. It never imports or calls `ToolExecutor`.
2. **Strict Tool Call Count:** Exactly one tool call per turn is accepted. Multiple tool calls trigger `ProviderFailure(ProviderErrorKind.MALFORMED_TOOL_CALL)`.
3. **Defense Against Prompt Overrides:** The model proposal must be independently verified by `SpecialistAgent` and admitted/authorized by `ToolExecutor` before any read or write.
4. **No Core Domain Alteration:** Business Brain, domain models, ten business tools, database migrations, and RBAC policies remain 100% untouched.

---

## 4. Experimental Results

### A. Unit Test Suite (`test_ollama_provider.py`)
- Mocked HTTP transport verifying:
  - Protocol implementation conformance
  - Structured output normalization
  - Single tool-call proposal mapping
  - Dict and JSON-string argument handling
  - Multiple tool-call rejection (`MALFORMED_TOOL_CALL`)
  - Connection refused mapping (`UNAVAILABLE`)
  - Read timeout and bounded retry handling (`TIMEOUT`)
  - Malformed content handling (`INVALID_RESPONSE`)
  - Markdown code-fence stripping
  - Cumulative token and request accounting
  - Absence of tool execution side effects
- Result: **13/13 passed** (alongside 5/5 frozen M08 provider tests, totaling **18 passed**).

### B. Live Local Smoke Test (`qwen3:1.7b`)
- Endpoint: `http://localhost:11434/api/chat`
- Tool provided: `check_inventory` with `sku: string`
- User prompt: *"Is product SKU-123 currently in stock?"*
- Model response: Native tool call proposal
  - `decision`: `CALL_TOOL`
  - `tool_name`: `check_inventory`
  - `tool_arguments`: `{"sku": "SKU-123"}`
  - `confidence`: `UNKNOWN`
  - `reason_code`: `MODEL_TOOL_PROPOSAL`
  - `finish_reason`: `stop`
  - `tool_calls`: 1
- Verification: Proposal successfully returned without executing `check_inventory`. No business state was mutated.
