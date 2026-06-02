"""
Async SQLAlchemy database configuration and session management
"""

import os
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool

# =====================================================================
# Database Configuration
# =====================================================================
DB_USER = os.getenv("DB_USER", "cfms_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "cfms_password")
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "3306")
DB_NAME = os.getenv("DB_NAME", "CFMS")

# MySQL 8.0+ async connection string using aiomysql
DATABASE_URL = f"mysql+aiomysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}?charset=utf8mb4"

# =====================================================================
# Async Engine and Session Factory
# =====================================================================
engine = create_async_engine(
    DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "False").lower() == "true",  # Set True for SQL debugging
    future=True,
    pool_pre_ping=True,  # Verify connections before using
    poolclass=NullPool,  # Optional: disable pooling for serverless environments
)

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
    autocommit=False,
)


# =====================================================================
# Dependency for FastAPI
# =====================================================================
async def get_db() -> AsyncSession:
    """
    FastAPI dependency to provide async database session.
    
    Usage:
        @router.get("/items")
        async def get_items(db: AsyncSession = Depends(get_db)):
            result = await db.execute(select(Item))
            ...
    
    Yields:
        AsyncSession for the request lifetime
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
