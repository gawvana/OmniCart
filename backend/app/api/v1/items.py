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
    list_id: Optional[UUID] = None
    items: List[Dict[str, Any]]

class ItemPayload(BaseModel):
    name: str
    quantity: Optional[Decimal] = Decimal("1")
    unit: Optional[str] = "шт"
    estimated_price: Optional[Decimal] = None
    price: Optional[Decimal] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    notes: Optional[str] = None
    priority: Optional[int] = 0
    client_mutation_id: Optional[str] = None

def serialize_item(it) -> Dict[str, Any]:
    price_val = float(it.price) if getattr(it, "price", None) is not None else None
    return {
        "id": str(it.id),
        "list_id": str(it.list_id),
        "listId": str(it.list_id),
        "product_id": str(it.product_id) if it.product_id else None,
        "productId": str(it.product_id) if it.product_id else None,
        "name": it.name,
        "quantity": float(it.quantity) if it.quantity is not None else 1.0,
        "unit": it.unit,
        "estimated_price": float(it.estimated_price) if it.estimated_price is not None else None,
        "estimatedPrice": float(it.estimated_price) if it.estimated_price is not None else None,
        "actual_price": float(it.actual_price) if it.actual_price is not None else None,
        "actualPrice": float(it.actual_price) if it.actual_price is not None else None,
        "price": price_val,
        "currency": it.currency,
        "category_id": it.category_id,
        "categoryId": it.category_id,
        "note": it.note,
        "notes": it.note,
        "priority": it.priority,
        "is_purchased": it.is_purchased,
        "isPurchased": it.is_purchased,
        "created_at": it.created_at.isoformat() if it.created_at else None,
        "createdAt": it.created_at.isoformat() if it.created_at else None,
        "purchased_at": it.purchased_at.isoformat() if it.purchased_at else None,
        "purchasedAt": it.purchased_at.isoformat() if it.purchased_at else None,
    }

@router.get("/")
async def get_items_query(
    list_id: UUID = Query(...),
    include_purchased: bool = Query(True),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    items = await svc.get_list_items(current_user.id, list_id, include_purchased=include_purchased)
    return [serialize_item(it) for it in items]

@router.get("/{list_id}")
async def get_items_path(
    list_id: UUID,
    include_purchased: bool = Query(True),
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    items = await svc.get_list_items(current_user.id, list_id, include_purchased=include_purchased)
    return [serialize_item(it) for it in items]

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
    return serialize_item(item)

@router.post("/{list_id}")
async def create_item_in_list(
    list_id: UUID,
    payload: ItemPayload,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    data = payload.dict(exclude_unset=True)
    if "notes" in data and not data.get("note"):
        data["note"] = data.pop("notes")
    if "price" in data and not data.get("estimated_price"):
        data["estimated_price"] = data.pop("price")
    item = await svc.create_item(current_user.id, list_id, data)
    return serialize_item(item)

@router.post("/{item_id}/purchase")
async def purchase_item(
    item_id: UUID,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    updated = await svc.update_item(current_user.id, item_id, is_purchased=True)
    return serialize_item(updated)

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
    return serialize_item(updated)

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
async def bulk_create_items_body(
    payload: BulkCreateRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if not payload.list_id:
        raise HTTPException(status_code=422, detail="list_id is required")
    svc = ItemService(db)
    created = await svc.bulk_create(current_user.id, payload.list_id, payload.items)
    return [serialize_item(it) for it in created]

@router.post("/{list_id}/bulk")
async def bulk_create_items_path(
    list_id: UUID,
    payload: BulkCreateRequest,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    svc = ItemService(db)
    created = await svc.bulk_create(current_user.id, list_id, payload.items)
    return [serialize_item(it) for it in created]