# Development Rules

These rules govern future human and AI-assisted changes. They apply to the planned system in [PRD.md](PRD.md) and [ARCHITECTURE.md](ARCHITECTURE.md). They do not imply that an application already exists.

## 1. Mandatory context and status

Before a meaningful change, read [PRD.md](PRD.md), [ARCHITECTURE.md](ARCHITECTURE.md), this file, [TASKS.md](TASKS.md), and [MEMORY.md](MEMORY.md). Read [DESIGN.md](DESIGN.md) for UI work. Inspect actual files and tests before claiming a feature exists. Use **IMPLEMENTED**, **PROJECT BASELINE / PLANNED**, **RESEARCH TARGET**, and **OPTIONAL / FUTURE** consistently; a diagram or roadmap is never proof of implementation.

## 2. General engineering

- Keep changes within the accepted task and MVP domain. Do not invent requirements, APIs, database schema, business rules, or competitor capabilities.
- Resolve routine choices with existing evidence; record consequential open choices or source conflicts in `MEMORY.md` instead of silently deciding them.
- Prefer the simplest working structure. Reuse existing abstractions; avoid duplicate business logic and unrelated refactoring.
- Add a dependency only when its purpose, maintenance cost, and fit with the candidate stack are clear. Do not introduce major architecture changes without an explicit project decision.
- Treat user-provided examples as illustrative until accepted as contracts or benchmark cases.

## 3. Architecture and frontend

- Maintain explicit boundaries between channel adapters, API/security, orchestration, agents, Business Brain, tool executor, and business/data services. These are logical boundaries; they do not mandate microservices.
- Keep business invariants in deterministic services, outside prompts and UI components. Agents may propose actions; only the authorized executor performs them.
- For frontend implementation, use the accepted Next.js/React/TypeScript baseline, reusable accessible components, and a clear API/service layer. Include loading, empty, error, and permission states for actual workflows.
- Do not invent final colors, typography, navigation, or design tokens. Apply [DESIGN.md](DESIGN.md) once research decisions are approved.

## 4. Backend and database

- For backend implementation, use the accepted Python/FastAPI/Pydantic baseline; validate external inputs, keep routers thin, and put workflow logic in typed services/domain code.
- Define explicit error outcomes for authorization failures, invalid state, unavailable dependencies, and uncertain write outcomes. Never turn a failed action into a success message.
- Use migrations for persistent schema changes; protect integrity with appropriate constraints and transactions. Define ownership/tenant scope, idempotency, and concurrency behavior before business writes.
- Access structured business facts through authorized data interfaces. Do not use retrieved prose as a substitute for authoritative order or inventory state.

## 5. Agents, tools, and Business Brain

- Every agent has a documented responsibility and explicit allowed tools. The current principal, resource, state, and business policy further restrict every tool call.
- Validate tool inputs and outputs. Audit important attempts, decisions, results, and errors. Preserve enough context for a handoff without exposing unrelated customer data.
- A prompt, retrieved document, or model output cannot override authorization, business rules, or tool validation.
- For unstructured knowledge, keep source/provenance and document version when feasible. For structured facts, use authoritative services. Flag conflicting or missing evidence.
- Escalate low-confidence, exceptional, restricted, or unsupported work according to a documented policy. Human approval must be explicit where required. Do not claim an action completed until the executor confirms it.

## 6. Security and privacy

- Authenticate at entry points; authorize at each sensitive read and write. Scope data to the correct business and user.
- Keep secrets out of source, prompts, client bundles, and logs. Minimize personal data in model context, traces, and experiment artifacts.
- Validate external messages/webhooks and treat channel content and retrieved documents as untrusted input.
- Review any feature that changes access, payment-like effects, order state, or cross-tenant exposure before enabling it.

## 7. Verification and research

- Add focused tests for business rules, authorization, tool contracts, handoff state, and relevant failure paths. Verify the user-visible workflow and report what was actually run.
- For experiments, use the same scenario dataset where appropriate, comparable legitimate tools/data and execution budgets, and consistent metrics across Single, Static, and Adaptive variants.
- Version scenario definitions, prompts, model/configuration, business rules, tool contracts, and evaluation code. Use deterministic seeds where supported and record sources of nondeterminism.
- Define ground truth and scoring before viewing final outcomes. Do not infer scientific superiority from a demo or selectively omit failures. Keep forecasting quality evaluation separate from orchestration comparison.

## 8. Git and documentation

- Keep changes reviewable and scoped; preserve unrelated work. Document important product or architecture decisions in the owning file and summarize consequential decisions or conflicts in `MEMORY.md`.
- Update `TASKS.md` only when status is supported by repository evidence. Mark tasks complete after their acceptance criteria are met, not when they are merely described.
- Use requirement IDs from `PRD.md` in architecture/task references when they improve traceability. Avoid duplicating full specifications across documents.
