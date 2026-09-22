from decimal import Decimal
from uuid import UUID
from typing import List, Dict, Any, Optional
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.budget_repository import BudgetRepository
from app.repositories.list_repository import ListRepository
from app.core.exceptions import AuthorizationError, NotFoundError

logger = structlog.get_logger(__name__)

class BudgetService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_budgets(self, user_id: UUID) -> List[Any]:
        budget_repo = BudgetRepository(self.session)
        return await budget_repo.get_user_budgets(user_id)

    async def create_budget(self, user_id: UUID, **kwargs) -> Any:
        budget_repo = BudgetRepository(self.session)
        # Ensure list is accessible if list_id is provided
        list_id = kwargs.get("list_id")
        if list_id:
            list_repo = ListRepository(self.session)
            member = await list_repo.get_member(list_id, user_id)
            if not member:
                raise AuthorizationError("Access denied to the specified list")
                
        budget = await budget_repo.create(user_id=user_id, **kwargs)
        logger.info("Budget created", budget_id=str(budget.id), user_id=str(user_id))
        return budget

    async def update_budget(self, user_id: UUID, budget_id: UUID, **kwargs) -> Any:
        budget_repo = BudgetRepository(self.session)
        budget = await budget_repo.get(budget_id)
        
        if not budget:
            raise NotFoundError("Budget not found")
        if budget.user_id != user_id:
            raise AuthorizationError("Access denied to modify this budget")
            
        updated = await budget_repo.update(budget_id, **kwargs)
        logger.info("Budget updated", budget_id=str(budget_id), user_id=str(user_id))
        return updated

    async def delete_budget(self, user_id: UUID, budget_id: UUID) -> None:
        budget_repo = BudgetRepository(self.session)
        budget = await budget_repo.get(budget_id)
        
        if not budget:
            raise NotFoundError("Budget not found")
        if budget.user_id != user_id:
            raise AuthorizationError("Access denied to delete this budget")
            
        await budget_repo.delete(budget_id)
        logger.info("Budget deleted", budget_id=str(budget_id), user_id=str(user_id))

    async def add_spending(self, budget_id: UUID, amount: Decimal) -> Any:
        budget_repo = BudgetRepository(self.session)
        budget = await budget_repo.get(budget_id)
        
        if not budget:
            raise NotFoundError("Budget not found")
            
        new_spent = (budget.spent_amount or Decimal("0.0")) + amount
        updated = await budget_repo.update(budget_id, spent_amount=new_spent)
        return updated

    async def check_budget_status(self, list_id: UUID) -> Optional[Dict[str, Any]]:
        budget_repo = BudgetRepository(self.session)
        budget = await budget_repo.get_active_by_list(list_id)
        
        if not budget:
            return None
            
        amount = budget.amount
        spent = budget.spent_amount or Decimal("0.0")
        remaining = amount - spent
        is_exceeded = remaining < 0
        
        return {
            "id": budget.id,
            "amount": float(amount),
            "spent": float(spent),
            "remaining": float(remaining),
            "is_exceeded": is_exceeded
        }
