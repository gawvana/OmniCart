import uuid
from sqlalchemy import Column, String, Boolean, ForeignKey, Numeric, Integer, UniqueConstraint, DateTime
from sqlalchemy.dialects.postgresql import UUID
from ..db.base import Base, TimestampMixin

class ShoppingList(Base, TimestampMixin):
    __tablename__ = "shopping_lists"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    family_id = Column(UUID(as_uuid=True), ForeignKey("families.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    emoji = Column(String, default="🛒", nullable=False)
    color = Column(String, default="#10b981", nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    is_archived = Column(Boolean, default=False, nullable=False)

class ShoppingListMember(Base, TimestampMixin):
    __tablename__ = "shopping_list_members"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(String, nullable=False)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    __table_args__ = (
        UniqueConstraint("list_id", "user_id", name="uq_shopping_list_member"),
    )

class ShoppingItem(Base, TimestampMixin):
    __tablename__ = "shopping_items"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    list_id = Column(UUID(as_uuid=True), ForeignKey("shopping_lists.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", ondelete="SET NULL"), nullable=True)
    name = Column(String, nullable=False)
    normalized_name = Column(String, nullable=False)
    quantity = Column(Numeric(10, 3), default=1, nullable=False)
    unit = Column(String, default="шт", nullable=False)
    estimated_price = Column(Numeric(12, 2), nullable=True)
    actual_price = Column(Numeric(12, 2), nullable=True)
    currency = Column(String, default="UZS", nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), nullable=True)
    note = Column(String, nullable=True)
    priority = Column(Integer, default=0, nullable=False)
    is_purchased = Column(Boolean, default=False, nullable=False)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    purchased_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    purchased_at = Column(DateTime(timezone=True), nullable=True)
    version = Column(Integer, default=1, nullable=False)
    client_mutation_id = Column(String, unique=True, index=True, nullable=True)

    @property
    def price(self):
        return self.actual_price or self.estimated_price

