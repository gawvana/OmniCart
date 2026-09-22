from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.models.notification import Notification, Reminder

class NotificationRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_notifications(self, user_id: UUID, unread_only: bool, limit: int) -> list[Notification]:
        stmt = select(Notification).where(Notification.user_id == user_id).order_by(Notification.created_at.desc()).limit(limit)
        if unread_only:
            stmt = stmt.where(Notification.is_read == False)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, user_id: UUID, type: str, title: str, body: str, data: dict) -> Notification:
        notification = Notification(user_id=user_id, type=type, title=title, body=body, data=data, is_read=False)
        self.session.add(notification)
        await self.session.flush()
        return notification

    async def mark_read(self, notification_id: UUID) -> None:
        stmt = update(Notification).where(Notification.id == notification_id).values(is_read=True)
        await self.session.execute(stmt)
        await self.session.flush()

    async def mark_all_read(self, user_id: UUID) -> None:
        stmt = update(Notification).where(Notification.user_id == user_id, Notification.is_read == False).values(is_read=True)
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_reminders(self, user_id: UUID, upcoming_only: bool) -> list[Reminder]:
        stmt = select(Reminder).where(Reminder.user_id == user_id).order_by(Reminder.remind_at)
        if upcoming_only:
            stmt = stmt.where(Reminder.remind_at > datetime.now(timezone.utc), Reminder.is_completed == False)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_reminder(self, user_id: UUID, title: str, description: Optional[str], remind_at: datetime) -> Reminder:
        reminder = Reminder(user_id=user_id, title=title, description=description, remind_at=remind_at, is_completed=False)
        self.session.add(reminder)
        await self.session.flush()
        return reminder

    async def complete_reminder(self, reminder_id: UUID) -> None:
        stmt = update(Reminder).where(Reminder.id == reminder_id).values(is_completed=True)
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_due_reminders(self) -> list[Reminder]:
        now = datetime.now(timezone.utc)
        stmt = select(Reminder).where(Reminder.remind_at <= now, Reminder.is_completed == False)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
