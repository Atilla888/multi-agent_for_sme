"""M06 pure authority, schema and canonicalization checks."""

from datetime import UTC, datetime
from uuid import uuid4

import pytest
from pydantic import ValidationError

from platform_backend.brain.conflicts import FactKind, SourceClaim, resolve_claims
from platform_backend.brain.contracts import (
    ContextStatus,
    DevContextLimits,
    ModelContextHints,
    SourceType,
    canonical_context_digest,
)
from platform_backend.brain.sources import redact_context_text


@pytest.mark.parametrize("field,value", [
    ("business_id", "foreign"), ("principal", "owner"),
    ("agent_role", "Analytics"), ("permissions", ["create_order"]),
])
def test_model_hints_reject_trusted_control_fields(field: str, value: object) -> None:
    with pytest.raises(ValidationError):
        ModelContextHints.model_validate({"question": "status?", field: value})


def test_order_truth_beats_derived_summary() -> None:
    decision = resolve_claims(FactKind.ORDER_STATUS, (
        SourceClaim(FactKind.ORDER_STATUS, "CREATED", SourceType.ORDER, "order:1"),
        SourceClaim(FactKind.ORDER_STATUS, "CONFIRMED", SourceType.SUMMARY, "summary:1"),
    ))
    assert decision.status is ContextStatus.PRESENT
    assert decision.winning_source is SourceType.ORDER
    assert decision.reason == "LOWER_AUTHORITY_CONTRADICTION_IGNORED"


def test_current_inventory_beats_document_and_policy_beats_injection() -> None:
    stock = resolve_claims(FactKind.INVENTORY_QUANTITY, (
        SourceClaim(FactKind.INVENTORY_QUANTITY, "0", SourceType.INVENTORY, "stock:1"),
        SourceClaim(FactKind.INVENTORY_QUANTITY, "10", SourceType.KNOWLEDGE, "doc:1"),
    ))
    policy = resolve_claims(FactKind.POLICY_RULE, (
        SourceClaim(FactKind.POLICY_RULE, "DENY", SourceType.POLICY, "policy:1"),
        SourceClaim(FactKind.POLICY_RULE, "ALLOW", SourceType.KNOWLEDGE, "doc:2"),
    ))
    assert stock.winning_source is SourceType.INVENTORY
    assert policy.winning_source is SourceType.POLICY


def test_current_published_document_beats_retired_and_equal_authority_conflicts() -> None:
    publication = resolve_claims(FactKind.DOCUMENT_POLICY, (
        SourceClaim(FactKind.DOCUMENT_POLICY, "V1", SourceType.KNOWLEDGE,
                    "doc:v1", current=False),
        SourceClaim(FactKind.DOCUMENT_POLICY, "V2", SourceType.KNOWLEDGE,
                    "doc:v2", current=True),
    ))
    conflict = resolve_claims(FactKind.POLICY_RULE, (
        SourceClaim(FactKind.POLICY_RULE, "ALLOW", SourceType.POLICY, "policy:a"),
        SourceClaim(FactKind.POLICY_RULE, "DENY", SourceType.POLICY, "policy:b"),
    ))
    assert publication.status is ContextStatus.PRESENT
    assert conflict.status is ContextStatus.CONFLICT
    assert conflict.winning_source is None


def test_canonical_digest_ignores_observation_clock_but_not_source_version() -> None:
    base = {"resource": {"id": str(uuid4()), "version": "1",
                         "observed_at": datetime.now(UTC).isoformat()}}
    changed_clock = {"resource": {**base["resource"], "observed_at": "2030-01-01T00:00:00Z"}}
    changed_version = {"resource": {**base["resource"], "version": "2"}}
    assert canonical_context_digest(base) == canonical_context_digest(changed_clock)
    assert canonical_context_digest(base) != canonical_context_digest(changed_version)


def test_development_limits_reject_zero_and_text_projection_redacts_credentials() -> None:
    with pytest.raises(ValueError):
        DevContextLimits(DEV_CONTEXT_MAX_MESSAGES=0)
    text, truncated = redact_context_text(
        "email alice@example.invalid password:supersecret", 200
    )
    assert not truncated
    assert "alice@example.invalid" not in text
    assert "supersecret" not in text
