from uuid import UUID
from typing import Optional, Any
from datetime import datetime, date
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from decimal import Decimal
from app.models.history import PurchaseHistory

class HistoryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, user_id: UUID, item_name: str, product_id: Optional[UUID], quantity: Decimal, unit: str, price: Optional[Decimal], currency: str, store_id: Optional[UUID], purchased_at: datetime) -> PurchaseHistory:
        history = PurchaseHistory(
            user_id=user_id,
            item_name=item_name,
            product_id=product_id,
            quantity=quantity,
            unit=unit,
            price=price,
            currency=currency,
            store_id=store_id,
            purchased_at=purchased_at
        )
        self.session.add(history)
        await self.session.flush()
        return history

    async def get_user_history(self, user_id: UUID, cursor: Optional[str], limit: int, filters: Optional[dict]) -> list[PurchaseHistory]:
        stmt = select(PurchaseHistory).where(PurchaseHistory.user_id == user_id).order_by(PurchaseHistory.purchased_at.desc()).limit(limit)
        if filters:
            if filters.get('start_date'):
                stmt = stmt.where(PurchaseHistory.purchased_at >= filters['start_date'])
            if filters.get('end_date'):
                stmt = stmt.where(PurchaseHistory.purchased_at <= filters['end_date'])
            if filters.get('store_id'):
                stmt = stmt.where(PurchaseHistory.store_id == filters['store_id'])
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_product(self, user_id: UUID, product_id: UUID, limit: int = 20) -> list[PurchaseHistory]:
        stmt = (
            select(PurchaseHistory)
            .where(and_(PurchaseHistory.user_id == user_id, PurchaseHistory.product_id == product_id))
            .order_by(PurchaseHistory.purchased_at.desc())
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_from_item(self, user_id: UUID, item: Any) -> PurchaseHistory:
        from datetime import timezone
        history = PurchaseHistory(
            user_id=user_id,
            item_name=item.name,
            product_id=getattr(item, "product_id", None),
            quantity=item.quantity if hasattr(item, "quantity") and item.quantity is not None else Decimal("1"),
            unit=getattr(item, "unit", "шт") or "шт",
            price=getattr(item, "price", None),
            currency=getattr(item, "currency", "UZS") or "UZS",
            store_id=getattr(item, "store_id", None),
            purchased_at=datetime.now(timezone.utc)
        )
        self.session.add(history)
        await self.session.flush()
        return history

    async def get_paginated_history(self, user_id: UUID, cursor: Optional[str], limit: int, filters: Optional[dict] = None) -> tuple[list[PurchaseHistory], Optional[str], bool]:
        items = await self.get_user_history(user_id, cursor=cursor, limit=limit + 1, filters=filters)
        has_more = len(items) > limit
        if has_more:
            items = items[:limit]
            next_cursor = str(items[-1].id)
        else:
            next_cursor = None
        return items, next_cursor, has_more

    async def get_product_purchase_dates(self, user_id: UUID, product_id: UUID) -> list[datetime]:
        stmt = select(PurchaseHistory.purchased_at).where(and_(PurchaseHistory.user_id == user_id, PurchaseHistory.product_id == product_id)).order_by(PurchaseHistory.purchased_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_spending_stats(self, user_id: UUID, start_date: date, end_date: date) -> dict:
        stmt = select(
            func.sum(PurchaseHistory.price),
            func.count(PurchaseHistory.id),
            func.avg(PurchaseHistory.price)
        ).where(
            and_(
                PurchaseHistory.user_id == user_id,
                PurchaseHistory.price.is_not(None),
                func.date(PurchaseHistory.purchased_at) >= start_date,
                func.date(PurchaseHistory.purchased_at) <= end_date
            )
        )
        result = await self.session.execute(stmt)
        row = result.first()
        return {
            "total_spent": row[0] or Decimal('0'),
            "count": row[1] or 0,
            "avg": row[2] or Decimal('0')
        }

    async def get_spending_by_category(self, user_id: UUID, start_date: date, end_date: date) -> list[dict]:
        # Assuming joining with product category is handled here or items have category
        pass

    async def get_spending_by_day(self, user_id: UUID, start_date: date, end_date: date) -> list[dict]:
        stmt = select(
            func.date(PurchaseHistory.purchased_at).label('day'),
            func.sum(PurchaseHistory.price)
        ).where(
            and_(
                PurchaseHistory.user_id == user_id,
                PurchaseHistory.price.is_not(None),
                func.date(PurchaseHistory.purchased_at) >= start_date,
                func.date(PurchaseHistory.purchased_at) <= end_date
            )
        ).group_by('day').order_by('day')
        result = await self.session.execute(stmt)
        return [{"date": str(row[0]), "amount": row[1]} for row in result.all()]

    async def get_frequent_products(self, user_id: UUID, limit: int = 10) -> list[dict]:
        stmt = select(
            PurchaseHistory.item_name,
            func.count(PurchaseHistory.id).label('count'),
            func.max(PurchaseHistory.purchased_at).label('last_purchased')
        ).where(PurchaseHistory.user_id == user_id).group_by(PurchaseHistory.item_name).order_by(func.count(PurchaseHistory.id).desc()).limit(limit)
        result = await self.session.execute(stmt)
        return [{"name": row[0], "count": row[1], "last_purchased": row[2]} for row in result.all()]
