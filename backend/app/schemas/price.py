from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime
from decimal import Decimal

class PriceObservationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    product_id: UUID
    product_name: str
    store_name: Optional[str] = None
    price: Decimal
    currency: str
    unit: str
    source: str
    observed_at: datetime
    confidence: float

class PriceHistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    product_name: str
    current_price: Optional[Decimal] = None
    average_price: Optional[Decimal] = None
    median_price: Optional[Decimal] = None
    min_price: Optional[Decimal] = None
    max_price: Optional[Decimal] = None
    observations: list[PriceObservationResponse]

class PriceObservationCreateRequest(BaseModel):
    product_id: UUID
    store_id: Optional[UUID] = None
    price: Decimal
    currency: str = 'UZS'
    unit: str = 'шт'
