import hmac
import hashlib
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from aiogram import Bot, Dispatcher
from aiogram.types import Update
from app.core.config import get_settings
from app.bot.bot import create_bot
from app.bot.dispatcher import setup_dispatcher
import redis.asyncio as redis

router = APIRouter()

_bot = None
_dp = None

def get_bot():
    global _bot
    if _bot is None:
        _bot = create_bot()
    return _bot

def get_dp():
    global _dp
    if _dp is None:
        _dp = setup_dispatcher()
    return _dp

async def verify_telegram_token(x_telegram_bot_api_secret_token: str = Header(None)):
    settings = get_settings()
    secret = getattr(settings, "TELEGRAM_WEBHOOK_SECRET", None) or getattr(settings, "TELEGRAM_SECRET_TOKEN", "")
    if not x_telegram_bot_api_secret_token or not hmac.compare_digest(
        x_telegram_bot_api_secret_token, secret
    ):
        raise HTTPException(status_code=401, detail="Invalid secret token")

@router.post("/webhook", dependencies=[Depends(verify_telegram_token)])
async def telegram_webhook(request: Request):
    data = await request.json()
    update = Update(**data)
    
    bot_instance = get_bot()
    dp_instance = get_dp()
    await dp_instance.feed_update(bot_instance, update)
    return {"status": "ok"}

@router.post("/setup-webhook")
async def setup_webhook(admin_token: str):
    settings = get_settings()
    expected_secret = getattr(settings, "SECRET_KEY", "omnicart-admin")
    if not hmac.compare_digest(admin_token, expected_secret):
        raise HTTPException(status_code=401, detail="Unauthorized")
        
    secret = getattr(settings, "TELEGRAM_WEBHOOK_SECRET", "")
    bot_instance = get_bot()
    webhook_url = f"{settings.WEBAPP_URL}/api/v1/bot/webhook"
    await bot_instance.set_webhook(url=webhook_url, secret_token=secret)
    return {"status": "Webhook set", "url": webhook_url}
