"""Disposable local test-realm provisioning, never application authentication.

Realm creation can outlive a socket timeout under full-suite container load.
Only admin setup gets 30 seconds; token/JWT/JWKS timeouts stay unchanged.
"""

import re
import time
from collections.abc import Callable
from http.client import HTTPException
from typing import Any
from uuid import uuid4

ADMIN_TIMEOUT_SECONDS = 30
MAX_CREATE_ATTEMPTS = 2
OWNER_ATTRIBUTE = "p5i.test.provisioning-attempt"
AMBIGUOUS_ERRORS = (OSError, HTTPException, ValueError)
TRANSIENT_STATUSES = (429, 500, 502, 503, 504)
Reply = tuple[int, dict, str | None]


class ProvisioningFailure(AssertionError):
    """Safe infrastructure failure; never includes tokens or response bodies."""


class KeycloakTestAdmin:
    def __init__(self, http: Callable[..., Reply], token: str) -> None:
        self._http = http
        self._token = token
        self._owners: dict[str, str] = {}

    def request(self, path: str, **kwargs: Any) -> Reply:
        if path != "/admin/realms" and not path.startswith("/admin/realms/"):
            raise ProvisioningFailure("Test admin helper only permits realm-admin endpoints")
        return self._http(path, bearer=self._token, timeout=ADMIN_TIMEOUT_SECONDS, **kwargs)

    def wait_ready(self) -> None:
        """Container health is gated by the runner; also require a real admin read."""
        deadline = time.monotonic() + 60
        for attempt in range(3):
            remaining = deadline - time.monotonic()
            if remaining <= 0:
                break
            try:
                status, document, _ = self._http(
                    "/admin/realms/master",
                    bearer=self._token,
                    timeout=min(ADMIN_TIMEOUT_SECONDS, remaining),
                    allowed_statuses=TRANSIENT_STATUSES,
                )
                if status == 200 and document.get("realm") == "master":
                    return
                if status not in TRANSIENT_STATUSES:
                    raise ProvisioningFailure("Keycloak test admin readiness read was not valid")
            except AMBIGUOUS_ERRORS:
                pass
            if attempt < 2:
                time.sleep(min(0.25, max(0, deadline - time.monotonic())))
        raise ProvisioningFailure("Keycloak test admin API did not become ready within its bound")

    def _lookup(self, realm: str) -> dict | None:
        for _ in range(2):
            try:
                status, document, _ = self.request(
                    f"/admin/realms/{realm}", allowed_statuses=(404, *TRANSIENT_STATUSES)
                )
                if status == 404:
                    return None
                if status == 200 and isinstance(document, dict):
                    return document
                if status not in TRANSIENT_STATUSES:
                    break
            except AMBIGUOUS_ERRORS:
                pass
        raise ProvisioningFailure(
            "Keycloak test realm state is UNKNOWN after bounded reads; no further POST is safe"
        )

    @staticmethod
    def _matches(document: dict, realm: str, owner: str) -> bool:
        attributes = document.get("attributes")
        return (
            document.get("realm") == realm
            and isinstance(attributes, dict)
            and attributes.get(OWNER_ATTRIBUTE) == owner
        )

    def create_realm(self, realm: str) -> None:
        if re.fullmatch(r"m05-smoke-[0-9a-f]{32}", realm) is None:
            raise ProvisioningFailure("Only a unique disposable m05-smoke realm is permitted")
        self.wait_ready()
        if self._lookup(realm) is not None:
            raise ProvisioningFailure("Refusing an existing realm not owned by this setup attempt")
        owner = uuid4().hex
        body = {"realm": realm, "enabled": True, "attributes": {OWNER_ATTRIBUTE: owner}}
        for attempt in range(MAX_CREATE_ATTEMPTS):
            status = None
            try:
                status, _, _ = self.request(
                    "/admin/realms",
                    method="POST",
                    body=body,
                    allowed_statuses=(409, *TRANSIENT_STATUSES),
                )
                if status not in (201, 409, *TRANSIENT_STATUSES):
                    raise ProvisioningFailure(
                        "Keycloak test realm creation returned an invalid status"
                    )
            except AMBIGUOUS_ERRORS:
                # A lost response does not establish a failed effect. Read before retrying.
                pass
            document = self._lookup(realm)
            if document is not None:
                if not self._matches(document, realm, owner):
                    raise ProvisioningFailure(
                        "Realm name/attempt ownership does not match this setup"
                    )
                self._owners[realm] = owner
                return
            if status == 409:
                raise ProvisioningFailure("Realm conflict could not be reconciled to this attempt")
            if attempt == MAX_CREATE_ATTEMPTS - 1:
                raise ProvisioningFailure(
                    "Test realm is absent after the bounded creation attempts"
                )
            # An authoritative 404 is the only condition permitting the one retry.

    def delete_realm(self, realm: str) -> None:
        owner = self._owners.get(realm)
        if owner is None:
            raise ProvisioningFailure("Refusing cleanup of a realm not owned by this helper")
        document = self._lookup(realm)
        if document is None:
            return
        if not self._matches(document, realm, owner):
            raise ProvisioningFailure("Refusing cleanup after test-realm ownership changed")
        try:
            status, _, _ = self.request(
                f"/admin/realms/{realm}", method="DELETE", allowed_statuses=(404,)
            )
            if status in (204, 404):
                return
            raise ProvisioningFailure("Keycloak test realm cleanup failed")
        except AMBIGUOUS_ERRORS:
            if self._lookup(realm) is None:
                return
            raise ProvisioningFailure("Test realm cleanup outcome is not confirmed") from None
