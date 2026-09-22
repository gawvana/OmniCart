from typing import Any, Dict, Optional

class AppException(Exception):
    def __init__(self, status_code: int, error_code: str, message: str, detail: Optional[Dict[str, Any]] = None):
        self.status_code = status_code
        self.error_code = error_code
        self.message = message
        self.detail = detail or {}
        super().__init__(self.message)

class NotFoundError(AppException):
    def __init__(self, message: str = "Resource not found", detail: Optional[Dict[str, Any]] = None):
        super().__init__(404, "NOT_FOUND", message, detail)

class ValidationError(AppException):
    def __init__(self, message: str = "Validation failed", detail: Optional[Dict[str, Any]] = None):
        super().__init__(422, "VALIDATION_ERROR", message, detail)

class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication failed", detail: Optional[Dict[str, Any]] = None):
        super().__init__(401, "UNAUTHORIZED", message, detail)

class AuthorizationError(AppException):
    def __init__(self, message: str = "Permission denied", detail: Optional[Dict[str, Any]] = None):
        super().__init__(403, "FORBIDDEN", message, detail)

class RateLimitError(AppException):
    def __init__(self, message: str = "Rate limit exceeded", detail: Optional[Dict[str, Any]] = None):
        super().__init__(429, "RATE_LIMIT_EXCEEDED", message, detail)

class AIServiceError(AppException):
    def __init__(self, message: str = "AI service error", detail: Optional[Dict[str, Any]] = None):
        super().__init__(503, "AI_SERVICE_ERROR", message, detail)

class ConflictError(AppException):
    def __init__(self, message: str = "Resource conflict", detail: Optional[Dict[str, Any]] = None):
        super().__init__(409, "CONFLICT", message, detail)
