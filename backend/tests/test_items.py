import pytest
from decimal import Decimal
from uuid import uuid4
from backend.app.services.item_service import ItemService
from backend.app.services.list_service import ListService

@pytest.mark.asyncio
class TestItemService:
    async def test_create_item(self, session, test_user, test_list):
        svc = ItemService(session)
        item = await svc.create_item(
            user_id=test_user.id,
            list_id=test_list.id,
            data={'name': 'Молоко', 'quantity': Decimal('2'), 'unit': 'л'}
        )
        assert item.name == 'Молоко'
        assert item.quantity == Decimal('2')
        assert item.is_purchased == False
    
    async def test_idempotent_create(self, session, test_user, test_list):
        svc = ItemService(session)
        mutation_id = 'test-mutation-1'
        item1 = await svc.create_item(
            user_id=test_user.id,
            list_id=test_list.id,
            data={'name': 'Хлеб', 'client_mutation_id': mutation_id}
        )
        item2 = await svc.create_item(
            user_id=test_user.id,
            list_id=test_list.id,
            data={'name': 'Хлеб', 'client_mutation_id': mutation_id}
        )
        assert item1.id == item2.id  # Same item returned
    
    async def test_purchase_item(self, session, test_user, test_list):
        svc = ItemService(session)
        item = await svc.create_item(
            user_id=test_user.id,
            list_id=test_list.id,
            data={'name': 'Яйца', 'quantity': Decimal('10'), 'unit': 'шт'}
        )
        updated = await svc.update_item(
            user_id=test_user.id,
            item_id=item.id,
            is_purchased=True
        )
        assert updated.is_purchased == True
        assert updated.purchased_at is not None
