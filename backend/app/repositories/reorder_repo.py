from uuid import UUID
from typing import Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, func
from app.models.recurring import SmartReorderEvent
from app.models.history import PurchaseHistory

class ReorderRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_pending(self, user_id: UUID) -> list[SmartReorderEvent]:
        stmt = select(SmartReorderEvent).where(
            SmartReorderEvent.user_id == user_id,
            SmartReorderEvent.status == 'pending'
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, **kwargs) -> SmartReorderEvent:
        from app.models.product import Product
        from datetime import timezone
        if 'expected_interval_days' in kwargs and 'estimated_interval_days' not in kwargs:
            kwargs['estimated_interval_days'] = float(kwargs.pop('expected_interval_days'))
        if 'last_purchase_at' not in kwargs:
            kwargs['last_purchase_at'] = kwargs.pop('last_purchase', None) or datetime.now(timezone.utc)
        if 'product_name' not in kwargs and 'product_id' in kwargs:
            prod = await self.session.get(Product, kwargs['product_id'])
            kwargs['product_name'] = prod.name if prod else 'Товар'
        event = SmartReorderEvent(**kwargs)
        self.session.add(event)
        await self.session.flush()
        return event

    async def update_status(self, event_id: UUID, status: str) -> SmartReorderEvent:
        stmt = update(SmartReorderEvent).where(SmartReorderEvent.id == event_id).values(status=status).returning(SmartReorderEvent)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def get_by_id(self, event_id: UUID) -> Optional[SmartReorderEvent]:
        stmt = select(SmartReorderEvent).where(SmartReorderEvent.id == event_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_frequent_product_ids(self, user_id: UUID, min_purchases: int = 3) -> list[UUID]:
        stmt = (
            select(PurchaseHistory.product_id)
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.product_id.is_not(None)
                )
            )
            .group_by(PurchaseHistory.product_id)
            .having(func.count(PurchaseHistory.id) >= min_purchases)
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_pending_for_product(self, user_id: UUID, product_id: UUID) -> Optional[SmartReorderEvent]:
        stmt = select(SmartReorderEvent).where(
            and_(
                SmartReorderEvent.user_id == user_id,
                SmartReorderEvent.product_id == product_id,
                SmartReorderEvent.status == 'pending'
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_last_purchase_date(self, user_id: UUID, product_id: UUID) -> Optional[datetime]:
        stmt = (
            select(PurchaseHistory.purchased_at)
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.product_id == product_id
                )
            )
            .order_by(PurchaseHistory.purchased_at.desc())
            .limit(1)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update(self, event_id: UUID, **kwargs) -> Optional[SmartReorderEvent]:
        stmt = update(SmartReorderEvent).where(SmartReorderEvent.id == event_id).values(**kwargs).returning(SmartReorderEvent)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    get = get_by_id
    get_pending_suggestions = get_pending

