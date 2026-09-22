from aiogram import Router, types
from aiogram.filters import CommandStart
from app.bot.i18n import t
from app.bot.keyboards.main import main_menu_keyboard
from app.core.config import get_settings

router = Router()

@router.message(CommandStart())
async def start_handler(message: types.Message, lang: str):
    settings = get_settings()
    args = message.text.split()
    
    if len(args) > 1 and args[1].startswith("cart_"):
        family_id = args[1].split("_")[1]
        # Handle family invite logic here
        await message.answer(t("family_invite_received", lang))
    else:
        text = t("welcome", lang)
        keyboard = main_menu_keyboard(settings.WEBAPP_URL, lang)
        await message.answer(text, reply_markup=keyboard)
