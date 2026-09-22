from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional
from decimal import Decimal
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.services.budget_service import BudgetService

router = APIRouter()

class CreateBudgetRequest(BaseModel):
    amount: Decimal
    currency: Optional[str] = "UZS"
    period: Optional[str] = "monthly"
    list_id: Optional[UUID] = None
    name: Optional[str] = "Общий бюджет"

class UpdateBudgetRequest(BaseModel):
    amount: Optional[Decimal] = None
    period: Optional[str] = None
    name: Optional[str] = None

class AddSpendingRequest(BaseModel):
    amount: Decimal

@router.get("/")
async def get_budgets(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    budgets = await svc.get_user_budgets(current_user.id)
    return [
        {
            "id": str(b.id),
            "amount": float(b.amount),
            "spent_amount": float(b.spent_amount or 0),
            "remaining": float(b.amount - (b.spent_amount or 0)),
            "currency": b.currency,
            "period": b.period,
            "name": b.name,
            "list_id": str(b.list_id) if b.list_id else None,
            "is_exceeded": (b.spent_amount or 0) > b.amount
        }
        for b in budgets
    ]

@router.post("/")
async def create_budget(
    payload: CreateBudgetRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    b = await svc.create_budget(current_user.id, **payload.dict(exclude_unset=True))
    return {
        "id": str(b.id),
        "amount": float(b.amount),
        "spent_amount": float(b.spent_amount or 0),
        "currency": b.currency,
        "period": b.period,
        "name": b.name,
        "list_id": str(b.list_id) if b.list_id else None
    }

@router.patch("/{budget_id}")
async def update_budget(
    budget_id: UUID,
    payload: UpdateBudgetRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    updated = await svc.update_budget(current_user.id, budget_id, **payload.dict(exclude_unset=True))
    return {
        "id": str(updated.id),
        "amount": float(updated.amount),
        "spent_amount": float(updated.spent_amount or 0),
        "name": updated.name,
        "period": updated.period
    }

@router.delete("/{budget_id}")
async def delete_budget(
    budget_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    await svc.delete_budget(current_user.id, budget_id)
    return {"success": True}

@router.get("/status/{list_id}")
async def check_budget_status(
    list_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    status = await svc.check_budget_status(list_id)
    return status or {"status": "no_budget"}

@router.post("/{budget_id}/spending")
async def add_spending(
    budget_id: UUID,
    payload: AddSpendingRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = BudgetService(db)
    updated = await svc.add_spending(budget_id, payload.amount)
    return {
        "id": str(updated.id),
        "spent_amount": float(updated.spent_amount),
        "remaining": float(updated.amount - updated.spent_amount)
    }