import pytest
import asyncio
import sys
from uuid import uuid4
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
import app.core.exceptions
sys.modules["backend.app.core.exceptions"] = app.core.exceptions
from backend.app.db.base import Base
from backend.app.models import *  # Import all models

# Use SQLite for tests (faster, no Docker needed)
TEST_DATABASE_URL = "sqlite+aiosqlite:///./test_omnicart.db"


@pytest.fixture
async def engine():
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()

@pytest.fixture
async def session(engine):
    session_factory = async_sessionmaker(engine, expire_on_commit=False)
    async with session_factory() as session:
        yield session
        await session.rollback()

@pytest.fixture
async def test_user(session):
    from backend.app.models.user import User
    user = User(
        id=uuid4(),
        telegram_user_id=123456789,
        username='testuser',
        first_name='Test',
        last_name='User',
        language='ru',
        currency='UZS',
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

@pytest.fixture
async def test_list(session, test_user):
    from backend.app.models.shopping import ShoppingList
    lst = ShoppingList(
        id=uuid4(),
        owner_id=test_user.id,
        name='Мой список',
        is_default=True,
    )
    session.add(lst)
    await session.commit()
    await session.refresh(lst)
    return lst

@pytest.fixture
async def test_categories(session):
    from backend.app.models.product import Category
    categories = [
        Category(id=1, name='Овощи и фрукты', emoji='🥬', sort_order=1),
        Category(id=2, name='Мясо и птица', emoji='🥩', sort_order=2),
        Category(id=3, name='Молочные продукты', emoji='🥛', sort_order=3),
        Category(id=4, name='Хлеб и выпечка', emoji='🍞', sort_order=4),
    ]
    for cat in categories:
        session.add(cat)
    await session.commit()
    return categories
