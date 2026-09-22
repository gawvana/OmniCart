import pytest
from uuid import uuid4
from backend.app.services.family_service import FamilyService
from backend.app.core.exceptions import AuthorizationError, NotFoundError

@pytest.mark.asyncio
class TestFamilyService:
    async def test_create_family(self, session, test_user):
        svc = FamilyService(session)
        family = await svc.create_family(test_user.id, 'Моя семья')
        assert family.name == 'Моя семья'
        assert family.created_by == test_user.id
    
    async def test_create_invite(self, session, test_user):
        svc = FamilyService(session)
        family = await svc.create_family(test_user.id, 'Test Family')
        invite = await svc.create_invite(test_user.id, family.id)
        assert invite.token is not None
        assert len(invite.token) > 20
    
    async def test_expired_invite(self, session, test_user):
        from datetime import datetime, timedelta, timezone
        svc = FamilyService(session)
        family = await svc.create_family(test_user.id, 'Test Family')
        invite = await svc.create_invite(test_user.id, family.id)
        # Manually expire it
        invite.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
        await session.commit()
        
        # Create another user to try joining
        from backend.app.models.user import User
        user2 = User(id=uuid4(), telegram_user_id=987654321, first_name='User2', language='ru', currency='UZS')
        session.add(user2)
        await session.commit()
        
        with pytest.raises(Exception):  # Should raise error for expired invite
            await svc.join_family(user2.id, invite.token)
