from fastapi import FastAPI, Response, status
from sqlalchemy import create_engine, text
from sqlalchemy.exc import SQLAlchemyError

from platform_backend.infrastructure.settings import Settings

app = FastAPI(title="SME Adaptive Platform", version="0.1.0")


@app.get("/health/live")
def liveness() -> dict[str, str]:
    return {"status": "alive"}


@app.get("/health/ready")
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

