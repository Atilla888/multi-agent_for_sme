# System Architecture

## 1. Status and principles

This is a **PLANNED** MVP architecture, not a description of running software. The repository audit found no source code, manifests, diagrams, configuration, or infrastructure. The technologies below are the accepted **PROJECT BASELINE / PLANNED** for the diploma, but none is **IMPLEMENTED** in this folder. Product scope lives in [PRD.md](PRD.md).

Architectural rules: put authorization and business invariants in deterministic application services; give agents only relevant context and permitted tools; use structured sources for operational facts and RAG for unstructured knowledge; preserve context and provenance across handoffs; keep research variants comparable; prefer an implementable modular MVP.

## 2. High-level architecture

```mermaid
flowchart LR
    C[Instagram / WhatsApp / Telegram / Web Chat] --> G[Channel adapters and API boundary]
    O[Owner / employee UI] --> G
    G --> S[Authentication and authorization]
    S --> R[Orchestration policy]
    R --> A[Sales / Support / Analytics agents]
    A --> B[Business Brain context service]
    A --> T[Validated tool executor]
    B --> D[(Structured business data)]
    B --> K[(Documents / FAQ and retrieval)]
    B --> H[(Conversation and execution state)]
    T --> D
    T --> M[Forecasting service]
    R --> U[Human escalation]
    T --> X[Audit / traces]
    R --> X
```

The diagram names responsibilities, not deployed services or existing modules. The channel adapters normalize external events; the API boundary authenticates requests and associates them with the correct business context. The orchestrator selects permitted next steps. Agents generate task reasoning and tool proposals. The executor independently checks authorization, validated inputs, business rules, and state before performing a tool call.

## 3. Layers and project baseline technology

| Layer | Responsibility | Planned implementation direction |
| --- | --- | --- |
| Client channels | Message transport and normalization for target channels | Channel adapters plus Web Chat; external API feasibility TBD |
| API and security | Staff authentication, request validation, permissions, API contracts | Python/FastAPI/Pydantic; Keycloak with OAuth2/OIDC/JWT and RBAC |
| Orchestration | Route, continue, hand off, clarify, escalate, persist execution state | LangGraph; LangChain where justified; policy is a research target |
| Agents | Bounded Sales, Support, Analytics behavior | API-based and open-source LLMs for experiments |
| Business Brain | Authorized structured context, documents, history, rules, tool registry | PostgreSQL, pgvector, Redis, MinIO/S3 |
| Tools and business operations | Validated reads/writes, reports, forecast requests | Application services and explicit tool contracts |
| Data and operations | Durable records, object storage, local runtime, telemetry | PostgreSQL, Docker, Docker Compose, GitHub Actions |

The accepted frontend baseline is Next.js, React, and TypeScript; the accepted ML baseline is pandas, scikit-learn, XGBoost, and PyTorch. These technology choices are planned, not implemented; use of individual ML libraries depends on the accepted workflow and evaluation. A service/API layer should mediate UI data access. No page tree or navigation is fixed; [DESIGN.md](DESIGN.md) is a research skeleton. A modular backend can keep API routers thin, orchestration and agent policy separate, and business services authoritative. This is a code organization proposal, not a microservice commitment. Kafka/NATS, ClickHouse, Kubernetes, event sourcing, and CQRS are optional/future rather than MVP baseline technologies.

## 4. Identity and authorization

Staff roles and tenant/resource ownership must be enforced at the API and tool executor. An agent's selected role cannot expand the current principal's permissions. Customer identity verification is required before disclosing private order/customer details; the exact process is TBD. Credentials remain outside prompts and logs. Human approval, where required by business policy, is a separate gate from model confidence. Authorization applies equally to all three research architectures.

## 5. Agent model and orchestration

An agent is defined by its role, responsibility, goal, allowed tools, access constraints, and relevant Business Brain context. Sales owns supported catalog/purchase flows; Support owns order help and policies; Analytics owns authorized reports/forecasts. The agent roster is fixed for the MVP concept, while exact prompts, tool permissions, and handoff rules remain open.

The adaptive policy may consider intent, available facts, conversation and execution state, tool availability, task complexity, permissions, and confidence. It may continue the current agent, clarify, call an authorized tool, hand off, escalate, or finish. Confidence semantics and thresholds must be specified before writes or evaluation; they are not invented here. A human handoff carries verified facts, sources, outstanding questions, attempted actions, and the reason for escalation. The precise adaptive decision algorithm is a **RESEARCH TARGET**.

## 6. Business Brain

| Context type | Intended source and access |
| --- | --- |
| Structured facts | Authorized APIs/SQL/tools for customers, products, orders, inventory, sales, transactions where available. |
| Unstructured knowledge | Versioned company documents, FAQ, policies, instructions, and descriptions; retrieval/RAG when relevant. |
| State and history | Conversation, current task and execution state, prior tool outcomes, business events. |
| Rules and capabilities | Applicable business rules and the tool registry with permissions and contracts. |

The Business Brain is a context boundary, not a second database or a synonym for vector search. Structured facts remain authoritative in their business stores. Retrieved documents require provenance and permission checks. Sources that disagree should be surfaced as uncertainty; the model must not silently choose a convenient version.

## 7. Tool execution and data

The candidate tool set is approximately 7–10 operations chosen from actual workflows; example names in [PRD.md](PRD.md) are illustrative, not API contracts. Each final tool needs a typed input/output contract, permission rule, validated resource scope, business preconditions, error result, and audit event. Writes additionally need explicit state-transition, duplicate/retry, and uncertain-outcome behavior. Agents request actions; deterministic services decide whether they may run. No database schema is committed by this document.

Operational records should preserve customer, product, order, inventory, sales, and conversation relationships as needed by accepted workflows. The precise use of baseline PostgreSQL, pgvector, Redis, and MinIO/S3 in each workflow remains to be defined. Data retention, tenant isolation, backups, and migration strategy require later decisions.

## 8. Analytics and ML

The MVP includes reports and a sales forecasting module. Candidate model progression: naive baseline, moving average, then XGBoost if data warrants it; LSTM or temporal/transformer approaches need separate justification. MAE, RMSE, and MAPE are candidate forecasting measures, selected only after defining the target and handling zero denominators. NLP classification/extraction may support orchestration. Sentiment, anomaly detection, and recommendation/ranking are **OPTIONAL / FUTURE** unless needed by a proven MVP scenario. Forecast accuracy is evaluated separately from orchestration outcomes.

## 9. Main runtime flows

| Flow | Planned path and stopping condition |
| --- | --- |
| Sales request | Channel/API → authorization/context → Sales → product/inventory tools → grounded reply or clarification/escalation. |
| Support request | Channel/API → identity check → Support → order/policy sources → answer or human escalation. |
| Multi-agent request | Support gathers verified order/policy/stock facts → orchestrator permits Sales handoff for a supported action → executor validates write → outcome returned with shared context. Unsupported effects escalate. |
| Analytics request | Authorized owner/employee → Analytics → report or forecast tool → answer with measure, period, and uncertainty. |
| Human escalation | Any agent/orchestrator detects unresolved, restricted, or low-confidence work → preserves facts and attempted actions → operator takes over. |

```mermaid
sequenceDiagram
    participant C as Customer
    participant R as Orchestrator
    participant S as Support
    participant B as Business Brain
    participant T as Tool executor
    participant H as Human operator
    C->>R: Exchange request
    R->>S: Route with conversation state
    S->>B: Request authorized order/policy context
    S->>T: Check relevant stock and supported operations
    T-->>S: Validated result
    alt Supported and authorized action
        S-->>R: Handoff proposal with verified facts
        R->>T: Execute permitted next action through specialist
        T-->>R: Recorded outcome
        R-->>C: Confirm actual outcome
    else Unsupported or approval required
        R->>H: Escalate with verified context
        R-->>C: Explain pending human review
    end
```

The sequence is illustrative. Exact exchange and reservation semantics are unresolved.

## 10. Research variants and observability

| Variant | Routing boundary |
| --- | --- |
| Single Agent | One universal agent with legitimate tool/data access; no specialist handoff. |
| Static Multi-Agent | Predefined task-to-specialist routing and any predefined transitions. |
| Context-Aware Adaptive Multi-Agent | Runtime routing/continuation decisions based on permitted context and execution state. |

All variants should share the same business data, security checks, tool implementations, scenario inputs, and evaluation rules. Instrumentation should capture a correlation ID, architecture variant, scenario/version, agent and routing decisions, permitted context references, tool attempts/results, errors, escalation, latency, LLM calls/usage, and terminal outcome. Sensitive payloads require minimization or redaction. See [PRD.md](PRD.md#9-research-requirements-and-success-measures) for candidate metrics.

## 11. Deployment and security

Docker and Docker Compose are the accepted baseline for local development/demo; no deployment files exist. External channel providers, LLMs, identity provider, database, and storage must have explicit credentials and environment separation. The application must validate webhooks, scope reads/writes to the current business, prevent prompt content from changing permissions, and retain auditable records of consequential actions. Actual threat controls and operational procedures are implementation decisions.

## 12. Decision register and open technical questions

**Current direction:** modular full-stack MVP, three specialized agents, deterministic tool/security layer, Business Brain with structured and document paths, three comparable research variants. These are project-brief decisions, not implemented components.

**Open:** exact channel launch sequence and provider access; final tool contracts and business transitions; customer verification; tenant model; persistence schema; retrieval/corpus governance; model/provider and budget; confidence policy; human approval boundaries; forecast target/data; logging retention; exact deployment topology. See [MEMORY.md](MEMORY.md#open-questions) for unresolved project decisions.
