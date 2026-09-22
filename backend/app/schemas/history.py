from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class PurchaseHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    item_name: str
    product_id: Optional[UUID] = None
    quantity: Decimal
    unit: str
    price: Optional[Decimal] = None
    currency: str
    store_id: Optional[UUID] = None
    purchased_at: datetime
    created_at: datetime

class PurchaseHistoryFilter(BaseModel):
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    category: Optional[str] = None
    store_id: Optional[UUID] = None
