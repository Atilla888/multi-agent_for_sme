import os

import psycopg
from psycopg import sql


def required(name: str) -> str:
    value = os.environ.get(name)
    if not value or value.startswith("replace-with-"):
        raise RuntimeError(f"mandatory configuration {name} is missing or still a placeholder")
    return value


def main() -> None:
    admin_url = required("MIGRATOR_DATABASE_URL")
    runtime_user = required("POSTGRES_RUNTIME_USER")
    runtime_password = required("POSTGRES_RUNTIME_PASSWORD")
    with psycopg.connect(admin_url, autocommit=True) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (runtime_user,))
            if cursor.fetchone() is None:
                cursor.execute(
                    sql.SQL("CREATE ROLE {} LOGIN PASSWORD {}").format(
                        sql.Identifier(runtime_user), sql.Literal(runtime_password)
                    )
                )
            else:
                # Keep the existing least-privilege role usable after local secret rotation.
                cursor.execute(
                    sql.SQL("ALTER ROLE {} PASSWORD {}").format(
                        sql.Identifier(runtime_user), sql.Literal(runtime_password)
                    )
                )
            cursor.execute(
                sql.SQL(
                    "ALTER ROLE {} NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS"
                ).format(sql.Identifier(runtime_user))
            )


if __name__ == "__main__":
    main()
