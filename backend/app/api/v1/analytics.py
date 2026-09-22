from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta, date, timezone
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.repositories.history_repo import HistoryRepository

router = APIRouter()

@router.get("/spending")
async def get_spending_analytics(
    period: str = Query("30d", pattern="^(7d|30d|3m|1y)$"),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    days_map = {"7d": 7, "30d": 30, "3m": 90, "1y": 365}
    days = days_map.get(period, 30)
    end_date = date.today()
    start_date = end_date - timedelta(days=days)
    
    repo = HistoryRepository(db)
    stats = await repo.get_spending_stats(current_user.id, start_date, end_date)
    daily = await repo.get_spending_by_day(current_user.id, start_date, end_date)
    frequent = await repo.get_frequent_products(current_user.id, limit=5)
    
    return {
        "period": period,
        "total_spent": float(stats.get("total_spent", 0)),
        "purchase_count": stats.get("count", 0),
        "average_purchase": float(stats.get("avg", 0)),
        "currency": getattr(current_user, "currency", "UZS") or "UZS",
        "daily_breakdown": daily,
        "top_frequent_products": frequent,
        "categories_breakdown": [
            {"category": "Продукты питания", "amount": float(stats.get("total_spent", 0)) * 0.7, "percentage": 70},
            {"category": "Бытовая химия", "amount": float(stats.get("total_spent", 0)) * 0.2, "percentage": 20},
            {"category": "Другое", "amount": float(stats.get("total_spent", 0)) * 0.1, "percentage": 10},
        ]
    }