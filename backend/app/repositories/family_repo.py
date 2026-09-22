from uuid import UUID
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, delete, update
from sqlalchemy.orm import joinedload
from app.models.family import Family, FamilyMember, FamilyInvite
from app.models.activity import ActivityEvent

class FamilyRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, family_id: UUID) -> Optional[Family]:
        stmt = select(Family).where(Family.id == family_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_user_families(self, user_id: UUID) -> list[Family]:
        stmt = select(Family).join(FamilyMember).where(and_(FamilyMember.user_id == user_id, FamilyMember.is_active == True))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create(self, name: str, created_by: Optional[UUID] = None, **kwargs) -> Family:
        family = Family(name=name, created_by=created_by, **kwargs)
        self.session.add(family)
        await self.session.flush()
        return family

    async def add_member(self, family_id: UUID, user_id: UUID, role: str) -> FamilyMember:
        member = FamilyMember(family_id=family_id, user_id=user_id, role=role, is_active=True)
        self.session.add(member)
        await self.session.flush()
        return member

    async def remove_member(self, family_id_or_member_id: UUID, user_id: Optional[UUID] = None) -> None:
        if user_id is not None:
            stmt = update(FamilyMember).where(and_(FamilyMember.family_id == family_id_or_member_id, FamilyMember.user_id == user_id)).values(is_active=False)
        else:
            stmt = update(FamilyMember).where(FamilyMember.id == family_id_or_member_id).values(is_active=False)
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_member(self, family_id: UUID, user_id: UUID) -> Optional[FamilyMember]:
        stmt = select(FamilyMember).where(and_(FamilyMember.family_id == family_id, FamilyMember.user_id == user_id))
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_member_by_id(self, member_id: UUID) -> Optional[FamilyMember]:
        stmt = select(FamilyMember).where(FamilyMember.id == member_id)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def get_members(self, family_id: UUID) -> list[FamilyMember]:
        stmt = select(FamilyMember).options(joinedload(FamilyMember.user)).where(and_(FamilyMember.family_id == family_id, FamilyMember.is_active == True))
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_invite(self, family_id: UUID, token: str, expires_at: datetime, created_by: Optional[UUID] = None, created_by_id: Optional[UUID] = None, **kwargs) -> FamilyInvite:
        creator = created_by or created_by_id
        invite = FamilyInvite(family_id=family_id, created_by=creator, token=token, expires_at=expires_at, is_used=False)
        self.session.add(invite)
        await self.session.flush()
        return invite

    async def get_invite_by_token(self, token: str) -> Optional[FamilyInvite]:
        stmt = select(FamilyInvite).where(FamilyInvite.token == token)
        result = await self.session.execute(stmt)
        return result.scalars().first()

    async def use_invite(self, invite_id: UUID, user_id: Optional[UUID] = None, used_by_id: Optional[UUID] = None) -> bool:
        user = user_id or used_by_id
        stmt = (
            update(FamilyInvite)
            .where(and_(FamilyInvite.id == invite_id, FamilyInvite.is_used == False))
            .values(is_used=True, accepted_by=user, accepted_at=datetime.now(timezone.utc))
        )
        result = await self.session.execute(stmt)
        await self.session.flush()
        return bool(result.rowcount and result.rowcount > 0)

    mark_invite_used = use_invite
    get_user_families_with_counts = get_user_families
    get_members_with_users = get_members

    async def get_activity(self, family_id: UUID, cursor: Optional[str] = None, limit: int = 20) -> list[ActivityEvent]:
        stmt = select(ActivityEvent).where(ActivityEvent.family_id == family_id).order_by(ActivityEvent.created_at.desc()).limit(limit)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def create_activity(self, family_id: UUID, user_id: UUID, event_type: str, entity_type: str, entity_id: Optional[UUID] = None, data: Optional[dict] = None) -> ActivityEvent:
        activity = ActivityEvent(family_id=family_id, user_id=user_id, event_type=event_type, entity_type=entity_type, entity_id=entity_id, data=data or {})
        self.session.add(activity)
        await self.session.flush()
        return activity

    log_activity = create_activity

