import asyncio
import logging
from app.bot.bot import create_bot
from app.bot.dispatcher import setup_dispatcher
from app.core.database import init_db

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def main():
    await init_db()
    bot = create_bot()
    dp = setup_dispatcher()
    
    try:
        logger.info("Starting bot polling...")
        await dp.start_polling(bot)
    finally:
        await bot.session.close()

if __name__ == "__main__":
    asyncio.run(main())
