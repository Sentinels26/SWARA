"""
SWARA Database Layer — supports both SQLite (local dev) and PostgreSQL (production).

LOCAL:      DATABASE_URL not set → uses sqlite:///./swara.db
PRODUCTION: DATABASE_URL=postgresql://... → uses PostgreSQL with connection pooling
"""

import os
import logging
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool, QueuePool

logger = logging.getLogger(__name__)

# ── URL resolution ──────────────────────────────────────────────────────────
DATABASE_URL = os.getenv("DATABASE_URL", "")

# Render / Railway sometimes emit postgres:// instead of postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_POSTGRES = DATABASE_URL.startswith("postgresql")

if IS_POSTGRES:
    # Production: PostgreSQL with proper connection pooling for serverless
    # NullPool avoids connection leaks in short-lived serverless invocations.
    # For high-throughput use, swap to QueuePool with pool_size=5, max_overflow=10.
    engine = create_engine(
        DATABASE_URL,
        poolclass=NullPool,        # safe for Vercel/serverless; no persistent pool
        echo=False,
        future=True,
    )
    logger.info("[DB] Using PostgreSQL")
else:
    # Local development: SQLite with WAL for concurrency
    SQLITE_URL = DATABASE_URL if DATABASE_URL else "sqlite:///./swara.db"
    engine = create_engine(
        SQLITE_URL,
        connect_args={"check_same_thread": False, "timeout": 30},
        echo=False,
        future=True,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_connection, connection_record):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA busy_timeout=30000")
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    logger.info("[DB] Using SQLite (local development)")

# ── Session factory ─────────────────────────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False,   # safe for serverless: don't re-query after commit
)

Base = declarative_base()


def get_db():
    """FastAPI dependency: yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def health_check_db() -> bool:
    """Quick connection check used by /health endpoint."""
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        return True
    except Exception as e:
        logger.error(f"[DB] Health check failed: {e}")
        return False
