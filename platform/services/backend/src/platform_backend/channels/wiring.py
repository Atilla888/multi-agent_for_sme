"""Builds the channel services from the environment; nothing here runs at import time."""

import os
from dataclasses import dataclass
from functools import lru_cache

from platform_backend.agents.provider import provider_from_environment
from platform_backend.agents.runtime import make_specialists
from platform_backend.brain.service import BusinessBrain
from platform_backend.channels.inbox import ChannelInbox
from platform_backend.channels.whatsapp import CHANNEL, WhatsAppClient, WhatsAppSettings
from platform_backend.infrastructure.settings import Settings
from platform_backend.repositories.postgres import PostgresDatabase
from platform_backend.tools.executor import ToolExecutor, ToolLimits


@dataclass(frozen=True)
class ChannelServices:
    settings: WhatsAppSettings
    inbox: ChannelInbox


def build_channel_services() -> ChannelServices:
    whatsapp = WhatsAppSettings.model_validate({})
    database = PostgresDatabase(Settings.model_validate({}).database_url)
    signing_key = os.environ.get("TOOL_CURSOR_SIGNING_KEY", "").encode("utf-8") or os.urandom(32)
    executor = ToolExecutor(
        database,
        cursor_signing_key=signing_key,
        limits=ToolLimits(
            max_forecast_horizon=int(os.environ.get("TOOL_MAX_FORECAST_HORIZON", "30"))
        ),
    )
    specialists = make_specialists(provider_from_environment(), BusinessBrain(database), executor)
    inbox = ChannelInbox(
        database,
        specialists,
        WhatsAppClient(whatsapp),
        business_id=whatsapp.business_id,
        channel=CHANNEL,
        run_timeout_seconds=int(os.environ.get("CHANNEL_RUN_TIMEOUT_SECONDS", "60")),
    )
    return ChannelServices(whatsapp, inbox)


@lru_cache(maxsize=1)
def configured_channel_services() -> ChannelServices:
    return build_channel_services()
