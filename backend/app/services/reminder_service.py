from uuid import UUID
from typing import List, Any, Optional
from datetime import datetime, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.reminder_repository import ReminderRepository
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class ReminderService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_reminders(self, user_id: UUID, upcoming_only: bool = True) -> List[Any]:
        repo = ReminderRepository(self.session)
        now = datetime.now(timezone.utc) if upcoming_only else None
        return await repo.get_user_reminders(user_id, after=now)

    async def create(
        self, 
        user_id: UUID, 
        title: str, 
        description: Optional[str], 
        remind_at: datetime
    ) -> Any:
        repo = ReminderRepository(self.session)
        reminder = await repo.create(
            user_id=user_id,
            title=title,
            description=description,
            remind_at=remind_at
        )
        logger.info("Reminder created", reminder_id=str(reminder.id), user_id=str(user_id))
        return reminder

    async def complete(self, user_id: UUID, reminder_id: UUID) -> Any:
        repo = ReminderRepository(self.session)
        reminder = await repo.get(reminder_id)
        
        if not reminder:
            raise NotFoundError("Reminder not found")
        if reminder.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        updated = await repo.update(reminder_id, is_completed=True, completed_at=datetime.now(timezone.utc))
        return updated

    @staticmethod
    async def get_due(session: AsyncSession) -> List[Any]:
        repo = ReminderRepository(session)
        now = datetime.now(timezone.utc)
        return await repo.get_due_reminders(now)
