from aiogram import Bot
from app.core.config import get_settings

def create_bot() -> Bot:
    settings = get_settings()
    return Bot(token=settings.TELEGRAM_BOT_TOKEN)
