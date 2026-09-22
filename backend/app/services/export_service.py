import io
import csv
from uuid import UUID
from typing import Dict, Any
import structlog
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.user_repository import UserRepository
from app.repositories.history_repository import HistoryRepository
from app.core.exceptions import NotFoundError

logger = structlog.get_logger(__name__)

class ExportService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def export_json(self, user_id: UUID) -> Dict[str, Any]:
        user_repo = UserRepository(self.session)
        data = await user_repo.get_full_export_data(user_id)
        if not data:
            raise NotFoundError("User not found")
        logger.info("JSON export completed", user_id=str(user_id))
        return data

    async def export_csv(self, user_id: UUID) -> str:
        history_repo = HistoryRepository(self.session)
        
        # Get all purchase history for user
        records = await history_repo.get_all_for_user(user_id)
        
        if not records:
            return "date,product_name,category,quantity,price,total\n"
            
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write header
        writer.writerow(["date", "product_name", "category", "quantity", "price", "total"])
        
        for record in records:
            qty = float(record.quantity) if record.quantity else 1.0
            price = float(record.price) if record.price else 0.0
            total = qty * price
            
            writer.writerow([
                record.purchased_at.isoformat(),
                record.product_name,
                record.category_name or "Uncategorized",
                qty,
                price,
                total
            ])
            
        logger.info("CSV export completed", user_id=str(user_id))
        return output.getvalue()
