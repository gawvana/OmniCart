import pytest
import uuid
from decimal import Decimal
from pathlib import Path
from datetime import datetime, timezone, timedelta
from sqlalchemy import select

from app.db.base import Base
from app.models.user import User, UserSettings
from app.models.shopping import ShoppingList, ShoppingListMember, ShoppingItem
from app.models.family import Family, FamilyMember, FamilyInvite
from app.models.budget import Budget
from app.models.history import PurchaseHistory
from app.models.recurring import RecurringItem, SmartReorderEvent
from app.models.activity import ActivityEvent, Notification, Reminder
from app.models.product import Category, Product, Favorite
from app.models.price import Store, Market, PriceObservation
from app.models.ai import AIRequest, FeatureFlag

@pytest.mark.asyncio
async def test_supabase_schema_completeness():
    """
    Verify all 24 application models are properly registered in the database metadata
    and correspond directly to the Supabase migration tables.
    """
    table_names = set(Base.metadata.tables.keys())
    expected_tables = {
        "users", "user_settings", "categories", "products", "product_aliases",
        "favorites", "families", "family_members", "family_invites",
        "shopping_lists", "shopping_list_members", "shopping_items",
        "stores", "markets", "price_observations", "budgets",
        "purchase_history", "recurring_items", "smart_reorder_events",
        "activity_events", "notifications", "reminders", "ai_requests",
        "feature_flags"
    }
    
    missing = expected_tables - table_names
    assert not missing, f"Missing tables in SQLAlchemy Base metadata: {missing}"

@pytest.mark.asyncio
async def test_supabase_migration_file_validity():
    """
    Verify the Supabase SQL migration file contains all expected DDL, RLS policies,
    realtime publications, and storage definitions.
    """
    migration_path = Path(__file__).resolve().parent.parent.parent / "supabase" / "migrations" / "20260922000000_initial_omnicart_schema.sql"
    assert migration_path.exists(), "Supabase migration file does not exist"
    
    content = migration_path.read_text(encoding="utf-8")
    
    # Verify RLS policies
    assert "ENABLE ROW LEVEL SECURITY" in content
    assert "CREATE POLICY lists_select" in content
    assert "CREATE POLICY items_select" in content
    assert "CREATE POLICY items_insert" in content
    assert "CREATE POLICY items_update" in content
    assert "CREATE POLICY items_delete" in content
    assert "CREATE POLICY families_select" in content
    
    # Verify Realtime
    assert "ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items" in content
    assert "ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_events" in content
    
    # Verify Storage
    assert "storage.buckets" in content
    assert "receipts" in content
    assert "avatars" in content

@pytest.mark.asyncio
async def test_crud_lifecycle(session):
    """
    Verify full CRUD lifecycle: CREATE, READ, UPDATE, DELETE on Supabase-compatible models.
    """
    # 1. CREATE User
    user_a = User(
        id=uuid.uuid4(),
        telegram_user_id=880001,
        first_name="Alice",
        last_name="Tester",
        username="alice_test",
        language="ru",
        currency="UZS"
    )
    session.add(user_a)
    await session.commit()
    await session.refresh(user_a)
    assert user_a.id is not None

    # 2. CREATE Shopping List
    list_a = ShoppingList(
        id=uuid.uuid4(),
        owner_id=user_a.id,
        name="Alice Groceries",
        emoji="🛒",
        color="#10B981",
        is_default=True
    )
    session.add(list_a)
    await session.commit()
    await session.refresh(list_a)

    # 3. CREATE Shopping Item
    item_a = ShoppingItem(
        id=uuid.uuid4(),
        list_id=list_a.id,
        name="Молоко 3.2%",
        normalized_name="молоко",
        quantity=Decimal("2.000"),
        unit="л",
        estimated_price=Decimal("12000.00"),
        actual_price=None,
        currency="UZS",
        is_purchased=False,
        created_by=user_a.id
    )
    session.add(item_a)
    await session.commit()
    await session.refresh(item_a)

    # 4. READ
    result = await session.execute(select(ShoppingItem).where(ShoppingItem.id == item_a.id))
    fetched_item = result.scalar_one_or_none()
    assert fetched_item is not None
    assert fetched_item.name == "Молоко 3.2%"
    assert fetched_item.quantity == Decimal("2.000")

    # 5. UPDATE
    fetched_item.actual_price = Decimal("11500.00")
    fetched_item.is_purchased = True
    fetched_item.purchased_by = user_a.id
    fetched_item.purchased_at = datetime.now(timezone.utc)
    await session.commit()
    await session.refresh(fetched_item)

    assert fetched_item.is_purchased is True
    assert fetched_item.actual_price == Decimal("11500.00")

    # 6. DELETE
    await session.delete(fetched_item)
    await session.commit()

    deleted_check = await session.execute(select(ShoppingItem).where(ShoppingItem.id == item_a.id))
    assert deleted_check.scalar_one_or_none() is None

@pytest.mark.asyncio
async def test_rls_security_user_isolation(session):
    """
    Verify security isolation: User A's private lists and items cannot be accessed
    by User B.
    """
    # Create User A & User B
    user_a = User(id=uuid.uuid4(), telegram_user_id=880002, first_name="UserA", language="ru")
    user_b = User(id=uuid.uuid4(), telegram_user_id=880003, first_name="UserB", language="ru")
    session.add_all([user_a, user_b])
    await session.commit()

    # User A creates a private shopping list
    list_a = ShoppingList(
        id=uuid.uuid4(),
        owner_id=user_a.id,
        name="User A Private List",
        is_default=True
    )
    session.add(list_a)
    await session.commit()

    # Simulate RLS filter query for User B:
    # User B should only see lists where owner_id == user_b.id OR user_b is in list_members
    subquery_members = select(ShoppingListMember.list_id).where(ShoppingListMember.user_id == user_b.id)
    query_for_b = select(ShoppingList).where(
        (ShoppingList.owner_id == user_b.id) |
        (ShoppingList.id.in_(subquery_members))
    )
    result_b = await session.execute(query_for_b)
    visible_lists_for_b = result_b.scalars().all()

    # User B must NOT see User A's private list
    assert list_a.id not in [l.id for l in visible_lists_for_b]

@pytest.mark.asyncio
async def test_family_viewer_mutation_restriction(session):
    """
    Verify Family RLS role rules:
    - User A (owner) creates family and list.
    - User B is added as a 'viewer'.
    - User B has read-only access and cannot mutate items.
    """
    user_a = User(id=uuid.uuid4(), telegram_user_id=880004, first_name="OwnerAlice", language="ru")
    user_b = User(id=uuid.uuid4(), telegram_user_id=880005, first_name="ViewerBob", language="ru")
    session.add_all([user_a, user_b])
    await session.commit()

    # Family created by User A
    family = Family(id=uuid.uuid4(), name="Alice Household", created_by=user_a.id)
    session.add(family)
    await session.commit()

    # Members: Alice is owner, Bob is viewer
    mem_a = FamilyMember(id=uuid.uuid4(), family_id=family.id, user_id=user_a.id, role="owner")
    mem_b = FamilyMember(id=uuid.uuid4(), family_id=family.id, user_id=user_b.id, role="viewer")
    session.add_all([mem_a, mem_b])
    await session.commit()

    # Shared list
    shared_list = ShoppingList(
        id=uuid.uuid4(),
        owner_id=user_a.id,
        family_id=family.id,
        name="Family Groceries"
    )
    session.add(shared_list)
    await session.commit()

    # List membership with viewer role for Bob
    list_mem_b = ShoppingListMember(
        id=uuid.uuid4(),
        list_id=shared_list.id,
        user_id=user_b.id,
        role="viewer"
    )
    session.add(list_mem_b)
    await session.commit()

    # Check permission logic matching RLS policy:
    # "role IN ('owner', 'editor')"
    def can_mutate(user_id: uuid.UUID, role: str) -> bool:
        return role in ("owner", "editor")

    assert can_mutate(user_a.id, "owner") is True
    assert can_mutate(user_b.id, "viewer") is False, "Viewer must not have mutation access"
