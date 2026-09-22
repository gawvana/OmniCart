from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from app.bot.i18n import t

def main_menu_keyboard(webapp_url: str, lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=t("btn_open_webapp", lang), web_app=WebAppInfo(url=webapp_url))],
        [InlineKeyboardButton(text=t("btn_my_list", lang), callback_data="my_list")],
        [
            InlineKeyboardButton(text=t("btn_add", lang), callback_data="add_item"),
            InlineKeyboardButton(text=t("btn_help", lang), callback_data="help")
        ]
    ])

def list_keyboard(items: list, lang: str) -> InlineKeyboardMarkup:
    buttons = []
    for item in items:
        status = "✅" if item.is_purchased else "❌"
        buttons.append([InlineKeyboardButton(text=f"{status} {item.name}", callback_data=f"toggle:{item.id}")])
    return InlineKeyboardMarkup(inline_keyboard=buttons)

def confirm_add_keyboard(hash_val: str, lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=t("btn_confirm_all", lang), callback_data=f"confirm_add:{hash_val}")],
        [InlineKeyboardButton(text=t("btn_cancel", lang), callback_data="cancel_add")]
    ])

def settings_keyboard(current_lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [
            InlineKeyboardButton(text="English 🇬🇧", callback_data="settings_lang:en"),
            InlineKeyboardButton(text="Русский 🇷🇺", callback_data="settings_lang:ru"),
            InlineKeyboardButton(text="O'zbekcha 🇺🇿", callback_data="settings_lang:uz")
        ]
    ])

def help_keyboard(lang: str) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text=t("btn_my_list", lang), callback_data="my_list")]
    ])
