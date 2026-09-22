from uuid import UUID
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.analytics_repository import AnalyticsRepository

logger = structlog.get_logger(__name__)

class AnalyticsService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_overview(self, user_id: UUID, days: int = 30) -> Dict[str, Any]:
        analytics_repo = AnalyticsRepository(self.session)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        return await analytics_repo.get_overview(user_id, since)

    async def get_by_category(self, user_id: UUID, days: int = 30) -> List[Dict[str, Any]]:
        analytics_repo = AnalyticsRepository(self.session)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        
        data = await analytics_repo.get_spending_by_category(user_id, since)
        total = sum((item.get("total_spent", 0) for item in data))
        
        for item in data:
            spent = item.get("total_spent", 0)
            item["percentage"] = round((spent / total) * 100, 2) if total > 0 else 0.0
            
        return data

    async def get_by_day(self, user_id: UUID, days: int = 30) -> List[Dict[str, Any]]:
        analytics_repo = AnalyticsRepository(self.session)
        since = datetime.now(timezone.utc) - timedelta(days=days)
        return await analytics_repo.get_spending_by_day(user_id, since, days)

    async def get_frequent_products(self, user_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
        analytics_repo = AnalyticsRepository(self.session)
        return await analytics_repo.get_frequent_products(user_id, limit)

    async def get_full_analytics(self, user_id: UUID, days: int = 30) -> Dict[str, Any]:
        return {
            "overview": await self.get_overview(user_id, days),
            "by_category": await self.get_by_category(user_id, days),
            "by_day": await self.get_by_day(user_id, days),
            "frequent_products": await self.get_frequent_products(user_id, limit=10),
            "period_days": days
        }
