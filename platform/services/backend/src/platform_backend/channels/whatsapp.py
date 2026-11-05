"""WhatsApp Cloud API adapter: signature check, payload parsing and outbound sends.

The adapter never interprets message text; it only moves bytes between Meta and the
channel inbox. Every inbound message is untrusted customer data.
"""

import hashlib
import hmac
from dataclasses import dataclass
from typing import Any
from uuid import UUID

import httpx
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

CHANNEL = "WHATSAPP"
MAX_INBOUND_CHARS = 2000


class WhatsAppSettings(BaseSettings):
    """Server-only configuration. Tokens never leave the backend process."""

    model_config = SettingsConfigDict(env_file=None, extra="ignore")

    verify_token: str = Field(min_length=8, alias="WHATSAPP_VERIFY_TOKEN")
    app_secret: str = Field(min_length=8, alias="WHATSAPP_APP_SECRET")
    access_token: str = Field(min_length=8, alias="WHATSAPP_ACCESS_TOKEN")
    phone_number_id: str = Field(min_length=1, alias="WHATSAPP_PHONE_NUMBER_ID")
    business_id: UUID = Field(alias="WHATSAPP_BUSINESS_ID")
    graph_version: str = Field(default="v26.0", alias="WHATSAPP_GRAPH_VERSION")
    graph_base_url: str = Field(
        default="https://graph.facebook.com", alias="WHATSAPP_GRAPH_BASE_URL"
    )


@dataclass(frozen=True)
class InboundMessage:
    provider_message_id: str
    external_user_id: str
    display_name: str | None
    text: str | None
    """None when the message is not plain text (image, audio, sticker...)."""
    message_type: str


@dataclass(frozen=True)
class DeliveryStatus:
    provider_message_id: str
    status: str


@dataclass(frozen=True)
class WebhookEvents:
    messages: tuple[tuple[str, InboundMessage], ...]
    """(phone_number_id, message) pairs."""
    statuses: tuple[tuple[str, DeliveryStatus], ...]


def verify_signature(app_secret: str, body: bytes, header: str | None) -> bool:
    """Meta signs the raw body with HMAC-SHA256 under the app secret."""
    if not header or not header.startswith("sha256="):
        return False
    expected = hmac.new(app_secret.encode("utf-8"), body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, header[len("sha256=") :])


STATUS_MAP = {
    "sent": "PENDING_DELIVERY",
    "delivered": "DELIVERED",
    "read": "DELIVERED",
    "failed": "FAILED",
}


def parse_webhook(payload: Any) -> WebhookEvents:
    """Extract text messages and delivery statuses; anything malformed is skipped."""
    messages: list[tuple[str, InboundMessage]] = []
    statuses: list[tuple[str, DeliveryStatus]] = []
    if not isinstance(payload, dict) or payload.get("object") != "whatsapp_business_account":
        return WebhookEvents((), ())
    for entry in payload.get("entry") or []:
        for change in (entry or {}).get("changes") or []:
            value = (change or {}).get("value") or {}
            if (change or {}).get("field") != "messages" or not isinstance(value, dict):
                continue
            phone_number_id = str((value.get("metadata") or {}).get("phone_number_id") or "")
            if not phone_number_id:
                continue
            names = {
                str(contact.get("wa_id")): (contact.get("profile") or {}).get("name")
                for contact in value.get("contacts") or []
                if isinstance(contact, dict) and contact.get("wa_id")
            }
            for raw in value.get("messages") or []:
                if not isinstance(raw, dict):
                    continue
                message_id = raw.get("id")
                sender = raw.get("from")
                if not isinstance(message_id, str) or not isinstance(sender, str):
                    continue
                kind = str(raw.get("type") or "unknown")
                text = None
                if kind == "text":
                    body = (raw.get("text") or {}).get("body")
                    if isinstance(body, str) and body.strip():
                        text = body.strip()[:MAX_INBOUND_CHARS]
                name = names.get(sender)
                messages.append(
                    (
                        phone_number_id,
                        InboundMessage(
                            message_id,
                            sender,
                            str(name)[:120] if isinstance(name, str) else None,
                            text,
                            kind,
                        ),
                    )
                )
            for raw in value.get("statuses") or []:
                if not isinstance(raw, dict):
                    continue
                message_id = raw.get("id")
                mapped = STATUS_MAP.get(str(raw.get("status")))
                if isinstance(message_id, str) and mapped:
                    statuses.append((phone_number_id, DeliveryStatus(message_id, mapped)))
    return WebhookEvents(tuple(messages), tuple(statuses))


class ChannelSendError(Exception):
    """Outbound delivery failed; the business effect behind the message is unchanged."""


class WhatsAppClient:
    def __init__(self, settings: WhatsAppSettings, client: httpx.Client | None = None) -> None:
        self._settings = settings
        self._client = client or httpx.Client(timeout=15)

    def send_text(self, to: str, text: str) -> str:
        """Returns the provider message id. Acceptance is not delivery."""
        url = (
            f"{self._settings.graph_base_url}/{self._settings.graph_version}/"
            f"{self._settings.phone_number_id}/messages"
        )
        body = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": to,
            "type": "text",
            "text": {"preview_url": False, "body": text[:4096]},
        }
        try:
            response = self._client.post(
                url,
                json=body,
                headers={"Authorization": f"Bearer {self._settings.access_token}"},
            )
        except httpx.HTTPError as exc:
            raise ChannelSendError("WhatsApp transport failed") from exc
        if response.status_code >= 400:
            raise ChannelSendError(f"WhatsApp rejected the message ({response.status_code})")
        try:
            message_id = response.json()["messages"][0]["id"]
        except (ValueError, KeyError, IndexError, TypeError) as exc:
            raise ChannelSendError("WhatsApp returned an unexpected response") from exc
        if not isinstance(message_id, str):
            raise ChannelSendError("WhatsApp returned an unexpected message id")
        return message_id
