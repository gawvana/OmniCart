from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime, date
from decimal import Decimal

class BudgetResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    list_id: Optional[UUID] = None
    name: Optional[str] = None
    amount: Decimal
    currency: str
    period: str
    spent_amount: Decimal
    remaining: Decimal
    is_exceeded: bool
    start_date: date
    end_date: date
    created_at: datetime

class BudgetCreateRequest(BaseModel):
    list_id: Optional[UUID] = None
    name: Optional[str] = None
    amount: Decimal
    currency: str = 'UZS'
    period: str = 'monthly'

class BudgetUpdateRequest(BaseModel):
    name: Optional[str] = None
    amount: Optional[Decimal] = None
    period: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
