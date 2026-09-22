from typing import Generic, TypeVar, Optional
from pydantic import BaseModel

T = TypeVar('T')

class PaginatedResponse(BaseModel, Generic[T]):
    items: list[T]
    next_cursor: Optional[str] = None
    has_more: bool

class ApiResponse(BaseModel, Generic[T]):
    data: T

class ApiErrorDetail(BaseModel):
    code: str
    message: str
    request_id: Optional[str] = None

class ApiErrorResponse(BaseModel):
    error: ApiErrorDetail

class SuccessResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None
