from uuid import UUID
from typing import Dict, Any, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_
from app.models.shopping import ShoppingItem
from app.models.history import PurchaseHistory
from app.models.product import Product, Favorite
from app.models.list import ShoppingList

class SearchRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def global_search(self, user_id: UUID, query: str, limit: int = 20) -> Dict[str, List[Dict[str, Any]]]:
        pattern = f"%{query}%"

        # 1. Search shopping items in user lists
        items_stmt = (
            select(ShoppingItem)
            .join(ShoppingList, ShoppingItem.list_id == ShoppingList.id)
            .where(
                and_(
                    ShoppingList.owner_id == user_id,
                    or_(ShoppingItem.name.ilike(pattern), ShoppingItem.normalized_name.ilike(pattern))
                )
            )
            .limit(limit)
        )
        items_res = await self.session.execute(items_stmt)
        items = [
            {"id": str(i.id), "name": i.name, "list_id": str(i.list_id), "is_purchased": i.is_purchased}
            for i in items_res.scalars().all()
        ]

        # 2. Search purchase history
        history_stmt = (
            select(PurchaseHistory)
            .where(
                and_(
                    PurchaseHistory.user_id == user_id,
                    PurchaseHistory.item_name.ilike(pattern)
                )
            )
            .order_by(PurchaseHistory.purchased_at.desc())
            .limit(limit)
        )
        hist_res = await self.session.execute(history_stmt)
        history = [
            {"id": str(h.id), "name": h.item_name, "price": float(h.price) if h.price else 0, "purchased_at": h.purchased_at.isoformat()}
            for h in hist_res.scalars().all()
        ]

        # 3. Search catalog products
        products_stmt = (
            select(Product)
            .where(or_(Product.name.ilike(pattern), Product.normalized_name.ilike(pattern)))
            .limit(limit)
        )
        prod_res = await self.session.execute(products_stmt)
        products = [
            {"id": str(p.id), "name": p.name, "category_id": p.category_id, "default_unit": p.default_unit}
            for p in prod_res.scalars().all()
        ]

        # 4. Search user favorites
        fav_stmt = (
            select(Favorite)
            .join(Product, Favorite.product_id == Product.id)
            .where(
                and_(
                    Favorite.user_id == user_id,
                    Product.name.ilike(pattern)
                )
            )
            .limit(limit)
        )
        fav_res = await self.session.execute(fav_stmt)
        favorites = [
            {"id": str(f.id), "product_id": str(f.product_id), "name": f.product.name if f.product else ""}
            for f in fav_res.scalars().all()
        ]

        return {
            "items": items,
            "history": history,
            "products": products,
            "favorites": favorites
        }
