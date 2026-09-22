from typing import Any, Awaitable, Callable, Dict
from aiogram import BaseMiddleware
from aiogram.types import TelegramObject, User
from backend.app.core.database import get_db_session
from backend.app.services.user_service import UserService

class DatabaseMiddleware(BaseMiddleware):
    async def __call__(
        self,
        handler: Callable[[TelegramObject, Dict[str, Any]], Awaitable[Any]],
        event: TelegramObject,
        data: Dict[str, Any]
    ) -> Any:
        tg_user: User = data.get("event_from_user")
        
        async for session in get_db_session():
            data["db_session"] = session
            if tg_user:
                user_service = UserService(session)
                user = await user_service.get_or_create_by_telegram_id(
                    telegram_id=str(tg_user.id),
                    username=tg_user.username,
                    first_name=tg_user.first_name,
                    last_name=tg_user.last_name,
                    language_code=tg_user.language_code
                )
                data["user"] = user
            
            return await handler(event, data)
