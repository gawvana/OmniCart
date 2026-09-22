from uuid import UUID
from typing import Dict, Any, List
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.search_repository import SearchRepository

logger = structlog.get_logger(__name__)

class SearchService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def search(self, user_id: UUID, query: str, limit: int = 20) -> Dict[str, List[Any]]:
        """
        Search across shopping items, history, favorites, products. 
        Return categorized results. Use ILIKE for text search.
        """
        search_repo = SearchRepository(self.session)
        
        normalized_query = query.strip()
        if not normalized_query:
            return {
                "items": [],
                "history": [],
                "favorites": [],
                "products": []
            }
            
        results = await search_repo.global_search(user_id, normalized_query, limit)
        return results
