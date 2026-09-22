import hashlib

class AICache:
    def __init__(self, redis_client):
        self.redis = redis_client
        self.default_ttl = 3600  # 1 hour
    
    async def get(self, operation: str, input_hash: str) -> str | None:
        key = f"ai:cache:{operation}:{input_hash}"
        val = await self.redis.get(key)
        return val.decode('utf-8') if val else None
    
    async def set(self, operation: str, input_hash: str, result: str, ttl: int | None = None) -> None:
        key = f"ai:cache:{operation}:{input_hash}"
        await self.redis.set(key, result, ex=ttl or self.default_ttl)
    
    @staticmethod
    def hash_input(text: str) -> str:
        return hashlib.sha256(text.encode('utf-8')).hexdigest()[:16]
