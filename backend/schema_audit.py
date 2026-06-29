from sqlalchemy import inspect

from app.database import engine


def main() -> None:
    inspector = inspect(engine)
    for table_name in sorted(inspector.get_table_names()):
        print(f"=== TABLE: {table_name} ===")
        for column in inspector.get_columns(table_name):
            print(
                f"  col: {column['name']}  type: {column['type']}  "
                f"nullable: {column['nullable']}  default: {column['default']}"
            )


if __name__ == "__main__":
    main()
