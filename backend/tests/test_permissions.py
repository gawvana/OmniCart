import pytest
from uuid import uuid4
from backend.app.services.list_service import ListService
from backend.app.services.item_service import ItemService
from backend.app.core.exceptions import AuthorizationError
from backend.app.models.user import User

@pytest.mark.asyncio
class TestPermissions:
    async def test_user_cannot_access_other_user_list(self, session, test_user, test_list):
        # Create another user
        user2 = User(id=uuid4(), telegram_user_id=111222333, first_name='Other', language='ru', currency='UZS')
        session.add(user2)
        await session.commit()
        
        svc = ListService(session)
        with pytest.raises(AuthorizationError):
            await svc.check_access(user2.id, test_list.id)
    
    async def test_user_cannot_delete_other_user_item(self, session, test_user, test_list):
        item_svc = ItemService(session)
        item = await item_svc.create_item(
            user_id=test_user.id,
            list_id=test_list.id,
            data={'name': 'Test Item'}
        )
        
        user2 = User(id=uuid4(), telegram_user_id=444555666, first_name='Hacker', language='ru', currency='UZS')
        session.add(user2)
        await session.commit()
        
        with pytest.raises(AuthorizationError):
            await item_svc.delete_item(user2.id, item.id)
