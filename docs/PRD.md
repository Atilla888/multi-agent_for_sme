# Product Requirements Document

## 1. Product identity

**Project:** Development of an Intelligent Adaptive Multi-Agent Platform for Customer Interaction Automation and Business Analytics in SMEs.

**Positioning:** AI-Native Business Operating System for small and medium-sized enterprises (SMEs), centered on customer operations and business analytics. **MVP domain:** retail and e-commerce.

**Status:** Product scope is specified here; the audited `Diplom` folder contains no application or prior project artifacts. Every capability below is **PLANNED** unless explicitly marked **RESEARCH TARGET** or **OPTIONAL / FUTURE**. See [MEMORY.md](MEMORY.md) for project decisions and implementation status.

## 2. Problem and vision

Retail SMEs receive customer requests through separate channels while customer, catalog, order, inventory, and policy information lives in different places. Staff must reconstruct context and perform routine checks or updates manually. The planned platform brings these requests into a shared workflow: specialized agents use relevant business context, propose or execute permitted business actions, and pass exceptional cases to a person with context intact. Owners can ask for operational reports and forecasts based on defined business data.

The product is a bounded customer operations platform, not a generic chatbot or a full ERP/CRM replacement. Its distinctive research target is whether context-aware adaptive orchestration improves outcomes compared with simpler agent arrangements under comparable conditions.

## 3. Users and actors

| Actor | Primary need |
| --- | --- |
| Customer | Ask about products, availability, orders, and support through a supported channel. |
| Human operator / employee | Review escalations, continue conversations, and carry out authorized work. |
| Business owner | Inspect business activity, reports, and forecast outputs. |
| Administrator | Manage authorized access and business configuration. |
| Adaptive orchestrator (system actor) | Select an appropriate next agent/action using permitted context and execution state. |

Exact employee roles, approval levels, and customer identity-verification rules remain open.

## 4. Core concepts

- **Business Brain:** Shared access to structured business facts, unstructured documents, conversation and execution history, current state, rules, and available tools. Structured records are normally accessed through authorized APIs/queries/tools; RAG is for relevant unstructured knowledge.
- **Specialized agents:** MVP roles are **Sales**, **Support**, and **Analytics**. Each has a bounded responsibility, goal, permitted tools, access permissions, and relevant shared context.
- **Business tools:** Validated operations that read or change actual business state. Example candidate operations include `find_product`, `check_inventory`, `create_order`, `update_order`, `reserve_inventory`, `find_customer`, `get_order`, `get_sales_report`, and `forecast_sales`; this is not a frozen API or final tool list.
- **Adaptive orchestrator:** A **RESEARCH TARGET** that can select an agent, request a tool, continue, hand off, clarify, or escalate based on context and state. Its algorithm is not yet fixed.
- **Human handoff:** A person receives the relevant verified facts and execution state when automation cannot safely finish.

## 5. MVP boundary

**IN SCOPE — PLANNED:** a retail/e-commerce workflow spanning customer conversations, customers, products, inventory, orders, sales data, documents/FAQ, three core agents, shared Business Brain, authorized business actions, human escalation, owner-facing analytics, a sales forecasting module, and a full-stack application. The target customer channels are Instagram, WhatsApp, Telegram, and Web Chat. The exact launch sequence and channel access are TBD. The planned business-tool set is approximately 7–10 operations, to be finalized from end-to-end workflows.

**RESEARCH TARGET:** Implement and evaluate Single Agent, Static Multi-Agent, and Context-Aware Adaptive Multi-Agent arrangements using comparable scenarios, business tools, data, and evaluation rules. Ablations may test the contribution of shared context, adaptive routing, handoff, structured state, and confidence-based escalation where feasible.

**OUT OF SCOPE / OPTIONAL FUTURE:** Full CRM/ERP coverage; additional agents (Inventory, Marketing, Finance, Owner, Reputation, Forecasting); general industry coverage; Kafka/NATS, ClickHouse, Kubernetes, microservices, event sourcing, or CQRS without new evidence; advanced recommendation/anomaly-detection modules unless necessary for the diploma; a finalized design system before UX research.

## 6. Functional requirements

These are target behaviors, not claims of implementation. IDs support links to [ARCHITECTURE.md](ARCHITECTURE.md) and [TASKS.md](TASKS.md).

| ID | Capability | Required behavior |
| --- | --- | --- |
| FR-AUTH-001 | Identity and access | Authenticate staff and enforce roles/permissions at API and tool boundaries. |
| FR-CHAN-001 | Channels | Accept and normalize messages from the four target channels, preserving channel and conversation identity. |
| FR-CONV-001 | Conversations | Keep conversation history and make the relevant history available to authorized agents/operators. |
| FR-CORE-001 | Business records | Provide authorized access to customers, products, orders, inventory, and sales facts needed by MVP workflows. |
| FR-BRAIN-001 | Business Brain | Supply relevant structured facts, document knowledge, rules, state, and history with source/provenance where applicable. |
| FR-AGENT-001 | Sales | Handle catalog, availability, and supported purchase/order workflows within permissions. |
| FR-AGENT-002 | Support | Handle FAQ/policy and order-support workflows; escalate unsupported or restricted changes. |
| FR-AGENT-003 | Analytics | Answer authorized owner/employee report requests and use the forecasting service where appropriate. |
| FR-TOOL-001 | Actions | Validate tool inputs and authorization; execute permitted reads/writes through business services and record consequential calls. |
| FR-ORCH-001 | Orchestration | Route tasks, carry relevant context across handoffs, and use state/confidence to decide whether to continue, clarify, or escalate. |
| FR-HUMAN-001 | Escalation | Create a handoff to a human operator with verified context and action history when automation cannot safely complete the task. |
| FR-ANALYTICS-001 | Analytics/ML | Provide defined sales reports and a forecast with its target, time range, and limitations stated. |
| FR-AUDIT-001 | Traceability | Capture request, agent decision, tool attempt/result, errors, and outcome with a correlation identifier, subject to privacy controls. |

Channel-specific platform permissions, data ownership, order transition rules, and exact report/forecast definitions must be settled before implementation.

## 7. Core scenarios

1. A customer asks whether a product is available. Sales finds the product, checks authoritative inventory, and responds with current availability or uncertainty.
2. A customer asks about an order. Support verifies the customer's right to access it, retrieves the order and relevant policy, then responds or escalates.
3. A customer requests a different jacket size. Support checks the order, policy, and stock; an authorized Sales action may follow only if the required business operation is supported. Otherwise the case goes to a person with context preserved.
4. An owner requests a sales summary or forecast. Analytics uses authorized structured data or the forecasting service, names the measure and period, and avoids treating a forecast as an observed fact.
5. An ambiguous request is clarified or escalated before any unsafe write. The visible outcome records why automation stopped.

These are workflow examples, not a frozen experiment dataset or a promise that every exchange operation can be automated.

## 8. Non-functional requirements

- **Security:** Enforce authorization independently of model output; protect credentials and sensitive customer information.
- **Traceability:** Make material agent decisions and business actions reconstructable for debugging and research, with appropriate retention and access controls.
- **Reliability:** A failed or uncertain action must not be presented as completed; retry and duplicate-message behavior must be defined before writes are enabled.
- **Maintainability:** Keep channel adapters, orchestration, business services, and data access separable enough to test and change independently.
- **Performance:** Measure end-to-end and component latency before setting numeric targets; no SLA is currently evidenced.
- **Research reproducibility:** Version scenarios, prompts/policies, model settings, tool set, and evaluation rules; keep the same controlled inputs across variants where feasible.

## 9. Research requirements and success measures

The **Single Agent** baseline uses one universal agent; **Static Multi-Agent** uses predefined routing among Sales, Support, and Analytics; **Adaptive Multi-Agent** may reroute or hand off based on current context and execution state. The research question is whether the adaptive arrangement improves results under comparable conditions. No superiority claim is made in advance.

Candidate measures: task success rate, tool selection accuracy, invalid action rate, human intervention rate, latency, cost per successful task, and factual grounding. Definitions, benchmark size, statistical method, and ablation eligibility belong to a later research protocol. Product success also requires completing the selected customer workflows with authorized actions and usable human escalation.

## 10. Risks, constraints, and open questions

- Channel APIs, permissions, and test accounts may constrain which integrations can be demonstrated.
- Business write semantics, identity verification, approval boundaries, tenant isolation, and recovery from uncertain tool outcomes are unresolved.
- Forecast target and historical data availability are unresolved; forecasting quality must be evaluated separately from orchestration quality.
- The accepted technology baseline is **PLANNED**, not implemented in this folder. See [ARCHITECTURE.md](ARCHITECTURE.md).
