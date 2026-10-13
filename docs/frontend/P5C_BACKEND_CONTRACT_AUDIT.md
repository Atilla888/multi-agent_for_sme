# P5C Backend Contract Audit

Date: 2026-10-14
Scope: P5C Conversations + Escalations frontend only

## Evidence inspected

- `platform/services/backend/src/platform_backend/api/app.py`
- `platform/services/backend/src/platform_backend/domain/context.py`
- `platform/services/backend/src/platform_backend/brain/contracts.py`
- `platform/services/backend/src/platform_backend/agents/contracts.py`
- `platform/services/backend/src/platform_backend/agents/runtime.py`
- `platform/services/backend/src/platform_backend/repositories/postgres.py`
- `platform/services/backend/src/platform_backend/security/policy.py`
- `platform/implementation_handoff/contracts/docs/engineering/physical_schema.sql`
- existing frontend API and authentication boundaries under `frontend/src/services/`

The public FastAPI surface currently exposes only `GET /health/live` and `GET /health/ready`.
The remaining contracts listed below are internal Python/domain or persistence contracts, not
public transport contracts. P5C does not invent endpoint paths or bypass the unavailable
Keycloak session.

## Contract truth matrix

| Capability | Design requires it? | Backend endpoint exists? | Backend response contract exists? | Verified current capability? | Frontend implementation mode | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| Liveness | Indirectly | Yes: `GET /health/live` | Yes | Yes | LIVE-CONTRACT-READY | Existing P5A health adapter remains unchanged. |
| Readiness | Indirectly | Yes: `GET /health/ready` | Yes | Yes | LIVE-CONTRACT-READY | Existing P5A health adapter remains unchanged. |
| Current principal/session/business | Yes | No | Internal `PrincipalContext` only | No public authenticated session flow | UNAVAILABLE | Keycloak `AuthAdapter` is an explicit not-configured boundary. Fixture screens must not imply authorization. |
| Conversation list | Yes | No | Persistence rows exist; no API schema | No | LOCAL UI FIXTURE ONLY | Deterministic view models; no `/api/conversations` route. |
| Conversation detail | Yes | No | Internal conversation/context contracts exist | No public transport | LOCAL UI FIXTURE ONLY | Route selection is real; data is visibly identified as fixture data. |
| Conversation messages | Yes | No | Internal `ConversationMessage` and DB message fields exist | Read-only internal retrieval only | READ-ONLY CONTRACT | Internal shape informs the UI model; fixture adapter supplies data. It is not claimed as backend integration. |
| Message actor/source distinction | Yes | No | Direction plus `active_agent`/agent roles exist internally | Partially evidenced | LOCAL UI FIXTURE ONLY | UI adds an explicit actor view model for Customer, Human Operator, Sales, Support, Analytics, and System. |
| Message send/delivery | Yes | No | DB delivery states exist | M08 PARTIAL / BLOCKED / DEFERRED | UNAVAILABLE | Composer stays disabled; no live/delivered claim. |
| Customer context | Yes | No | Internal `CustomerFact` with provenance exists | Authorized internal read path only | READ-ONLY CONTRACT | Fixture-only presentation; no full Customers screen. |
| Product/inventory context | Yes | No | Internal product/inventory facts with provenance exist | Authorized internal read path only | READ-ONLY CONTRACT | Observed inventory is not a live-stock promise. |
| Related order context | Yes | No | Internal `OrderFact` exists | Authorized internal read path only | READ-ONLY CONTRACT | Order and reservation states remain separate; E02 blocks update UI. |
| Specialist identity | Yes | No | `AgentRole` is Sales, Support, Analytics | Yes as an internal contract | READ-ONLY CONTRACT | Adaptive Orchestrator is not shown as a fourth agent. |
| Support to Sales handoff event | Yes | No | `HANDOFF` proposal and target role exist internally | Runtime says orchestration is required | LOCAL UI FIXTURE ONLY | Presented as an evidenced fixture event, not as live adaptive orchestration. |
| Escalation list/detail | Yes | No | DB escalation and run contracts exist | Persistence is current, public API is absent | LOCAL UI FIXTURE ONLY | Uses the platform escalation model, not a generic ticket model. |
| WAITING_HUMAN | Yes | No | `agent_runs.status` supports `WAITING_HUMAN` | Internal persistence contract exists | READ-ONLY CONTRACT | Fixture renders the approved stop/ownership semantics. |
| OUTCOME_UNKNOWN | Yes | No | Agent/tool outcome contracts support it | Runtime safety behavior exists | READ-ONLY CONTRACT | UI requires reconciliation and offers no mutation retry. |
| Assign/claim escalation | Design shows it | No | Persistence fields exist, no public command | No | UNAVAILABLE | No enabled action or simulated success. |
| Human decision | Design shows it | No | No public command contract | No | TARGET-ONLY | Visual target only; no backend call. |
| Durable Resume | Design shows it | No | M12 not implemented | No | TARGET-ONLY | Disabled and explicitly marked TARGET / NOT STARTED. |
| Resolve/close escalation | Design shows states | No | Persistence has `RESOLVED`; no public command | No | LOCAL UI FIXTURE ONLY | Read-only state variants only. |
| Agent Run deep link | Contextual design link | No | Internal run persistence exists | No authorized route contract | UNAVAILABLE | No fake Agent Runs implementation in P5C. |
| `create_order` / `reserve_inventory` | Referenced by scenario history | No staff screen endpoint | Internal tool inputs/results exist | Backend tool runtime only | UNAVAILABLE | P5C performs no business mutation. |
| `update_order` | Referenced by E02 | No staff screen endpoint | Internal tool contract exists | E02 restricted | UNAVAILABLE | No update action is exposed. |

## Mapping rule

The frontend P5C types are view models. They are not declared as FastAPI response types.
`READ-ONLY CONTRACT` means an internal, authorized backend/domain shape exists and can guide a
future adapter; it does not mean that a callable endpoint exists today. The P5C fixture adapter
is separate from `frontend/src/services/api` and never sends network requests.

## Integration blockers

1. No authenticated current-principal/business endpoint or completed Keycloak session wiring.
2. No public conversation list/detail/message endpoint.
3. No public escalation list/detail/claim/decision endpoint.
4. M08 external provider/channel delivery remains PARTIAL / BLOCKED / DEFERRED.
5. Handoff orchestration is not exposed as a current application capability.
6. M12 durable Human Resume is TARGET / NOT STARTED.
7. No public reconciliation command exists for OUTCOME_UNKNOWN.
