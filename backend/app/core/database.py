"""
FluxStock — Async SQLAlchemy engine & session factory.
"""

import logging
from collections.abc import AsyncGenerator

from fastapi import HTTPException
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

logger = logging.getLogger(__name__)

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    future=True,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — yields an async DB session per request."""
    async with async_session() as session:
        try:
            yield session
            await session.commit()
        except HTTPException:
            # HTTPException is a normal control flow in FastAPI,
            # not a DB error — commit any pending work and re-raise.
            await session.commit()
            raise
        except Exception:
            logger.exception("Database session error — rolling back")
            await session.rollback()
            raise


async def create_tables():
    """Create all tables from ORM metadata (dev convenience).
    In production, use Alembic migrations instead."""
    from app.models.base import Base
    # Import all models so they are registered on Base.metadata
    import app.models  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables ensured.")
