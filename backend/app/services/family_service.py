import secrets
from uuid import UUID
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta, timezone
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.family_repo import FamilyRepository
from app.core.exceptions import AuthorizationError, NotFoundError, ValidationError, ConflictError

logger = structlog.get_logger(__name__)

class FamilyService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_user_families(self, user_id: UUID) -> List[Any]:
        family_repo = FamilyRepository(self.session)
        return await family_repo.get_user_families_with_counts(user_id)

    async def create_family(self, user_id: UUID, name: str) -> Any:
        family_repo = FamilyRepository(self.session)
        family = await family_repo.create(name=name, created_by=user_id)
        await family_repo.add_member(family.id, user_id, role="owner")
        
        await self.log_activity(
            family_id=family.id,
            user_id=user_id,
            event_type="family_created",
            entity_type="family",
            entity_id=family.id
        )
        logger.info("Family created", family_id=str(family.id), user_id=str(user_id))
        return family

    async def create_invite(self, user_id: UUID, family_id: UUID) -> Any:
        family_repo = FamilyRepository(self.session)
        member = await family_repo.get_member(family_id, user_id)
        if not member or member.role not in ["owner", "admin"]:
            raise AuthorizationError("Only owner or admin can create invites")
            
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        invite = await family_repo.create_invite(
            family_id=family_id,
            created_by_id=user_id,
            token=token,
            expires_at=expires_at
        )
        logger.info("Family invite created", family_id=str(family_id), user_id=str(user_id))
        return invite

    async def join_family(self, user_id: UUID, token: str) -> Any:
        family_repo = FamilyRepository(self.session)
        invite = await family_repo.get_invite_by_token(token)
        
        if not invite:
            raise NotFoundError("Invite not found")
        if invite.is_used:
            raise ValidationError("Invite has already been used")
        exp = invite.expires_at
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            raise ValidationError("Invite has expired")
            
        existing_member = await family_repo.get_member(invite.family_id, user_id)
        if existing_member:
            raise ValidationError("You are already a member of this family")
            
        # Atomically claim invite to prevent race conditions
        claimed = await family_repo.use_invite(invite.id, used_by_id=user_id)
        if not claimed:
            raise ConflictError("Invite has already been used or claimed")
            
        member = await family_repo.add_member(invite.family_id, user_id, role="member")
        
        await self.log_activity(
            family_id=invite.family_id,
            user_id=user_id,
            event_type="member_joined",
            entity_type="user",
            entity_id=user_id
        )
        logger.info("User joined family", family_id=str(invite.family_id), user_id=str(user_id))
        return member

    async def get_members(self, family_id: UUID, user_id: UUID) -> List[Any]:
        family_repo = FamilyRepository(self.session)
        member = await family_repo.get_member(family_id, user_id)
        if not member:
            raise AuthorizationError("Access denied")
        return await family_repo.get_members_with_users(family_id)

    async def remove_member(self, user_id: UUID, family_id: UUID, member_id: UUID) -> None:
        family_repo = FamilyRepository(self.session)
        actor = await family_repo.get_member(family_id, user_id)
        if not actor or actor.role not in ["owner", "admin"]:
            raise AuthorizationError("Only owner or admin can remove members")
            
        target = await family_repo.get_member_by_id(member_id)
        if not target or target.family_id != family_id:
            raise NotFoundError("Member not found in this family")
            
        if target.user_id == user_id and target.role == "owner":
            raise ValidationError("Owner cannot remove themselves without transferring ownership")
            
        await family_repo.remove_member(member_id)
        
        await self.log_activity(
            family_id=family_id,
            user_id=user_id,
            event_type="member_removed",
            entity_type="user",
            entity_id=target.user_id
        )
        logger.info("Member removed from family", family_id=str(family_id), target_id=str(target.user_id))

    async def get_activity(self, user_id: UUID, family_id: UUID, cursor: Optional[str], limit: int = 20) -> List[Any]:
        family_repo = FamilyRepository(self.session)
        member = await family_repo.get_member(family_id, user_id)
        if not member:
            raise AuthorizationError("Access denied")
            
        return await family_repo.get_activity(family_id, cursor, limit)

    async def log_activity(
        self, 
        family_id: Optional[UUID], 
        user_id: UUID, 
        event_type: str, 
        entity_type: str, 
        entity_id: Optional[UUID] = None, 
        data: Optional[Dict[str, Any]] = None
    ) -> None:
        if not family_id:
            return
            
        family_repo = FamilyRepository(self.session)
        await family_repo.log_activity(
            family_id=family_id,
            user_id=user_id,
            event_type=event_type,
            entity_type=entity_type,
            entity_id=entity_id,
            data=data or {}
        )
