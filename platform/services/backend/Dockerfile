FROM python:3.12.12-slim-bookworm@sha256:593bd06efe90efa80dc4eee3948be7c0fde4134606dd40d8dd8dbcade98e669c AS dependencies

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /workspace
COPY requirements-m01-m07.lock ./
RUN python -m pip install --upgrade pip==25.2 && \
    python -m pip install -c requirements-m01-m07.lock \
      alembic==1.20.0 fastapi==0.116.1 pydantic==2.11.7 \
      pydantic-settings==2.10.1 'psycopg[binary,pool]==3.2.10' \
      SQLAlchemy==2.0.54 'uvicorn[standard]==0.35.0' 'PyJWT[crypto]==2.15.0' \
      fastembed==0.8.1 minio==7.2.20 httpx==0.28.1 \
      anthropic==1.15.0 httpx2==2.14.0 httpcore2==2.14.0 jiter==0.17.0 \
      docstring-parser==0.18.0 opentelemetry-api==1.45.1

FROM dependencies AS model-assets
ENV HF_HOME=/tmp/hf XDG_CACHE_HOME=/tmp
COPY infra/model/fastembed-0.8.1-bge-small-en-v1.5.sha256 /tmp/model.sha256
RUN mkdir -p /opt/fastembed-cache && \
    python -c "from fastembed import TextEmbedding; m=TextEmbedding(model_name='BAAI/bge-small-en-v1.5',cache_dir='/opt/fastembed-cache'); assert len(next(m.embed(['development model validation']))) == 384" && \
    sha256sum -c /tmp/model.sha256 && \
    test "$(cat /opt/fastembed-cache/models--Qdrant--bge-small-en-v1.5-onnx-Q/refs/main)" = "aa8f8b060edb00e03bfdd08813a2949946c8ba55" && \
    chmod -R a+rX /opt/fastembed-cache

FROM dependencies AS runtime
COPY --from=model-assets /opt/fastembed-cache /opt/fastembed-cache
COPY pyproject.toml README.md ./
COPY services/backend/src ./services/backend/src
COPY infra/migrations ./infra/migrations
COPY implementation_handoff/contracts/docs/engineering/physical_schema.sql ./implementation_handoff/contracts/docs/engineering/physical_schema.sql
RUN python -m pip install --no-deps .

USER 65532:65532
CMD ["uvicorn", "platform_backend.api.app:app", "--host", "0.0.0.0", "--port", "8000"]

FROM dependencies AS test-dependencies
RUN python -m pip install -c requirements-m01-m07.lock \
      mypy==1.17.1 pytest==8.4.2 pytest-cov==6.2.1 ruff==0.12.11

FROM test-dependencies AS test
COPY --from=model-assets /opt/fastembed-cache /opt/fastembed-cache
COPY pyproject.toml README.md ./
COPY services/backend/src ./services/backend/src
COPY infra/migrations ./infra/migrations
COPY implementation_handoff/contracts/docs/engineering/physical_schema.sql ./implementation_handoff/contracts/docs/engineering/physical_schema.sql
COPY tests ./tests
RUN python -m pip install --no-deps .
USER 65532:65532
CMD ["pytest", "-q", "-p", "no:cacheprovider", "tests/unit", "tests/integration", "tests/security"]

