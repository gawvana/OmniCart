from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.user import UserSettings

class SettingsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: UUID) -> Optional[UserSettings]:
        stmt = select(UserSettings).where(UserSettings.user_id == user_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, user_id: UUID, **kwargs) -> UserSettings:
        settings = UserSettings(user_id=user_id, **kwargs)
        self.session.add(settings)
        await self.session.flush()
        return settings

    async def update(self, settings_id: UUID, **kwargs) -> Optional[UserSettings]:
        stmt = update(UserSettings).where(UserSettings.id == settings_id).values(**kwargs).returning(UserSettings)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()
