from pydantic import BaseModel, ConfigDict
from typing import Optional
from decimal import Decimal

class AIParseRequest(BaseModel):
    text: str

class AIParsedItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    name: str
    quantity: Decimal
    unit: str
    category: Optional[str] = None
    confidence: float

class AIParseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    items: list[AIParsedItem]
    cached: bool = False

class AIShoppingPlanRequest(BaseModel):
    people: int = 1
    budget: Optional[Decimal] = None
    days: int = 7
    preferences: Optional[str] = None

class AIShoppingPlanCategory(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    category: str
    emoji: str
    items: list[AIParsedItem]

class AIShoppingPlanResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    categories: list[AIShoppingPlanCategory]
    estimated_total: Decimal
    currency: str

class AIBudgetSuggestion(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    original_item: str
    suggested_item: str
    savings: Decimal
    reason: str

class AIBudgetSuggestionsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    suggestions: list[AIBudgetSuggestion]
    potential_savings: Decimal

class AIInsightResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    summary: str
    highlights: list[str]
