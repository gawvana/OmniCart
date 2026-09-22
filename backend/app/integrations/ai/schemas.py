from pydantic import BaseModel
from typing import List, Optional

class ParsedItemSchema(BaseModel):
    name: str
    quantity: float = 1.0
    unit: str = "шт"
    category: Optional[str] = None
    confidence: float = 0.9

class ParseItemsResult(BaseModel):
    items: List[ParsedItemSchema]

class ShoppingPlanItem(BaseModel):
    name: str
    quantity: float
    unit: str
    estimated_price: Optional[float] = None

class ShoppingPlanCategory(BaseModel):
    category: str
    emoji: str
    items: List[ShoppingPlanItem]

class ShoppingPlanResult(BaseModel):
    categories: List[ShoppingPlanCategory]
    estimated_total: float
    currency: str = "UZS"

class BudgetSuggestionSchema(BaseModel):
    original_item: str
    suggested_item: str
    savings: float
    reason: str

class BudgetSuggestionsResult(BaseModel):
    suggestions: List[BudgetSuggestionSchema]
    potential_savings: float

class ReminderParseResult(BaseModel):
    title: str
    description: Optional[str] = None
    datetime: str  # ISO 8601

class CategorizeResult(BaseModel):
    category: str
    confidence: float

class InsightsResult(BaseModel):
    summary: str
    highlights: List[str]
