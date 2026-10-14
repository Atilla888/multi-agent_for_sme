# P5G/H — Backend Contract Audit

**Status:** COMPLETE

**Audit type:** read-only public API, domain, persistence, security, provider, and milestone evidence review

**Frontend integration decision:** typed deterministic fixtures behind explicit adapters; no fake endpoint, transport, persistence, authorization, or provider status.

## Executive finding

The platform contains internal persistence and service evidence for businesses, memberships, customer channel identities, integrations, conversations, messages, agent runs, tool calls, agent steps, escalations, and audit logs. It also contains Keycloak-compatible OIDC verification, staff roles, tenant/object authorization, internal specialist outcomes, safe reason codes, tool results, and bounded provider metadata.

None of those internal contracts is a browser API. The public FastAPI application exposes only `/health/live` and `/health/ready`. There is no authenticated endpoint for Customer Web Chat, current principal/business context, integrations, settings, audit events, or agent runs. M08 remains PARTIAL / BLOCKED / DEFERRED; M09–M12 are not started; M13 is not started.

P5G/H therefore uses local fixtures only. All network and mutation actions remain disabled or unavailable.

## Audited evidence

- `platform/services/backend/src/platform_backend/api/app.py`
- `domain/context.py`, `security/oidc.py`, and `security/policy.py`
- `agents/contracts.py`, `agents/runtime.py`, and `agents/provider.py`
- `repositories/postgres.py`, Business Brain conversation sources, and ToolExecutor audit/tool-call writes
- frozen `physical_schema.sql`
- M05 and M08 implementation evidence, milestone status, and repository recovery status
- P5A API/Auth boundaries and P5C–P5F contract-audit patterns

No platform file was changed.

## Verified internal contracts

### Identity and business scope

- `PrincipalContext` binds principal kind, subject, business, staff role, customer and identity references.
- Staff roles are exactly `OWNER`, `OPERATOR`, and `PLATFORM_ADMIN`.
- OIDC validates Keycloak-compatible access tokens and resolves business membership; frontend role display is not authorization.
- Customer access requires a trusted customer identity link; an order number or message text is not identity proof.

### Channel, conversation, and message persistence

- Channel values are `TELEGRAM`, `WHATSAPP`, `INSTAGRAM`, and `WEB`.
- Integration mode is `LIVE`, `MOCK`, or `SANDBOX`; persistence alone does not prove validation or live acceptance.
- Conversation state is `OPEN`, `ESCALATED`, or `CLOSED`.
- Message direction is `INBOUND` or `OUTBOUND`; delivery state distinguishes received, processing, processed, pending delivery, delivered, delivery unknown, and failed.
- Repository methods can read a conversation and bounded messages for internal Business Brain context, but no public message/session route exists.

### Agent run and tool evidence

- Internal agent roles are Sales, Support, and Analytics.
- `AgentOutcome` provides run ID, role, normalized terminal status, safe response, confidence, evidence references, ToolResults, safe events, context/prompt digests, request/token counts, latency, and optional handoff proposal.
- Provider metadata can include provider/model/version/request ID, token usage, latency, finish reason, tool-call count, and retry count.
- Model output is an untrusted proposal. Tool execution passes through role, schema, policy, tenant/resource, and domain enforcement.
- Durable schema supports runs, tool calls, steps, escalations, and audit logs, but current M08 trace events are in-memory and no public run endpoint exists.

### Audit evidence

- Deterministic services append durable audit records for supported effects and security decisions.
- Audit storage includes business, correlation, actor scope, event type, resource type/reference, outcome, and safe details.
- No public list/detail endpoint, field-level redaction DTO, or retention/pagination contract exists.

### Settings and configuration

- Internal business configuration version and environment/runtime settings exist.
- No approved public settings catalog or authenticated write API exists.
- Environment/provider credentials and secret references are server-side implementation details and must never become fixture values or client output.

## Public HTTP surface

Only these routes are implemented:

- `GET /health/live`
- `GET /health/ready`

The following public contracts are absent:

- customer chat session bootstrap, history, send, confirm, retry, or delivery status;
- current principal, active business, effective roles, or capabilities;
- integration list/detail, validation, activation, or health;
- settings list/detail/update;
- audit event list/detail;
- agent run list/detail or event stream;
- durable Resume/replay.

Internal repositories, schemas, tools, and model-provider adapters must not be called directly from browser code.

## Capability matrix

| Capability | Design requires? | Internal contract exists? | Public HTTP endpoint | Authorization | Verified status | P5G/H mode |
|---|---|---|---|---|---|---|
| Customer thread and actors | Yes | Conversation/message persistence and internal reads | No | Customer identity + business scope | Internal only | LOCAL UI FIXTURE ONLY |
| Customer message send | Yes | Message persistence concepts only | No | Verified customer session | Unavailable | NOT_CONFIGURED |
| Business-action confirmation | Yes | `write_confirmed` internal request gate | No | Customer identity + current facts + executor policy | No browser contract | UNAVAILABLE |
| Message delivery status/retry | Yes | Message delivery states exist | No | Customer-owned message/session | No transport contract | NOT_CONFIGURED |
| Human pending communication | Yes | Escalation/run states exist | No | Customer-safe projection | No public projection | LOCAL UI FIXTURE ONLY |
| Integration list and mode | Yes | Integration table and channel/mode allowlists | No | Assigned admin/business grant | Internal persistence only | LOCAL UI FIXTURE ONLY |
| Provider live health | Yes | No accepted live-provider gate | No | Admin/provider scope | M08 deferred | NOT_CONFIGURED |
| Configure/validate/activate provider | Conditional | No approved browser contract | No | Admin/provider scope | Unavailable | UNAVAILABLE |
| Effective settings/access | Yes | Membership/config version concepts | No | Assigned business grant | No frontend DTO | READ-ONLY CONTRACT |
| Save setting | Conditional | No approved setting contract | No | Per-setting action policy | Unavailable | UNAVAILABLE |
| Audit list/detail | Yes | Durable audit storage/write paths | No | Restricted event/resource scope | No public read API | LOCAL UI FIXTURE ONLY |
| Agent run list/detail | Yes | Run/tool/event contracts and storage | No | Restricted/contextual run scope | No public read API | LOCAL UI FIXTURE ONLY |
| Provider/model/usage metadata | Conditional | Internal development metadata | No | Restricted safe trace fields | M08 not accepted | LOCAL UI FIXTURE ONLY |
| Tool activity summary | Yes | ToolResult and durable tool-call evidence | No | Restricted safe trace fields | Internal only | LOCAL UI FIXTURE ONLY |
| Durable Resume | No current action | Schema revisions only; M12 absent | No | Future revalidation policy | TARGET / NOT STARTED | TARGET-ONLY |
| Forecast administration | No | M13 absent | No | Future Owner/admin policy | NOT STARTED | UNAVAILABLE |

## Missing contracts

Live P5I integration requires independently approved contracts for:

1. authenticated current-principal, active-business, roles, and effective capabilities;
2. customer Web Chat session verification, bounded history, send receipt, delivery receipt, and safe reconnect;
3. explicit order-confirmation DTOs with current facts, idempotency, and uncertain-outcome reconciliation;
4. integration list/detail with configured/validated/active/mode/health fields and server-side secret handling;
5. authorized integration mutation and validation flows, if approved;
6. versioned settings definitions, validation, edit rights, confirmed persistence, conflict, and audit references;
7. field-redacted audit list/detail with pagination/filtering and contextual resource authorization;
8. field-redacted agent-run list/detail with safe event/tool/model metadata and no hidden reasoning;
9. stable typed denied, unavailable, stale, pending, and unknown responses;
10. M12 durable Resume only after principal, policy, state, revision, and uncertain-effect revalidation.

## Fixture and adapter decision

- Every feature receives typed view models and a feature-local adapter interface.
- Fixture adapters are synchronous, deterministic, network-free, and separated from page components.
- Adapter metadata declares `publicEndpoint: null` and the precise current mode.
- No `fetch`, `/api/*` route, server action, WebSocket, artificial delay, optimistic save/send, or generated provider success is introduced.
- Fixtures contain synthetic North Shop data only and no secret, token, credential, raw prompt, hidden reasoning, or personal data.

## Security and safety boundary

- Customer Web Chat never exposes staff navigation, audit/run/tool internals, or cross-customer data.
- Audit and Agent Runs fail closed in restricted variants and withhold fixture records.
- Audit events use redacted safe metadata only.
- Agent Runs show safe lifecycle summaries, not chain-of-thought or unrestricted arguments.
- A model proposal is not authorization; the executor and domain remain decisive.
- No Resume/replay control is implemented. E02 remains active. M13 remains not started.
- Experimental Ollama work is absent from canonical main and is not represented as a production integration.

## Audit conclusion

The internal platform contracts constrain vocabulary, identity, roles, states, safe fields, and trust boundaries, but they do not support live frontend integration. P5G/H is approved only for truthful, typed local fixture compositions with unavailable mutations and explicit P5I adapter seams.
