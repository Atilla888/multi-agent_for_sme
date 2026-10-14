import os
from uuid import UUID, uuid4

import psycopg
from fastapi import FastAPI, Request, Response, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from platform_backend.api.configuration import HttpServices, trusted_url
from platform_backend.api.reads import router
from platform_backend.domain.errors import DomainFailure, ErrorCode
from platform_backend.infrastructure.settings import Settings


def create_app(http_services: HttpServices | None = None) -> FastAPI:
    application = FastAPI(title="SME Adaptive Platform", version="0.1.0")
    application.state.http_services = http_services
    local_http = os.environ.get("OIDC_ALLOW_LOCAL_HTTP", "false").lower() == "true"
    origins = [
        origin.strip().rstrip("/")
        for origin in os.environ.get("HTTP_CORS_ORIGINS", "").split(",")
        if origin.strip()
    ]
    for origin in origins:
        trusted_url(origin, local_http)
    application.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=False,
        allow_methods=["GET"],
        allow_headers=["Authorization", "X-Business-ID", "X-Request-ID"],
        expose_headers=["X-Request-ID"],
    )

    @application.middleware("http")
    async def request_context(request: Request, call_next):  # type: ignore[no-untyped-def]
        try:
            request_id = str(UUID(request.headers.get("x-request-id", "")))
        except ValueError:
            request_id = str(uuid4())
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        response.headers["Cache-Control"] = "no-store"
        return response

    @application.exception_handler(DomainFailure)
    async def domain_error(request: Request, failure: DomainFailure) -> JSONResponse:
        codes = {
            ErrorCode.UNAUTHENTICATED: 401,
            ErrorCode.FORBIDDEN: 403,
            ErrorCode.NOT_ACCESSIBLE: 404,
            ErrorCode.NOT_FOUND: 404,
            ErrorCode.VALIDATION_ERROR: 422,
            ErrorCode.CONFLICT: 409,
            ErrorCode.STALE_STATE: 409,
            ErrorCode.DEPENDENCY_UNAVAILABLE: 503,
        }
        headers = (
            {"WWW-Authenticate": "Bearer"} if failure.code is ErrorCode.UNAUTHENTICATED else {}
        )
        return JSONResponse(
            status_code=codes.get(failure.code, 503),
            headers=headers,
            content={
                "code": failure.code.value,
                "message": failure.safe_message,
                "request_id": request.state.request_id,
            },
        )

    @application.exception_handler(RequestValidationError)
    async def invalid_request(request: Request, failure: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={
                "code": "VALIDATION_ERROR",
                "message": "Invalid read request",
                "request_id": request.state.request_id,
            },
        )

    @application.exception_handler(psycopg.Error)
    async def database_unavailable(request: Request, failure: psycopg.Error) -> JSONResponse:
        return JSONResponse(
            status_code=503,
            content={
                "code": "DEPENDENCY_UNAVAILABLE",
                "message": "Business source is unavailable",
                "request_id": request.state.request_id,
            },
        )

    application.include_router(router)
    application.add_api_route("/health/live", liveness, methods=["GET"])
    application.add_api_route("/health/ready", readiness, methods=["GET"])
    return application


def liveness() -> dict[str, str]:
    return {"status": "alive"}


def readiness(response: Response) -> dict[str, str]:
    try:
        settings = Settings.model_validate({})
        sqlalchemy_url = settings.database_url.replace("postgresql://", "postgresql+psycopg://", 1)
        engine = create_engine(sqlalchemy_url, pool_pre_ping=True)
        with engine.connect() as connection:
            revision = connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalar_one()
            connection.execute(text("SELECT 1"))
        engine.dispose()
    except (SQLAlchemyError, ValueError):
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE
        return {"status": "not_ready"}
    return {"status": "ready", "migration": str(revision)}


app = create_app()
