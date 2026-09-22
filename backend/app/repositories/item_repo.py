from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, and_, func
from app.models.shopping import ShoppingItem

class ItemRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, item_id: UUID) -> Optional[ShoppingItem]:
        stmt = select(ShoppingItem).where(ShoppingItem.id == item_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_list(self, list_id: UUID, include_purchased: bool = False) -> list[ShoppingItem]:
        stmt = select(ShoppingItem).where(ShoppingItem.list_id == list_id)
        if not include_purchased:
            stmt = stmt.where(ShoppingItem.is_purchased == False)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_by_client_mutation_id(self, list_id: UUID, client_mutation_id: str) -> Optional[ShoppingItem]:
        stmt = select(ShoppingItem).where(
            and_(ShoppingItem.list_id == list_id, ShoppingItem.client_mutation_id == client_mutation_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_by_mutation_id(self, client_mutation_id: str) -> Optional[ShoppingItem]:
        stmt = select(ShoppingItem).where(ShoppingItem.client_mutation_id == client_mutation_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, list_id: UUID, created_by: Optional[UUID] = None, created_by_id: Optional[UUID] = None, **kwargs) -> ShoppingItem:
        creator = created_by or created_by_id
        item = ShoppingItem(list_id=list_id, created_by=creator, **kwargs)
        self.session.add(item)
        await self.session.flush()
        return item

    async def update(self, item_id: UUID, **kwargs) -> ShoppingItem:
        if 'purchased_by_id' in kwargs:
            kwargs['purchased_by'] = kwargs.pop('purchased_by_id')
        if 'created_by_id' in kwargs:
            kwargs['created_by'] = kwargs.pop('created_by_id')
        if 'version' not in kwargs:
            kwargs['version'] = ShoppingItem.version + 1
        stmt = update(ShoppingItem).where(ShoppingItem.id == item_id).values(**kwargs).returning(ShoppingItem)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def delete(self, item_id: UUID) -> None:
        stmt = delete(ShoppingItem).where(ShoppingItem.id == item_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def mark_purchased(self, item_id: UUID, purchased_by: UUID) -> ShoppingItem:
        stmt = (
            update(ShoppingItem)
            .where(ShoppingItem.id == item_id)
            .values(
                is_purchased=True,
                purchased_at=datetime.now(timezone.utc),
                version=ShoppingItem.version + 1
            )
            .returning(ShoppingItem)
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def count_by_list(self, list_id: UUID, purchased: Optional[bool] = None) -> int:
        stmt = select(func.count(ShoppingItem.id)).where(ShoppingItem.list_id == list_id)
        if purchased is not None:
            stmt = stmt.where(ShoppingItem.is_purchased == purchased)
        result = await self.session.execute(stmt)
        return result.scalar() or 0

    async def find_duplicate(self, list_id: UUID, normalized_name: str) -> Optional[ShoppingItem]:
        stmt = select(ShoppingItem).where(
            and_(
                ShoppingItem.list_id == list_id,
                ShoppingItem.normalized_name == normalized_name,
                ShoppingItem.is_purchased == False
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    # Aliases for compatibility
    get = get_by_id
    get_by_list_id = get_by_list
    find_active_by_name = find_duplicate

