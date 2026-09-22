from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional

from app.api.deps import get_db, get_current_user
from app.services.reorder_service import ReorderService

router = APIRouter()

@router.get("/suggestions")
async def get_reorder_suggestions(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ReorderService(db)
    suggestions = await svc.get_suggestions(current_user.id)
    return [
        {
            "id": str(s.id),
            "product_id": str(s.product_id),
            "product_name": s.product_name,
            "confidence": s.confidence,
            "estimated_interval_days": s.estimated_interval_days,
            "next_expected_at": s.next_expected_at.isoformat() if s.next_expected_at else None,
            "status": s.status
        }
        for s in suggestions
    ]

@router.post("/calculate")
async def calculate_reorders(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ReorderService(db)
    new_events = await svc.calculate_reorders(current_user.id)
    return {
        "success": True,
        "count": len(new_events),
        "suggestions": [
            {
                "id": str(e.id),
                "product_name": e.product_name,
                "confidence": e.confidence
            }
            for e in new_events
        ]
    }

@router.post("/suggestions/{event_id}/accept")
async def accept_suggestion(
    event_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ReorderService(db)
    accepted = await svc.accept(current_user.id, event_id)
    return {"success": True, "id": str(accepted.id), "status": accepted.status}

@router.post("/suggestions/{event_id}/dismiss")
async def dismiss_suggestion(
    event_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ReorderService(db)
    dismissed = await svc.dismiss(current_user.id, event_id)
    return {"success": True, "id": str(dismissed.id), "status": dismissed.status}