from uuid import UUID
from typing import List, Any
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.list_repository import ListRepository
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class ListService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_lists(self, user_id: UUID, include_archived: bool = False) -> List[Any]:
        list_repo = ListRepository(self.session)
        return await list_repo.get_user_lists_with_counts(user_id, include_archived)

    async def get_or_create_default(self, user_id: UUID) -> Any:
        list_repo = ListRepository(self.session)
        default_list = await list_repo.get_default_list(user_id)
        if not default_list:
            default_list = await list_repo.create(
                owner_id=user_id,
                name="My Shopping List",
                emoji="🛒",
                color="#4CAF50",
                is_default=True
            )
            await list_repo.add_member(default_list.id, user_id, role="owner")
        return default_list

    async def create_list(self, user_id: UUID, name: str, emoji: str, color: str) -> Any:
        list_repo = ListRepository(self.session)
        new_list = await list_repo.create(
            owner_id=user_id,
            name=name,
            emoji=emoji,
            color=color,
            is_default=False
        )
        await list_repo.add_member(new_list.id, user_id, role="owner")
        logger.info("Shopping list created", user_id=str(user_id), list_id=str(new_list.id))
        return new_list

    async def update_list(self, user_id: UUID, list_id: UUID, **kwargs) -> Any:
        await self.check_access(user_id, list_id, min_role="editor")
        list_repo = ListRepository(self.session)
        updated_list = await list_repo.update(list_id, **kwargs)
        if not updated_list:
            raise NotFoundError("List not found")
        logger.info("Shopping list updated", user_id=str(user_id), list_id=str(list_id))
        return updated_list

    async def check_access(self, user_id: UUID, list_id: UUID, min_role: str = 'viewer') -> Any:
        list_repo = ListRepository(self.session)
        member = await list_repo.get_member(list_id, user_id)
        
        if not member:
            raise AuthorizationError("Access denied to this list")
            
        role_hierarchy = {"viewer": 1, "editor": 2, "admin": 3, "owner": 4}
        user_role_level = role_hierarchy.get(member.role, 0)
        min_role_level = role_hierarchy.get(min_role, 1)
        
        if user_role_level < min_role_level:
            raise AuthorizationError(f"Insufficient permissions. Requires {min_role}")
            
        shopping_list = await list_repo.get(list_id)
        if not shopping_list:
            raise NotFoundError("List not found")
            
        return shopping_list

    async def share_list(self, user_id: UUID, list_id: UUID, target_user_id: UUID, role: str) -> Any:
        await self.check_access(user_id, list_id, min_role="admin")
        list_repo = ListRepository(self.session)
        member = await list_repo.add_member(list_id, target_user_id, role)
        logger.info("Shopping list shared", list_id=str(list_id), target_user_id=str(target_user_id), role=role)
        return member
