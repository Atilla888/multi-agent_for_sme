# P5G/H — Web Chat + Administration Design Audit

**Status:** COMPLETE

**Audit type:** read-only authority and surviving Figma-tooling review

**Implementation decision:** preserve the separate customer surface, reuse the P5B system for staff Administration, and represent unavailable contracts truthfully rather than inventing SaaS behavior.

## Authority and evidence hierarchy

The audit reviewed, in precedence order:

1. `docs/DESIGN.md`, especially the Shared Staff Shell, Integrations, Settings, Audit, Agent Runs, Customer Web Chat, capability matrix, accessibility and frontend safety sections;
2. `docs/PRD.md`, `docs/ARCHITECTURE.md`, `docs/RULES.md`, `docs/TASKS.md`, and `docs/MEMORY.md`;
3. Phase 2E screen contracts for Agent Runs, Integrations, Settings, Audit, and Customer Web Chat;
4. Phase 3C Design System, Phase 3D high-fidelity, and Phase 3E interaction reports;
5. surviving Phase 3C/3D/3E plugin source for Web Chat components, high-fidelity variants, restricted navigation, and Flow 8;
6. P5A–P5F frontend implementation and audit reports, current routes, reusable UI primitives, staff shell, auth boundary, and semantic state model.

No Figma file or plugin source was modified.

## Shared decisions

- Customer Web Chat is a separate customer-facing application surface and must not inherit the staff shell.
- Integrations, Settings, Audit, and Agent Runs remain under the existing Administration area in the six-area staff shell.
- Audit is restricted/permissioned. Agent Runs is contextual/restricted. Neither is a merely disabled universal Operator destination.
- Visible UI and role hints never replace backend authorization.
- All five families use the approved Calm Operational SaaS visual language and existing P5B primitives.
- Exact backend-driven breakpoints, translations, freshness thresholds, retention, and field-level grants remain unspecified.

## Customer Web Chat

### Confirmed

- Separate customer shell with North Shop business identity, message timeline, customer and business replies, state card, and composer.
- Mobile-important layout with 44 px customer touch-target guidance and no horizontal page overflow at narrow widths.
- Approved variants: Initial, Active, Clarification, Confirmation Required, Processing, Confirmed Result, Known Failure, Waiting Human, Confirmation Pending, and Message Delivery Failure.
- `Confirm order` names the authorized business action; `Change details` is secondary.
- Processing says that an update will appear when available and invents no CTA.
- Known reservation failure states that the Order already exists, the item was not reserved, and the customer should not place the same order again.
- Confirmation Pending uses plain-language uncertainty and duplicate-submission protection.
- Message Delivery Failure preserves the confirmed business result and limits recovery to communication.
- Customer copy excludes ToolCall, Agent Run, LangGraph, `OUTCOME_UNKNOWN`, M12, E02, confidence, hidden reasoning, and staff-only evidence.

### Inferred from approved visual

- A compact centered thread column and restrained header are appropriate responsive translations of the 414 px Phase 3D reference.
- Customer/business message alignment, sender labels, timestamps, and non-color status text can be composed from P5B surfaces without introducing another design system.
- State variants can be selected through deterministic query parameters for review and tests; these controls are not customer product actions.

### Not specified

- Public session bootstrap, customer verification, send/retry endpoints, streaming, WebSocket transport, delivery receipts, provider reconnection, persistence, or live handoff transport.
- Final translated EN/RU/KZ copy and production breakpoints.

## Integrations

### Confirmed

- Administration list/detail concept for Instagram, WhatsApp, Telegram, and Web Chat.
- Configured, validated, active, and LIVE/MOCK/SANDBOX are separate facts.
- M08 live-provider acceptance is incomplete; configured must never be presented as live.
- Last validation/health time, safe provider impact, and secret-free presentation are required when supported.
- Provider-wide health differs from one case's delivery failure.

### Inferred from approved visual

- P5B Cards, StatusBadge, StateNotice, and table-like metadata groups are the appropriate non-P0 composition.
- A fixture status board may demonstrate Not configured, Deferred, and Unavailable without an enabled Configure/Validate/Activate action.

### Not specified

- Public integration DTOs, credential forms, activation contracts, freshness SLA, provider capability negotiation, and authorized mutation policy.

## Settings

### Confirmed

- Only effective access and explicitly approved business/application settings belong here.
- Business scope, current value/version, edit right, provenance, and audit reference are required when supplied.
- Unsupported/read-only, unsaved, saving, confirmed, stale/conflict, denied, and dependency-unavailable are distinct.
- No generic agent-policy editor, billing/theme suite, secret editor, privilege override, or E02 bypass.

### Inferred from approved visual

- A read-only current-access summary and disabled setting controls truthfully demonstrate the layout while no write contract exists.
- Disabled controls require explanatory text and must not display a success toast.

### Not specified

- Approved editable setting catalog, write endpoint, validation schema, responsible role, platform-versus-tenant ownership, and version-conflict protocol.

## Audit

### Confirmed

- Restricted/permissioned durable event list distinct from Agent Runs.
- Safe fields are actor, scope, resource, action/security decision, trusted result, time, correlation/operation reference, and redacted provenance.
- Search/filter and contextual return are allowed only inside independently authorized scope.
- No edit/delete, raw secret/token, private prompt, hidden reasoning, unrestricted PII, or existence disclosure for inaccessible records.
- Recorded, rejected, unknown/reconciled, delayed/incomplete, valid no-event, inaccessible, and unavailable remain distinct.

### Inferred from approved visual

- A restricted fixture specimen may show redacted semantic rows and a permission boundary while clearly withholding real event data.
- Local table scrolling is appropriate at narrow staff widths.

### Not specified

- Public audit endpoint, field-level grant/redaction DTO, retention, pagination contract, linked-resource access contract, and event-index lag policy.

## Agent Runs

### Confirmed

- Restricted/contextual lifecycle view, distinct from durable Audit evidence.
- Safe fields include run/correlation reference, specialist sequence, previous/current handler, proposal, authorization/admission, attempt, result, tool/effect reference, status, handoff, stop reason, and escalation.
- Supported actors are Sales, Support, Analytics, Human Operator, Customer, and System where context requires them; Adaptive Orchestrator is not exposed as a participant or page.
- Proposed, rejected, executing, completed, known failed, waiting human, `OUTCOME_UNKNOWN`/reconciling, delayed/incomplete, and denied are distinct.
- Tool activity must express `MODEL PROPOSES → EXECUTOR AUTHORIZES → DOMAIN ENFORCES`.
- No hidden chain-of-thought, private prompts, raw secrets, unrestricted arguments, or working Resume action.

### Inferred from approved visual

- A compact run list plus selected safe-summary panel is consistent with other P5 staff list/detail compositions.
- Model/provider metadata may be shown only as explicitly labelled development fixture metadata, never as proof of a live customer path.

### Not specified

- Public run list/detail API, event DTO, durable M11 trace ingestion, exact redaction rules, retention, cost provenance, research-role grants, or M12 Resume contract.

## Responsive, localization, and accessibility decisions

- Web Chat is validated at 390 px, tablet, and desktop; messages, notices, header, composer, and long business names wrap without document-level overflow.
- Staff screens remain desktop-primary and support smaller laptop and 390 px widths; wide tables scroll locally.
- Layouts reserve 30–50% label growth for EN/RU/KZ-like content and avoid critical truncation.
- Semantic landmarks, labelled composer/control states, message actor identification, table headers, keyboard-native controls, visible focus, and non-color-only status text are required.
- These checks target WCAG 2.2 AA-level design quality and do not claim certification.

## Audit verdict

The design authority is sufficient to implement the five screen families without invention. Customer Web Chat has an approved P0 high-fidelity composition; the four Administration families use their approved Phase 2E contracts, the shared shell, restricted navigation, and the P5B system. Backend-dependent interaction must remain unavailable until public authenticated contracts exist.
