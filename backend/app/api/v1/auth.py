from fastapi import APIRouter, Depends, Body, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.services.auth_service import AuthService

router = APIRouter()

@router.post("/validate")
async def validate_telegram(
    init_data: Optional[str] = Body(None, embed=True),
    x_telegram_init_data: Optional[str] = Header(None, alias="X-Telegram-Init-Data"),
    db: AsyncSession = Depends(get_db)
):
    raw_data = init_data or x_telegram_init_data
    if not raw_data:
        raise HTTPException(status_code=400, detail="Missing Telegram initData")
    
    auth_service = AuthService(db)
    user, is_new = await auth_service.authenticate(raw_data)
    return {
        "success": True,
        "is_new": is_new,
        "user": {
            "id": str(user.id),
            "telegram_id": user.telegram_user_id,
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "language": user.language,
            "currency": user.currency,
        }
    }

@router.get("/me")
async def get_current_user_profile(current_user = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "telegram_id": current_user.telegram_user_id,
        "username": current_user.username,
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "language": getattr(current_user, "language", "ru"),
        "currency": getattr(current_user, "currency", "UZS"),
    }