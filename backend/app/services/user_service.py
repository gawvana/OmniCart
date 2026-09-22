from uuid import UUID
from typing import Dict, Any, Optional
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from datetime import datetime, timezone
from app.repositories.user_repository import UserRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.list_repository import ListRepository
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_or_create_by_telegram_id(
        self,
        telegram_id: Any,
        username: Optional[str] = None,
        first_name: Optional[str] = "User",
        last_name: Optional[str] = None,
        language_code: Optional[str] = "ru"
    ) -> Any:
        user_repo = UserRepository(self.session)
        try:
            tg_id_int = int(telegram_id)
        except (ValueError, TypeError):
            tg_id_int = 0

        user = await user_repo.get_by_telegram_id(tg_id_int)
        if not user:
            user = await user_repo.create(
                telegram_id=tg_id_int,
                username=username,
                first_name=first_name or "User",
                last_name=last_name,
                language_code=language_code or "ru",
                last_seen_at=datetime.now(timezone.utc)
            )
            list_repo = ListRepository(self.session)
            await list_repo.create(
                owner_id=user.id,
                name="Мой список",
                emoji="🛒",
                color="#3B82F6",
                is_default=True
            )
        return user

    async def get_profile(self, user_id: UUID) -> Dict[str, Any]:
        user_repo = UserRepository(self.session)
        user = await user_repo.get(user_id)
        if not user:
            raise NotFoundError("User not found")
            
        stats = await user_repo.get_user_stats(user_id)
        
        return {
            "id": user.id,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "stats": {
                "total_purchases": stats.get("total_purchases", 0),
                "total_lists": stats.get("total_lists", 0),
                "total_spent": float(stats.get("total_spent", 0.0)),
                "family_members": stats.get("family_members", 0)
            }
        }

    async def update_profile(self, user_id: UUID, **kwargs) -> Any:
        user_repo = UserRepository(self.session)
        user = await user_repo.update(user_id, **kwargs)
        if not user:
            raise NotFoundError("User not found")
        logger.info("User profile updated", user_id=str(user_id))
        return user

    async def get_settings(self, user_id: UUID) -> Any:
        settings_repo = SettingsRepository(self.session)
        settings = await settings_repo.get_by_user_id(user_id)
        if not settings:
            settings = await settings_repo.create(user_id=user_id)
        return settings

    async def update_settings(self, user_id: UUID, **kwargs) -> Any:
        settings_repo = SettingsRepository(self.session)
        settings = await settings_repo.get_by_user_id(user_id)
        if not settings:
            settings = await settings_repo.create(user_id=user_id, **kwargs)
        else:
            settings = await settings_repo.update(settings.id, **kwargs)
        logger.info("User settings updated", user_id=str(user_id))
        return settings

    async def export_data(self, user_id: UUID, format: str = 'json') -> Dict[str, Any]:
        user_repo = UserRepository(self.session)
        data = await user_repo.get_full_export_data(user_id)
        if not data:
            raise NotFoundError("User not found")
        logger.info("User data exported", user_id=str(user_id), format=format)
        return data

    async def delete_account(self, user_id: UUID) -> None:
        user_repo = UserRepository(self.session)
        success = await user_repo.soft_delete(user_id)
        if not success:
            raise NotFoundError("User not found")
        logger.info("User account deleted", user_id=str(user_id))
