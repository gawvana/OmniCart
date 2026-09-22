from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from app.models.ai import AIRequest, FeatureFlag

class AIRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def log_request(self, user_id: UUID, provider: str, model: str, operation: str, tokens_input: int, tokens_output: int, latency_ms: int, status: str, error: Optional[str]) -> AIRequest:
        log = AIRequest(
            user_id=user_id,
            provider=provider,
            model=model,
            operation=operation,
            tokens_input=tokens_input,
            tokens_output=tokens_output,
            latency_ms=latency_ms,
            status=status,
            error=error,
            created_at=datetime.now(timezone.utc)
        )
        self.session.add(log)
        await self.session.flush()
        return log

    async def get_user_usage(self, user_id: UUID, since: datetime) -> dict:
        stmt = select(
            func.count(AIRequest.id),
            func.sum(AIRequest.tokens_input + AIRequest.tokens_output)
        ).where(
            and_(
                AIRequest.user_id == user_id,
                AIRequest.created_at >= since
            )
        )
        result = await self.session.execute(stmt)
        row = result.first()
        return {
            "count": row[0] or 0,
            "tokens": row[1] or 0
        }

    async def get_feature_flags(self) -> list[FeatureFlag]:
        stmt = select(FeatureFlag)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_feature_flag(self, name: str) -> Optional[FeatureFlag]:
        stmt = select(FeatureFlag).where(FeatureFlag.name == name)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def set_feature_flag(self, name: str, enabled: bool) -> FeatureFlag:
        stmt = select(FeatureFlag).where(FeatureFlag.name == name)
        result = await self.session.execute(stmt)
        flag = result.scalars().first()
        if flag:
            flag.enabled = enabled
        else:
            flag = FeatureFlag(name=name, enabled=enabled)
            self.session.add(flag)
        await self.session.flush()
        return flag
