from collections.abc import Iterator
from contextlib import contextmanager
from uuid import UUID

from sqlalchemy import Connection, text


@contextmanager
def tenant_transaction(connection: Connection, business_id: UUID) -> Iterator[Connection]:
    """Bind tenant scope to exactly one transaction; PostgreSQL clears it at end."""
    if connection.in_transaction():
        raise RuntimeError("tenant_transaction requires an idle pooled connection")
    with connection.begin():
        connection.execute(
            text("SELECT set_config('app.current_business_id', :business_id, true)"),
            {"business_id": str(business_id)},
        )
        yield connection

