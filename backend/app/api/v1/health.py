from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from typing import Optional
import redis.asyncio as redis

from app.api.deps import get_db, get_redis

router = APIRouter()

@router.get("/health/live")
@router.get("/health")
async def liveness_check():
    """Liveness probe: process is alive and responsive."""
    return {"status": "alive"}

@router.get("/health/ready")
@router.get("/ready")
async def readiness_check(
    request: Request,
    db: AsyncSession = Depends(get_db),
    redis_client: Optional[redis.Redis] = Depends(get_redis)
):
    """Readiness probe: verify DB and Redis dependencies."""
    db_ok = False
    redis_ok = False
    errors = {}

    # Check DB
    try:
        res = await db.execute(text("SELECT 1"))
        db_ok = res.scalar() == 1
    except Exception as e:
        errors["db"] = str(e)

    # Check Redis
    if redis_client:
        try:
            redis_ok = await redis_client.ping()
        except Exception as e:
            errors["redis"] = str(e)
    else:
        # If in-memory or unconfigured
        redis_ok = True

    if not db_ok or not redis_ok:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={
                "status": "not_ready",
                "database": "ok" if db_ok else "unreachable",
                "redis": "ok" if redis_ok else "unreachable",
                "errors": errors
            }
        )

    return {
        "status": "ready",
        "database": "ok",
        "redis": "ok"
    }
