from uuid import UUID
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from decimal import Decimal
from app.models.budget import Budget

class BudgetRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, budget_id: UUID) -> Optional[Budget]:
        stmt = select(Budget).where(Budget.id == budget_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_budgets(self, user_id: UUID) -> list[Budget]:
        stmt = select(Budget).where(Budget.user_id == user_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_list_budget(self, list_id: UUID) -> Optional[Budget]:
        stmt = select(Budget).where(Budget.list_id == list_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def create(self, **kwargs) -> Budget:
        budget = Budget(**kwargs)
        self.session.add(budget)
        await self.session.flush()
        return budget

    async def update(self, budget_id: UUID, **kwargs) -> Budget:
        stmt = update(Budget).where(Budget.id == budget_id).values(**kwargs).returning(Budget)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def update_spent(self, budget_id: UUID, amount: Decimal) -> Budget:
        stmt = update(Budget).where(Budget.id == budget_id).values(
            spent_amount=Budget.spent_amount + amount
        ).returning(Budget)
        result = await self.session.execute(stmt)
        await self.session.flush()
        return result.scalars().first()

    async def delete(self, budget_id: UUID) -> None:
        stmt = delete(Budget).where(Budget.id == budget_id)
        await self.session.execute(stmt)
        await self.session.flush()
