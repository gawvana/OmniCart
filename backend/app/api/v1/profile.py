from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.api.deps import get_db, get_current_user
from app.models.shopping import ShoppingList
from app.models.history import PurchaseHistory
from app.models.family import FamilyMember
from app.models.budget import Budget

router = APIRouter()

@router.get("/")
async def get_profile(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Total lists
    lists_count = await db.scalar(
        select(func.count(ShoppingList.id)).where(ShoppingList.owner_id == current_user.id)
    ) or 0

    # Total purchases
    purchases_count = await db.scalar(
        select(func.count(PurchaseHistory.id)).where(PurchaseHistory.user_id == current_user.id)
    ) or 0

    # Families
    family_count = await db.scalar(
        select(func.count(FamilyMember.id)).where(FamilyMember.user_id == current_user.id)
    ) or 0

    # Active budget
    active_budget = (await db.execute(
        select(Budget).where(Budget.user_id == current_user.id).order_by(Budget.created_at.desc()).limit(1)
    )).scalars().first()

    return {
        "user": {
            "id": str(current_user.id),
            "telegram_id": current_user.telegram_user_id,
            "username": current_user.username,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "language": getattr(current_user, "language", "ru"),
            "currency": getattr(current_user, "currency", "UZS"),
            "city": getattr(current_user, "city", "Ташкент")
        },
        "stats": {
            "lists_count": lists_count,
            "purchases_count": purchases_count,
            "family_count": family_count,
            "budget": {
                "amount": float(active_budget.amount) if active_budget else 0.0,
                "spent": float(active_budget.spent_amount or 0) if active_budget else 0.0,
                "remaining": float((active_budget.amount - (active_budget.spent_amount or 0))) if active_budget else 0.0,
                "currency": active_budget.currency if active_budget else "UZS"
            } if active_budget else None
        }
    }