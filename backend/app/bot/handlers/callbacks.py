from uuid import UUID
from aiogram import Router, F, types
from backend.app.bot.i18n import t
from backend.app.services.shopping_list_service import ShoppingListService

router = Router()

@router.callback_query(F.data == "my_list")
async def cb_my_list(query: types.CallbackQuery, lang: str, db_session, user):
    from backend.app.bot.handlers.commands import cmd_list
    await cmd_list(query.message, lang, db_session, user)
    await query.answer()

@router.callback_query(F.data == "add_item")
async def cb_add_item(query: types.CallbackQuery, lang: str):
    await query.message.answer(t("add_prompt", lang))
    await query.answer()

@router.callback_query(F.data.startswith("toggle:"))
async def cb_toggle_item(query: types.CallbackQuery, lang: str, db_session, user):
    item_id = query.data.split(":", 1)[1]
    service = ShoppingListService(db_session)
    await service.toggle_item(item_id, user.id)
    await query.answer(t("item_updated", lang))

@router.callback_query(F.data == "help")
async def cb_help(query: types.CallbackQuery, lang: str):
    from backend.app.bot.handlers.commands import cmd_help
    await cmd_help(query.message, lang)
    await query.answer()

@router.callback_query(F.data.startswith("confirm_add:"))
async def cb_confirm_add(query: types.CallbackQuery, lang: str, db_session, user):
    await query.message.edit_text(t("items_added_success", lang))
    await query.answer()

@router.callback_query(F.data == "cancel_add")
async def cb_cancel_add(query: types.CallbackQuery, lang: str):
    await query.message.delete()
    await query.answer()

@router.callback_query(F.data.startswith("settings_lang:"))
async def cb_settings_lang(query: types.CallbackQuery, lang: str, db_session, user):
    new_lang = query.data.split(":")[1]
    user.language = new_lang
    await db_session.commit()
    await query.message.edit_text(t("lang_changed", new_lang))
    await query.answer()
