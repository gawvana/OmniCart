import uuid
from sqlalchemy import Column, String, ForeignKey, Numeric, Date
from sqlalchemy.dialects.postgresql import UUID
from ..db.base import Base, TimestampMixin

class Budget(Base, TimestampMixin):
    __tablename__ = "budgets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=True)
    name = Column(String, nullable=True)
    amount = Column(Numeric(14, 2), nullable=False)
    currency = Column(String, default="UZS", nullable=False)
    period = Column(String, nullable=False)
    spent_amount = Column(Numeric(14, 2), default=0, nullable=False)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
