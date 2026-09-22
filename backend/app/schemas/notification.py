from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class NotificationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    type: str
    title: str
    body: str
    data: dict
    is_read: bool
    created_at: datetime

class ReminderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    description: Optional[str] = None
    remind_at: datetime
    is_completed: bool
    created_at: datetime

class ReminderCreateRequest(BaseModel):
    title: str
    description: Optional[str] = None
    remind_at: datetime

class AIReminderParseRequest(BaseModel):
    text: str
