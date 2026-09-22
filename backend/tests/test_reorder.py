import pytest
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from uuid import uuid4
from backend.app.services.reorder_service import ReorderService
from backend.app.models.history import PurchaseHistory
from backend.app.models.product import Product

@pytest.mark.asyncio
class TestSmartReorder:
    async def test_needs_minimum_purchases(self, session, test_user):
        svc = ReorderService(session)
        # With no purchases, should return empty
        suggestions = await svc.calculate_reorders(test_user.id)
        assert len(suggestions) == 0
    
    async def test_generates_suggestion_with_enough_data(self, session, test_user):
        # Create product
        product = Product(id=uuid4(), name='Молоко', normalized_name='молоко', default_unit='л')
        session.add(product)
        await session.commit()
        
        # Create 4 purchases at ~7 day intervals
        now = datetime.now(timezone.utc)
        for i in range(4):
            purchase = PurchaseHistory(
                id=uuid4(),
                user_id=test_user.id,
                item_name='Молоко',
                product_id=product.id,
                quantity=Decimal('2'),
                unit='л',
                purchased_at=now - timedelta(days=7 * (3 - i)),
            )
            session.add(purchase)
        await session.commit()
        
        svc = ReorderService(session)
        suggestions = await svc.calculate_reorders(test_user.id)
        # Should have a suggestion for milk
        assert len(suggestions) >= 1
