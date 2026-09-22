from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.repositories.reminder_repo import ReminderRepository

router = APIRouter()

class CreateReminderRequest(BaseModel):
    title: str
    description: Optional[str] = None
    remind_at: datetime

@router.get("/")
async def get_reminders(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ReminderRepository(db)
    reminders = await repo.get_user_reminders(current_user.id)
    return [
        {
            "id": str(r.id),
            "title": r.title,
            "description": r.description,
            "remind_at": r.remind_at.isoformat() if r.remind_at else None,
            "is_completed": r.is_completed
        }
        for r in reminders
    ]

@router.post("/")
async def create_reminder(
    payload: CreateReminderRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ReminderRepository(db)
    r = await repo.create(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
        remind_at=payload.remind_at
    )
    return {
        "id": str(r.id),
        "title": r.title,
        "description": r.description,
        "remind_at": r.remind_at.isoformat() if r.remind_at else None,
        "is_completed": r.is_completed
    }

@router.delete("/{reminder_id}")
async def delete_reminder(
    reminder_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    repo = ReminderRepository(db)
    await repo.update(reminder_id, is_completed=True)
    return {"success": True}