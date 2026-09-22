import statistics
from decimal import Decimal
from uuid import UUID
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.price_repository import PriceRepository
from app.repositories.product_repository import ProductRepository
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class PriceService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def report_price(self, user_id: UUID, product_id: UUID, price: Decimal, **kwargs) -> Any:
        price_repo = PriceRepository(self.session)
        observation = await price_repo.create(
            user_id=user_id,
            product_id=product_id,
            price=price,
            **kwargs
        )
        logger.info("Price reported", product_id=str(product_id), price=float(price))
        return observation

    def _filter_outliers(self, prices: List[float]) -> List[float]:
        if not prices:
            return []
        if len(prices) < 4:
            return prices
            
        prices_sorted = sorted(prices)
        q1_idx = len(prices_sorted) // 4
        q3_idx = (len(prices_sorted) * 3) // 4
        q1 = prices_sorted[q1_idx]
        q3 = prices_sorted[q3_idx]
        iqr = q3 - q1
        
        lower_bound = q1 - (1.5 * iqr)
        upper_bound = q3 + (1.5 * iqr)
        
        return [p for p in prices if lower_bound <= p <= upper_bound]

    async def get_price_history(self, product_id: UUID, days: int = 30) -> Dict[str, Any]:
        price_repo = PriceRepository(self.session)
        cutoff_date = datetime.now(timezone.utc) - timedelta(days=days)
        
        observations = await price_repo.get_by_product(product_id, since=cutoff_date)
        
        if not observations:
            return {
                "product_id": product_id,
                "current_price": None,
                "stats": {"min": None, "max": None, "avg": None, "median": None},
                "history": []
            }
            
        prices = [float(obs.price) for obs in observations]
        filtered_prices = self._filter_outliers(prices)
        
        if not filtered_prices:
            filtered_prices = prices
            
        median_price = statistics.median(filtered_prices)
        
        history_data = [
            {
                "date": obs.created_at.isoformat(),
                "price": float(obs.price),
                "store": obs.store_name
            }
            for obs in observations
        ]
        
        return {
            "product_id": product_id,
            "current_price": median_price,
            "stats": {
                "min": min(filtered_prices),
                "max": max(filtered_prices),
                "avg": sum(filtered_prices) / len(filtered_prices),
                "median": median_price
            },
            "history": history_data
        }

    async def get_product_price_history(self, product_name: str, days: int = 30) -> Dict[str, Any]:
        product_repo = ProductRepository(self.session)
        product = await product_repo.find_by_name_or_alias(product_name.strip().lower())
        
        if not product:
            raise NotFoundError("Product not found")
            
        return await self.get_price_history(product.id, days)
