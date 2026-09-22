from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, and_, delete
from app.models.shopping import ShoppingList, ShoppingListMember

class ListRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, list_id: UUID) -> Optional[ShoppingList]:
        stmt = select(ShoppingList).where(ShoppingList.id == list_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_lists(self, user_id: UUID, include_archived: bool = False) -> list[ShoppingList]:
        stmt = (
            select(ShoppingList)
            .join(ShoppingListMember)
            .where(ShoppingListMember.user_id == user_id)
        )
        if not include_archived:
            stmt = stmt.where(ShoppingList.is_archived == False)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_default_list(self, user_id: UUID) -> Optional[ShoppingList]:
        stmt = (
            select(ShoppingList)
            .join(ShoppingListMember)
            .where(
                ShoppingListMember.user_id == user_id,
                ShoppingList.is_default == True,
                ShoppingList.is_archived == False
            )
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, owner_id: UUID, name: str, emoji: str, color: str, is_default: bool) -> ShoppingList:
        new_list = ShoppingList(
            owner_id=owner_id,
            name=name,
            emoji=emoji,
            color=color,
            is_default=is_default
        )
        self.session.add(new_list)
        await self.session.flush()
        return new_list

    async def update(self, list_id: UUID, **kwargs) -> ShoppingList:
        stmt = update(ShoppingList).where(ShoppingList.id == list_id).values(**kwargs).returning(ShoppingList)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def get_members(self, list_id: UUID) -> list[ShoppingListMember]:
        stmt = select(ShoppingListMember).where(ShoppingListMember.list_id == list_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_member(self, list_id: UUID, user_id: UUID) -> Optional[ShoppingListMember]:
        stmt = select(ShoppingListMember).where(
            and_(ShoppingListMember.list_id == list_id, ShoppingListMember.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first()

    get = get_by_id

    async def add_member(self, list_id: UUID, user_id: UUID, role: str, added_by: Optional[UUID]) -> ShoppingListMember:
        member = ShoppingListMember(
            list_id=list_id,
            user_id=user_id,
            role=role,
            added_by=added_by
        )
        self.session.add(member)
        await self.session.flush()
        return member

    async def remove_member(self, list_id: UUID, user_id: UUID) -> None:
        stmt = delete(ShoppingListMember).where(
            and_(ShoppingListMember.list_id == list_id, ShoppingListMember.user_id == user_id)
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def is_member(self, list_id: UUID, user_id: UUID) -> bool:
        stmt = select(ShoppingListMember).where(
            and_(ShoppingListMember.list_id == list_id, ShoppingListMember.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalars().first() is not None

    async def get_member_role(self, list_id: UUID, user_id: UUID) -> Optional[str]:
        stmt = select(ShoppingListMember.role).where(
            and_(ShoppingListMember.list_id == list_id, ShoppingListMember.user_id == user_id)
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
