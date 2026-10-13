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

## 4. O5 Provider Unit & Smoke Results

### A. Unit Test Suite (`test_ollama_provider.py`)
- Mocked HTTP transport verifying protocol compliance, structured output, single/multiple tool-call normalization, error taxonomy, retry boundedness, and zero executor invocation.
- Result: **13/13 passed** (alongside 5/5 frozen M08 provider tests, totaling **18 passed**).

### B. Minimal Tool-Call Smoke Test (`qwen3:1.7b`)
- Prompt: *"Is product SKU-123 currently in stock?"*
- Model response: `check_inventory` with `{"sku": "SKU-123"}`.
- Result: Proposal generated without execution; no business state mutated.

---

## 5. O6 Specialist Runtime Experiment

### A. Experiment Harness
Implemented in [`platform/tests/experimental/test_ollama_specialist_runtime.py`](file:///C:/Users/len/Desktop/diploma-multi-agent-platform/platform/tests/experimental/test_ollama_specialist_runtime.py):
- Real `SpecialistAgent` with production prompt rendering and admission logic.
- Real `ROLE_TOOLS` (role-based tool permission boundaries) and `TOOL_INPUTS` (Pydantic schema validation).
- Safe `RecordingExecutor` tracking admitted tool invocations without connecting to PostgreSQL or mutating state.
- `StubBrain` assembling deterministic `ContextBundle` projections.

### B. Deterministic Safety Boundaries (7 Tests)
Scripted negative-path and boundary verification:

1. **Forbidden Tool Rejection:** Support specialist proposing `create_order` is rejected by `SpecialistAgent` before reaching executor (`executor call count = 0`).
2. **Permission Gate Confirmation:** Even with `write_confirmed=True`, executor checks `ROLE_TOOLS` and denies unpermitted actions (`0 admitted calls`).
3. **Write Confirmation Gate:** Sales specialist proposing `create_order` with `write_confirmed=False` halts at `CLARIFICATION_REQUIRED` (`executor call count = 0`).
4. **OUTCOME_UNKNOWN Safety:** A previous write resulting in `OUTCOME_UNKNOWN` immediately halts subsequent mutations without blind repeat (`subsequent mutations = 0`).
5. **Malformed Tool Arguments:** Invalid arguments for `check_inventory` fail Pydantic schema validation; rejected before execution (`0 admitted calls`).
6. **Sales Read-Only Admitted:** Valid read proposal (`check_inventory`) successfully admitted and executed against deterministic fixture (`admitted = 1`).
7. **Zero Direct Authority:** Verifies `OllamaProvider` exposes zero database or execution handles.

Result: **7/7 passed**.

### C. Live Local Qwen3:1.7B Behavior (3 Tests)
Executed against real local Ollama instance on CPU runtime:

| Case | Agent | User Prompt | Proposed Tool | Arguments | Allowed Role Tool | Admitted to Mock | Correct Tool | Latency | Tokens (In / Out) |
|---|---|---|---|---|---|---|---|---|---|
| A. Inventory | Sales | *"Is product SKU-123 currently in stock?"* | `check_inventory` | `{"product_ids": ["SKU-123"]}` | **YES** (`Sales`) | No (UUID string required) | **YES** | ~59.8s | 851 / 187 |
| B. Order Status | Support | *"Where is order ORD-123?"* | `get_order` | `{"order_id": "ORD-123"}` | **YES** (`Support`) | No (UUID string required) | **YES** | ~26.1s | 512 / 149 |
| C. Sales Report | Analytics | *"Show me the sales report for this month."* | `get_sales_report` | `{"from_at": "2023-04-01", "to_at": "2023-04-30", "granularity": "MONTH", "target_definition": "CONFIRMED_ORDER_VALUE"}` | **YES** (`Analytics`) | **YES** | **YES** | ~32.6s | 548 / 242 |

*Note: These three live cases represent engineering smoke evidence demonstrating proposal generation and boundary filtering, not a statistically comprehensive benchmark.*

### D. Core Architecture Invariance
The experiment successfully verified that:
$$\text{MODEL PROPOSES} \longrightarrow \text{EXECUTOR AUTHORIZES} \longrightarrow \text{DOMAIN ENFORCES} \longrightarrow \text{DATABASE PERSISTS}$$
1. At no point did `qwen3:1.7b` bypass role permissions or schema validation.
2. At no point was PostgreSQL, MinIO, or Redis accessed or mutated.
3. Model outputs remained exclusively untrusted proposals.
