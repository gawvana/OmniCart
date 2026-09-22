import structlog
from typing import AsyncGenerator, Callable, Optional
from uuid import UUID
from fastapi import Depends, Request, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import redis.asyncio as redis

from app.db.engine import async_session_factory
from app.repositories.user_repo import UserRepository
from app.repositories.list_repo import ListRepository
from app.services.auth_service import AuthService
from app.services.ai_service import AIService
from app.integrations.ai.router import AIRouter
from app.integrations.ai.cache import AICache
from app.integrations.ai.rate_limiter import AIRateLimiter
from app.core.config import settings

logger = structlog.get_logger(__name__)

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_factory() as session:
        yield session

async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
    init_data = request.headers.get("X-Telegram-Init-Data") or request.headers.get("x-telegram-init-data")
    
    # 1. Telegram InitData authentication
    if init_data:
        try:
            auth_service = AuthService(db)
            user, _ = await auth_service.authenticate(init_data)
            return user
        except Exception as e:
            logger.warning("Telegram auth failed", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Authentication failed: {str(e)}"
            )

    # 2. Test-environment explicit bypass (only allowed in test/dev with X-Test-User-Id)
    test_user_id = request.headers.get("X-Test-User-Id")
    if test_user_id and getattr(settings, "APP_ENV", "development") in ("test", "testing", "development"):
        try:
            user_repo = UserRepository(db)
            if test_user_id.isdigit():
                user = await user_repo.get_by_telegram_id(int(test_user_id))
            else:
                user = await user_repo.get_by_id(UUID(test_user_id))
            if user:
                return user
        except Exception:
            pass

    # 3. Fail closed: no anonymous or synthetic fake user in production
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Authentication required: missing or invalid Telegram initData"
    )

def get_redis(request: Request) -> Optional[redis.Redis]:
    return getattr(request.app.state, "redis_client", None)

def get_ai_router(request: Request) -> AIRouter:
    ai_router = getattr(request.app.state, "ai_router", None)
    if not ai_router:
        ai_router = AIRouter(settings)
    return ai_router

class DummyRedisCache:
    def __init__(self):
        self._store = {}
    async def get(self, key: str):
        return self._store.get(key)
    async def set(self, key: str, val: str, ex: int = 3600):
        self._store[key] = val
    def pipeline(self):
        return self
    def zremrangebyscore(self, *args, **kwargs):
        pass
    def zcard(self, *args, **kwargs):
        pass
    def zadd(self, *args, **kwargs):
        pass
    def expire(self, *args, **kwargs):
        pass
    async def execute(self):
        return [0, 1]

_in_memory_cache = DummyRedisCache()

async def get_ai_service(
    db: AsyncSession = Depends(get_db),
    redis_client: Optional[redis.Redis] = Depends(get_redis),
    ai_router: AIRouter = Depends(get_ai_router)
) -> AIService:
    client = redis_client or _in_memory_cache
    cache = AICache(client)
    rate_limiter = AIRateLimiter(client)
    return AIService(db, ai_router, cache, rate_limiter)

def require_role(min_role: str) -> Callable:
    role_weights = {"viewer": 1, "editor": 2, "admin": 3, "owner": 4}
    async def role_checker(current_user = Depends(get_current_user)):
        user_role = getattr(current_user, "role", "viewer")
        is_admin = getattr(current_user, "is_admin", False)
        if not is_admin and role_weights.get(user_role, 1) < role_weights.get(min_role, 1):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied: action requires role '{min_role}'"
            )
        return current_user
    return role_checker

async def get_current_admin(current_user = Depends(get_current_user)):
    is_admin = getattr(current_user, "is_admin", False) or getattr(current_user, "role", "") == "admin"
    admin_tg_ids = getattr(settings, "ADMIN_TELEGRAM_IDS", [])
    if is_admin or (getattr(current_user, "telegram_user_id", None) in admin_tg_ids):
        return current_user
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Admin access required"
    )
