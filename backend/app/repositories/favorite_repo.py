from uuid import UUID
from typing import Optional, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete
from sqlalchemy.orm import joinedload
from app.models.product import Favorite, Product

class FavoriteRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_user_favorites(self, user_id: UUID) -> List[Favorite]:
        stmt = select(Favorite).options(joinedload(Favorite.product)).where(Favorite.user_id == user_id).order_by(Favorite.sort_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_user_favorites_with_products(self, user_id: UUID) -> List[Dict[str, Any]]:
        favorites = await self.get_user_favorites(user_id)
        return [
            {
                "id": str(f.id),
                "product_id": str(f.product_id),
                "name": f.product.name if f.product else "",
                "category_id": f.product.category_id if f.product else None,
                "default_unit": f.product.default_unit if f.product else "шт",
                "sort_order": f.sort_order
            }
            for f in favorites
        ]

    async def add(self, user_id: UUID, product_id: UUID) -> Favorite:
        stmt = select(Favorite).where(and_(Favorite.user_id == user_id, Favorite.product_id == product_id))
        result = await self.session.execute(stmt)
        existing = result.scalars().first()
        if existing:
            return existing
        favorite = Favorite(user_id=user_id, product_id=product_id)
        self.session.add(favorite)
        await self.session.flush()
        return favorite

    async def remove(self, user_id: UUID, product_id: UUID) -> bool:
        stmt = delete(Favorite).where(and_(Favorite.user_id == user_id, Favorite.product_id == product_id))
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.rowcount > 0
