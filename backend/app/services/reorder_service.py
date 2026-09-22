import statistics
from uuid import UUID
from typing import List, Any
from datetime import datetime, timedelta, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.reorder_repository import ReorderRepository
from app.services.history_service import HistoryService
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class ReorderService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.history_service = HistoryService(session)

    async def get_suggestions(self, user_id: UUID) -> List[Any]:
        repo = ReorderRepository(self.session)
        return await repo.get_pending_suggestions(user_id)

    async def accept(self, user_id: UUID, event_id: UUID) -> Any:
        repo = ReorderRepository(self.session)
        event = await repo.get(event_id)
        
        if not event:
            raise NotFoundError("Reorder event not found")
        if event.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        updated = await repo.update(event_id, status="accepted", acted_upon_at=datetime.now(timezone.utc))
        return updated

    async def dismiss(self, user_id: UUID, event_id: UUID) -> Any:
        repo = ReorderRepository(self.session)
        event = await repo.get(event_id)
        
        if not event:
            raise NotFoundError("Reorder event not found")
        if event.user_id != user_id:
            raise AuthorizationError("Access denied")
            
        updated = await repo.update(event_id, status="dismissed", acted_upon_at=datetime.now(timezone.utc))
        return updated

    async def calculate_reorders(self, user_id: UUID) -> List[Any]:
        repo = ReorderRepository(self.session)
        
        # In a real app, this would use a more complex SQL aggregation or ML model
        # Here we retrieve frequent products, fetch their intervals
        # Assuming history_repo can give us products with >= 3 purchases for this user
        products_to_check = await repo.get_frequent_product_ids(user_id, min_purchases=3)
        
        new_events = []
        now = datetime.now(timezone.utc)
        
        for product_id in products_to_check:
            # Check if there is already a pending event for this product
            pending = await repo.get_pending_for_product(user_id, product_id)
            if pending:
                continue
                
            intervals = await self.history_service.get_product_intervals(user_id, product_id)
            if len(intervals) < 2:
                continue
                
            avg_interval = statistics.mean(intervals)
            if not (3.0 <= avg_interval <= 90.0):
                continue
                
            # Confidence based on std dev
            std_dev = statistics.stdev(intervals) if len(intervals) > 2 else avg_interval * 0.5
            # Simple confidence score: bounded between 0 and 1
            confidence = max(0.0, min(1.0, 1.0 - (std_dev / avg_interval)))
            
            if confidence >= 0.5:
                # Get last purchase date
                last_purchase = await repo.get_last_purchase_date(user_id, product_id)
                if not last_purchase:
                    continue
                    
                next_expected_at = last_purchase + timedelta(days=avg_interval)
                
                # If it's expected soon or already overdue
                if next_expected_at <= now + timedelta(days=2):
                    event = await repo.create(
                        user_id=user_id,
                        product_id=product_id,
                        expected_interval_days=int(avg_interval),
                        confidence=confidence,
                        next_expected_at=next_expected_at,
                        status="pending"
                    )
                    new_events.append(event)
                    
        logger.info("Calculated reorders", user_id=str(user_id), new_events_count=len(new_events))
        return new_events
