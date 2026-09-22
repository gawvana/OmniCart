from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class CategoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    name: str
    emoji: str
    sort_order: int
    parent_id: Optional[int] = None

class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    normalized_name: str
    category_id: Optional[int] = None
    default_unit: str
    created_at: datetime

class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    product_id: UUID
    product_name: str
    product_category: Optional[str] = None
    sort_order: int
    created_at: datetime

class FavoriteCreateRequest(BaseModel):
    product_id: UUID
