#!/usr/bin/env python3
"""
SWARA SQLite → PostgreSQL Data Migration Script
================================================
READS:  backend/swara.db (SQLite — NEVER modified)
WRITES: PostgreSQL database specified by DATABASE_URL env var

Usage:
  export DATABASE_URL="postgresql://user:pass@host:5432/swara_prod"
  python3 migrate_sqlite_to_postgres.py

Safety guarantees:
  - SQLite database is NEVER modified (read-only)
  - Script is idempotent: re-running skips rows that already exist by PK
  - Foreign-key ordering is respected (parents before children)
  - All existing IDs, timestamps, and relationships are preserved
  - Sequence counters are updated after bulk insert so new rows get correct IDs
"""

import os
import sys
import sqlite3
import json
import logging
from datetime import datetime

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
)
logger = logging.getLogger(__name__)

# ── Paths ───────────────────────────────────────────────────────────────────
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
SQLITE_PATH = os.path.join(SCRIPT_DIR, "backend", "swara.db")
DATABASE_URL = os.getenv("DATABASE_URL", "")

if not DATABASE_URL:
    print("\n❌  DATABASE_URL environment variable is not set.")
    print("   Set it to your PostgreSQL connection string, e.g.:")
    print('   export DATABASE_URL="postgresql://user:pass@host:5432/swara_prod"')
    sys.exit(1)

if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

if not os.path.exists(SQLITE_PATH):
    print(f"\n❌  SQLite database not found at: {SQLITE_PATH}")
    sys.exit(1)

# ── Connect ─────────────────────────────────────────────────────────────────
logger.info(f"[SQLite] Opening (read-only): {SQLITE_PATH}")
sqlite_conn = sqlite3.connect(f"file:{SQLITE_PATH}?mode=ro", uri=True)
sqlite_conn.row_factory = sqlite3.Row

import sqlalchemy
from sqlalchemy import create_engine, text, inspect

logger.info("[PostgreSQL] Connecting …")
pg_engine = create_engine(DATABASE_URL, echo=False)

# ── Ensure tables exist ──────────────────────────────────────────────────────
logger.info("[PostgreSQL] Running Alembic migrations to ensure schema is current …")
sys.path.insert(0, os.path.join(SCRIPT_DIR, "backend"))

try:
    from alembic.config import Config
    from alembic import command

    alembic_cfg = Config(os.path.join(SCRIPT_DIR, "backend", "alembic.ini"))
    alembic_cfg.set_main_option("sqlalchemy.url", DATABASE_URL)
    alembic_cfg.set_main_option(
        "script_location", os.path.join(SCRIPT_DIR, "backend", "alembic")
    )
    command.upgrade(alembic_cfg, "head")
    logger.info("[Alembic] Schema is up to date ✓")
except Exception as e:
    logger.warning(f"[Alembic] Could not run migrations automatically: {e}")
    logger.warning("  → Make sure the schema exists before migration (run alembic upgrade head manually).")


# ── Helper functions ─────────────────────────────────────────────────────────

def sqlite_rows(table: str):
    """Return all rows from SQLite table as list of dicts."""
    cur = sqlite_conn.cursor()
    cur.execute(f'SELECT * FROM "{table}"')
    rows = cur.fetchall()
    return [dict(r) for r in rows]


def pg_count(conn, table: str) -> int:
    result = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"'))
    return result.scalar()


def upsert_rows(conn, table: str, rows: list[dict], pk_col: str = "id"):
    """
    Insert rows into PostgreSQL, skipping rows whose PK already exists.
    Preserves all original IDs and timestamps.
    """
    if not rows:
        logger.info(f"  [skip] {table}: no rows in SQLite")
        return 0

    inserted = 0
    for row in rows:
        # Check if PK already exists
        exists = conn.execute(
            text(f'SELECT 1 FROM "{table}" WHERE "{pk_col}" = :pk'),
            {"pk": row[pk_col]},
        ).fetchone()
        if exists:
            continue

        # Build parameterized INSERT
        cols = list(row.keys())
        col_clause = ", ".join(f'"{c}"' for c in cols)
        val_clause = ", ".join(f":{c}" for c in cols)
        sql = f'INSERT INTO "{table}" ({col_clause}) VALUES ({val_clause})'

        try:
            conn.execute(text(sql), row)
            inserted += 1
        except Exception as e:
            logger.error(f"  [ERROR] {table} row pk={row.get(pk_col)}: {e}")

    return inserted


def reset_sequence(conn, table: str, pk_col: str = "id"):
    """
    After bulk-inserting rows with explicit IDs, reset the PostgreSQL
    sequence so future auto-increments start after the max existing ID.
    """
    try:
        seq_name = f"{table}_{pk_col}_seq"
        conn.execute(
            text(
                f"""
                SELECT setval(
                    '{seq_name}',
                    COALESCE((SELECT MAX("{pk_col}") FROM "{table}"), 1),
                    true
                )
                """
            )
        )
    except Exception as e:
        logger.warning(f"  [WARN] Could not reset sequence for {table}: {e}")


# ── Migration order (parent tables first) ────────────────────────────────────
# Tables are migrated in dependency order so foreign keys never reference
# rows that haven't been inserted yet.

MIGRATION_ORDER = [
    "users",
    "professional_profiles",
    "survivor_profiles",
    "referrals",
    "cases",
    "baselines",
    "check_ins",
    "action_logs",
    "consents",
    "alerts",
    "audit_logs",
    "safety_plans",
    "notifications",
    "ai_analyses",
    "ai_conversations",
    "ai_messages",
    "ai_conversation_summaries",
    "appointments",
    "case_events",
    "interventions",
]


def validate_sqlite_counts():
    """Print SQLite row counts for reference."""
    logger.info("\n── SQLite row counts (source) ───────────────────────")
    cur = sqlite_conn.cursor()
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
    tables = [r[0] for r in cur.fetchall() if r[0] != "alembic_version"]
    totals = {}
    for t in tables:
        cur.execute(f'SELECT COUNT(*) FROM "{t}"')
        cnt = cur.fetchone()[0]
        totals[t] = cnt
        logger.info(f"  {t:<35} {cnt:>6} rows")
    return totals


def validate_postgres_counts(conn, expected: dict):
    """Print PostgreSQL row counts and compare with SQLite."""
    logger.info("\n── PostgreSQL row counts (after migration) ──────────")
    all_ok = True
    for table, exp_cnt in expected.items():
        try:
            pg_cnt = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
            status = "✓" if pg_cnt >= exp_cnt else "⚠"
            if pg_cnt < exp_cnt:
                all_ok = False
            logger.info(f"  {table:<35} SQLite={exp_cnt:>5}  PG={pg_cnt:>5}  {status}")
        except Exception as e:
            logger.warning(f"  {table}: ERROR — {e}")
            all_ok = False
    return all_ok


# ── Main migration ────────────────────────────────────────────────────────────

def main():
    logger.info("\n" + "=" * 60)
    logger.info("  SWARA SQLite → PostgreSQL Migration")
    logger.info("=" * 60)

    sqlite_counts = validate_sqlite_counts()

    with pg_engine.begin() as conn:
        # Temporarily disable FK checks during bulk insert
        # (PostgreSQL doesn't have a single global toggle, so we rely on ordering)

        total_inserted = 0

        for table in MIGRATION_ORDER:
            if table not in sqlite_counts:
                logger.info(f"  [skip] {table}: not in SQLite")
                continue

            rows = sqlite_rows(table)
            logger.info(f"\n  → {table}: {len(rows)} SQLite rows …")

            n = upsert_rows(conn, table, rows)
            reset_sequence(conn, table)

            logger.info(f"     inserted {n} new rows (skipped {len(rows) - n} already-existing)")
            total_inserted += n

    logger.info(f"\n  Total rows inserted: {total_inserted}")

    # Validation
    with pg_engine.connect() as conn:
        all_ok = validate_postgres_counts(conn, sqlite_counts)

    logger.info("\n" + "=" * 60)
    if all_ok:
        logger.info("  ✅  Migration COMPLETE — all row counts match or exceed SQLite")
    else:
        logger.warning("  ⚠   Migration completed with warnings — check row counts above")
    logger.info("=" * 60 + "\n")


if __name__ == "__main__":
    main()
