import re
from uuid import UUID
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.item_repository import ItemRepository
from app.repositories.history_repository import HistoryRepository
from app.repositories.budget_repository import BudgetRepository
from app.services.list_service import ListService
from app.services.product_service import ProductService
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class ItemService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.list_service = ListService(session)
        self.product_service = ProductService(session)

    def _normalize_name(self, name: str) -> str:
        return re.sub(r"\\s+", " ", name.strip().lower())

    async def _detect_duplicate(self, list_id: UUID, name: str) -> Optional[Any]:
        item_repo = ItemRepository(self.session)
        normalized = self._normalize_name(name)
        return await item_repo.find_active_by_name(list_id, normalized)

    async def get_list_items(self, user_id: UUID, list_id: UUID, include_purchased: bool = False) -> List[Any]:
        await self.list_service.check_access(user_id, list_id, min_role="viewer")
        item_repo = ItemRepository(self.session)
        return await item_repo.get_by_list_id(list_id, include_purchased)

    async def create_item(self, user_id: UUID, list_id: UUID, data: Dict[str, Any]) -> Any:
        await self.list_service.check_access(user_id, list_id, min_role="editor")
        item_repo = ItemRepository(self.session)
        
        name = data.get("name")
        if not name:
            raise ValueError("Item name is required")
            
        client_mutation_id = data.get("client_mutation_id")
        if client_mutation_id:
            existing = await item_repo.get_by_mutation_id(client_mutation_id)
            if existing:
                return existing
                
        duplicate = await self._detect_duplicate(list_id, name)
        if duplicate:
            # Could offer to increase quantity, but logic dictates returning or auto-incrementing
            # Standard approach: increment quantity
            new_qty = (duplicate.quantity or 1) + (data.get("quantity") or 1)
            return await self.update_item(user_id, duplicate.id, quantity=new_qty)
            
        product = await self.product_service.resolve_or_create(
            name=name,
            category_id=data.get("category_id"),
            unit=data.get("unit", "шт")
        )
        
        new_item = await item_repo.create(
            list_id=list_id,
            product_id=product.id,
            name=name,
            normalized_name=self._normalize_name(name),
            quantity=data.get("quantity", 1),
            unit=data.get("unit", "шт"),
            category_id=data.get("category_id") or product.category_id,
            client_mutation_id=client_mutation_id,
            created_by_id=user_id
        )
        logger.info("Item created", item_id=str(new_item.id), list_id=str(list_id))
        return new_item

    async def update_item(self, user_id: UUID, item_id: UUID, **kwargs) -> Any:
        item_repo = ItemRepository(self.session)
        item = await item_repo.get(item_id)
        if not item:
            raise NotFoundError("Item not found")
            
        await self.list_service.check_access(user_id, item.list_id, min_role="editor")
        
        is_marking_purchased = kwargs.get("is_purchased") is True and not item.is_purchased
        
        if is_marking_purchased:
            kwargs["purchased_at"] = datetime.now(timezone.utc)
            kwargs["purchased_by"] = user_id
            
        updated_item = await item_repo.update(item_id, **kwargs)
        
        if is_marking_purchased:
            history_repo = HistoryRepository(self.session)
            await history_repo.create_from_item(user_id, updated_item)
            
            budget_repo = BudgetRepository(self.session)
            if updated_item.price:
                total_cost = updated_item.price * (updated_item.quantity or 1)
                await budget_repo.add_spending_for_list(updated_item.list_id, total_cost)
                
        logger.info("Item updated", item_id=str(item_id), user_id=str(user_id))
        return updated_item

    async def delete_item(self, user_id: UUID, item_id: UUID) -> None:
        item_repo = ItemRepository(self.session)
        item = await item_repo.get(item_id)
        if not item:
            raise NotFoundError("Item not found")
            
        await self.list_service.check_access(user_id, item.list_id, min_role="editor")
        await item_repo.delete(item_id)
        logger.info("Item deleted", item_id=str(item_id), user_id=str(user_id))

    async def bulk_create(self, user_id: UUID, list_id: UUID, items: List[Dict[str, Any]]) -> List[Any]:
        await self.list_service.check_access(user_id, list_id, min_role="editor")
        
        created_items = []
        # In a real impl with SQLAlchemy, we might use session.add_all or a bulk insert operation
        # But for business logic consistency (product resolution, etc.), iterative creation inside a transaction is safer
        for item_data in items:
            item = await self.create_item(user_id, list_id, item_data)
            created_items.append(item)
            
        logger.info("Bulk created items", count=len(created_items), list_id=str(list_id))
        return created_items
