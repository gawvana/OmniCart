import time

class AIRateLimiter:
    def __init__(self, redis_client, max_requests: int = 20, window: int = 60):
        self.redis = redis_client
        self.max_requests = max_requests
        self.window = window
    
    async def check(self, user_id: str) -> bool:
        key = f"ai:ratelimit:{user_id}"
        current_time = time.time()
        window_start = current_time - self.window
        
        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        pipe.zadd(key, {str(current_time): current_time})
        pipe.expire(key, self.window)
        results = await pipe.execute()
        
        request_count = results[1]
        
        return request_count < self.max_requests
    
    async def get_remaining(self, user_id: str) -> int:
        key = f"ai:ratelimit:{user_id}"
        current_time = time.time()
        window_start = current_time - self.window
        
        pipe = self.redis.pipeline()
        pipe.zremrangebyscore(key, 0, window_start)
        pipe.zcard(key)
        results = await pipe.execute()
        
        request_count = results[1]
        
        return max(0, self.max_requests - request_count)
