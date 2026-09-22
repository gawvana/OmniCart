from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import Optional, List, Dict, Any
from decimal import Decimal
from pydantic import BaseModel

from app.api.deps import get_db, get_current_user
from app.services.item_service import ItemService

router = APIRouter()

class CreateItemRequest(BaseModel):
    list_id: UUID
    name: str
    quantity: Optional[Decimal] = Decimal("1")
    unit: Optional[str] = "шт"
    estimated_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    priority: Optional[int] = 0
    client_mutation_id: Optional[str] = None

class UpdateItemRequest(BaseModel):
    name: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    estimated_price: Optional[Decimal] = None
    actual_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    priority: Optional[int] = None
    is_purchased: Optional[bool] = None

class BulkCreateRequest(BaseModel):
    list_id: UUID
    items: List[Dict[str, Any]]

@router.get("/")
async def get_items(
    list_id: UUID = Query(...),
    include_purchased: bool = Query(True),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    items = await svc.get_list_items(current_user.id, list_id, include_purchased=include_purchased)
    return [
        {
            "id": str(it.id),
            "list_id": str(it.list_id),
            "product_id": str(it.product_id) if it.product_id else None,
            "name": it.name,
            "quantity": float(it.quantity) if it.quantity is not None else 1.0,
            "unit": it.unit,
            "estimated_price": float(it.estimated_price) if it.estimated_price is not None else None,
            "actual_price": float(it.actual_price) if it.actual_price is not None else None,
            "currency": it.currency,
            "category_id": it.category_id,
            "note": it.note,
            "priority": it.priority,
            "is_purchased": it.is_purchased,
            "created_at": it.created_at.isoformat() if it.created_at else None,
            "purchased_at": it.purchased_at.isoformat() if it.purchased_at else None,
        }
        for it in items
    ]

@router.post("/")
async def create_item(
    payload: CreateItemRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    data = payload.dict()
    list_id = data.pop("list_id")
    item = await svc.create_item(current_user.id, list_id, data)
    return {
        "id": str(item.id),
        "list_id": str(item.list_id),
        "product_id": str(item.product_id) if item.product_id else None,
        "name": item.name,
        "quantity": float(item.quantity) if item.quantity is not None else 1.0,
        "unit": item.unit,
        "estimated_price": float(item.estimated_price) if item.estimated_price is not None else None,
        "is_purchased": item.is_purchased,
        "category_id": item.category_id,
        "priority": item.priority
    }

@router.patch("/{item_id}")
async def update_item(
    item_id: UUID,
    payload: UpdateItemRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    data = payload.dict(exclude_unset=True)
    updated = await svc.update_item(current_user.id, item_id, **data)
    return {
        "id": str(updated.id),
        "name": updated.name,
        "quantity": float(updated.quantity) if updated.quantity is not None else 1.0,
        "unit": updated.unit,
        "estimated_price": float(updated.estimated_price) if updated.estimated_price is not None else None,
        "actual_price": float(updated.actual_price) if updated.actual_price is not None else None,
        "is_purchased": updated.is_purchased,
        "purchased_at": updated.purchased_at.isoformat() if updated.purchased_at else None
    }

@router.delete("/{item_id}")
async def delete_item(
    item_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    await svc.delete_item(current_user.id, item_id)
    return {"success": True}

@router.post("/bulk")
async def bulk_create_items(
    payload: BulkCreateRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    created = await svc.bulk_create(current_user.id, payload.list_id, payload.items)
    return [
        {
            "id": str(it.id),
            "name": it.name,
            "quantity": float(it.quantity) if it.quantity is not None else 1.0,
            "unit": it.unit,
            "is_purchased": it.is_purchased
        }
        for it in created
    ]