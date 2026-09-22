from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_
from app.models.recurring import RecurringItem

class RecurringRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, item_id: UUID) -> Optional[RecurringItem]:
        stmt = select(RecurringItem).where(RecurringItem.id == item_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_items(self, user_id: UUID) -> list[RecurringItem]:
        stmt = select(RecurringItem).where(RecurringItem.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_due_items(self, user_id: UUID) -> list[RecurringItem]:
        now = datetime.now(timezone.utc)
        stmt = select(RecurringItem).where(
            and_(
                RecurringItem.user_id == user_id,
                RecurringItem.enabled == True,
                RecurringItem.next_due_at <= now
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> RecurringItem:
        item = RecurringItem(**kwargs)
        self.session.add(item)
        await self.session.flush()
        return item

    async def update(self, item_id: UUID, **kwargs) -> RecurringItem:
        stmt = update(RecurringItem).where(RecurringItem.id == item_id).values(**kwargs).returning(RecurringItem)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def delete(self, item_id: UUID) -> None:
        stmt = delete(RecurringItem).where(RecurringItem.id == item_id)
        await self.session.execute(stmt)
        await self.session.flush()
