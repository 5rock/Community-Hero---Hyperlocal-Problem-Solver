"""One-time, idempotent SQLite to PostgreSQL data migration."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import MetaData, create_engine, func, select
from sqlalchemy.dialects.postgresql import insert

TABLES = (
    ("users", "users"),
    ("audit_logs", "audit_logs"),
    ("activities", "activities"),
    ("notifications", "notifications"),
    ("issues", "issues"),
    ("user_sessions", "user_sessions"),
    ("verifications", "verifications"),
    ("polls", "polls"),
)


def _postgres_url() -> str:
    value = os.getenv("DATABASE_URL", "").strip()
    if value.startswith("postgres://"):
        return "postgresql+psycopg2://" + value.removeprefix("postgres://")
    if value.startswith("postgresql://"):
        return "postgresql+psycopg2://" + value.removeprefix("postgresql://")
    if value.startswith("postgresql+psycopg2://"):
        return value
    raise RuntimeError("DATABASE_URL must point to PostgreSQL")


def migrate(source: Path = Path("sql_app.db")) -> dict[str, tuple[int, int]]:
    if not source.is_file():
        raise FileNotFoundError(f"SQLite source not found: {source}")

    sqlite_engine = create_engine(f"sqlite:///{source.resolve().as_posix()}")
    postgres_engine = create_engine(_postgres_url(), pool_pre_ping=True)
    source_meta, target_meta = MetaData(), MetaData()
    source_meta.reflect(bind=sqlite_engine)
    target_meta.reflect(bind=postgres_engine)
    counts: dict[str, tuple[int, int]] = {}

    with sqlite_engine.connect() as source_connection, postgres_engine.begin() as target_connection:
        for source_name, target_name in TABLES:
            if source_name not in source_meta.tables:
                counts[target_name] = (0, 0)
                continue
            if target_name not in target_meta.tables:
                raise RuntimeError(f"Target table is missing: {target_name}; run Alembic first")

            source_table = source_meta.tables[source_name]
            target_table = target_meta.tables[target_name]
            allowed = set(target_table.c.keys())
            rows = [
                {key: value for key, value in row._mapping.items() if key in allowed}
                for row in source_connection.execute(select(source_table))
            ]
            if rows:
                primary_keys = [column.name for column in target_table.primary_key.columns]
                statement = insert(target_table).values(rows)
                if primary_keys:
                    statement = statement.on_conflict_do_nothing(index_elements=primary_keys)
                target_connection.execute(statement)

            source_count = len(rows)
            target_count = target_connection.scalar(
                select(func.count()).select_from(target_table)
            )
            counts[target_name] = (source_count, int(target_count or 0))

        # Keep PostgreSQL identity sequences ahead of imported integer IDs.
        for _, target_name in TABLES:
            table = target_meta.tables.get(target_name)
            if table is None or "id" not in table.c:
                continue
            target_connection.exec_driver_sql(
                "SELECT setval(pg_get_serial_sequence(%s, 'id'), "
                "COALESCE((SELECT MAX(id) FROM " + f'"{target_name}"' + "), 1), true)",
                (target_name,),
            )

    return counts


def main() -> None:
    load_dotenv()
    results = migrate()
    print("table,sqlite_rows,postgres_rows,status")
    for table, (source_count, target_count) in results.items():
        status = "OK" if target_count >= source_count else "MISMATCH"
        print(f"{table},{source_count},{target_count},{status}")
    if any(target < source for source, target in results.values()):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
