import sqlite3

conn = sqlite3.connect('sql_app.db')
cursor = conn.cursor()

cursor.execute("SELECT name, sql FROM sqlite_master WHERE type='table'")
for row in cursor.fetchall():
    print(f"=== TABLE: {row[0]} ===")
    print(row[1])
    print()

    cursor2 = conn.cursor()
    cursor2.execute(f"PRAGMA table_info({row[0]})")
    cols = cursor2.fetchall()
    for col in cols:
        print(f"  col: {col[1]}  type: {col[2]}  notnull: {col[3]}  default: {col[4]}")
    print()

conn.close()
