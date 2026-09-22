from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List

from app.api.deps import get_db, get_current_user

router = APIRouter()

@router.get("/compare")
async def compare_prices(
    query: str = Query("Молоко", min_length=1),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Market comparison across Uzbekistan stores
    stores_data = [
        {
            "store_name": "Korzinka",
            "logo": "🏪",
            "item_name": query,
            "price": 12500,
            "currency": "UZS",
            "in_stock": True,
            "is_cheapest": True
        },
        {
            "store_name": "Makro",
            "logo": "🛒",
            "item_name": query,
            "price": 13900,
            "currency": "UZS",
            "in_stock": True,
            "is_cheapest": False
        },
        {
            "store_name": "Havas",
            "logo": "🏬",
            "item_name": query,
            "price": 12900,
            "currency": "UZS",
            "in_stock": True,
            "is_cheapest": False
        }
    ]
    return {
        "query": query,
        "results": stores_data,
        "cheapest_store": "Korzinka",
        "savings_amount": 1400
    }