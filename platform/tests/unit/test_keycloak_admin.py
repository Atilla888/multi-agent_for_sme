"""Offline infrastructure checks; real protocol/domain tests remain unchanged."""

from unittest.mock import MagicMock, Mock, patch
from urllib.error import URLError

import pytest

from tests.keycloak_admin import (
    ADMIN_TIMEOUT_SECONDS,
    OWNER_ATTRIBUTE,
    KeycloakTestAdmin,
    ProvisioningFailure,
)
from tests.security import test_keycloak_live as live

REALM = "m05-smoke-" + "0" * 32
ABSENT = (404, {}, None)
CREATED = (201, {}, None)
MASTER = (200, {"realm": "master"}, None)


def setup(*steps):
    """Each reply is explicit; an unexpected additional call fails the test."""
    calls = []
    pending = iter(steps)
    posted = {}

    def http(path, **kwargs):
        calls.append((path, kwargs))
        if path == "/admin/realms" and kwargs.get("method") == "POST":
            posted.update(kwargs["body"])
        step = next(pending)
        if isinstance(step, Exception):
            raise step
        if step == "owned":
            return 200, dict(posted), None
        if callable(step):
            return 200, step(dict(posted)), None
        return step

    return KeycloakTestAdmin(http, "offline-test-only"), calls


def post_count(calls):
    return sum(kwargs.get("method") == "POST" for _, kwargs in calls)


def test_normal_creation_requires_admin_read_and_owned_identity():
    admin, calls = setup(MASTER, ABSENT, CREATED, "owned")
    admin.create_realm(REALM)
    assert calls[0][0] == "/admin/realms/master"
    assert post_count(calls) == 1
    assert all(kwargs["timeout"] == ADMIN_TIMEOUT_SECONDS == 30 for _, kwargs in calls)
    assert calls[-1][0] == f"/admin/realms/{REALM}"


@pytest.mark.parametrize(
    "error", [TimeoutError(), URLError("connection lost"), ConnectionResetError()]
)
def test_ambiguous_create_with_owned_realm_does_not_repeat_post(error):
    admin, calls = setup(MASTER, ABSENT, error, "owned")
    admin.create_realm(REALM)
    assert post_count(calls) == 1


def test_confirmed_absence_permits_one_retry_which_creates_realm():
    admin, calls = setup(MASTER, ABSENT, TimeoutError(), ABSENT, CREATED, "owned")
    admin.create_realm(REALM)
    assert post_count(calls) == 2
    assert calls[3][0] == f"/admin/realms/{REALM}"
    posts = [kwargs["body"] for _, kwargs in calls if kwargs.get("method") == "POST"]
    assert posts[0] == posts[1]  # Same unique name and attempt marker, not a new effect identity.


def test_ambiguous_retry_is_reconciled_to_owned_realm():
    admin, calls = setup(MASTER, ABSENT, TimeoutError(), ABSENT, TimeoutError(), "owned")
    admin.create_realm(REALM)
    assert post_count(calls) == 2


def test_conflict_after_retry_requires_exact_attempt_ownership():
    admin, calls = setup(MASTER, ABSENT, TimeoutError(), ABSENT, (409, {}, None), "owned")
    admin.create_realm(REALM)
    assert post_count(calls) == 2


def test_final_unknown_state_fails_without_further_post():
    admin, calls = setup(
        MASTER, ABSENT, TimeoutError(), ABSENT, TimeoutError(), TimeoutError(), TimeoutError()
    )
    with pytest.raises(ProvisioningFailure, match="state is UNKNOWN"):
        admin.create_realm(REALM)
    assert post_count(calls) == 2
    assert len(calls) == 7


def test_unknown_first_reconciliation_never_allows_second_post():
    admin, calls = setup(MASTER, ABSENT, TimeoutError(), TimeoutError(), TimeoutError())
    with pytest.raises(ProvisioningFailure, match="state is UNKNOWN"):
        admin.create_realm(REALM)
    assert post_count(calls) == 1


def test_both_attempts_absent_fail_without_uncontrolled_loop():
    admin, calls = setup(MASTER, ABSENT, TimeoutError(), ABSENT, TimeoutError(), ABSENT)
    with pytest.raises(ProvisioningFailure, match="absent after the bounded"):
        admin.create_realm(REALM)
    assert post_count(calls) == 2
    assert len(calls) == 6


def test_preexisting_realm_is_not_adopted_or_modified():
    admin, calls = setup(MASTER, (200, {"realm": REALM}, None))
    with pytest.raises(ProvisioningFailure, match="existing realm"):
        admin.create_realm(REALM)
    assert post_count(calls) == 0


@pytest.mark.parametrize(
    "document",
    [
        lambda body: {**body, "realm": "unrelated-realm"},
        {"realm": REALM, "attributes": {OWNER_ATTRIBUTE: "another-attempt"}},
    ],
)
def test_unrelated_reconciliation_result_is_not_success_or_cleanup_target(document):
    response = document if callable(document) else (200, document, None)
    admin, calls = setup(MASTER, ABSENT, (409, {}, None), response)
    with pytest.raises(ProvisioningFailure, match="ownership does not match"):
        admin.create_realm(REALM)
    with pytest.raises(ProvisioningFailure, match="not owned"):
        admin.delete_realm(REALM)
    assert post_count(calls) == 1


def test_admin_readiness_retries_only_reads_before_any_creation():
    admin, calls = setup(TimeoutError(), (503, {}, None), MASTER, ABSENT, CREATED, "owned")
    with patch("tests.keycloak_admin.time.sleep"):
        admin.create_realm(REALM)
    assert all(path == "/admin/realms/master" for path, _ in calls[:3])
    assert post_count(calls) == 1


def test_admin_readiness_failure_never_creates_realm():
    admin, calls = setup(TimeoutError(), TimeoutError(), TimeoutError())
    with (
        patch("tests.keycloak_admin.time.sleep"),
        pytest.raises(ProvisioningFailure, match="did not become ready"),
    ):
        admin.create_realm(REALM)
    assert post_count(calls) == 0


def test_cleanup_checks_ownership_and_deletes_once():
    admin, calls = setup(MASTER, ABSENT, CREATED, "owned", "owned", (204, {}, None))
    admin.create_realm(REALM)
    admin.delete_realm(REALM)
    assert sum(kwargs.get("method") == "DELETE" for _, kwargs in calls) == 1


def test_cleanup_refuses_changed_ownership():
    admin, calls = setup(MASTER, ABSENT, CREATED, "owned", (200, {"realm": REALM}, None))
    admin.create_realm(REALM)
    with pytest.raises(ProvisioningFailure, match="ownership changed"):
        admin.delete_realm(REALM)
    assert not any(kwargs.get("method") == "DELETE" for _, kwargs in calls)


def test_unrelated_realm_name_rejected_before_any_request():
    http = Mock()
    with pytest.raises(ProvisioningFailure, match="unique disposable"):
        KeycloakTestAdmin(http, "offline-test-only").create_realm("master")
    http.assert_not_called()


def test_transport_keeps_token_timeout_separate_from_test_admin_timeout():
    response = MagicMock()
    response.__enter__.return_value = response
    response.status = 200
    response.read.return_value = b"{}"
    with patch.object(live, "urlopen", return_value=response) as wire:
        live._http("/realms/master/protocol/openid-connect/token")
        assert wire.call_args.kwargs["timeout"] == 10
        KeycloakTestAdmin(live._http, "offline-test-only").request("/admin/realms/master")
        assert wire.call_args.kwargs["timeout"] == 30


def test_transient_server_error_is_reconciled_without_second_post():
    admin, calls = setup(MASTER, ABSENT, (503, {}, None), "owned")
    admin.create_realm(REALM)
    assert post_count(calls) == 1


def test_ambiguous_cleanup_reconciles_absence_without_repeating_delete():
    admin, calls = setup(MASTER, ABSENT, CREATED, "owned", "owned", TimeoutError(), ABSENT)
    admin.create_realm(REALM)
    admin.delete_realm(REALM)
    assert sum(kwargs.get("method") == "DELETE" for _, kwargs in calls) == 1


def test_ambiguous_cleanup_does_not_claim_success_while_realm_exists():
    admin, calls = setup(MASTER, ABSENT, CREATED, "owned", "owned", TimeoutError(), "owned")
    admin.create_realm(REALM)
    with pytest.raises(ProvisioningFailure, match="cleanup outcome is not confirmed"):
        admin.delete_realm(REALM)
    assert sum(kwargs.get("method") == "DELETE" for _, kwargs in calls) == 1
