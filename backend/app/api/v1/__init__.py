from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.profile import router as profile_router
from app.api.v1.settings import router as settings_router
from app.api.v1.lists import router as lists_router
from app.api.v1.items import router as items_router
from app.api.v1.products import router as products_router
from app.api.v1.favorites import router as favorites_router
from app.api.v1.history import router as history_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.family import router as family_router
from app.api.v1.budget import router as budget_router
from app.api.v1.recurring import router as recurring_router
from app.api.v1.ai import router as ai_router
from app.api.v1.reminders import router as reminders_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.search import router as search_router
from app.api.v1.market import router as market_router
from app.api.v1.websocket import router as websocket_router
from app.api.v1.admin import router as admin_router

router = APIRouter()
router.include_router(auth_router, prefix="/auth", tags=["Auth"])
router.include_router(profile_router, prefix="/profile", tags=["Profile"])
router.include_router(settings_router, prefix="/settings", tags=["Settings"])
router.include_router(lists_router, prefix="/lists", tags=["Lists"])
router.include_router(items_router, prefix="/items", tags=["Items"])
router.include_router(products_router, prefix="/products", tags=["Products"])
router.include_router(favorites_router, prefix="/favorites", tags=["Favorites"])
router.include_router(history_router, prefix="/history", tags=["History"])
router.include_router(analytics_router, prefix="/analytics", tags=["Analytics"])
router.include_router(family_router, prefix="/family", tags=["Family"])
router.include_router(budget_router, prefix="/budget", tags=["Budget"])
router.include_router(recurring_router, prefix="/recurring", tags=["Recurring"])
router.include_router(ai_router, prefix="/ai", tags=["AI"])
router.include_router(reminders_router, prefix="/reminders", tags=["Reminders"])
router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])
router.include_router(search_router, prefix="/search", tags=["Search"])
router.include_router(market_router, prefix="/market", tags=["Market"])
router.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])
router.include_router(admin_router, prefix="/admin", tags=["Admin"])
