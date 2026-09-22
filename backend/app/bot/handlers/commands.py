from aiogram import Router, types
from aiogram.filters import Command
from app.bot.i18n import t
from app.bot.keyboards.main import list_keyboard, help_keyboard, settings_keyboard
from app.services.shopping_list_service import ShoppingListService
from app.core.config import get_settings

router = Router()

@router.message(Command("list"))
async def cmd_list(message: types.Message, lang: str, db_session, user):
    service = ShoppingListService(db_session)
    items = await service.get_user_items(user.id)
    
    if not items:
        await message.answer(t("list_empty", lang))
        return
        
    text = t("list_header", lang) + "\n\n"
    for item in items:
        status = "☑" if item.is_purchased else "☐"
        text += f"{status} {item.name} - {item.quantity}\n"
        
    keyboard = list_keyboard(items, lang)
    await message.answer(text, reply_markup=keyboard)

@router.message(Command("add"))
async def cmd_add(message: types.Message, lang: str, db_session, user):
    args = message.text.split(maxsplit=1)
    if len(args) > 1:
        text = args[1]
        service = ShoppingListService(db_session)
        await service.add_item(user.id, text)
        await message.answer(t("item_added", lang))
    else:
        await message.answer(t("add_prompt", lang))

@router.message(Command("help"))
async def cmd_help(message: types.Message, lang: str):
    await message.answer(t("help", lang), reply_markup=help_keyboard(lang))

@router.message(Command("settings"))
async def cmd_settings(message: types.Message, lang: str):
    await message.answer(t("settings", lang), reply_markup=settings_keyboard(lang))

@router.message(Command("history"))
async def cmd_history(message: types.Message, lang: str, db_session, user):
    from app.services.history_service import HistoryService
    service = HistoryService(db_session)
    history = await service.get_user_history(user.id, limit=5)
    if not history:
        await message.answer(t("history_empty", lang))
        return
    text = f"📜 {t('btn_my_list', lang)}:\n\n"
    for item in history:
        text += f"• {item.item_name} - {item.quantity} {item.unit}\n"
    await message.answer(text)

@router.message(Command("favorites"))
async def cmd_favorites(message: types.Message, lang: str, db_session, user):
    from app.services.product_service import ProductService
    service = ProductService(db_session)
    favs = await service.get_user_favorites(user.id)
    if not favs:
        await message.answer(t("favorites_empty", lang))
        return
    text = "⭐ Избранное:\n\n"
    for f in favs:
        prod_name = f.product.name if f.product else "Продукт"
        text += f"• {prod_name}\n"
    await message.answer(text)

@router.message(Command("analytics"))
async def cmd_analytics(message: types.Message, lang: str, db_session, user):
    from app.services.analytics_service import AnalyticsService
    service = AnalyticsService(db_session)
    stats = await service.get_user_analytics(user.id)
    total_spent = stats.get("total_spent", 0)
    total_purchases = stats.get("total_purchases", 0)
    text = f"📊 Аналитика:\n\n• Покупок: {total_purchases}\n• Потрачено: {total_spent:.2f} UZS"
    await message.answer(text)

@router.message(Command("profile"))
async def cmd_profile(message: types.Message, lang: str, db_session, user):
    from app.services.user_service import UserService
    service = UserService(db_session)
    profile = await service.get_profile(user.id)
    name = f"{profile.get('first_name', '')} {profile.get('last_name', '')}".strip()
    text = f"👤 Профиль:\n\n• Имя: {name}\n• ID: {user.telegram_user_id}\n• Язык: {user.language}"
    await message.answer(text)

@router.message(Command("family"))
async def cmd_family(message: types.Message, lang: str, db_session, user):
    from app.services.family_service import FamilyService
    bot_info = await message.bot.get_me()
    service = FamilyService(db_session)
    family = await service.get_user_family(user.id)
    if family:
        invite_link = f"https://t.me/{bot_info.username}?start=fam_{family.id}"
        await message.answer(t("family_invite", lang, link=invite_link))
    else:
        new_fam = await service.create_family(user.id, f"Семья {user.first_name}")
        invite_link = f"https://t.me/{bot_info.username}?start=fam_{new_fam.id}"
        await message.answer(t("family_invite", lang, link=invite_link))
