import re
import logging
from aiogram import Router, types
from aiogram.filters import Filter
from app.bot.i18n import t
from app.bot.keyboards.main import confirm_add_keyboard
from app.core.config import get_settings
from app.services.shopping_list_service import ShoppingListService

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
        raw_text = message.text.strip()
        lower_text = raw_text.lower()
        
        if "бюджет" in lower_text or "budget" in lower_text:
            await message.answer(t("budget_set", lang))
            return
            
        if "напомни" in lower_text or "remind" in lower_text:
            await message.answer(t("reminder_created", lang))
            return
            
        if "план" in lower_text or "plan" in lower_text:
            await message.answer(t("ai_planning", lang))
            return

        # Parse grocery items (smart natural language)
        items_list = []
        lines = [line.strip() for line in re.split(r'[\n,;]+', raw_text) if line.strip()]
        for line in lines:
            cleaned = re.sub(r'^(добавь|купи|купить|надо|возьми)\s+', '', line, flags=re.IGNORECASE).strip()
            if cleaned:
                items_list.append({"name": cleaned, "quantity": 1})

        if not items_list:
            await message.answer(t("ai_error", lang))
            return
            
        text = t("ai_parsing_success", lang) + "\n\n"
        names_for_callback = []
        for item in items_list:
            text += f"• {item.get('name', '')}\n"
            names_for_callback.append(item.get('name', ''))
            
        callback_payload = ",".join(names_for_callback)[:60]
        await message.answer(text, reply_markup=confirm_add_keyboard(callback_payload, lang))
        
    except Exception as e:
        logger.error(f"Natural language processing error: {e}")
        await message.answer(t("ai_error", lang))
