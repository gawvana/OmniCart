from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.services.history_service import HistoryService

router = APIRouter()

@router.get("/")
async def get_history(
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = HistoryService(db)
    items, next_cursor, has_more = await svc.get_history(
        user_id=current_user.id,
        cursor=cursor,
        limit=limit,
        filters=None
    )
    return {
        "items": [
            {
                "id": str(item.id),
                "name": item.item_name,
                "quantity": float(item.quantity) if item.quantity is not None else 1.0,
                "unit": item.unit,
                "price": float(item.price) if item.price is not None else None,
                "currency": item.currency,
                "purchased_at": item.purchased_at.isoformat() if item.purchased_at else None
            }
            for item in items
        ],
        "next_cursor": next_cursor,
        "has_more": has_more
    }