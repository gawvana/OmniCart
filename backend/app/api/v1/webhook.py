import hmac
import hashlib
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from aiogram import Bot, Dispatcher
from aiogram.types import Update
from backend.app.core.config import get_settings
from backend.app.bot.bot import create_bot
from backend.app.bot.dispatcher import setup_dispatcher
import redis.asyncio as redis

router = APIRouter()
bot = create_bot()
dp = setup_dispatcher()
redis_client = redis.Redis(host='localhost', port=6379, db=0)

async def verify_telegram_token(x_telegram_bot_api_secret_token: str = Header(None)):
    settings = get_settings()
    if not x_telegram_bot_api_secret_token or not hmac.compare_digest(
        x_telegram_bot_api_secret_token, settings.TELEGRAM_SECRET_TOKEN
    ):
        raise HTTPException(status_code=401, detail="Invalid secret token")

@router.post("/webhook", dependencies=[Depends(verify_telegram_token)])
async def telegram_webhook(request: Request):
    data = await request.json()
    update = Update(**data)
    
    # Deduplication
    cache_key = f"tg_update_{update.update_id}"
    is_new = await redis_client.set(cache_key, "1", nx=True, ex=7200)
    
    if is_new:
        await dp.feed_update(bot, update)
        
    return {"status": "ok"}

@router.post("/setup-webhook")
async def setup_webhook(admin_token: str):
    settings = get_settings()
    if not hmac.compare_digest(admin_token, settings.ADMIN_SECRET):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    webhook_url = f"{settings.WEBHOOK_BASE_URL}/api/v1/bot/webhook"
    await bot.set_webhook(url=webhook_url, secret_token=settings.TELEGRAM_SECRET_TOKEN)
    return {"status": "Webhook set", "url": webhook_url}
