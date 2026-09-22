from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.services.list_service import ListService
from app.repositories.list_repo import ListRepository

router = APIRouter()

class CreateListRequest(BaseModel):
    name: str
    emoji: Optional[str] = "🛒"
    color: Optional[str] = "#3B82F6"
    is_default: Optional[bool] = False

class UpdateListRequest(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    is_archived: Optional[bool] = None

class ShareListRequest(BaseModel):
    target_user_id: UUID
    role: str = "editor"

@router.get("/")
async def get_lists(
    include_archived: bool = Query(False),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    lists = await svc.get_user_lists(current_user.id, include_archived=include_archived)
    return [
        {
            "id": str(lst.id),
            "name": lst.name,
            "emoji": lst.emoji,
            "color": lst.color,
            "is_default": lst.is_default,
            "is_archived": lst.is_archived,
            "owner_id": str(lst.owner_id),
            "created_at": lst.created_at.isoformat() if lst.created_at else None,
        }
        for lst in lists
    ]

@router.post("/")
async def create_list(
    payload: CreateListRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    lst = await svc.create_list(
        user_id=current_user.id,
        name=payload.name,
        emoji=payload.emoji or "🛒",
        color=payload.color or "#3B82F6",
        is_default=payload.is_default or False
    )
    return {
        "id": str(lst.id),
        "name": lst.name,
        "emoji": lst.emoji,
        "color": lst.color,
        "is_default": lst.is_default,
        "is_archived": lst.is_archived,
        "owner_id": str(lst.owner_id)
    }

@router.get("/{list_id}")
async def get_list(
    list_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    lst = await svc.check_access(current_user.id, list_id, min_role="viewer")
    return {
        "id": str(lst.id),
        "name": lst.name,
        "emoji": lst.emoji,
        "color": lst.color,
        "is_default": lst.is_default,
        "is_archived": lst.is_archived,
        "owner_id": str(lst.owner_id)
    }

@router.patch("/{list_id}")
async def update_list(
    list_id: UUID,
    payload: UpdateListRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    data = payload.dict(exclude_unset=True)
    updated = await svc.update_list(current_user.id, list_id, **data)
    return {
        "id": str(updated.id),
        "name": updated.name,
        "emoji": updated.emoji,
        "color": updated.color,
        "is_default": updated.is_default,
        "is_archived": updated.is_archived,
    }

@router.delete("/{list_id}")
async def delete_list(
    list_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    await svc.delete_list(current_user.id, list_id)
    return {"success": True}

@router.post("/{list_id}/share")
async def share_list(
    list_id: UUID,
    payload: ShareListRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    member = await svc.share_list(current_user.id, list_id, payload.target_user_id, payload.role)
    return {
        "id": str(member.id),
        "list_id": str(member.list_id),
        "user_id": str(member.user_id),
        "role": member.role
    }

@router.get("/{list_id}/members")
async def get_members(
    list_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ListService(db)
    await svc.check_access(current_user.id, list_id, min_role="viewer")
    repo = ListRepository(db)
    members = await repo.get_members(list_id)
    return [
        {
            "id": str(m.id),
            "user_id": str(m.user_id),
            "role": m.role,
        }
        for m in members
    ]