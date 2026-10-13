# M05 formal revalidation

## 1. Milestone purpose

Revalidate OIDC/Keycloak verification, current staff membership, tenant/object/customer/operator authorization and defense-in-depth boundaries.

## 2. Authoritative source

SAFE master Appendix I, S035 `m05_execution_report.md`, S039, M02/M04 security contracts and frozen P3 manifests.

## 3. Historical status

PASSED in the original environment.

## 4. Reconstructed implementation involved

OIDC verification, policy, identity service, staff lookup migration, tenant repository/RLS and tool admission.

## 5. Acceptance criteria

Real local Keycloak token/JWKS verification; signature/issuer/audience/expiry/purpose negatives; current DB membership; Platform Admin not automatically Owner; customer identity scoped by tenant/channel; own-object access only; Operator requires assignment; foreign/forbidden access has no effect. Test credentials must remain local and unprinted.

## 6. Exact tests/commands

- Independent: `pytest ... tests/security/test_identity.py tests/security/test_keycloak_live.py`
- M02 RLS negatives and M04/shared forbidden-agent paths remain required regression evidence.

## 7. Observed result

Independent M05 suite: **11 passed in 6.20s**. It created and removed a synthetic local realm, validated a real access token/JWKS, and passed wrong-audience and synthetic-token negative paths. M02's 8 RLS cases, M04's ten specialist negatives and the shared foreign-resource/no-effect path also passed in their dedicated gates and final regression.

## 8. Failures/skips

0 failed, 0 skipped.

## 9. Limitations

Internal local adapter only; no public feature/auth routes, production key rotation operation or live customer channels are claimed.

## 10. Verdict

**M05: PASS.**
