import hashlib
import hmac
import json
from datetime import datetime, timezone
from urllib.parse import parse_qsl
from fastapi import Request, Depends
from pydantic import BaseModel
from .config import get_settings
from .exceptions import AuthenticationError

class TelegramUser(BaseModel):
    id: int
    first_name: str
    last_name: str | None = None
    username: str | None = None
    language_code: str | None = None
    is_premium: bool | None = None

def validate_telegram_init_data(init_data: str, bot_token: str, max_age: int = 3600) -> TelegramUser:
    try:
        parsed_data = dict(parse_qsl(init_data))
        if "hash" not in parsed_data:
            raise AuthenticationError(message="Missing hash in init data")
            
        hash_value = parsed_data.pop("hash")
        
        # Sort params
        data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(parsed_data.items()))
        
        # HMAC with WebAppData-derived key
        secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
        computed_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if computed_hash != hash_value:
            raise AuthenticationError(message="Invalid hash")
            
        auth_date_raw = parsed_data.get("auth_date")
        if not auth_date_raw:
            raise AuthenticationError(message="Missing auth_date in init data")
        try:
            auth_date = int(auth_date_raw)
        except ValueError:
            raise AuthenticationError(message="Invalid auth_date format")
            
        now_ts = datetime.now(timezone.utc).timestamp()
        if auth_date > now_ts + 60:
            raise AuthenticationError(message="Init data auth_date is in the future")
        if (now_ts - auth_date) > max_age:
            raise AuthenticationError(message="Init data expired")
            
        user_json = parsed_data.get("user")
        if not user_json:
            raise AuthenticationError(message="User data missing")
            
        try:
            user_data = json.loads(user_json)
        except Exception:
            raise AuthenticationError(message="Malformed user JSON in init data")
            
        if not isinstance(user_data, dict) or not user_data.get("id"):
            raise AuthenticationError(message="Missing user id in init data")
            
        return TelegramUser(**user_data)
        
    except Exception as e:
        if isinstance(e, AuthenticationError):
            raise
        raise AuthenticationError(message=f"Invalid init data format: {str(e)}")

async def get_current_user(request: Request) -> TelegramUser:
    init_data = request.headers.get("X-Telegram-Init-Data")
    if not init_data:
        raise AuthenticationError(message="Missing X-Telegram-Init-Data header")
        
    settings = get_settings()
    return validate_telegram_init_data(init_data, settings.TELEGRAM_BOT_TOKEN)
