from uuid import UUID
from typing import List, Dict, Any, Optional, Tuple
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.history_repository import HistoryRepository
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class HistoryService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def record_purchase(self, user_id: UUID, item: Any) -> Any:
        history_repo = HistoryRepository(self.session)
        record = await history_repo.create_from_item(user_id, item)
        logger.info("Purchase recorded", user_id=str(user_id), item_id=str(item.id))
        return record

    async def get_history(
        self, 
        user_id: UUID, 
        cursor: Optional[str], 
        limit: int, 
        filters: Optional[Dict[str, Any]]
    ) -> Tuple[List[Any], Optional[str], bool]:
        history_repo = HistoryRepository(self.session)
        return await history_repo.get_paginated_history(
            user_id=user_id,
            cursor=cursor,
            limit=limit,
            filters=filters or {}
        )

    async def get_product_intervals(self, user_id: UUID, product_id: UUID) -> List[float]:
        history_repo = HistoryRepository(self.session)
        records = await history_repo.get_by_product(user_id, product_id, limit=20)
        
        if len(records) < 2:
            return []
            
        intervals = []
        for i in range(len(records) - 1):
            date1 = records[i].purchased_at
            date2 = records[i + 1].purchased_at
            # difference in days
            diff_days = (date1 - date2).total_seconds() / 86400.0
            if diff_days > 0:
                intervals.append(diff_days)
                
        return intervals
