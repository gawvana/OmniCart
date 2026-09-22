from aiogram import Router, types
from aiogram.filters import Command
from backend.app.bot.i18n import t
from backend.app.bot.keyboards.main import list_keyboard, help_keyboard, settings_keyboard
from backend.app.services.shopping_list_service import ShoppingListService
from backend.app.core.config import get_settings

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
async def cmd_history(message: types.Message, lang: str):
    await message.answer(t("history_empty", lang))

@router.message(Command("favorites"))
async def cmd_favorites(message: types.Message, lang: str):
    await message.answer(t("favorites_empty", lang))

@router.message(Command("analytics"))
async def cmd_analytics(message: types.Message, lang: str):
    await message.answer(t("analytics_empty", lang))

@router.message(Command("profile"))
async def cmd_profile(message: types.Message, lang: str):
    await message.answer(t("profile_empty", lang))

@router.message(Command("family"))
async def cmd_family(message: types.Message, lang: str):
    bot_info = await message.bot.get_me()
    invite_link = f"https://t.me/{bot_info.username}?start=cart_{user.family_id}"
    await message.answer(t("family_invite", lang, link=invite_link))
