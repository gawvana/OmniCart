from uuid import UUID
from typing import List, Any
from datetime import datetime, timedelta, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.recurring_repository import RecurringRepository
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class RecurringService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_items(self, user_id: UUID) -> List[Any]:
        repo = RecurringRepository(self.session)
        return await repo.get_by_user(user_id)

    async def create(self, user_id: UUID, **kwargs) -> Any:
        repo = RecurringRepository(self.session)
        
        interval_days = kwargs.get("interval_days", 7)
        now = datetime.now(timezone.utc)
        
        kwargs["user_id"] = user_id
        if "next_due_at" not in kwargs:
            kwargs["next_due_at"] = now + timedelta(days=interval_days)
            
        item = await repo.create(**kwargs)
        logger.info("Recurring item created", item_id=str(item.id), user_id=str(user_id))
        return item

    async def update(self, user_id: UUID, item_id: UUID, **kwargs) -> Any:
        repo = RecurringRepository(self.session)
        item = await repo.get(item_id)
        
        if not item:
            raise NotFoundError("Recurring item not found")
        if item.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        if "interval_days" in kwargs and kwargs["interval_days"] != item.interval_days:
            # Recalculate next_due_at if interval changed and not explicitly set
            if "next_due_at" not in kwargs:
                last_added = item.last_added_at or item.created_at
                kwargs["next_due_at"] = last_added + timedelta(days=kwargs["interval_days"])
                
        updated = await repo.update(item_id, **kwargs)
        logger.info("Recurring item updated", item_id=str(item_id))
        return updated

    async def delete(self, user_id: UUID, item_id: UUID) -> None:
        repo = RecurringRepository(self.session)
        item = await repo.get(item_id)
        
        if not item:
            raise NotFoundError("Recurring item not found")
        if item.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        await repo.delete(item_id)
        logger.info("Recurring item deleted", item_id=str(item_id))

    async def get_due_items(self, user_id: UUID) -> List[Any]:
        repo = RecurringRepository(self.session)
        now = datetime.now(timezone.utc)
        return await repo.get_due_items_by_user(user_id, current_time=now)

    async def mark_added(self, item_id: UUID) -> Any:
        repo = RecurringRepository(self.session)
        item = await repo.get(item_id)
        
        if not item:
            raise NotFoundError("Recurring item not found")
            
        now = datetime.now(timezone.utc)
        next_due = now + timedelta(days=item.interval_days)
        
        updated = await repo.update(
            item_id,
            last_added_at=now,
            next_due_at=next_due
        )
        return updated
