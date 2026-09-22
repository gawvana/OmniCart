import pytest
import time
import json
import hmac
import hashlib
from uuid import uuid4
from urllib.parse import urlencode
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.config import settings
from app.core.exceptions import (
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    ValidationError,
)
from app.models.user import User
from app.models.shopping import ShoppingList, ShoppingItem
from app.models.family import Family, FamilyMember
from app.services.list_service import ListService
from app.services.item_service import ItemService
from app.services.budget_service import BudgetService
from app.services.family_service import FamilyService
from app.repositories.family_repo import FamilyRepository
from app.api.deps import get_current_user, get_db

BOT_TOKEN = "8857323456:AAEZanVbPfk44RjV8BcgjKLT957t5pDM5Ac"

def generate_test_init_data(user_dict: dict, auth_date: int | None = None, bot_token: str = BOT_TOKEN) -> str:
    if auth_date is None:
        auth_date = int(time.time())
    user_json = json.dumps(user_dict, separators=(",", ":"), ensure_ascii=False)
    params = {
        "auth_date": str(auth_date),
        "query_id": "AAHdF6IQAAAAAN0XohD72r8q",
        "user": user_json,
    }
    data_check_string = "\n".join(f"{k}={v}" for k, v in sorted(params.items()))
    secret_key = hmac.new(b"WebAppData", bot_token.encode(), hashlib.sha256).digest()
    hash_val = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    params["hash"] = hash_val
    return urlencode(params)


@pytest.mark.asyncio
class TestSecurityRedTeam:

    async def test_auth_001_missing_init_data(self):
        """TEST AUTH-001: Request with no Telegram initData -> 401."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me")
            assert res.status_code == 401
            assert "detail" in res.json() or "error" in res.json()

    async def test_auth_002_malformed_init_data(self):
        """TEST AUTH-002: Malformed Telegram initData -> 401/422."""
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            headers = {"X-Telegram-Init-Data": "user=broken_not_json&hash=123"}
            res = await ac.get("/api/v1/auth/me", headers=headers)
            assert res.status_code in (401, 422)

    async def test_auth_003_invalid_telegram_hash(self):
        """TEST AUTH-003: Invalid Telegram hash -> 401."""
        valid_data = generate_test_init_data({"id": 999901, "first_name": "Alice"})
        tampered = valid_data.replace("hash=", "hash=deadbeef00000000000000000000000000000000000000000000000000000000")
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me", headers={"X-Telegram-Init-Data": tampered})
            assert res.status_code == 401

    async def test_auth_004_expired_auth_date(self):
        """TEST AUTH-004: Expired auth_date -> 401."""
        two_days_ago = int(time.time()) - 172800
        expired_data = generate_test_init_data({"id": 999902, "first_name": "Bob"}, auth_date=two_days_ago)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me", headers={"X-Telegram-Init-Data": expired_data})
            assert res.status_code == 401

    async def test_auth_005_future_auth_date(self):
        """TEST AUTH-005: Future auth_date -> reject 401."""
        far_future = int(time.time()) + 7200
        future_data = generate_test_init_data({"id": 999903, "first_name": "Charlie"}, auth_date=far_future)
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me", headers={"X-Telegram-Init-Data": future_data})
            assert res.status_code == 401

    async def test_auth_006_fake_x_user_id(self):
        """TEST AUTH-006: Fake X-User-Id header without valid initData -> rejected 401."""
        fake_uuid = str(uuid4())
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me", headers={"X-User-Id": fake_uuid})
            assert res.status_code == 401

    async def test_auth_007_fake_bearer_uuid(self):
        """TEST AUTH-007: Fake Bearer token without valid initData -> rejected 401."""
        fake_uuid = str(uuid4())
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {fake_uuid}"})
            assert res.status_code == 401

    async def test_auth_008_user_a_accessing_user_b_list(self, session):
        """TEST AUTH-008: User A accessing User B list -> 403/404."""
        user_a = User(id=uuid4(), telegram_user_id=111, first_name="A", language="ru")
        user_b = User(id=uuid4(), telegram_user_id=222, first_name="B", language="ru")
        session.add_all([user_a, user_b])
        await session.flush()

        list_b = ShoppingList(id=uuid4(), owner_id=user_b.id, name="B List")
        session.add(list_b)
        await session.commit()

        list_svc = ListService(session)
        with pytest.raises((AuthorizationError, NotFoundError)):
            await list_svc.get_list(user_a.id, list_b.id)

    async def test_auth_009_user_a_modifying_user_b_item(self, session):
        """TEST AUTH-009: User A mutating User B item -> 403/404."""
        user_a = User(id=uuid4(), telegram_user_id=112, first_name="A", language="ru")
        user_b = User(id=uuid4(), telegram_user_id=223, first_name="B", language="ru")
        session.add_all([user_a, user_b])
        await session.flush()

        list_b = ShoppingList(id=uuid4(), owner_id=user_b.id, name="B List")
        session.add(list_b)
        await session.flush()

        item_b = ShoppingItem(id=uuid4(), list_id=list_b.id, name="Apple", normalized_name="apple")
        session.add(item_b)
        await session.commit()

        item_svc = ItemService(session)
        with pytest.raises((AuthorizationError, NotFoundError)):
            await item_svc.update_item(user_a.id, item_b.id, name="Hacked Apple")

    async def test_auth_010_user_a_modifying_user_b_budget(self, session):
        """TEST AUTH-010: User A modifying User B budget -> 403/404."""
        user_a = User(id=uuid4(), telegram_user_id=113, first_name="A", language="ru")
        user_b = User(id=uuid4(), telegram_user_id=224, first_name="B", language="ru")
        session.add_all([user_a, user_b])
        await session.flush()

        budget_svc = BudgetService(session)
        budget_b = await budget_svc.create_budget(user_b.id, amount=100000)

        with pytest.raises((AuthorizationError, NotFoundError)):
            await budget_svc.update_budget(user_a.id, budget_b.id, amount=999999)

    async def test_auth_011_viewer_modifying_list_item(self, session):
        """TEST AUTH-011: Viewer attempting item mutation -> 403/404."""
        owner = User(id=uuid4(), telegram_user_id=114, first_name="Owner", language="ru")
        viewer = User(id=uuid4(), telegram_user_id=225, first_name="Viewer", language="ru")
        session.add_all([owner, viewer])
        await session.flush()

        lst = ShoppingList(id=uuid4(), owner_id=owner.id, name="Shared List")
        session.add(lst)
        await session.flush()

        list_svc = ListService(session)
        await list_svc.add_member(owner.id, lst.id, viewer.id, role="viewer")
        await session.commit()

        item_svc = ItemService(session)
        with pytest.raises((AuthorizationError, NotFoundError)):
            await item_svc.create_item(viewer.id, lst.id, {"name": "Unauthorized Item"})

    async def test_auth_012_normal_user_accessing_admin_stats(self, session):
        """TEST AUTH-012: Normal non-admin user accessing admin stats -> 403 Forbidden."""
        normal_user = User(
            id=uuid4(),
            telegram_user_id=777888999,
            first_name="Regular",
            is_admin=False,
            role="user"
        )
        session.add(normal_user)
        await session.commit()

        app.dependency_overrides[get_current_user] = lambda: normal_user
        app.dependency_overrides[get_db] = lambda: session
        try:
            async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
                res = await ac.get("/api/v1/admin/stats")
                assert res.status_code == 403
        finally:
            app.dependency_overrides.clear()

    async def test_auth_013_reuse_family_invite(self, session):
        """TEST AUTH-013: Reuse family invite token -> reject."""
        owner = User(id=uuid4(), telegram_user_id=301, first_name="Owner", language="ru")
        member_1 = User(id=uuid4(), telegram_user_id=302, first_name="Member1", language="ru")
        member_2 = User(id=uuid4(), telegram_user_id=303, first_name="Member2", language="ru")
        session.add_all([owner, member_1, member_2])
        await session.flush()

        family_svc = FamilyService(session)
        family = await family_svc.create_family(owner.id, "Smiths")
        invite = await family_svc.create_invite(owner.id, family.id)

        # First use succeeds
        await family_svc.join_family(member_1.id, invite.token)

        # Second use with same token MUST be rejected
        with pytest.raises((ValidationError, ConflictError)):
            await family_svc.join_family(member_2.id, invite.token)

    async def test_auth_014_race_two_joins_with_one_invite(self, session):
        """TEST AUTH-014: Race two joins with one invite -> exactly one succeeds."""
        owner = User(id=uuid4(), telegram_user_id=401, first_name="Owner", language="ru")
        user1 = User(id=uuid4(), telegram_user_id=402, first_name="User1", language="ru")
        user2 = User(id=uuid4(), telegram_user_id=403, first_name="User2", language="ru")
        session.add_all([owner, user1, user2])
        await session.flush()

        family_repo = FamilyRepository(session)
        family = await family_repo.create(name="Racing Family", created_by=owner.id)
        from datetime import datetime, timedelta, timezone
        invite = await family_repo.create_invite(
            family_id=family.id,
            token="race-test-token-1234",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
            created_by=owner.id
        )
        await session.commit()

        # Simulate race: both attempt to claim atomically
        claim1 = await family_repo.use_invite(invite.id, used_by_id=user1.id)
        claim2 = await family_repo.use_invite(invite.id, used_by_id=user2.id)

        assert claim1 is True
        assert claim2 is False  # Exactly one claim succeeds!

    async def test_auth_015_direct_storage_or_idor_manipulation(self, session):
        """TEST AUTH-015: Direct IDOR manipulation -> blocked."""
        user_victim = User(id=uuid4(), telegram_user_id=501, first_name="Victim", language="ru")
        user_attacker = User(id=uuid4(), telegram_user_id=502, first_name="Attacker", language="ru")
        session.add_all([user_victim, user_attacker])
        await session.flush()

        list_victim = ShoppingList(id=uuid4(), owner_id=user_victim.id, name="Private List")
        session.add(list_victim)
        await session.commit()

        list_svc = ListService(session)
        # Attacker tries to share victim's list
        with pytest.raises(AuthorizationError):
            await list_svc.add_member(user_attacker.id, list_victim.id, user_attacker.id, role="editor")
