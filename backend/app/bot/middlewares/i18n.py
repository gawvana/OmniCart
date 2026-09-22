from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject

class I18nMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        user = data.get("user")
        tg_user = data.get("event_from_user")
        
        lang = "en"
        if user and hasattr(user, "language_code") and user.language_code:
            lang = user.language_code
        elif tg_user and tg_user.language_code:
            lang = tg_user.language_code
            
        data["lang"] = lang
        return await handler(event, data)
