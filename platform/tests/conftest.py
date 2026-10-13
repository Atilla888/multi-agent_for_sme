import os

import pytest


def _url(name: str) -> str:
    value = os.environ.get(name)
    if not value:
        pytest.skip(f"{name} is unavailable; real PostgreSQL test is BLOCKED")
    return value


@pytest.fixture(scope="session")
def migrator_url() -> str:
    return _url("MIGRATOR_DATABASE_URL")


@pytest.fixture(scope="session")
def runtime_url() -> str:
    return _url("DATABASE_URL")


@pytest.fixture()
def admin_connection(migrator_url: str):
    import psycopg

    with psycopg.connect(migrator_url, autocommit=True) as connection:
        yield connection

