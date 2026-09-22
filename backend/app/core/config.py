from functools import lru_cache
from typing import Optional, List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    DEBUG: bool = True
    LOG_LEVEL: str = "INFO"
    SECRET_KEY: str

    TELEGRAM_BOT_TOKEN: str
    TELEGRAM_WEBAPP_URL: str
    TELEGRAM_WEBHOOK_SECRET: str
    BOT_MODE: str = "polling"

    DATABASE_URL: str
    REDIS_URL: str

    AI_PROVIDER: str = "groq"
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama3-8b-8192"
    GROQ_FAST_MODEL: str = "llama3-8b-8192"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-pro"

    RATE_LIMIT_PER_MINUTE: int = 60
    AI_RATE_LIMIT_PER_MINUTE: int = 10

    ALLOWED_ORIGINS: List[str] = ["*"]
    SENTRY_DSN: Optional[str] = None

    AI_PARSER_ENABLED: bool = True
    AI_PLANNER_ENABLED: bool = True
    BUDGET_ENABLED: bool = True
    PRICE_HISTORY_ENABLED: bool = True
    RECURRING_ENABLED: bool = True
    SMART_REORDER_ENABLED: bool = True
    FAMILY_ENABLED: bool = True
    ANALYTICS_ENABLED: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

@lru_cache
def get_settings() -> Settings:
    return Settings()
