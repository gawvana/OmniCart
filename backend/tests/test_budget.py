import pytest
from decimal import Decimal
from backend.app.services.budget_service import BudgetService

@pytest.mark.asyncio
class TestBudgetService:
    async def test_create_budget(self, session, test_user):
        svc = BudgetService(session)
        budget = await svc.create_budget(
            user_id=test_user.id,
            amount=Decimal('500000'),
            currency='UZS',
            period='monthly'
        )
        assert budget.amount == Decimal('500000')
        assert budget.spent_amount == Decimal('0')
    
    async def test_add_spending(self, session, test_user):
        svc = BudgetService(session)
        budget = await svc.create_budget(
            user_id=test_user.id,
            amount=Decimal('500000'),
            currency='UZS'
        )
        updated = await svc.add_spending(budget.id, Decimal('100000'))
        assert updated.spent_amount == Decimal('100000')
