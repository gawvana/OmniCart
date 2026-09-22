from redis.asyncio import Redis, ConnectionPool
from .config import get_settings

class RedisManager:
    def __init__(self):
        self.pool = None
        self.client = None

    async def connect(self):
        settings = get_settings()
        self.pool = ConnectionPool.from_url(settings.REDIS_URL, decode_responses=True)
        self.client = Redis(connection_pool=self.pool)

    async def disconnect(self):
        if self.client:
            await self.client.close()
        if self.pool:
            await self.pool.disconnect()

    def get_client(self) -> Redis:
        if not self.client:
            raise RuntimeError("Redis client not initialized")
        return self.client

redis_manager = RedisManager()

async def get_redis() -> Redis:
    return redis_manager.get_client()
