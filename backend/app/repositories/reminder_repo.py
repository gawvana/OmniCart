from uuid import UUID
from typing import Optional, List
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_
from app.models.activity import Reminder

class ReminderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get(self, reminder_id: UUID) -> Optional[Reminder]:
        stmt = select(Reminder).where(Reminder.id == reminder_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_reminders(self, user_id: UUID, after: Optional[datetime] = None) -> List[Reminder]:
        stmt = select(Reminder).where(Reminder.user_id == user_id)
        if after:
            stmt = stmt.where(and_(Reminder.remind_at >= after, Reminder.is_completed == False))
        stmt = stmt.order_by(Reminder.remind_at.asc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, user_id: UUID, title: str, description: Optional[str], remind_at: datetime) -> Reminder:
        reminder = Reminder(
            user_id=user_id,
            title=title,
            description=description,
            remind_at=remind_at,
            is_completed=False,
            created_at=datetime.now(timezone.utc)
        )
        self.session.add(reminder)
        await self.session.flush()
        return reminder

    async def update(self, reminder_id: UUID, **kwargs) -> Optional[Reminder]:
        stmt = update(Reminder).where(Reminder.id == reminder_id).values(**kwargs).returning(Reminder)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def get_due_reminders(self, before: datetime) -> List[Reminder]:
        stmt = select(Reminder).where(
            and_(Reminder.remind_at <= before, Reminder.is_completed == False)
        ).order_by(Reminder.remind_at.asc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
