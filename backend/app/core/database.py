import sys
from pathlib import Path
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

_backend_dir = str(Path(__file__).resolve().parent.parent.parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from backend.app.db.engine import engine, async_session_factory, get_session
from backend.app.db.base import Base

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session

async def init_db():
    import backend.app.models
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
