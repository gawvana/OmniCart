from uuid import UUID
from typing import Optional
from datetime import datetime, timedelta, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from decimal import Decimal
from app.models.price import PriceObservation

class PriceRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create_observation(self, product_id: UUID, price: Decimal, currency: str, unit: str, source: str, store_id: Optional[UUID], market_id: Optional[UUID], reported_by: Optional[UUID], confidence: float) -> PriceObservation:
        obs = PriceObservation(
            product_id=product_id,
            price=price,
            currency=currency,
            unit=unit,
            source=source,
            store_id=store_id,
            market_id=market_id,
            reported_by=reported_by,
            confidence=confidence,
            observed_at=datetime.now(timezone.utc)
        )
        self.session.add(obs)
        await self.session.flush()
        return obs

    async def get_product_prices(self, product_id: UUID, days: int = 30) -> list[PriceObservation]:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = select(PriceObservation).where(
            and_(PriceObservation.product_id == product_id, PriceObservation.observed_at >= since)
        ).order_by(PriceObservation.observed_at.desc())
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_price_stats(self, product_id: UUID, days: int = 30) -> dict:
        since = datetime.now(timezone.utc) - timedelta(days=days)
        stmt = select(
            func.avg(PriceObservation.price),
            func.min(PriceObservation.price),
            func.max(PriceObservation.price)
        ).where(
            and_(PriceObservation.product_id == product_id, PriceObservation.observed_at >= since)
        )
        result = await self.session.execute(stmt)
        row = result.first()
        
        current = await self.get_latest_price(product_id)
        
        return {
            "current": current.price if current else None,
            "average": row[0],
            "median": None, # Approximate median not easily done in simple SQL, depends on dialect
            "min": row[1],
            "max": row[2]
        }

    async def get_latest_price(self, product_id: UUID) -> Optional[PriceObservation]:
        stmt = select(PriceObservation).where(PriceObservation.product_id == product_id).order_by(PriceObservation.observed_at.desc()).limit(1)
        result = await self.session.execute(stmt)
        return result.scalars().first()
