from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.repositories.product_repo import ProductRepository

router = APIRouter()

class AddFavoriteRequest(BaseModel):
    product_id: UUID

@router.get("/")
async def get_favorites(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    favs = await repo.get_favorites(current_user.id)
    return [
        {
            "id": str(f.id),
            "product_id": str(f.product_id),
            "product_name": f.product.name if f.product else "Товар",
            "category_id": f.product.category_id if f.product else None,
            "unit": f.product.default_unit if f.product else "шт"
        }
        for f in favs
    ]

@router.post("/")
async def add_favorite(
    payload: AddFavoriteRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    fav = await repo.add_favorite(current_user.id, payload.product_id)
    return {"success": True, "id": str(fav.id), "product_id": str(fav.product_id)}

@router.delete("/{product_id}")
async def remove_favorite(
    product_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ProductRepository(db)
    await repo.remove_favorite(current_user.id, product_id)
    return {"success": True}