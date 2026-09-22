from uuid import UUID
from typing import List, Dict, Any, Optional
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.notification_repository import NotificationRepository
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class NotificationService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_notifications(self, user_id: UUID, unread_only: bool = False, limit: int = 50) -> List[Any]:
        repo = NotificationRepository(self.session)
        return await repo.get_user_notifications(user_id, unread_only, limit)

    async def create(
        self, 
        user_id: UUID, 
        type: str, 
        title: str, 
        body: str, 
        data: Optional[Dict[str, Any]] = None
    ) -> Any:
        repo = NotificationRepository(self.session)
        notification = await repo.create(
            user_id=user_id,
            type=type,
            title=title,
            body=body,
            data=data or {}
        )
        logger.info("Notification created", notification_id=str(notification.id), user_id=str(user_id))
        return notification

    async def mark_read(self, user_id: UUID, notification_id: UUID) -> None:
        repo = NotificationRepository(self.session)
        notification = await repo.get(notification_id)
        
        if not notification:
            raise NotFoundError("Notification not found")
        if notification.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        await repo.update(notification_id, is_read=True)

    async def mark_all_read(self, user_id: UUID) -> None:
        repo = NotificationRepository(self.session)
        await repo.mark_all_as_read(user_id)
        logger.info("All notifications marked as read", user_id=str(user_id))
