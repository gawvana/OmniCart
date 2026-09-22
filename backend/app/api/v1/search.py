from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user
from app.repositories.search_repo import SearchRepository

router = APIRouter()

@router.get("/")
async def search(
    q: str = Query(..., min_length=1),
    limit: int = Query(20, le=50),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = SearchRepository(db)
    results = await repo.global_search(current_user.id, q, limit=limit)
    return results