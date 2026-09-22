from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime
from decimal import Decimal

class ShoppingListResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    owner_id: UUID
    name: str
    emoji: str
    color: str
    is_default: bool
    is_archived: bool
    item_count: int
    created_at: datetime
    updated_at: datetime

class ShoppingListCreateRequest(BaseModel):
    name: str
    emoji: str = '🛒'
    color: str = '#10b981'

class ShoppingListUpdateRequest(BaseModel):
    name: Optional[str] = None
    emoji: Optional[str] = None
    color: Optional[str] = None
    is_archived: Optional[bool] = None

class ShoppingItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    list_id: UUID
    product_id: Optional[UUID] = None
    name: str
    normalized_name: Optional[str] = None
    quantity: Decimal
    unit: str
    estimated_price: Optional[Decimal] = None
    actual_price: Optional[Decimal] = None
    currency: str
    category_id: Optional[int] = None
    category_name: Optional[str] = None
    category_emoji: Optional[str] = None
    note: Optional[str] = None
    priority: int
    is_purchased: bool
    purchased_at: Optional[datetime] = None
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    version: int

class ShoppingItemCreateRequest(BaseModel):
    name: str
    quantity: Decimal = Decimal('1')
    unit: str = 'шт'
    estimated_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    priority: int = 0
    client_mutation_id: Optional[str] = None

class ShoppingItemUpdateRequest(BaseModel):
    name: Optional[str] = None
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    estimated_price: Optional[Decimal] = None
    actual_price: Optional[Decimal] = None
    category_id: Optional[int] = None
    note: Optional[str] = None
    priority: Optional[int] = None
    is_purchased: Optional[bool] = None

class ShoppingItemBulkCreateRequest(BaseModel):
    items: list[ShoppingItemCreateRequest]
