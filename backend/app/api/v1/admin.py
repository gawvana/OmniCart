from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_db, get_current_admin
from app.models.user import User
from app.models.shopping import ShoppingList, ShoppingItem
from app.models.family import Family

router = APIRouter()

@router.get("/stats")
async def get_admin_stats(
    admin = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    total_users = await db.scalar(select(func.count(User.id))) or 0
    total_lists = await db.scalar(select(func.count(ShoppingList.id))) or 0
    total_items = await db.scalar(select(func.count(ShoppingItem.id))) or 0
    total_families = await db.scalar(select(func.count(Family.id))) or 0

    return {
        "status": "healthy",
        "total_users": total_users,
        "total_lists": total_lists,
        "total_items": total_items,
        "total_families": total_families,
        "version": "2.0.0"
    }