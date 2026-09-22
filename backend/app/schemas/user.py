from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime
from decimal import Decimal

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    telegram_user_id: int
    username: Optional[str] = None
    first_name: str
    last_name: Optional[str] = None
    avatar_url: Optional[str] = None
    language: str
    currency: str
    city: Optional[str] = None
    created_at: datetime

class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    language: Optional[str] = None
    city: Optional[str] = None
    currency: Optional[str] = None
    avatar_url: Optional[str] = None

class UserStatsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    total_purchases: int
    total_lists: int
    total_spent: Decimal
    family_members: int

class UserProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    user: UserResponse
    stats: UserStatsResponse

class UserSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    language: str
    currency: str
    city: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: bool
    ai_enabled: bool
    notification_preferences: dict

class UserSettingsUpdateRequest(BaseModel):
    language: Optional[str] = None
    currency: Optional[str] = None
    city: Optional[str] = None
    timezone: Optional[str] = None
    theme: Optional[str] = None
    notifications_enabled: Optional[bool] = None
    ai_enabled: Optional[bool] = None
    notification_preferences: Optional[dict] = None
