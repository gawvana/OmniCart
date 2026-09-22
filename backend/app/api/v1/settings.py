from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.repositories.settings_repo import SettingsRepository
from app.repositories.user_repo import UserRepository

router = APIRouter()

class UpdateSettingsRequest(BaseModel):
    language: Optional[str] = None
    currency: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    ai_enabled: Optional[bool] = None

@router.get("/")
async def get_settings(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = SettingsRepository(db)
    settings = await repo.get_by_user_id(current_user.id)
    if not settings:
        settings = await repo.create(
            user_id=current_user.id,
            language=getattr(current_user, "language", "ru"),
            currency=getattr(current_user, "currency", "UZS"),
            theme="auto",
            notifications_enabled=True,
            ai_enabled=True
        )
    return {
        "language": settings.language or getattr(current_user, "language", "ru"),
        "currency": settings.currency or getattr(current_user, "currency", "UZS"),
        "city": settings.city or getattr(current_user, "city", "Ташкент"),
        "timezone": settings.timezone or getattr(current_user, "timezone", "Asia/Tashkent"),
        "theme": settings.theme,
        "notifications_enabled": settings.notifications_enabled,
        "ai_enabled": settings.ai_enabled
    }

@router.patch("/")
async def update_settings(
    payload: UpdateSettingsRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = SettingsRepository(db)
    user_repo = UserRepository(db)
    settings = await repo.get_by_user_id(current_user.id)
    data = payload.dict(exclude_unset=True)
    
    if not settings:
        settings = await repo.create(user_id=current_user.id, **data)
    else:
        settings = await repo.update(settings.id, **data)
        
    # Also update user fields if language or currency changed
    user_updates = {}
    if "language" in data:
        user_updates["language"] = data["language"]
    if "currency" in data:
        user_updates["currency"] = data["currency"]
    if user_updates:
        await user_repo.update(current_user.id, **user_updates)

    return {
        "language": settings.language,
        "currency": settings.currency,
        "city": settings.city,
        "timezone": settings.timezone,
        "theme": settings.theme,
        "notifications_enabled": settings.notifications_enabled,
        "ai_enabled": settings.ai_enabled
    }