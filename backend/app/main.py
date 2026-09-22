import sys
from pathlib import Path

_backend_dir = str(Path(__file__).resolve().parent.parent)
if sys.path[0] != _backend_dir:
    if _backend_dir in sys.path:
        sys.path.remove(_backend_dir)
    sys.path.insert(0, _backend_dir)

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import redis.asyncio as redis
from pydantic import ValidationError

from app.api.v1 import router as v1_router
from app.api.v1.health import router as health_router
from app.core.config import settings
from app.core.exceptions import AppException
# from app.core.middleware import RequestIDMiddleware, LoggingMiddleware
# from app.core.ai_router import AIRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.redis_client = redis.from_url(settings.REDIS_URL, decode_responses=True)
    # app.state.ai_router = AIRouter(settings)
    app.state.ai_router = None
    yield
    await app.state.redis_client.close()

app = FastAPI(
    title="OmniCart AI",
    version="2.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# app.add_middleware(RequestIDMiddleware)
# app.add_middleware(LoggingMiddleware)

@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message, "request_id": getattr(request.state, "request_id", "")}}
    )

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    return JSONResponse(
        status_code=422,
        content={"error": {"code": "VALIDATION_ERROR", "message": str(exc), "request_id": getattr(request.state, "request_id", "")}}
    )

app.include_router(health_router)
app.include_router(v1_router, prefix="/api/v1")
