import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Integer, DateTime, Float
from sqlalchemy.dialects.postgresql import UUID
from ..db.base import Base, TimestampMixin

class RecurringItem(Base, TimestampMixin):
    __tablename__ = "recurring_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=True)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, nullable=False)
    quantity = Column(Numeric(10, 3), default=1, nullable=False)
    unit = Column(String, default="шт", nullable=False)
    interval_days = Column(Integer, nullable=False)
    last_added_at = Column(DateTime(timezone=True), nullable=True)
    next_due_at = Column(DateTime(timezone=True), index=True, nullable=True)
    enabled = Column(Boolean, default=True, nullable=False)

class SmartReorderEvent(Base, TimestampMixin):
    __tablename__ = "smart_reorder_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    product_name = Column(String, nullable=False)
    confidence = Column(Float, nullable=False)
    estimated_interval_days = Column(Float, nullable=False)
    last_purchase_at = Column(DateTime(timezone=True), nullable=False)
    next_expected_at = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="pending", nullable=False)
