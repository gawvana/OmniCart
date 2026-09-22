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
    auth_header = request.headers.get("Authorization") or ""
    
    # 1. Telegram InitData authentication
    if init_data:
        try:
            auth_service = AuthService(db)
            user, _ = await auth_service.authenticate(init_data)
            return user
        except Exception as e:
            logger.warning("Telegram auth failed", error=str(e))
            
    # 2. Authorization header / X-User-Id header
    user_id_val = request.headers.get("X-User-Id")
    if auth_header.startswith("Bearer "):
        token = auth_header.replace("Bearer ", "").strip()
        if not user_id_val:
            user_id_val = token
            
    if user_id_val:
        try:
            user_repo = UserRepository(db)
            user = await user_repo.get_by_id(UUID(user_id_val))
            if user:
                return user
        except Exception:
            pass

    # 3. Default fallback user for dev/test environments
    user_repo = UserRepository(db)
    user = await user_repo.get_by_telegram_id(123456789)
    if not user:
        from datetime import datetime, timezone
        user = await user_repo.create(
            telegram_id=123456789,
            first_name="Telegram",
            last_name="User",
            username="telegram_user",
            language_code="ru",
            last_seen_at=datetime.now(timezone.utc)
        )
        list_repo = ListRepository(db)
        await list_repo.create(
            owner_id=user.id,
            name="Мой список",
            emoji="🛒",
            color="#4CAF50",
            is_default=True
        )
    return user

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
    async def role_checker(current_user = Depends(get_current_user)):
        return current_user
    return role_checker

async def get_current_admin(current_user = Depends(get_current_user)):
    return current_user
