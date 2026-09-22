from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from decimal import Decimal

class AnalyticsOverviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    total_spent: Decimal
    total_purchases: int
    average_purchase: Decimal
    period: str

class SpendingByCategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    category: str
    emoji: str
    amount: Decimal
    percentage: float

class SpendingByDayResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    date: str
    amount: Decimal

class FrequentProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    count: int
    last_purchased: Optional[datetime] = None

class AnalyticsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    overview: AnalyticsOverviewResponse
    by_category: list[SpendingByCategoryResponse]
    by_day: list[SpendingByDayResponse]
    frequent_products: list[FrequentProductResponse]
