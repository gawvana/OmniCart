from aiogram import Dispatcher
from backend.app.bot.middlewares.auth import DatabaseMiddleware
from backend.app.bot.middlewares.i18n import I18nMiddleware
from backend.app.bot.handlers import start, commands, natural_language, callbacks

def setup_dispatcher() -> Dispatcher:
    dp = Dispatcher()
    
    # Register middlewares
    dp.update.middleware(DatabaseMiddleware())
    dp.update.middleware(I18nMiddleware())
    
    # Register routers
    dp.include_router(start.router)
    dp.include_router(commands.router)
    dp.include_router(callbacks.router)
    dp.include_router(natural_language.router)
    
    return dp
