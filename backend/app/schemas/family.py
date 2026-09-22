from pydantic import BaseModel, ConfigDict
from uuid import UUID
from typing import Optional
from datetime import datetime

class FamilyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    name: str
    created_by: UUID
    member_count: int
    created_at: datetime

class FamilyCreateRequest(BaseModel):
    name: str

class FamilyMemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    username: Optional[str] = None
    first_name: str
    role: str
    joined_at: datetime
    is_active: bool

class FamilyInviteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    family_id: UUID
    token: str
    created_by: UUID
    expires_at: datetime
    is_used: bool
    created_at: datetime

class FamilyInviteCreateRequest(BaseModel):
    pass

class FamilyActivityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    user_id: UUID
    user_name: str
    event_type: str
    entity_type: str
    data: dict
    created_at: datetime

class JoinFamilyRequest(BaseModel):
    token: str
