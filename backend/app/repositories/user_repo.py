from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user import User, UserSettings

class UserRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, user_id: UUID) -> Optional[User]:
        stmt = select(User).where(User.id == user_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_telegram_id(self, telegram_id: int) -> Optional[User]:
        stmt = select(User).where(User.telegram_user_id == telegram_id, User.is_deleted == False)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, telegram_user_id: int, username: Optional[str], first_name: str, last_name: Optional[str], language: str) -> User:
        user = User(
            telegram_user_id=telegram_user_id,
            username=username,
            first_name=first_name,
            last_name=last_name,
            language=language
        )
        self.session.add(user)
        await self.session.flush()
        return user

    async def update(self, user_id: UUID, **kwargs) -> User:
        stmt = update(User).where(User.id == user_id).values(**kwargs).returning(User)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def get_settings(self, user_id: UUID) -> Optional[UserSettings]:
        stmt = select(UserSettings).where(UserSettings.id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create_settings(self, user_id: UUID, **kwargs) -> UserSettings:
        settings = UserSettings(id=user_id, **kwargs)
        self.session.add(settings)
        await self.session.flush()
        return settings

    async def update_settings(self, user_id: UUID, **kwargs) -> UserSettings:
        stmt = update(UserSettings).where(UserSettings.id == user_id).values(**kwargs).returning(UserSettings)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def soft_delete(self, user_id: UUID) -> None:
        stmt = update(User).where(User.id == user_id).values(is_deleted=True)
        await self.session.execute(stmt)
        await self.session.flush()

    async def update_last_seen(self, user_id: UUID) -> None:
        stmt = update(User).where(User.id == user_id).values(last_seen_at=datetime.now(timezone.utc))
        await self.session.execute(stmt)
        await self.session.flush()
