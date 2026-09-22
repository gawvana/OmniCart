from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime
from decimal import Decimal

class RecurringItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    product_id: Optional[UUID] = None
    name: str
    quantity: Decimal
    unit: str
    interval_days: int
    last_added_at: Optional[datetime] = None
    next_due_at: Optional[datetime] = None
    enabled: bool
    created_at: datetime

class RecurringItemCreateRequest(BaseModel):
    name: str
    product_id: Optional[UUID] = None
    list_id: Optional[UUID] = None
    quantity: Decimal = Decimal('1')
    unit: str = 'шт'
    interval_days: int

class RecurringItemUpdateRequest(BaseModel):
    quantity: Optional[Decimal] = None
    unit: Optional[str] = None
    interval_days: Optional[int] = None
    enabled: Optional[bool] = None

class SmartReorderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    product_name: str
    confidence: float
    estimated_interval_days: float
    last_purchase_at: datetime
    next_expected_at: datetime
    status: str
