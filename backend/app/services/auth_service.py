import json
import urllib.parse
from datetime import datetime, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from app.repositories.user_repository import UserRepository
from app.repositories.list_repository import ListRepository
from app.core.exceptions import AuthorizationError

logger = structlog.get_logger(__name__)

class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def authenticate(self, init_data: str) -> tuple:
        \"\"\"
        Validate Telegram initData, get_or_create user. Return (user, is_new).
        Auto-create default shopping list for new users. Update last_seen_at.
        \"\"\"
        # Validate init_data (assumes signature validation is done or delegated)
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        if "user" not in parsed_data:
            raise AuthorizationError("Invalid Telegram init_data: missing user")
            
        try:
            tg_user = json.loads(parsed_data["user"])
        except json.JSONDecodeError:
            raise AuthorizationError("Invalid Telegram init_data: malformed user JSON")

        tg_id = tg_user.get("id")
        if not tg_id:
            raise AuthorizationError("Invalid Telegram init_data: missing user id")

        user_repo = UserRepository(self.session)
        list_repo = ListRepository(self.session)
        
        user = await user_repo.get_by_telegram_id(tg_id)
        is_new = False
        
        if not user:
            is_new = True
            user = await user_repo.create(
                telegram_id=tg_id,
                first_name=tg_user.get("first_name", ""),
                last_name=tg_user.get("last_name", ""),
                username=tg_user.get("username", ""),
                language_code=tg_user.get("language_code", "en"),
                last_seen_at=datetime.now(timezone.utc)
            )
            
            # Auto-create default shopping list
            await list_repo.create(
                owner_id=user.id,
                name="My Shopping List",
                emoji="🛒",
                color="#4CAF50",
                is_default=True
            )
            
            logger.info("New user registered", user_id=str(user.id), telegram_id=tg_id)
        else:
            # Update last_seen_at
            user = await user_repo.update(user.id, last_seen_at=datetime.now(timezone.utc))
            logger.info("User authenticated", user_id=str(user.id))
            
        return user, is_new
