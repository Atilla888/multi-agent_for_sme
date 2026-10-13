# M05 — Identity / Authorization / Tenant Isolation execution report

Checkpoint: 2026-09-29. Local Keycloak 26.3.3, PostgreSQL 17.8/pgvector 0.8.1, Python 3.12.12, PyJWT 2.15.0, cryptography 50.0.1; Docker Engine 29.7.2 and Compose 5.5.0.

## Implementation

- `domain/context.py` separates staff User, external Customer, service identity, human role and agent specialization. Trusted `ExecutionContext` is separate from model-facing input.
- `security/oidc.py` verifies RS256 signature using the configured issuer JWKS, allowed algorithm, issuer, audience, expiry, required timestamps/subject and Bearer purpose. Its staff resolver maps issuer+subject to an application User and checks current PostgreSQL business membership. A `platform_admin` realm role is not automatically Owner.
- `application/identity.py` implements Q01 first contact as atomic Customer + CustomerIdentity, uniquely scoped by business/channel/external user; no cross-channel auto-merge.
- `security/policy.py` implements business, owner and customer/order object policies. Operator order access requires an assigned active escalation for that customer's conversation. Tool/agent admission remains in `tools/executor.py`; tenant predicates and forced RLS remain in PostgreSQL.
- Alembic `0004_staff_identity_lookup.py` adds a fixed, SECURITY DEFINER issuer/subject lookup function with `PUBLIC` execute revoked and runtime execute granted. It does not grant runtime SELECT on global `app_users`, does not give backend the migrator credential, and does not weaken RLS.

## Executed security evidence

The final combined command is the one printed in the M03/M04 reports. Final result: **60 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**. M05-specific `tests/security/test_identity.py` plus `test_keycloak_live.py`: **11 PASSED / 0 FAILED / 0 SKIPPED / 0 BLOCKED**, all PostgreSQL-backed. The whole `tests/security/` directory has 19 passing cases when the eight original M02 RLS cases are included.

The OIDC live case created a unique temporary local Keycloak realm/client/user, obtained a real access token, fetched the real JWKS, validated signature/issuer/audience/purpose, resolved a seeded User + Owner membership through the runtime DB role, rejected a wrong audience, and deleted the temporary realm. Synthetic RS256 tests separately rejected expired tokens, wrong issuer/audience, invalid signature, HS256 and wrong token purpose. Database tests rejected Owner A in B, PlatformAdmin-as-Owner, unassigned Operator, foreign Customer/Order UUID, and cross-channel/cross-business identity merge. Assigned Operator and own-order Customer access passed. M04's ten per-tool negatives verify agent/tool intersection, including Support/Analytics write denial with persisted audit and no effect. The M01/M02 RLS regression cases remained green, including forced RLS, least-privilege grants, missing context, foreign tenant and pooled A→B context reset.

Command for the local Keycloak-only proof:

```text
docker compose --profile test --env-file .env -f infra/compose/compose.yaml run --rm db-tests pytest -q --tb=line -p no:cacheprovider tests/security/test_keycloak_live.py
```

It returned `1 passed`. The full final run repeated it successfully. Test-only Keycloak admin credentials are supplied from ignored `.env` to `db-tests`; they are not in the backend runtime environment, repository, emitted evidence, or future LLM context. The smoke test removes its synthetic realm in `finally`.

## Limits and gate

No FastAPI feature routes or customer-channel webhook were added (M14/later scope). The verifier is an internal M05 adapter, not an externally exposed auth endpoint. Key rotation fetch is cache-based; production issuer/audience/JWKS/secret operation must be configured and reviewed during deployment. The approved E02 policy gap affects `update_order` only and does not authorize weakening security. No identity or tenant-boundary deviation was made. **M05: PASSED** on executed local scope.
