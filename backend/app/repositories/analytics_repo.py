from uuid import UUID
from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.history import PurchaseHistory

class AnalyticsRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_overview(self, user_id: UUID, since: datetime) -> Dict[str, Any]:
        stmt = (
            select(
                func.coalesce(func.sum(PurchaseHistory.price), 0).label("total_spent"),
                func.count(PurchaseHistory.id).label("total_items"),
                func.count(func.distinct(PurchaseHistory.shopping_list_id)).label("total_trips")
            )
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.purchased_at >= since
                )
            )
        )
        res = await self.session.execute(stmt)
        row = res.first()
        total_spent = float(row.total_spent) if row else 0.0
        total_items = int(row.total_items) if row else 0
        total_trips = int(row.total_trips) if row else 0
        avg_receipt = round(total_spent / total_trips, 2) if total_trips > 0 else 0.0

        return {
            "total_spent": total_spent,
            "total_items": total_items,
            "total_trips": total_trips,
            "avg_receipt": avg_receipt
        }

    async def get_spending_by_category(self, user_id: UUID, since: datetime) -> List[Dict[str, Any]]:
        stmt = (
            select(
                PurchaseHistory.category.label("category"),
                func.coalesce(func.sum(PurchaseHistory.price), 0).label("total_spent"),
                func.count(PurchaseHistory.id).label("items_count")
            )
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.purchased_at >= since
                )
            )
            .group_by(PurchaseHistory.category)
            .order_by(func.sum(PurchaseHistory.price).desc())
        )
        res = await self.session.execute(stmt)
        return [
            {
                "category": row.category or "Другое",
                "total_spent": float(row.total_spent),
                "items_count": int(row.items_count)
            }
            for row in res.all()
        ]

    async def get_spending_by_day(self, user_id: UUID, since: datetime, days: int = 30) -> List[Dict[str, Any]]:
        date_trunc = func.date_trunc('day', PurchaseHistory.purchased_at)
        stmt = (
            select(
                date_trunc.label("day"),
                func.coalesce(func.sum(PurchaseHistory.price), 0).label("amount")
            )
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.purchased_at >= since
                )
            )
            .group_by(date_trunc)
            .order_by(date_trunc.asc())
        )
        res = await self.session.execute(stmt)
        return [
            {
                "date": row.day.strftime("%Y-%m-%d") if hasattr(row.day, 'strftime') else str(row.day)[:10],
                "amount": float(row.amount)
            }
            for row in res.all()
        ]

    async def get_frequent_products(self, user_id: UUID, limit: int = 10) -> List[Dict[str, Any]]:
        stmt = (
            select(
                PurchaseHistory.product_name.label("name"),
                func.count(PurchaseHistory.id).label("purchase_count"),
                func.avg(PurchaseHistory.price).label("avg_price")
            )
            .where(PurchaseHistory.user_id == user_id)
            .group_by(PurchaseHistory.product_name)
            .order_by(func.count(PurchaseHistory.id).desc())
            .limit(limit)
        )
        res = await self.session.execute(stmt)
        return [
            {
                "name": row.name,
                "purchase_count": int(row.purchase_count),
                "avg_price": round(float(row.avg_price), 2) if row.avg_price else 0.0
            }
            for row in res.all()
        ]
