from functools import lru_cache
from typing import Optional, List, Union
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str = "omnicart-super-secret-production-key-2026-secure"

    TELEGRAM_BOT_TOKEN: str = ""
    TELEGRAM_WEBAPP_URL: str = "https://frontend-umber-seven-66.vercel.app"
    TELEGRAM_WEBHOOK_SECRET: str = "omnicart-webhook-secret-token-2026"
    BOT_MODE: str = "polling"
    ADMIN_TELEGRAM_IDS: List[int] = []

    DATABASE_URL: str = "sqlite+aiosqlite:///./omnicart.db"
    REDIS_URL: str = "redis://localhost:6379/0"

    SUPABASE_URL: Optional[str] = None
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None

    AI_PROVIDER: str = "groq"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "openai/gpt-oss-20b"
    GROQ_FAST_MODEL: str = "openai/gpt-oss-20b"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    @property
    def WEBAPP_URL(self) -> str:
        return self.TELEGRAM_WEBAPP_URL

    @property
    def BOT_TOKEN(self) -> str:
        return self.TELEGRAM_BOT_TOKEN

    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_MINUTE: int = 10

    ALLOWED_ORIGINS: Union[List[str], str] = ["*"]
    SENTRY_DSN: Optional[str] = None

    AI_PARSER_ENABLED: bool = True
    AI_PLANNER_ENABLED: bool = True
    BUDGET_ENABLED: bool = True
    PRICE_HISTORY_ENABLED: bool = True
    RECURRING_ENABLED: bool = True
    SMART_REORDER_ENABLED: bool = True
    FAMILY_ENABLED: bool = True
    ANALYTICS_ENABLED: bool = True

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

@lru_cache
def get_settings() -> Settings:
    return Settings()

settings = get_settings()

