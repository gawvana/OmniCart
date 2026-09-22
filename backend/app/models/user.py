import uuid
from sqlalchemy import Column, String, Boolean, BigInteger, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from ..db.base import Base, TimestampMixin, SoftDeleteMixin

class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    telegram_user_id = Column(BigInteger, unique=True, index=True, nullable=False)
    username = Column(String, nullable=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    language = Column(String, default="ru", nullable=False)
    timezone = Column(String, nullable=True)
    country = Column(String, nullable=True)
    city = Column(String, nullable=True)
    currency = Column(String, default="UZS", nullable=False)
    last_seen_at = Column(String, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)

class UserSettings(Base, TimestampMixin):
    __tablename__ = "user_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    language = Column(String, nullable=True)
    currency = Column(String, nullable=True)
    city = Column(String, nullable=True)
    timezone = Column(String, nullable=True)
    theme = Column(String, default="auto", nullable=False)
    notifications_enabled = Column(Boolean, default=True, nullable=False)
    ai_enabled = Column(Boolean, default=True, nullable=False)
    notification_preferences = Column(JSON, default=dict, nullable=False)
