from aiogram import Router, types
from aiogram.filters import Filter
from backend.app.bot.i18n import t
from backend.app.services.ai_service import AIService
from backend.app.bot.keyboards.main import confirm_add_keyboard
import logging

logger = logging.getLogger(__name__)
router = Router()

class NaturalLanguageFilter(Filter):
    async def __call__(self, message: types.Message) -> bool:
        if not message.text:
            return False
        return not message.text.startswith("/")

@router.message(NaturalLanguageFilter())
async def handle_natural_language(message: types.Message, lang: str, db_session, user):
    try:
        if "бюджет" in message.text.lower() or "budget" in message.text.lower():
            await message.answer(t("budget_set", lang))
            return
            
        if "напомни" in message.text.lower() or "remind" in message.text.lower():
            await message.answer(t("reminder_created", lang))
            return
            
        if "план" in message.text.lower() or "plan" in message.text.lower():
            await message.answer(t("ai_planning", lang))
            return

        ai_service = AIService()
        parsed_items = await ai_service.parse_shopping_items(message.text)
        
        if not parsed_items:
            await message.answer(t("ai_error", lang))
            return
            
        text = t("ai_parsing_success", lang) + "\n\n"
        for item in parsed_items:
            text += f"• {item.get('name', '')} - {item.get('quantity', '')}\n"
            
        # Store temporary parsing result in redis/db with hash in real app
        fake_hash = "tmp123" 
        await message.answer(text, reply_markup=confirm_add_keyboard(fake_hash, lang))
        
    except Exception as e:
        logger.error(f"AI parsing error: {e}")
        await message.answer(t("ai_error", lang))
