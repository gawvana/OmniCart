from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.recurring import SmartReorderEvent

class ReorderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_pending(self, user_id: UUID) -> list[SmartReorderEvent]:
        stmt = select(SmartReorderEvent).where(
            SmartReorderEvent.user_id == user_id,
            SmartReorderEvent.status == 'pending'
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> SmartReorderEvent:
        event = SmartReorderEvent(**kwargs)
        self.session.add(event)
        await self.session.flush()
        return event

    async def update_status(self, event_id: UUID, status: str) -> SmartReorderEvent:
        stmt = update(SmartReorderEvent).where(SmartReorderEvent.id == event_id).values(status=status).returning(SmartReorderEvent)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def get_by_id(self, event_id: UUID) -> Optional[SmartReorderEvent]:
        stmt = select(SmartReorderEvent).where(SmartReorderEvent.id == event_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()
