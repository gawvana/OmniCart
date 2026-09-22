from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.repositories.product_repo import ProductRepository

router = APIRouter()

@router.get("/search")
async def search_products(
    query: str = Query(..., min_length=1),
    limit: int = Query(20, le=50),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    products = await repo.search_products(query, limit=limit)
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "category_id": p.category_id,
            "default_unit": p.default_unit
        }
        for p in products
    ]

@router.get("/categories")
async def get_categories(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    categories = await repo.get_categories()
    return [
        {
            "id": c.id,
            "name": c.name,
            "emoji": c.emoji,
            "parent_id": c.parent_id,
            "sort_order": c.sort_order
        }
        for c in categories
    ]