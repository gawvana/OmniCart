from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.services.family_service import FamilyService

router = APIRouter()

class CreateFamilyRequest(BaseModel):
    name: str

class JoinFamilyRequest(BaseModel):
    token: str

@router.get("/")
async def get_families(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    families = await svc.get_user_families(current_user.id)
    return [
        {
            "id": str(f.id),
            "name": f.name,
            "created_by": str(f.created_by),
            "created_at": f.created_at.isoformat() if f.created_at else None
        }
        for f in families
    ]

@router.post("/")
async def create_family(
    payload: CreateFamilyRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    f = await svc.create_family(current_user.id, payload.name)
    return {
        "id": str(f.id),
        "name": f.name,
        "created_by": str(f.created_by)
    }

@router.post("/{family_id}/invites")
async def create_invite(
    family_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    invite = await svc.create_invite(current_user.id, family_id)
    return {
        "token": invite.token,
        "expires_at": invite.expires_at.isoformat() if invite.expires_at else None,
        "invite_link": f"https://t.me/OmniCartV2_bot?start=join_{invite.token}"
    }

@router.post("/join")
async def join_family(
    payload: JoinFamilyRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    member = await svc.join_family(current_user.id, payload.token)
    return {
        "success": True,
        "family_id": str(member.family_id),
        "role": member.role
    }

@router.get("/{family_id}/members")
async def get_members(
    family_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    members = await svc.get_members(family_id, current_user.id)
    return [
        {
            "id": str(m.id),
            "user_id": str(m.user_id),
            "role": m.role,
            "joined_at": m.joined_at.isoformat() if hasattr(m, "joined_at") and m.joined_at else None
        }
        for m in members
    ]

@router.delete("/{family_id}/members/{member_id}")
async def remove_member(
    family_id: UUID,
    member_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    await svc.remove_member(current_user.id, family_id, member_id)
    return {"success": True}

@router.get("/{family_id}/activity")
async def get_activity(
    family_id: UUID,
    cursor: Optional[str] = Query(None),
    limit: int = Query(20, le=100),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = FamilyService(db)
    events = await svc.get_activity(current_user.id, family_id, cursor=cursor, limit=limit)
    return [
        {
            "id": str(e.id),
            "event_type": e.event_type,
            "entity_type": e.entity_type,
            "user_id": str(e.user_id),
            "data": e.data,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in events
    ]