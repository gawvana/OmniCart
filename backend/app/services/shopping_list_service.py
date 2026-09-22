from uuid import UUID
from typing import List, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.list_service import ListService
from app.services.item_service import ItemService
from app.repositories.item_repository import ItemRepository

class ShoppingListService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.list_service = ListService(session)
        self.item_service = ItemService(session)
        self.item_repo = ItemRepository(session)

    async def get_user_items(self, user_id: UUID, include_purchased: bool = True) -> List[Any]:
        default_list = await self.list_service.get_or_create_default(user_id)
        return await self.item_repo.get_by_list_id(default_list.id, include_purchased=include_purchased)

    async def add_item(self, user_id: UUID, name: str, quantity: float = 1.0, unit: str = "шт") -> Any:
        default_list = await self.list_service.get_or_create_default(user_id)
        return await self.item_service.create_item(
            user_id=user_id,
            list_id=default_list.id,
            data={"name": name, "quantity": quantity, "unit": unit}
        )

    async def toggle_item(self, item_id: Any, user_id: UUID) -> Any:
        # Support string or int or UUID
        if isinstance(item_id, str):
            try:
                item_uuid = UUID(item_id)
            except ValueError:
                item_uuid = item_id
        else:
            item_uuid = item_id

        item = await self.item_repo.get_by_id(item_uuid)
        if not item:
            return None
        new_status = not item.is_purchased
        return await self.item_service.toggle_status(user_id, item.id, new_status)
