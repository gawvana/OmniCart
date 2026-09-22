from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete, or_
from sqlalchemy.orm import joinedload
from app.models.product import Product, Category, Favorite

class ProductRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, product_id: UUID) -> Optional[Product]:
        stmt = select(Product).where(Product.id == product_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_normalized_name(self, name: str) -> Optional[Product]:
        stmt = select(Product).where(Product.normalized_name == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def find_by_alias(self, alias: str) -> Optional[Product]:
        # Simplistic implementation if alias mapping exists in a separate table, but for now assuming normalized_name check
        return await self.get_by_normalized_name(alias)

    async def create(self, name: str, normalized_name: str, category_id: Optional[int], default_unit: str) -> Product:
        product = Product(
            name=name,
            normalized_name=normalized_name,
            category_id=category_id,
            default_unit=default_unit
        )
        self.session.add(product)
        await self.session.flush()
        return product

    async def get_categories(self) -> list[Category]:
        stmt = select(Category).order_by(Category.sort_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def search_products(self, query: str, limit: int = 20) -> list[Product]:
        stmt = select(Product).where(
            or_(
                Product.name.ilike(f"%{query}%"),
                Product.normalized_name.ilike(f"%{query}%")
            )
        ).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_favorites(self, user_id: UUID) -> list[Favorite]:
        stmt = select(Favorite).options(joinedload(Favorite.product)).where(Favorite.user_id == user_id).order_by(Favorite.sort_order)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def add_favorite(self, user_id: UUID, product_id: UUID) -> Favorite:
        stmt = select(Favorite).where(and_(Favorite.user_id == user_id, Favorite.product_id == product_id))
        result = await self.session.execute(stmt)
        if result.scalars().first():
            return result.scalars().first()

        favorite = Favorite(user_id=user_id, product_id=product_id, sort_order=0)
        self.session.add(favorite)
        await self.session.flush()
        return favorite

    async def remove_favorite(self, user_id: UUID, product_id: UUID) -> None:
        stmt = delete(Favorite).where(and_(Favorite.user_id == user_id, Favorite.product_id == product_id))
        await self.session.execute(stmt)
        await self.session.flush()
