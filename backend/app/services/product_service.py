import re
from uuid import UUID
from typing import List, Dict, Any, Optional
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.product_repository import ProductRepository
from app.repositories.favorite_repository import FavoriteRepository
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class ProductService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _normalize_name(self, name: str) -> str:
        return re.sub(r"\\s+", " ", name.strip().lower())

    async def resolve_or_create(self, name: str, category_id: Optional[int] = None, unit: str = 'шт') -> Any:
        product_repo = ProductRepository(self.session)
        normalized = self._normalize_name(name)
        
        product = await product_repo.find_by_name_or_alias(normalized)
        if product:
            return product
            
        new_product = await product_repo.create(
            name=name,
            normalized_name=normalized,
            category_id=category_id,
            default_unit=unit
        )
        logger.info("Product created", product_id=str(new_product.id), name=name)
        return new_product

    async def search(self, query: str, limit: int = 20) -> List[Any]:
        product_repo = ProductRepository(self.session)
        normalized_query = self._normalize_name(query)
        if not normalized_query:
            return []
        return await product_repo.search(normalized_query, limit=limit)

    async def get_categories(self) -> List[Any]:
        product_repo = ProductRepository(self.session)
        return await product_repo.get_all_categories()

    async def get_favorites(self, user_id: UUID) -> List[Dict[str, Any]]:
        fav_repo = FavoriteRepository(self.session)
        return await fav_repo.get_user_favorites_with_products(user_id)

    async def add_favorite(self, user_id: UUID, product_id: UUID) -> Any:
        fav_repo = FavoriteRepository(self.session)
        product_repo = ProductRepository(self.session)
        
        product = await product_repo.get(product_id)
        if not product:
            raise NotFoundError("Product not found")
            
        fav = await fav_repo.add(user_id, product_id)
        logger.info("Product added to favorites", user_id=str(user_id), product_id=str(product_id))
        return fav

    async def remove_favorite(self, user_id: UUID, product_id: UUID) -> None:
        fav_repo = FavoriteRepository(self.session)
        success = await fav_repo.remove(user_id, product_id)
        if not success:
            raise NotFoundError("Favorite not found")
        logger.info("Product removed from favorites", user_id=str(user_id), product_id=str(product_id))
