from pydantic import BaseModel
from .user import UserResponse

class TelegramAuthRequest(BaseModel):
    init_data: str

class AuthResponse(BaseModel):
    user: UserResponse
    is_new: bool
