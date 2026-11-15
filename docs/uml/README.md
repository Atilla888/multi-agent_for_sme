# UML diagrams — Multi-Agent Platform (PlantUML)

All 14 diagram types of UML 2.5 for the platform, plus two ER diagrams of the database. Every diagram is written in PlantUML and drawn from the real project: the backend source (`platform/services/backend/src/platform_backend`), the database schema (`physical_schema.sql`), the Docker Compose file, and the architecture chapters D01–D13 of the master document.

- `src/` — PlantUML sources (`.puml`); `_style.iuml` holds the shared styling
- `png/` — rendered images (run the commands below to also produce `svg/`, which stays sharp in Word and in slides)
- `UML_all_diagrams.pdf` — every diagram in one file, in the order below

Elements marked `<<planned>>` are designed but not built yet (the LangGraph orchestrator M09–M11, channel adapters, and the trained forecast model). Everything else exists in the code today.

## UML 2.5 coverage

UML has 7 structure diagram types and 7 behavior diagram types. Each one is covered below.

| # | UML type (Russian name) | File | What it shows |
|---|---|---|---|
| 1 | Use Case (диаграмма прецедентов) | `01a_use_case_customer`, `01b_use_case_staff` | Actors (Customer, Owner, Operator, Admin, channel provider, LLM, Keycloak) and what each can do. Includes `<<include>>`/`<<extend>>` relations and the staff role generalization. |
| 2 | Class (диаграмма классов) | `02_class_domain` | Domain model: Business, Customer, Product, Inventory, Order, OrderItem, the Money value object, PrincipalContext / ExecutionContext and the enums, with real multiplicities (an order has 1..50 lines). |
| | | `03_class_agents_brain` | SpecialistAgent, AgentDecision, AgentOutcome, the BusinessBrain and its seven context providers, KnowledgeService, and the Protocol interfaces they depend on (LLMProvider, BrainPort, ExecutorPort). |
| | | `04_class_tools_execution` | ToolExecutor, the 10 strict tool input contracts, ToolResult, OrderService, QueryService, OperationLedger and the repositories, plus the per-agent tool allowlist. |
| 3 | Object (диаграмма объектов) | `05_object` | A snapshot after a confirmed order: customer, identity, product, stock, order and order line, agent run, idempotency operations, tool calls and audit records. |
| 4 | Package (диаграмма пакетов) | `06_package` | Backend packages with dependencies taken from the real `from platform_backend.X import` statements. |
| 5 | Component (диаграмма компонентов) | `07_component` | The six macro-layers L1–L6 (D02) with provided and required interfaces. |
| 6 | Composite Structure (диаграмма составной структуры) | `08_composite_structure` | Internal parts and ports of a SpecialistAgent and of the ToolExecutor. |
| 7 | Deployment (диаграмма развёртывания) | `09_deployment` | Docker Compose services, their images, the edge/data/identity networks, volumes, one-shot jobs and the external clouds. |
| 8 | Profile (диаграмма профилей) | `10_profile` | The `<<MultiAgentPlatform>>` profile: the stereotypes used in these diagrams (TenantScoped, Versioned, Agent, Tool, Untrusted, Planned…) and the metaclasses they extend. |
| 9 | Sequence (диаграмма последовательности) | `11_seq_ingestion` | Message ingestion: webhook check, dedupe, durable receipt, run, and delivery retries that never repeat the business command (D03). |
| | | `12_seq_create_order` | The real Sales flow: Brain → LLM → find_product → create_order (idempotent) → reserve_inventory, with alternatives for shortage and an unknown commit outcome (D04). |
| | | `13_seq_handoff_escalation` | Support → Sales handoff, update_order blocked by E02, then escalation and the operator's decision (D05, D11). |
| | | `14_seq_knowledge` | Document upload → quarantine → index → publish, then ACL-filtered retrieval (D09). |
| 10 | Activity (диаграмма деятельности) | `15_activity_tool_execution` | `ToolExecutor.execute()` step by step: admission, allowlist, strict validation, dispatch of each tool, result classification, audit. |
| | | `16_activity_specialist_run` | `SpecialistAgent.run()` with swimlanes: the bounded decision loop and every exit outcome. |
| | | `17_activity_forecast_pipeline` | The forecasting pipeline with fork/join of baselines and XGBoost, and the validation gate (D10). |
| 11 | State Machine (диаграмма состояний) | `18_state_order` | Order: CREATED → CONFIRMED / NEEDS_ATTENTION. |
| | | `19_state_agent_run` | AgentRun: RUNNING (with orchestration sub-states from §10.2) → WAITING_HUMAN → SUCCEEDED / FAILED. |
| | | `20_state_escalation` | Escalation: OPEN → CLAIMED → RESOLVED. |
| | | `21_state_document_version` | DocumentVersion: STAGED → READY → published / FAILED / REVOKED. |
| | | `22_state_message` | Inbound and outbound Message statuses, and Conversation OPEN / ESCALATED / CLOSED. |
| 12 | Communication (диаграмма коммуникации) | `23_communication` | The create_order collaboration as numbered messages between objects. |
| 13 | Timing (временная диаграмма) | `24_timing` | One Sales run over time: message, run, agent, order and tool budget lines against the 60 s deadline. |
| 14 | Interaction Overview (обзорная диаграмма взаимодействия) | `25_interaction_overview` | The end-to-end request as an activity flow whose nodes refer to the sequence, activity and state diagrams above. |
| — | ER (not UML; bonus) | `26_er_commerce_identity`, `27_er_knowledge_execution` | All 25 tables from `physical_schema.sql` with keys, status values and cardinalities. |

## Notes on notation

- PlantUML has no dedicated syntax for composite structure, profile or communication diagrams. They are drawn with the closest PlantUML constructs (nested components with ports, a class diagram with `<<metaclass>>`/`<<stereotype>>`, and objects with numbered links), and each title says so. The UML meaning is kept.
- State names and values are copied from the database `CHECK` constraints and Python enums. Transitions not stored as data (for example the escalation release and review sub-states) follow the D11 design.
- The object and timing diagrams use illustrative values (a demo shop, timings in seconds).

## How to re-render

Install Java and Graphviz, download `plantuml.jar` (version 1.2025.4 was used), then run:

```
cd src
java -jar plantuml.jar -tpng -o ../png *.puml
java -jar plantuml.jar -tsvg -o ../svg *.puml
```

For the very large class diagram, set the environment variable `PLANTUML_LIMIT_SIZE=16384` first.
