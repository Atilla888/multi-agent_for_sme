"""WhatsApp webhook endpoints. Verification by token, authenticity by HMAC signature."""

import json
import logging
from typing import Annotated

from fastapi import APIRouter, BackgroundTasks, Header, Query, Request, Response
from fastapi.responses import JSONResponse, PlainTextResponse

from platform_backend.channels.inbox import ChannelInbox
from platform_backend.channels.whatsapp import (
    DeliveryStatus,
    InboundMessage,
    parse_webhook,
    verify_signature,
)
from platform_backend.channels.wiring import ChannelServices, configured_channel_services

router = APIRouter(prefix="/webhooks/whatsapp", tags=["channels"])
log = logging.getLogger("platform_backend.channels")

MAX_BODY_BYTES = 256 * 1024


def channel_services(request: Request) -> ChannelServices | None:
    configured = getattr(request.app.state, "channel_services", None)
    if configured is not None:
        return configured  # type: ignore[no-any-return]
    try:
        return configured_channel_services()
    except ValueError:
        return None


@router.get("")
def verify(
    request: Request,
    mode: Annotated[str | None, Query(alias="hub.mode")] = None,
    token: Annotated[str | None, Query(alias="hub.verify_token")] = None,
    challenge: Annotated[str | None, Query(alias="hub.challenge")] = None,
) -> Response:
    services = channel_services(request)
    if services is None:
        return JSONResponse(status_code=503, content={"code": "NOT_CONFIGURED"})
    if mode == "subscribe" and token == services.settings.verify_token and challenge:
        return PlainTextResponse(challenge[:256])
    return JSONResponse(status_code=403, content={"code": "VERIFICATION_FAILED"})


@router.post("")
async def receive(
    request: Request,
    background: BackgroundTasks,
    signature: Annotated[str | None, Header(alias="X-Hub-Signature-256")] = None,
) -> Response:
    services = channel_services(request)
    if services is None:
        return JSONResponse(status_code=503, content={"code": "NOT_CONFIGURED"})
    body = await request.body()
    if len(body) > MAX_BODY_BYTES:
        return JSONResponse(status_code=413, content={"code": "PAYLOAD_TOO_LARGE"})
    if not verify_signature(services.settings.app_secret, body, signature):
        return JSONResponse(status_code=403, content={"code": "INVALID_SIGNATURE"})
    try:
        events = parse_webhook(json.loads(body))
    except ValueError:
        return JSONResponse(status_code=400, content={"code": "INVALID_PAYLOAD"})
    # Meta expects a fast 200; the agent run happens after the response is sent.
    for phone_number_id, message in events.messages:
        background.add_task(_process, services.inbox, phone_number_id, message)
    for phone_number_id, status in events.statuses:
        background.add_task(_record, services.inbox, phone_number_id, status)
    return JSONResponse(
        status_code=200,
        content={"accepted": {"messages": len(events.messages), "statuses": len(events.statuses)}},
    )


def _process(inbox: ChannelInbox, phone_number_id: str, message: InboundMessage) -> None:
    try:
        reply = inbox.handle(phone_number_id, message)
    except Exception:  # noqa: BLE001 - a background task must never crash the worker
        log.exception(
            "channel inbound processing failed", extra={"message": message.provider_message_id}
        )
        return
    if reply is not None:
        log.info(
            "channel reply",
            extra={
                "conversation": str(reply.conversation_id),
                "outcome": reply.outcome,
                "delivered": reply.delivered,
            },
        )


def _record(inbox: ChannelInbox, phone_number_id: str, status: DeliveryStatus) -> None:
    try:
        inbox.record_status(phone_number_id, status)
    except Exception:  # noqa: BLE001
        log.exception("channel status processing failed")
