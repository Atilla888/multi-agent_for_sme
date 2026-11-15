# Phase 2 — Competitor UX/UI Research

## 2.0 Research Method

**Research date:** 2026-09-29. **Scope:** public official product documentation/help centers first, then official product pages. The supplied research brief calls this work “Phase 2”; in the existing [project roadmap](../TASKS.md), it fulfills the research portion of **Phase 0.5**, while roadmap Phase 2 remains Business Core. All external observations below are *documented or vendor-presented behavior*, not a hands-on test of authenticated workspaces. Public page screenshots and copy do not establish interaction quality, reliability, or entitlement on every plan. Each cited link gives the source title and URL; sources were checked on the research date. “Observed” means explicitly shown or described in an accessible source. “Interpretation” means a design inference for our planned product. **Access limit:** direct opening of `ubee.kz` timed out; its search-indexed official-domain excerpt is treated as a lead, not direct verification. No source code, live accounts, UML, Draw.io, PDFs, presentations, or lab reports exist in this repository. Sections 2.8–2.12 therefore map [PRD.md](../PRD.md) and [ARCHITECTURE.md](../ARCHITECTURE.md), not unseen UML.

Two separate evaluation lenses are used; no combined score is calculated:

| Lens | Questions checked |
| --- | --- |
| Functional similarity | Omnichannel communication; CRM/structured data; shared knowledge/context; specialized agents; multi-agent collaboration; agent-to-agent and human handoff; tools/APIs; business-state writes; business analytics; forecasting/ML; owner assistant; agent analytics; RAG/knowledge; workflows; adaptive routing; audit/action visibility. |
| UX/product design | Navigation and information architecture; dashboard; inbox, list and active conversation; customer profile/context; agent identity/status; takeover and multi-agent state; action feedback; knowledge management; analytics; workflow and agent configuration; onboarding; empty/loading/error states; hierarchy, density, consistency. |

Evidence notation in section 2.5: **✓** = explicit current official documentation or clear product-page description of the capability; **△** = adjacent/limited capability or only a broad vendor claim; **—** = not verified publicly or not a documented focus, *never proof of absence*. Vendor pages are weaker evidence than help-center instructions; “✓” does not mean independently tested. **P** = planned for *our* project; **R** = research target. Where a claim is ambiguous, the text says “Not verified from public sources.” UX observations are about documented information structure, not measured usability. Do not transfer a competitor's design, branding, or unsupported behavior into our specification.

## 2.1 SleekFlow

### 2.1.1 Product and UX Structure

**Observed:** SleekFlow documents a left sidebar with Inbox, Contacts, Broadcasts, Flow Builder, SleekFlow AI, and Analytics. The Inbox combines connected customer channels, while the Contacts module holds customer profiles. AI agents are configured in AgentFlow and deployed to conversation flows. Sources: [Welcome to SleekFlow](https://help.sleekflow.io/en_US/getting-started/welcome-to-sleekflow), [Getting started with SleekFlow Inbox](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox), [Set up, test, deploy and manage an AgentFlow AI agent](https://help.sleekflow.io/agentflow/set-up-test-deploy-and-manage-an-agentflow-ai-agent). **Interpretation:** It is the strongest publicly documented reference here for a customer-conversation operating workspace, but the major modules exceed our bounded MVP.

### 2.1.2 Global Navigation

**Observed:** A persistent left sidebar separates operational messaging, contacts, automation, AI, and analytics; AI configuration uses its own internal navigation and analytics tab. Source: [Welcome to SleekFlow](https://help.sleekflow.io/en_US/getting-started/welcome-to-sleekflow). **Interpretation:** A stable first-level hierarchy can help operators find the inbox and owners find analytics. Its breadth is too large to adopt wholesale; our first IA should keep fewer destinations.

### 2.1.3 Inbox / Conversation Workspace

**Observed:** The documented Inbox has four areas: an Inbox views panel, conversation list, active conversation workspace (control bar, history, composer), and right-side contact panel. Views include My Inbox and company queues; list controls include search, filters, status, assigned/unassigned and unread/unreplied handling. The contact panel can be opened without leaving the conversation. Sources: [Getting started with SleekFlow Inbox](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox), [Navigating and managing conversations in Inbox](https://help.sleekflow.io/inbox/managing-conversations-in-inbox). **Interpretation:** The visible list → dialogue → context relationship is directly relevant, while exact panel widths, visual density, and mobile behavior are not verified here and must be tested in wireframes.

### 2.1.4 Customer Context

**Observed:** The contact panel documents identity/contact fields, remarks, labels, lists, contact properties, tickets, custom objects, e-commerce data from integrations, and media; access depends on role permission. Shopify can put order/purchase context in Inbox. Sources: [Accessing contact profile and information in Inbox](https://help.sleekflow.io/en_US/accessing-contact-profile-and-information-in-inbox), [Shopify integration](https://help.sleekflow.io/en_US/shopify-integration). **Interpretation:** Our operator needs verified identity, relevant customer/order/stock facts, policy sources, assignment, and prior actions beside the dialogue; each fact needs source and permission context. A label or retrieved paragraph must not masquerade as current order state.

### 2.1.5 AI Agent Experience

**Observed:** AgentFlow setup is documented as create → configure/test → deploy. Agent settings include name/description, rules or playbook, knowledge, optional procedures/actions, testing playground, deployment channels and exit conditions. Knowledge sources are assigned per agent from a global library. Sources: [AgentFlow setup](https://help.sleekflow.io/agentflow/set-up-test-deploy-and-manage-an-agentflow-ai-agent), [AI Knowledge Base](https://help.sleekflow.io/en_US/ai-knowledge-base). **Interpretation:** Separate role, knowledge, permitted action, test, and deployment states would make our three agents legible; the exact configuration UI is not yet a product requirement.

### 2.1.6 Human ↔ AI Collaboration

**Observed:** In the documented Human-AI Conversation Control feature preview, an AI session is Active, Standby, or Ended. An AI-handling Inbox view and per-conversation banner expose state; a human reply moves active AI to Standby. Staff may pause, resume, end, and add context before resuming; ending creates an internal handover note, while state transitions appear as system messages. The feature requires the preview and appropriate plan/access. Source: [Manage AI agent sessions in Inbox with Human-AI Conversation Control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control). **Interpretation:** Our human takeover must show ownership, pending work, and whether AI can still reply. One visible control state is more useful than an unexplained “AI on/off” switch.

### 2.1.7 Multi-Agent Behavior

**Observed product capability:** More than one SleekFlow AI agent can have a live session for the same contact; the agent roster shows each session's state, countdown, and controls. A human reply pauses all active agents, and AI messages show the agent name. The official source calls these *independent sessions*, not a verified task-planning handoff. Source: [Human-AI Conversation Control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control). **Our interpretation:** A roster is useful for visibility, but co-enrollment does not demonstrate our context-aware adaptive orchestrator or Support → Sales task handoff.

### 2.1.8 Tools / API / Actions

**Observed:** SleekFlow documents Custom API integration schemas (inputs, outputs, auth) and separate AgentFlow playbook rules that determine when an enabled agent calls an API. It distinguishes integration availability from agent assignment. Execution Trace can display external tool calls and failed playbook steps. Sources: [Custom API integrations in SleekFlow AI](https://help.sleekflow.io/en_US/custom-api-integrations-in-sleekflow-ai), [View AI message’s Execution trace in Inbox](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox). Shopify docs confirm one-way data sync and Inbox context; an older AgentFlow-specific page limits that integration to product-catalog access, so **do not infer that Shopify order mutations are available to the AI**. Sources: [Shopify integration](https://help.sleekflow.io/en_US/shopify-integration), [Shopify integration in AgentFlow](https://help.sleekflow.io/en_US/shopify-integration-in-agentflow). **Interpretation:** Our UI should separate a configured tool from an agent's permission to invoke it, and a proposed write from a confirmed business effect.

### 2.1.9 Analytics

**Observed:** SleekFlow documents a Conversation Analytics dashboard for volumes and response performance and a separate AI Agent Analytics dashboard for agent usage, exit reasons, knowledge-source use, handover rates and credits. These are operational/agent metrics; the reviewed pages do not establish an owner-facing sales-forecast experience. Sources: [Conversation Analytics](https://help.sleekflow.io/en_US/analitik-percakapan), [AI Agent Analytics](https://help.sleekflow.io/en_US/ai-agent-analytics). **Interpretation:** Our business report/forecast should be distinguishable from conversation and agent-operational analytics.

### 2.1.10 Knowledge

**Observed:** Global Knowledge Base holds files, indexed pages, web search sources and custom answers; per-agent assignment controls use. The UI exposes processing/extraction state and review of generated articles. Source: [Add, assign, review, and manage your AI Knowledge Base](https://help.sleekflow.io/en_US/ai-knowledge-base). **Interpretation:** Source status, version and assigned agent are useful concepts, but our Business Brain also includes authoritative structured records, state, history and rules.

### 2.1.11 Strong UX Decisions

**Evidence-backed assessment:** Putting contact context beside messages reduces navigation; the AI state banner and AI-handling queue identify live automation; a read-only per-message execution trace makes AI output inspectable. These are strong *patterns for our tasks*, not a claim of measured usability. Sources: [Inbox layout](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox), [Human-AI control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control), [Execution Trace](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox).

### 2.1.12 Weaknesses / Limits for Our Use Case

**Structural limits, not aesthetic criticism:** SleekFlow's documented platform includes broadcast marketing and a full flow builder that our MVP does not require. Its published multi-agent behavior is independent AI sessions; an adaptive research policy is not established by that evidence. The Shopify documentation has integration/AgentFlow scope differences. Sources: [Navigation](https://help.sleekflow.io/en_US/getting-started/welcome-to-sleekflow), [Human-AI control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control), [Shopify integration in AgentFlow](https://help.sleekflow.io/en_US/shopify-integration-in-agentflow).

### 2.1.13 What We Should Learn From SleekFlow

| Pattern | Why it works for our task | Mapping to our system | Required change |
| --- | --- | --- | --- |
| Conversation + relevant contact panel | Operator can check facts while replying | Support/Sales, `FR-CONV-001`, `FR-CORE-001` | Show verified orders, inventory, policy provenance and permission state, not only CRM labels. |
| Explicit AI session state and takeover | Operator can see who is responding | `FR-HUMAN-001` | Show responsible specialist and handoff state; avoid simultaneous conflicting replies. |
| Per-message execution trace | Staff can inspect what AI relied on | `FR-AUDIT-001`, `FR-TOOL-001` | Distinguish proposal, validation, execution, failure and uncertain result. |
| Global knowledge with per-agent assignment | Reuse documents without identical permissions | `FR-BRAIN-001` | Keep structured business facts and rules separate from document retrieval. |

### 2.1.14 What We Should NOT Copy

Do not reproduce SleekFlow's visual styling, icons, or exact four-area proportions. Do not import broadcast/marketing modules into the MVP by analogy. Do not treat independent AI sessions or generic CRM actions as proof of our adaptive handoff and validated retail writes.

### 2.1.15 Mapping to Our UML / Architecture

No UML file is present; this is a mapping to our documented architecture. Customer → channel conversation; Sales/Support → named AI identity and relevant tool history; Analytics → distinct owner analytics entry; Business Brain → sourced context and knowledge management; Adaptive Orchestrator → routing and handoff state (our own research target); Tool Executor → action/result trace; Human Operator → takeover control and preserved context. Source on the competitor side: [Inbox](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox), [Human-AI control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control), [Execution Trace](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox).

## 2.2 Sintra AI

### 2.2.1 Product Structure

**Observed:** Sintra documents workspaces containing Brain AI, Helpers, chat/history, an Inbox for task outputs, integrations and automations. Helpers have specialist roles; Brain AI supplies shared workspace knowledge. Sources: [Sintra workspace features and their interaction](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [Sintra Workspaces](https://help.sintra.ai/en/articles/12606924-sintra-workspaces). **Interpretation:** Sintra is the clearest conceptual AI-team/shared-knowledge reference, while its Inbox serves automation/task outputs rather than our customer service queue.

### 2.2.2 Navigation

**Observed:** Official help lists left navigation for workspace switch, Home with helper cards/search, Inbox, Automations, Brain AI, Chat History, Tasks and settings. A home search can direct a task to a suitable Helper. Source: [How to navigate the Sintra AI web app](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app). **Interpretation:** Role discovery and shared knowledge deserve identifiable entry points, but our primary operator entry should remain the customer conversation queue.

### 2.2.3 AI Employees / Agent Presentation

**Observed:** Helpers are named, role-specific cards/chats; the help center lists specialist business functions. Per-Helper settings can adjust response style and tools. Sources: [Sintra Helpers explained](https://help.sintra.ai/en/articles/9607295-sintra-helpers-explained), [Navigation guide](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app). **Interpretation:** Sales, Support, and Analytics should be distinguishable by role, scope and current responsibility, without copying character art or implying personhood.

### 2.2.4 Brain AI / Shared Context

**Observed:** Brain AI is workspace-scoped; its All Knowledge area holds saved snippets, files, links and other content and can be searched, filtered, edited or removed. Helpers share the workspace Brain, while separate workspaces isolate knowledge. The official guide cautions that connected integrations do not automatically populate consistently retrievable All Knowledge. Sources: [How to manage knowledge in Brain AI](https://help.sintra.ai/en/articles/11758256-how-to-manage-knowledge-in-the-brain-ai), [Sintra Workspaces](https://help.sintra.ai/en/articles/12606924-sintra-workspaces). **Interpretation:** Shared knowledge scope is a useful UI concept. Our Business Brain is broader: structured live business data, policy rules, task state and tools cannot be represented as one document bucket.

### 2.2.5 Agent Collaboration

**Observed:** Sintra's Helper Collaboration article describes assistance within a chat but lists limits on integrations and visibility of assisting chats. A newer overview documents beta Team Chat with a Team Leader that delegates and synthesizes work. The public evidence does not expose a permission-aware, business-state-dependent routing algorithm. Sources: [Helper Collaboration](https://help.sintra.ai/en/articles/12332728-helper-collaboration), [What is Sintra AI?](https://help.sintra.ai/en/articles/12266334-what-is-sintra-ai). **Interpretation:** Show specialist participation and a handoff summary; do not label Sintra's public behavior equivalent to our context-aware adaptive research architecture.

### 2.2.6 Tasks / Automations

**Observed:** Helpers can perform task-specific use cases and recurring/scheduled tasks. Sintra's workspace Inbox collects generated outputs and items needing review. Sources: [Workspace features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [Recurring Scheduled Helper Tasks](https://help.sintra.ai/en/articles/12913572-recurring-scheduled-helper-tasks). **Interpretation:** A task/review queue pattern can inform our escalation and pending-action states, but not replace a customer inbox.

### 2.2.7 Knowledge Management

**Observed:** All Knowledge supports source search/type/privacy filters and manual versus Helper-assisted saving; the official guide warns that assisted saving may summarize away detail. Source: [How to manage knowledge in Brain AI](https://help.sintra.ai/en/articles/11758256-how-to-manage-knowledge-in-the-brain-ai). **Interpretation:** Show whether knowledge is exact, summarized, current, and approved before it informs business action.

### 2.2.8 Agent Configuration

**Observed:** Helper chat settings and Brain AI workspace content can be adjusted; integrations are connected at workspace level. Sources: [Using the helper's chat](https://help.sintra.ai/en/articles/12130291-using-the-helper-s-chat), [Brain AI explained](https://help.sintra.ai/en/articles/12266276-brain-ai-explained). **Interpretation:** Our agent setup must make tool permission and escalation boundaries visible in addition to voice/style settings.

### 2.2.9 Activity / History

**Observed:** Helper chats have persistent, searchable workspace history; the Inbox stores automation outputs. Sources: [Workspace features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [Using the helper's chat](https://help.sintra.ai/en/articles/12130291-using-the-helper-s-chat). **Interpretation:** Our history also needs verified tool attempts and terminal business outcomes; chat history alone is insufficient.

### 2.2.10 Analytics / Insights

**Observed:** Sintra documents integrations that let Helpers fetch analytics data and produce reports, and scheduled metrics summaries. A dedicated agent-performance or retail forecasting dashboard was **not verified from public sources reviewed**. Sources: [Integrations explained](https://help.sintra.ai/en/articles/12929400-integrations-explained), [Workspace features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction).

### 2.2.11 Strong UX Decisions

**Evidence-backed assessment:** A workspace boundary makes context scope explicit; named specialist Helpers make capabilities discoverable; a separate review Inbox distinguishes generated work from conversational chat. Sources: [Sintra Workspaces](https://help.sintra.ai/en/articles/12606924-sintra-workspaces), [Navigation guide](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app).

### 2.2.12 Limits for Our Product

Sintra's documented Inbox is not an omnichannel customer-service queue. Its shared Brain is documented primarily as curated knowledge, while our Business Brain additionally needs authoritative retail records, current state, rules and authorized business tools. Exact multi-agent operational controls and transaction outcomes remain unverified for our use case. Sources: [Workspace features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [Brain AI management](https://help.sintra.ai/en/articles/11758256-how-to-manage-knowledge-in-the-brain-ai).

### 2.2.13 What We Should Learn

Expose a small roster of the three agent roles and the shared Business Brain as separate but connected concepts. Show which agent is responsible now and what shared evidence it used. Put human-review items in an explicit queue. These are our design inferences from [Sintra navigation](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app) and [workspace structure](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), not copied screens.

### 2.2.14 What We Should Not Copy

Do not copy named personas, avatars, brand visuals, or a task-output Inbox as the default customer operations workspace. Do not flatten Business Brain into the Brain AI knowledge library or present Team Chat as proof that business tool permissions and state-dependent routing are solved.

### 2.2.15 Mapping to Our Architecture

Sintra Helpers → visible Sales/Support/Analytics identities; workspace Brain → a *partial* analogy for shared unstructured context; Helper tasks/review Inbox → pending operator work; Team Chat → conceptual visibility of specialist collaboration. Our Adaptive Orchestrator, Tool Executor, authoritative business data and human takeover need their own interaction models. Sources: [Workspace features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [What is Sintra AI?](https://help.sintra.ai/en/articles/12266334-what-is-sintra-ai).

## 2.3 Kazakhstan Competitors

The following are individual reviews of public, mostly vendor-authored pages. They establish what is **publicly described**, not verified production reliability, UX quality, or feature availability in every account. “Different” means a documented emphasis or an unverified component relative to our brief; it does not prove a feature is absent.

### 2.3.1 Senbi

#### Product overview

**Observed:** Senbi describes CRM for leads, customers, sales, tasks, payments and goods, plus an AI sales agent and an in-CRM assistant for questions on live sales/product data. Source: [Senbi CRM — pipeline, leads, finance and KPI in one place](https://senbi.org/en/crm/). **Interpretation:** Broadest local analogy for structured SME operations plus owner-facing natural-language data access.

#### What is similar to our diploma project

Unified business records, inbound AI lead handling and natural-language questions over CRM facts are documented on the [official CRM page](https://senbi.org/en/crm/).

#### What is different from our diploma project

The public description is CRM/commerce centered; three named Sales/Support/Analytics agents and their adaptive comparison are **not verified from public sources**. This is a scope distinction, not a negative capability claim.

#### Customer channels

**Observed:** Lead intake is listed for WhatsApp, Instagram, Facebook and a website widget. Telegram is **not verified from this CRM page**. [Source](https://senbi.org/en/crm/).

#### CRM / business data

**Observed:** Deals, customers, goods, payments, finance and staff performance are described. [Source](https://senbi.org/en/crm/).

#### AI functionality

**Observed:** The page distinguishes an inbound AI sales agent from a personal assistant that answers questions about CRM data. [Source](https://senbi.org/en/crm/).

#### Knowledge / RAG

**Not verified from public sources reviewed** for this specific Senbi CRM experience; no RAG claim is inferred from the term “AI assistant.”

#### Real business actions

**Observed vendor claim:** The AI agent creates deals; independent execution semantics and permissions are not shown. [Source](https://senbi.org/en/crm/).

#### Analytics

**Observed:** CRM reports by pipeline/staff and assistant responses with tables/totals are described. Forecasting is **not verified**. [Source](https://senbi.org/en/crm/).

#### Multi-agent capability

**Not verified from public sources reviewed.** The sales agent and owner assistant are distinct functions, but this does not establish agent collaboration.

#### Human handoff

**Not verified from public sources reviewed** as a specific AI-to-human control with preserved context.

#### UX/UI observations

**Observed in official product description:** a pipeline view and assistant replies in text/tables are illustrated. **Interpretation:** natural-language reports can complement a structured dashboard; exact in-app layout and usability require access. [Source](https://senbi.org/en/crm/).

#### Strongest relevance to us

Structured operational data and owner questions in one product, supported by the [Senbi CRM page](https://senbi.org/en/crm/).

#### Main limitation as an analogue

Published evidence does not establish cross-specialist workflow state or our research orchestration.

#### Functional similarity conclusion

**High for business data + owner assistant; partial for multi-agent customer operations.** This is an interpretation from the features above, not a test result.

### 2.3.2 aspanCRM

#### Product overview

**Observed:** aspanCRM documents a shared channel Inbox, CRM pipelines, AI agents, workflows, reports and audit. Sources: [Product overview](https://aspancrm.kz/ru/product/), [Inbox](https://aspancrm.kz/ru/product/inbox/), [AI agents](https://aspancrm.kz/ru/product/ai/). **Interpretation:** Strong local analogue for channel → CRM action continuity.

#### What is similar to our diploma project

AI inside customer channels can create a lead, move a deal and assign a task; human takeover and shared knowledge across agents are described. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### What is different from our diploma project

Its documented actions are CRM lead/deal operations. Our planned retail workflow also needs authoritative product, order and inventory actions plus a three-architecture research comparison; those should not be inferred from the vendor page.

#### Customer channels

**Observed:** WhatsApp, Instagram and Telegram are listed in the shared Inbox; calls are integrated separately. [Inbox](https://aspancrm.kz/ru/product/inbox/).

#### CRM / business data

**Observed:** Multiple funnels, customizable stages/fields and lead records are described. [Pipelines](https://aspancrm.kz/ru/product/pipelines/).

#### AI functionality

**Observed:** Configurable AI agents, model choice and lead-handling are presented. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### Knowledge / RAG

**Observed vendor claim:** PDF/DOCX/TXT knowledge is indexed for retrieval, and one knowledge base can serve several agents. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### Real business actions

**Observed vendor claim:** AI may create leads, move pipeline stages, create manager tasks and book meetings within allowed actions. No evidence here establishes order modification or inventory reservation. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### Analytics

**Observed:** Funnel/reporting and an audit journal are listed. Sales forecasting as a validated ML service is **not verified**. [Product overview](https://aspancrm.kz/ru/product/), [Team and permissions](https://aspancrm.kz/ru/product/team/).

#### Multi-agent capability

**Partial:** the vendor says multiple agents can use the same knowledge base; agent-to-agent handoff or adaptive routing is **not verified**. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### Human handoff

**Observed vendor claim:** the AI stops when a manager writes and can pass doubtful cases to a manager. Exact state machine is not publicly specified. [AI agents](https://aspancrm.kz/ru/product/ai/), [Inbox](https://aspancrm.kz/ru/product/inbox/).

#### UX/UI observations

**Observed:** Public pages illustrate channel Inbox, pipeline and event log; the audit log includes actor/object/date filtering. **Interpretation:** an action history is relevant to our Tool Executor visibility, but the website mockups do not prove actual usability. [Product overview](https://aspancrm.kz/ru/product/), [Team and permissions](https://aspancrm.kz/ru/product/team/).

#### Strongest relevance to us

Documented AI-triggered CRM writes and an operator handoff in a Kazakhstan channel product. [AI agents](https://aspancrm.kz/ru/product/ai/).

#### Main limitation as an analogue

No public proof reviewed of retail order/inventory tool semantics or research-grade adaptive orchestration.

#### Functional similarity conclusion

**Strongest Kazakhstan real-action reference; high for inbox + CRM; partial for our specialized orchestration.** This is a reasoned comparison of published scope.

### 2.3.3 CareHub

#### Product overview

**Observed:** CareHub positions a unified customer Inbox with Cario AI, operator workspace, channel analytics and human transfer. Sources: [CareHub home](https://carehub.kz/), [Inbox](https://carehub.kz/product/inbox), [AI agent](https://carehub.kz/product/ai-agent).

#### What is similar to our diploma project

Its channel-first operator view, AI answers in the same customer dialogue and transfer with context address our conversation/handoff tasks. [AI agent](https://carehub.kz/en/product/ai-agent), [CareHub home](https://carehub.kz/).

#### What is different from our diploma project

Published emphasis is messaging, lead lifecycle and service analytics. Our Business Brain's structured orders/inventory and independent forecasting are not established by these pages.

#### Customer channels

**Observed:** WhatsApp, Instagram, Telegram and web widget are listed. [CareHub home](https://carehub.kz/).

#### CRM / business data

**Observed vendor claim:** contact profile and CRM synchronization/lifecycle are described; a full native retail order model is **not verified**. [CareHub home](https://carehub.kz/), [AI agent](https://carehub.kz/product/ai-agent).

#### AI functionality

**Observed:** Cario answers and qualifies; the site also describes operator suggestions/copilot and AI ticketing. [CareHub home](https://carehub.kz/).

#### Knowledge / RAG

**Observed vendor claim:** AI uses an approved knowledge base. Specific retrieval indexing, provenance and document lifecycle are **not verified**. [AI agent](https://carehub.kz/en/product/ai-agent).

#### Real business actions

**Partial:** the site describes appointment booking, lifecycle movement and CRM routing, but not a documented general tool executor for order/inventory writes. [AI agent](https://carehub.kz/product/ai-agent).

#### Analytics

**Observed:** conversation and staff measures such as response time, volume and conversion are documented. This is not evidence of sales forecasting. [Analytics](https://carehub.kz/product/analytics).

#### Multi-agent capability

**Not verified from public sources reviewed** as AI-agent-to-AI-agent collaboration; “AI agent” plus “human agent” is a different relationship.

#### Human handoff

**Observed vendor claim:** AI passes a conversation with context to a manager; AI and staff use the shared Inbox. Exact pause/resume transitions are not documented here. [AI agent](https://carehub.kz/product/ai-agent), [CareHub home](https://carehub.kz/).

#### UX/UI observations

**Observed:** official pages describe one chronological conversation stream, filters by channel/tag/manager, notes and a visible operator workspace. **Interpretation:** this is the closest Kazakhstan reference for the employee's customer Inbox; detailed interaction behavior still needs an account/demo. [Inbox](https://carehub.kz/product/inbox).

#### Strongest relevance to us

Customer-facing multi-channel workspace and AI-to-human context transfer. [CareHub home](https://carehub.kz/).

#### Main limitation as an analogue

The public evidence is mainly product-page description; it does not verify a multi-agent retail business-action architecture.

#### Functional similarity conclusion

**Strongest Kazakhstan communication/inbox reference; partial for structured retail actions and agent collaboration.**

### 2.3.4 Bayge CRM

#### Product overview

**Observed vendor description:** Bayge presents a messenger-centered CRM with AI bot, booking, sales pipeline and analytics. [Bayge CRM](https://crm.bayge.kz/).

#### What is similar to our diploma project

AI-assisted conversations, knowledge-backed responses, CRM leads and channel aggregation are described. [Bayge CRM](https://crm.bayge.kz/).

#### What is different from our diploma project

Published modes emphasize booking/sales/support by bot configuration; our three separately bounded agents and orchestration experiment are not established by this page.

#### Customer channels

**Observed vendor description:** WhatsApp, Telegram, Instagram, email and telephony are shown. [Bayge CRM](https://crm.bayge.kz/).

#### CRM / business data

**Observed:** customer/deal pipeline and roles are displayed. [Bayge CRM](https://crm.bayge.kz/).

#### AI functionality

**Observed:** AI bot, lead scoring and reply suggestions are advertised. [Bayge CRM](https://crm.bayge.kz/).

#### Knowledge / RAG

**Observed vendor claim:** knowledge-backed bot uses documents/FAQ/chat history. [Bayge CRM](https://crm.bayge.kz/).

#### Real business actions

**Partial:** lead/deal creation and appointment booking are described; order/inventory writes and a verified general API action contract are **not verified**. [Bayge CRM](https://crm.bayge.kz/).

#### Analytics

**Observed vendor description:** pipeline/owner metrics and AI lead score are displayed. Forecast model/service is **not verified**. [Bayge CRM](https://crm.bayge.kz/).

#### Multi-agent capability

**Not verified from public sources reviewed.** Multiple bot modes do not establish cooperating agents.

#### Human handoff

**Not verified from public sources reviewed** as a defined AI-to-human state transition.

#### UX/UI observations

**Observed:** the public page illustrates a pipeline board and bot-setup sequence. **Interpretation:** guided setup is potentially useful, but these illustrations are not an authenticated workspace review. [Bayge CRM](https://crm.bayge.kz/).

#### Strongest relevance to us

Local example of knowledge-backed channel automation connected to a CRM pipeline. [Bayge CRM](https://crm.bayge.kz/).

#### Main limitation as an analogue

Evidence is a marketing page; agent handoff, permissioned tools and retail transaction controls need verification.

#### Functional similarity conclusion

**Partial match** for inbox, CRM and knowledge; no documented equivalent of the complete research architecture.

### 2.3.5 Ubee

#### Product overview

**Evidence limit:** This review refers to **Ubee AI at `ubee.kz`**, not an unrelated beauty-booking product with a similar name. Search returned an official-domain excerpt about AI replies, CRM and automation, but direct access to the page timed out. These details are **not directly verified from an opened public source**. [Official URL for later verification](https://ubee.kz/).

#### What is similar to our diploma project

The indexed excerpt suggests channel messages, AI replies, CRM lead records and manager involvement. Treat this as a research lead pending direct official-page or demo access. [Official URL](https://ubee.kz/).

#### What is different from our diploma project

The indexed excerpt emphasizes sales funnel automation. Specialized multi-agent orchestration and owner forecasting are **not verified from accessible public sources**.

#### Customer channels

The official-domain search excerpt lists WhatsApp, Instagram and Telegram. Direct verification of channel availability is pending. [Official URL](https://ubee.kz/).

#### CRM / business data

The indexed excerpt mentions customers, leads and pipeline; direct verification is pending. [Official URL](https://ubee.kz/).

#### AI functionality

The indexed excerpt mentions inbound AI replies and lead qualification; direct verification is pending. [Official URL](https://ubee.kz/).

#### Knowledge / RAG

**Not verified from accessible public sources reviewed.** The indexed excerpt is insufficient to establish document retrieval or RAG mechanics.

#### Real business actions

The indexed excerpt suggests lead creation, but direct evidence of execution, tool contracts and inventory/order actions is **not verified**. [Official URL](https://ubee.kz/).

#### Analytics

The indexed excerpt mentions conversion, response-speed and channel metrics; direct dashboard verification and forecasting are **not verified**. [Official URL](https://ubee.kz/).

#### Multi-agent capability

**Not verified from public sources reviewed.**

#### Human handoff

The indexed excerpt suggests manager involvement. Takeover control and preserved context are **not verified**. [Official URL](https://ubee.kz/).

#### UX/UI observations

**Not verified from an accessible UI source.** Do not draw an interaction-pattern conclusion from the indexed excerpt alone.

#### Strongest relevance to us

Potential messaging-to-CRM proposition to verify later. [Official URL](https://ubee.kz/).

#### Main limitation as an analogue

Direct official-site access is unavailable in this research session; context, writes and specialist handoff remain unverified.

#### Functional similarity conclusion

**Provisional only:** possible front-line AI/CRM relevance, insufficient evidence for a firm similarity conclusion.

### 2.3.6 AIQazaq

#### Product overview

**Observed vendor description:** AIQazaq markets integration of 1C, external CRM, spreadsheets and messengers with an AI assistant, including owner queries over business data. [AIQazaq](https://aiqazaq.kz/).

#### What is similar to our diploma project

Structured business data is queried through natural language and brought into AI-supported decisions; messaging sales use cases are also described. [AIQazaq](https://aiqazaq.kz/).

#### What is different from our diploma project

It is presented largely as an integration/service solution rather than a bounded native retail operator UI. A shared three-agent Business Brain and adaptive routing are **not verified**.

#### Customer channels

**Observed vendor description:** WhatsApp, Telegram and Instagram are mentioned in sales scenarios; channel availability depends on the service package described. [AIQazaq](https://aiqazaq.kz/).

#### CRM / business data

**Observed:** 1C plus Bitrix24/amoCRM and Google Sheets data are discussed. That is connected external data, not proof of a native CRM. [AIQazaq](https://aiqazaq.kz/).

#### AI functionality

**Observed vendor description:** text/voice business questions and client-facing AI agent examples. [AIQazaq](https://aiqazaq.kz/).

#### Knowledge / RAG

**Not verified from public sources reviewed** as a maintained document retrieval workspace.

#### Real business actions

**Partial:** the site describes sheet filling, CRM status updates and sales examples; permission, error and transaction controls are **not verified**. [AIQazaq](https://aiqazaq.kz/).

#### Analytics

**Observed vendor description:** reports from 1C/CRM and daily Telegram summaries. A measured forecast model is **not verified**. [AIQazaq](https://aiqazaq.kz/).

#### Multi-agent capability

The page mentions custom agents for departments in a larger package, but public evidence does not establish agent-to-agent collaboration or adaptive orchestration. [AIQazaq](https://aiqazaq.kz/).

#### Human handoff

**Not verified from public sources reviewed** as an operator takeover UI.

#### UX/UI observations

**Observed:** website examples show conversational business-data answers and Telegram report delivery. **Interpretation:** source labeling and measure definitions would be necessary in our owner analytics; authenticated dashboard behavior is not reviewed. [AIQazaq](https://aiqazaq.kz/).

#### Strongest relevance to us

External structured data made accessible to an owner assistant. [AIQazaq](https://aiqazaq.kz/).

#### Main limitation as an analogue

Less public evidence for a unified retail customer-operations workspace and controllable handoff.

#### Functional similarity conclusion

**High for owner data queries; partial for customer operations; multi-agent behavior unverified.**

## 2.4 Secondary Global References

### 2.4.1 respond.io

**Observed:** Official docs describe a multichannel Inbox with contact details and activities in a side panel, AI Agents that can assign a conversation to a human/team or another AI Agent, and a visible Takeover control in the composer. AI Agent Actions include field/tag changes, workflow triggers and HTTP requests. Sources: [Getting Started with Inbox](https://respond.io/help/inbox/getting-started-with-inbox), [Getting Started with AI Agents](https://respond.io/help/ai-agents/getting-started-with-ai-agents), [Using AI Agent Actions](https://respond.io/help/ai-agent-actions/using-ai-agent-actions), [Assign to agent or team](https://respond.io/help/ai-agent-actions/ai-agent-action-assign-to-agent-or-team). **Interpretation:** The clearest secondary reference for explicit ownership transfer among human and AI assignees. An agent-to-agent assignment is documented; it is not proof of shared business-state planning or our adaptive algorithm. Contact context and takeover pattern are transferable; exact messaging UI and permission behavior require product testing.

### 2.4.2 HighLevel

**Observed:** HighLevel's official docs place Conversation AI in CRM/workflow contexts. Its workflow action waits for a contact reply, branches by condition/timeout and exposes configuration for channel, limits and fallback. Separate documentation shows a booking action that checks a connected calendar and reports booked/not-booked outcomes. Sources: [Conversation AI Workflow Action](https://help.gohighlevel.com/support/solutions/articles/155000001358-workfl), [Appointment Booking Conversation AI](https://help.gohighlevel.com/support/solutions/articles/155000003467-workflow-action-appointment-booking-conversation-ai-booking-bot), [Create a Conversation AI Bot](https://help.gohighlevel.com/support/solutions/articles/155000004401). **Interpretation:** A strong reference for explicit workflow states and real calendar actions, though its sales/booking breadth exceeds our retail MVP. Its action outcome branches suggest our UI must not report success until the business tool confirms it. It is not evidence of our three-specialist adaptive research variant.

### 2.4.3 Vendasta

**Observed:** Vendasta's documentation presents an AI Workforce roster with named role/profile, channels, capabilities/tools and knowledge sources. Pre-built and custom AI Employees are configured in a business workspace; conversation logs can expose explanations and tool/knowledge use. Sources: [AI Workforce Overview](https://docs.vendasta.com/ai/ai-workforce/), [Meet your AI Workforce](https://support.vendasta.com/learn/ai-workforce/meet-your-workforce/), [Custom AI Employees](https://support.vendasta.com/ai/ai-workforce/custom-ai-employees/). **Interpretation:** Useful agent-role presentation and capability configuration reference. Do not copy avatar/persona styling or assume its roster coordinates a single retail order workflow among agents; that is **not verified from the reviewed public sources**.

## 2.5 Cross-Competitor Comparison

The tables compare **documented functions**, not visual quality. `O` omnichannel, `C` CRM/structured records, `K` knowledge/RAG, `A` real actions, `BA` business analytics, `SA` specialist agents, `HH` human handoff, `MA` multi-agent cooperation, `AR` adaptive orchestration, `SC` shared business context. Symbols follow §2.0; **P/R describe our plan, not an implemented competitor feature**. A website claim can receive ✓ only when it explicitly names a capability, but still needs later hands-on validation. Sources for each row are linked in its first cell; narrow meanings are detailed in §§2.1–2.4.

**A. Kazakhstan functional comparison**

| Product / official evidence | O | C | K | A | BA | SA | HH | MA | AR | SC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Senbi](https://senbi.org/en/crm/) | ✓ | ✓ | — | △ | ✓ | △ | — | — | — | △ |
| [aspanCRM](https://aspancrm.kz/ru/product/) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | △ | — | △ |
| [CareHub](https://carehub.kz/) | ✓ | △ | △ | △ | △ | △ | ✓ | — | — | △ |
| [Bayge CRM](https://crm.bayge.kz/) | ✓ | ✓ | ✓ | △ | ✓ | △ | — | — | — | △ |
| [Ubee AI](https://ubee.kz/)† | △ | △ | — | △ | △ | — | △ | — | — | — |
| [AIQazaq](https://aiqazaq.kz/) | △ | △ | — | △ | ✓ | △ | — | — | — | △ |
| **Our project (planned)** | P | P | P | P | P | P | P | R | R | P |

**B. Global functional comparison**

| Product / official evidence | O | C | K | A | BA | SA | HH | MA | AR | SC |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [SleekFlow](https://help.sleekflow.io/en_US/getting-started/welcome-to-sleekflow) | ✓ | ✓ | ✓ | ✓ | △ | ✓ | ✓ | △ | — | △ |
| [Sintra AI](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction) | — | △ | ✓ | ✓ | △ | ✓ | △ | ✓ | △ | △ |
| [respond.io](https://respond.io/help/ai-agents/getting-started-with-ai-agents) | ✓ | ✓ | ✓ | ✓ | △ | ✓ | ✓ | △ | △ | △ |
| [HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000001358-workfl) | ✓ | ✓ | △ | ✓ | △ | ✓ | ✓ | △ | △ | △ |
| [Vendasta](https://docs.vendasta.com/ai/ai-workforce/) | ✓ | ✓ | ✓ | ✓ | △ | ✓ | △ | — | — | △ |
| **Our project (planned)** | P | P | P | P | P | P | P | R | R | P |

**Evidence caveats:** `SA ✓` for aspanCRM means multiple configurable roles are explicitly described; `MA △` only means shared knowledge, not handoff. SleekFlow `MA △` means independent live sessions for one contact. respond.io `MA △` means assignment between agents. Sintra `MA ✓` reflects documented Team Chat/delegation in beta; `AR △` does **not** assert business-state-aware routing. HighLevel `AR △` reflects configured branching, not our adaptive research mechanism. `BA △` for communication platforms can be conversation/lead analytics; no row claims equivalent retail forecasting. A public marketing page with sparse implementation detail has lower confidence than official step-by-step help.

† Ubee row is based only on a search-indexed official-domain excerpt because direct opening timed out; its symbols are tentative and must not be read as verified capabilities.

**Separate UX/design comparison — documented interaction pattern, not a score**

| Reference | Publicly described UI structure | Usability evidence limit | Relevance to our work |
| --- | --- | --- | --- |
| [SleekFlow Inbox](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox) | Queue, list, active chat and contact context; AI state controls in a feature preview | Help text/screenshot descriptions, no authenticated use | Operator conversation and takeover model |
| [Sintra navigation](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app) | Helper cards, workspace switch, Brain, tasks and output Inbox | No retail customer workflow tested | Agent identity and shared-knowledge discoverability |
| [CareHub Inbox](https://carehub.kz/product/inbox) | Channel-filtered shared Inbox with notes and operator context | Vendor page, no account test | Kazakhstan operator workflow reference |
| [aspanCRM product](https://aspancrm.kz/ru/product/) | Inbox, pipeline and actor-labeled audit examples | Vendor page, no account test | Connecting sales actions to visible history |
| [respond.io Inbox](https://respond.io/help/inbox/getting-started-with-inbox) | Contact sidebar and ownership/takeover controls | Documentation, no account test | Explicit AI/human assignee and handoff |
| [Vendasta AI Workforce](https://docs.vendasta.com/ai/ai-workforce/) | Role/profile/capability/knowledge configuration | Documentation, no account test | Bounded specialist management |

## 2.6 Functional Similarity to Our Platform

| Question | Evidence-based conclusion |
| --- | --- |
| Closest Kazakhstan product overall | **aspanCRM** for combined Inbox, CRM writes, knowledge and human takeover ([product](https://aspancrm.kz/ru/product/), [AI](https://aspancrm.kz/ru/product/ai/)). **Senbi** is closer for breadth of structured business data plus owner questions ([CRM](https://senbi.org/en/crm/)). “Closest” changes with the workflow measured. |
| Strongest Kazakhstan real-action reference | **aspanCRM:** public docs explicitly name lead creation, deal moves and tasks ([AI agents](https://aspancrm.kz/ru/product/ai/)). This does not imply our order/inventory actions. |
| Strongest Kazakhstan communication/inbox reference | **CareHub:** official pages emphasize one operator Inbox, AI in the same dialogue and handoff ([Inbox](https://carehub.kz/product/inbox), [AI](https://carehub.kz/product/ai-agent)). |
| Closest global operational product | **SleekFlow:** broadest reviewed official documentation of customer Inbox, contact context, AI state, action tools and trace ([Inbox](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox), [control](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control), [API](https://help.sleekflow.io/en_US/custom-api-integrations-in-sleekflow-ai)). |
| Closest shared Brain + AI team concept | **Sintra AI:** workspace Brain, specialist Helpers and beta Team Chat ([features](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction), [Team Chat](https://help.sintra.ai/en/articles/12266334-what-is-sintra-ai)). Its Brain is not equivalent to our full Business Brain. |
| Strongest tools/actions analogue | **SleekFlow** for documented custom API configuration and execution trace; **HighLevel** for concrete booking/branch outcome ([SleekFlow APIs](https://help.sleekflow.io/en_US/custom-api-integrations-in-sleekflow-ai), [HighLevel booking](https://help.gohighlevel.com/support/solutions/articles/155000003467-workflow-action-appointment-booking-conversation-ai-booking-bot)). |

**Complete-architecture question:** No reviewed *public source* documents a competitor implementing all of our proposed combination: retail customer channels + authoritative order/inventory actions + shared structured/unstructured Business Brain + three bounded Sales/Support/Analytics roles + observable context-aware handoff + owner forecasting + controlled three-architecture research comparison. This is a statement about **the reviewed evidence**, not a market-wide claim of novelty or proof that no competitor has such a system. Pieces appear separately: SleekFlow covers the customer workspace/actions, Sintra AI the specialist team/shared knowledge, Senbi owner queries over CRM data, aspanCRM local CRM actions, and respond.io agent assignment. Our scientific contribution remains the empirical orchestration comparison, not the invention of agents.

## 2.7 UX Patterns Relevant to Our Platform

All rows are **design inferences** from the linked observed pattern. They specify a problem to solve in our product, not a decision to copy a competitor interface.

| UX problem in our platform | Useful reference | Observed pattern | Adaptation for our system |
| --- | --- | --- | --- |
| Navigation | [SleekFlow](https://help.sleekflow.io/en_US/getting-started/welcome-to-sleekflow) | Persistent module sidebar | Keep first-level destinations few and role-relevant. |
| Inbox | [SleekFlow](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox) | Queue → list → conversation → context | Start operators at conversations, with escalation as a queue/filter. |
| Conversation list | [SleekFlow](https://help.sleekflow.io/inbox/managing-conversations-in-inbox) | Ownership/status/search filters | Show channel, assignee, waiting state, and unread status. |
| Customer context | [SleekFlow](https://help.sleekflow.io/en_US/accessing-contact-profile-and-information-in-inbox) | Permissioned right-side contact data | Show verified order, customer and inventory facts with source/time. |
| AI agent state | [SleekFlow](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control) | Active/Standby/Ended state strip | Use explicit responsibility/state and distinguish paused from finished. |
| Agent handoff | [Sintra](https://help.sintra.ai/en/articles/12266334-what-is-sintra-ai) | Specialist collaboration in Team Chat | Show previous/next specialist and transferred facts; no unexplained routing. |
| Human takeover | [respond.io](https://respond.io/help/ai-agents/getting-started-with-ai-agents) | Takeover control in composer | Prevent further AI replies and show who owns the next response. |
| Business Brain | [Sintra Brain](https://help.sintra.ai/en/articles/11758256-how-to-manage-knowledge-in-the-brain-ai) | Shared searchable knowledge | Present knowledge alongside live structured facts, rules and state as different sources. |
| Agent management | [Vendasta](https://docs.vendasta.com/ai/ai-workforce/) | Profile, role, capabilities and knowledge | Show permitted tools and escalation policy for each of our three roles. |
| Tool execution | [SleekFlow](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox) | Per-message read-only execution trace | Expose proposed/executed/failed/unknown outcome, with authority and audit link. |
| Analytics | [SleekFlow AI Analytics](https://help.sleekflow.io/en_US/ai-agent-analytics) | Separate AI-operation metrics | Separate owner business/forecast metrics from agent quality/cost. |
| Workflows | [HighLevel](https://help.gohighlevel.com/support/solutions/articles/155000001358-workfl) | Explicit branch/timeout outcomes | Show allowed transitions and fallback without shipping a broad visual builder. |
| Knowledge | [SleekFlow KB](https://help.sleekflow.io/en_US/ai-knowledge-base) | Global source list and per-agent assignment | Show source status, provenance, access and stale-content warnings. |
| Notifications | [Sintra Inbox](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction) | Tasks needing input collected in one place | Make escalation and approval requests visible in the operator queue. |
| Audit/activity | [aspanCRM](https://aspancrm.kz/ru/product/team/) | Actor/object/time event journal | Let staff inspect consequential actions without reading raw technical logs. |

## 2.8 UML / Requirements → UI Mapping

**No UML source was present.** The matrix is a preliminary *requirements-to-UI* mapping from [PRD requirements](../PRD.md#6-functional-requirements) and [architecture flows](../ARCHITECTURE.md#9-main-runtime-flows). It must be checked against actual UML when supplied. “Required UI” describes an interaction need, not a final screen layout. Only staff-facing web surfaces and the planned customer Web Chat are assumed; external messaging clients remain their own UIs.

| Requirement / actor | User goal | System behavior | Required UI | Required state / feedback |
| --- | --- | --- | --- | --- |
| Customer — product inquiry (`FR-AGENT-001`) | Find a suitable item | Sales retrieves catalog facts | Channel reply/Web Chat | Identified product, source/time, unavailable/ambiguous case |
| Customer — inventory inquiry (`FR-CORE-001`) | Know availability | Authorized stock check | Channel reply/Web Chat; operator context | In stock/out of stock/unknown; never unconfirmed reservation |
| Customer — order question (`FR-AGENT-002`) | Understand order state | Verify identity and read order/policy | Channel reply; operator order context | Verified/unverified identity, actual status, source |
| Customer — order change (`FR-TOOL-001`) | Request modification | Check rules/stock; execute permitted action or escalate | Channel status; operator action review | Proposed, approved, executed, failed, or human pending |
| Human operator — receive escalation (`FR-HUMAN-001`) | Notice case to handle | Preserve state and assign owner | Escalation queue/filter | New, assigned, pending, resolved; reason |
| Human operator — view AI context (`FR-BRAIN-001`) | Avoid re-checking facts | Show verified facts, sources, attempts | Conversation context/activity | Verified vs inferred/unknown facts; source timestamp |
| Human operator — take over (`FR-HUMAN-001`) | Reply safely | Pause AI response and assign operator | Visible takeover action | Ownership and AI state changed |
| Human operator — return to AI (`FR-HUMAN-001`) | Resume supported automation | Restore control if policy permits | Resume/reassign action | Which agent resumes, what context carries, blocked state |
| Owner — sales report (`FR-ANALYTICS-001`) | See business measure | Query authorized structured data | Analytics view | Metric definition, period, scope, freshness, empty/error |
| Owner — forecast (`FR-ANALYTICS-001`) | Inspect future estimate | Invoke forecast service | Analytics view/detail | Target, horizon, uncertainty, unavailable model/data |
| Owner — business overview (`FR-CORE-001`) | Orient to current operations | Aggregate accepted measures | Analytics overview or summary | Definition and refresh state; no invented accounting revenue |
| Administrator — agent configuration (`FR-AGENT-001`–`003`) | Set role boundaries | Save validated role/tool settings | Agent roster/detail (proposed) | Draft, saved, validation error, deployment state |
| Administrator — knowledge (`FR-BRAIN-001`) | Maintain policy/FAQ | Add/review authorized sources | Knowledge area (proposed) | Processing, version, conflict, stale/failure state |
| Administrator — integrations (`FR-CHAN-001`) | Connect channels | Configure and validate provider | Settings (proposed) | Connected, pending, failed, permission denied |
| Administrator — permissions (`FR-AUTH-001`) | Bound staff/agent access | Enforce roles and ownership | Settings/identity-provider entry | Effective rights, refusal explanation, audit event |
| Sales Agent (system) | Resolve sales request | Read catalog/stock and propose action | Named agent state in conversation | Agent identity and actual tool outcome |
| Support Agent (system) | Resolve support request | Read order/policy, clarify/escalate | Named agent state in conversation | What was verified and why work stopped |
| Analytics Agent (system) | Answer owner query | Query report/forecast | Named agent state in analytics | Source/target/period and calculation status |
| Business Brain (`FR-BRAIN-001`) | Supply relevant context | Separate structured, document, rule and state sources | Context provenance/knowledge entry | Source kind, version/freshness, access limit |
| Adaptive Orchestrator (`FR-ORCH-001`) | Route work | Select, hand off, clarify or escalate | Activity/ownership indicator | Current/previous agent, handoff reason, pending step |
| Tool Executor (`FR-TOOL-001`) | Apply authorized action | Validate and run tool | Action/trace detail | Proposed ≠ executed; success/failure/unknown outcome |
| Human handoff (`FR-HUMAN-001`) | Preserve continuity | Package facts and route case | Operator queue + context packet | Assignee, urgency, verified facts, unresolved questions |

## 2.9 Proposed Information Architecture

**Version A — minimal MVP proposal, not approved navigation.** Derived from the requirements matrix: the operator needs one conversation workspace; business records must remain reachable; agents/knowledge require bounded administration; owners need business analytics. [SleekFlow](https://help.sleekflow.io/en_US/getting-started-with-sleekflow-inbox) supports keeping context near the dialogue, while [Sintra](https://help.sintra.ai/en/articles/9607255-how-to-navigate-the-sintra-ai-web-app) supports discoverable agent/knowledge areas. Neither dictates our menu.

```text
Platform (role-scoped)
├── Conversations (queue, dialogue, escalation filter, context/action drawer)
├── Business
│   ├── Customers & Orders (linked record detail)
│   └── Products & Inventory
├── AI
│   ├── Agents (roster and role detail)
│   └── Knowledge (unstructured sources; structured facts shown by provenance)
├── Analytics (business report and forecast; agent operations as a distinct view)
└── Settings (channels/integrations and access; Keycloak entry where applicable)
```

| Section | Primary actor | Requirement/justification | MVP simplification |
| --- | --- | --- | --- |
| Conversations | Operator | `FR-CHAN-001`, `FR-CONV-001`, `FR-HUMAN-001` | Escalation is a filter/queue, not a separate app. |
| Business | Operator, owner | `FR-CORE-001`, `FR-TOOL-001` | Keep customer/order detail linked; avoid full CRM pipeline. |
| AI | Administrator, operator (read-only activity) | `FR-AGENT-001`–`003`, `FR-BRAIN-001`, `FR-AUDIT-001` | Three roles; no agent marketplace or general builder. |
| Analytics | Owner | `FR-ANALYTICS-001` | One business/forecast entry; separate operational agent metrics by view. |
| Settings | Administrator | `FR-AUTH-001`, `FR-CHAN-001` | Only necessary channels/access; no broad enterprise console. |

**Version B — future consideration only:** separate activity/audit, advanced workflow builder, marketing/broadcasts, anomaly detection, richer CRM and additional agents if real use cases justify them. No such destination is required for current MVP.

## 2.10 Core User Flows

These flows specify required feedback and safe terminal outcomes; exact tool contracts and permissions remain open in [MEMORY.md](../MEMORY.md#open-questions). A tool name below is illustrative, as in the PRD.

| Flow | User, trigger and UI entry | System actors and tools | Visible feedback and exception | Terminal state |
| --- | --- | --- | --- | --- |
| **A — Product availability / Sales** | Customer asks through channel/Web Chat; operator may watch in Conversations | Orchestrator → Sales → Business Brain structured catalog → `find_product`, `check_inventory` | Product and stock source/time; clarify variant; show unavailable or lookup failure | Grounded reply; order action only if supported, validated and confirmed |
| **B — Order support** | Customer asks order question; Conversations shows case | Support → identity check → `get_order` → policy knowledge | Verified identity/order and policy source; avoid exposing private record before verification | Grounded answer or controlled escalation |
| **C — Multi-agent handoff** | Customer requests supported order change/exchange; operator sees history | Support verifies order/policy/stock → orchestrator transfers context to Sales → permitted `update_order`/`reserve_inventory` if supported | Show prior checks, receiving agent, proposed vs executed action; unsupported release/refund or failed write stops automation | Confirmed business effect or human pending, never an invented completion |
| **D — Human escalation** | Restricted/uncertain request or low-confidence outcome; escalation filter | Current agent/orchestrator → handoff packet → operator | Reason, verified facts, sources, attempts, ownership, AI paused; missing data and failed assignment visible | Human owns case; customer sees pending review, not false success |
| **E — Owner analytics** | Owner requests summary/forecast from Analytics | Analytics → `get_sales_report` or `forecast_sales` over authorized business data | Measure/period/scope/target, observed vs forecast, freshness and unavailable-data error | Sourced report or qualified forecast result |

Across all flows, the UI must expose waiting, permission denied, dependency failure and uncertain external outcome as different states. Neither low model confidence nor a fluent answer authorizes a business write.

## 2.11 Screen Inventory

**First provisional inventory:** **7 MVP REQUIRED surfaces**, **3 MVP SUPPORTING surfaces/states**, and future possibilities. “Surface” can be a page, focused view or drawer; wireframing will decide its physical layout. This count is a proposal derived from the current requirements, not an approved design. Keycloak can own the sign-in experience; no bespoke login visual is implied.

| Class / surface | Purpose; primary user; main task | Required data; primary action | Critical states; requirement |
| --- | --- | --- | --- |
| **MVP REQUIRED 1 — Conversations** | Triage/reply/hand off; operator; resolve a customer request | Messages, channel, assignee, AI state, relevant context; reply/take over/escalate | Unread, AI active/paused, human pending, empty, send failure; `FR-CHAN-001`, `FR-CONV-001`, `FR-HUMAN-001` |
| **MVP REQUIRED 2 — Customer & Order detail** | Inspect authorized records; operator; verify current facts | Customer identity, order status/history, permission; open verified order | Not verified, not found, restricted, stale; `FR-CORE-001`, `FR-AUTH-001` |
| **MVP REQUIRED 3 — Products & Inventory** | Inspect stock/product facts; sales employee; answer or support action | Catalog, variant, stock freshness; inspect availability | No match, out of stock, lookup failure; `FR-CORE-001`, `FR-AGENT-001` |
| **MVP REQUIRED 4 — AI Agents** | See/configure three bounded roles; administrator; review permitted capabilities | Role, allowed tools, knowledge assignment, status; edit/validate role | Draft, active, invalid permission/configuration; `FR-AGENT-001`–`003`, `FR-TOOL-001` |
| **MVP REQUIRED 5 — Knowledge** | Curate unstructured sources; administrator; add/review FAQ/policy | Source, version, processing state, agent access; review source | Processing, conflict, stale, failed ingestion; `FR-BRAIN-001` |
| **MVP REQUIRED 6 — Analytics & Forecast** | Inspect defined business results; owner; query report/forecast | Measure, scope, period, target, forecast run; generate/view result | No data, pending, model unavailable, uncertainty; `FR-ANALYTICS-001` |
| **MVP REQUIRED 7 — Settings / Connections** | Manage permitted access/channels; administrator; connect or restrict | Channel state and role permissions; save/test connection | Not connected, expired, denied, failed; `FR-AUTH-001`, `FR-CHAN-001` |
| **MVP SUPPORTING — Sign-in/denial** | Authenticate staff; staff; enter permitted workspace | Identity provider and effective role; sign in/retry | Expired, denied; `FR-AUTH-001` |
| **MVP SUPPORTING — Action/agent activity detail** | Investigate an outcome; operator/admin; inspect trace | Decision, tool attempt/result, source, actor/time; open event | Proposed, executed, failed, unknown; `FR-AUDIT-001`, `FR-TOOL-001` |
| **MVP SUPPORTING — Escalation queue state** | Prioritize human work; operator; claim/resume case | Reason, priority, assignee, context packet; claim/take over | New, assigned, waiting, resolved; `FR-HUMAN-001` |
| **FUTURE** | Separate overview dashboard, workflow builder, broadcast marketing, advanced audit explorer, additional agents | Only if validated use cases justify them | Outside present screen count |

The supporting activity and escalation surfaces can live inside Conversations/AI as filters or drawers, which is why they are not counted as separate required top-level pages. Screen-level copy, layout and accessibility behavior await wireframes.

## 2.12 Design Requirements Derived from Research

These requirements are proposed, testable interaction constraints derived from project requirements and the cited patterns—not color, typography, component styling or final navigation decisions.

| ID | Design requirement | Grounding |
| --- | --- | --- |
| DR-001 | Show channel, current owner and responsible AI specialist on every active conversation. | `FR-CONV-001`, `FR-ORCH-001`; [SleekFlow AI states](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control) |
| DR-002 | Distinguish AI **proposed**, **awaiting approval**, **executed**, **failed** and **unknown** tool outcomes; never use a success cue for an unconfirmed write. | `FR-TOOL-001`; [SleekFlow trace](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox), [HighLevel booking outcomes](https://help.gohighlevel.com/support/solutions/articles/155000003467-workflow-action-appointment-booking-conversation-ai-booking-bot) |
| DR-003 | A specialist handoff must identify sender, receiver, reason and transferred verified facts; distinguish it from multiple independent AI sessions. | `FR-ORCH-001`; [SleekFlow roster](https://help.sleekflow.io/en_US/agentflow/manage-ai-agent-sessions-in-inbox-with-human-ai-conversation-control) |
| DR-004 | Human takeover must stop AI customer replies, change ownership visibly and preserve the context packet; resumption must show the chosen agent and policy result. | `FR-HUMAN-001`; [respond.io takeover](https://respond.io/help/ai-agents/getting-started-with-ai-agents) |
| DR-005 | Put verified customer/order/stock facts beside the conversation without exposing unauthorized records; show source and freshness. | `FR-CORE-001`, `FR-AUTH-001`; [SleekFlow contact panel](https://help.sleekflow.io/en_US/accessing-contact-profile-and-information-in-inbox) |
| DR-006 | Present Business Brain material by source type: structured fact, document, rule or execution state; show provenance/conflicts instead of a single undifferentiated “AI knowledge” block. | `FR-BRAIN-001`; [Sintra knowledge](https://help.sintra.ai/en/articles/11758256-how-to-manage-knowledge-in-the-brain-ai) |
| DR-007 | Keep business/forecast measures separate from conversation and agent-operation measures; label target, period, scope and observed/estimated status. | `FR-ANALYTICS-001`; [SleekFlow agent analytics](https://help.sleekflow.io/en_US/ai-agent-analytics) |
| DR-008 | Communicate uncertainty in words tied to missing/contradictory evidence or permission, without displaying model confidence as a calibrated probability unless it actually is one. | `FR-ORCH-001`, `FR-HUMAN-001`; project safety rules |
| DR-009 | Give operators explicit empty, loading, denied, dependency-failed and uncertain-commit states with a safe next step. | `FR-TOOL-001`, `FR-AUDIT-001`; project reliability requirement |
| DR-010 | Keep agent role, permitted tools, assigned knowledge and escalation policy inspectable to authorized staff. | `FR-AGENT-001`–`003`; [Vendasta configuration](https://docs.vendasta.com/ai/ai-workforce/) |
| DR-011 | Expose a human-readable, permissioned action/activity trail linked from the conversation; preserve actor, time, source and result. | `FR-AUDIT-001`; [aspanCRM audit](https://aspancrm.kz/ru/product/team/), [SleekFlow trace](https://help.sleekflow.io/en_US/view-ai-message%E2%80%99s-execution-trace-in-inbox) |
| DR-012 | Make pending human attention and approvals findable from the operator's main workspace, with one responsible owner. | `FR-HUMAN-001`; [Sintra review Inbox](https://help.sintra.ai/en/articles/12638328-sintra-workspace-features-and-their-interaction) |

## 2.13 Conclusions

1. **Strongest overall operational UX benchmark:** SleekFlow for documented Inbox, context, AI session control, tools and trace. It does not establish our adaptive architecture.
2. **Strongest Kazakhstan references:** aspanCRM for CRM actions; CareHub for customer Inbox and human collaboration; Senbi for operational business data plus owner assistant. These are complementary, not interchangeable.
3. **Other strong global references:** Sintra AI for specialist/team/shared-knowledge presentation; respond.io for ownership and AI/human assignment; HighLevel for workflow outcomes; Vendasta for role/capability configuration.
4. **Best customer-workspace design reference:** SleekFlow; locally, CareHub. Findings concern documented layout/workflow structure, not measured ease of use.
5. **Best AI-team/shared-brain design reference:** Sintra AI, with the explicit caveat that its Brain is primarily curated knowledge and its Team Chat evidence does not prove our operational routing model.
6. **Strongest business-action references:** SleekFlow custom APIs and aspanCRM's named CRM writes; HighLevel gives a concrete appointment transaction. None verifies our exact retail tool contracts.
7. **Patterns to adapt:** context beside dialogue, explicit AI/human ownership, specialist identity, source/permission visibility, pending-work queue, and inspectable action outcomes.
8. **Patterns to avoid:** copying proprietary visuals, adding broad CRM/marketing navigation, showing fluent text as proof of a write, confusing simultaneous AI sessions with handoff, and reducing Business Brain to RAG.
9. **Our main UX opportunity:** make a multi-specialist retail workflow understandable at the moment an action is proposed, verified, executed, handed off or escalated. The seven-screen IA and design requirements are proposals for wireframing and owner review, **not approved UI**.
